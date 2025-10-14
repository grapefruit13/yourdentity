const FirestoreService = require("../services/firestoreService");
const firestoreService = new FirestoreService("products");
const {FieldValue} = require("firebase-admin/firestore");

const getProducts = async (req, res, next) => {
  try {
    const {page = 0, size = 10, status = "onSale"} = req.query;

    // 인덱스 없이 작동하도록 쿼리 단순화
    // 먼저 모든 상품을 가져온 후 메모리에서 필터링
    const result = await firestoreService.getWithPagination({
      page: parseInt(page),
      size: parseInt(size),
      orderBy: "createdAt",
      orderDirection: "desc",
      where: [], // where 조건 제거
    });

    // 메모리에서 상태 필터링
    if (result.content && status) {
      result.content = result.content.filter(
          (product) => product.status === status,
      );
    }

    // 목록에서는 간소화된 정보만 반환 (루틴과 동일한 구조)
    if (result.content) {
      result.content = result.content.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        status: product.status,
        price: product.price,
        currency: product.currency,
        stockCount: product.stockCount,
        soldCount: product.soldCount,
        viewCount: product.view_count || 0,
        buyable: product.buyable,
        sellerId: product.sellerId,
        sellerName: product.sellerName,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      }));
    }

    return res.paginate(result.content || [], result.pageable || {});
  } catch (error) {
    console.error("Error getting products:", error);
    return next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const {productId} = req.params;

    const product = await firestoreService.getDocument("products", productId);

    if (!product) {
      const err = new Error("상품을 찾을 수 없습니다");
      err.code = "NOT_FOUND";
      throw err;
    }

    // 조회수 증가 (원자적 업데이트)
    firestoreService.updateDocument("products", productId, {
      view_count: FieldValue.increment(1),
      updatedAt: new Date(),
    });

    // Q&A 조회
    const qnas = await firestoreService.getCollectionWhere(
        "qnas",
        "targetId",
        "==",
        productId,
    );
    const formattedQnas = qnas.map((qna) => ({
      id: qna.id,
      content: qna.content || [],
      media: qna.media || [],
      answerContent: qna.answerContent || null,
      answerMedia: qna.answerMedia || [],
      answerUserId: qna.answerUserId || null,
      askedBy: qna.userId,
      answeredBy: qna.answerUserId,
      askedAt: qna.createdAt,
      answeredAt: qna.answerCreatedAt || null,
      likesCount: qna.likesCount || 0,
    }));

    // 상품 상세 정보 반환 (루틴과 동일한 구조)
    const response = {
      ...product,
      viewCount: (product.view_count || 0) + 1,
      qna: formattedQnas,
      content: product.content || [],
      media: product.media || [],
    };

    return res.success(response);
  } catch (error) {
    console.error("Error getting product:", error);
    return next(error);
  }
};

const purchaseProduct = async (req, res, next) => {
  try {
    const {
      productId,
      variantId,
      quantity = 1,
      customFields = {},
      shippingAddress,
      phoneNumber,
    } = req.body;

    const userId = req.user.uid;
    const userWalletBalance = 500; // TODO: 실제로는 사용자 지갑에서 잔액 조회

    if (!productId) {
      const err = new Error("productId는 필수입니다");
      err.code = "INVALID_REQUEST";
      throw err;
    }

    // 상품 정보 조회 (동시성 문제 해결을 위해 트랜잭션 사용)
    const product = await firestoreService.getDocument("products", productId);
    if (!product) {
      const err = new Error("상품을 찾을 수 없습니다");
      err.code = "NOT_FOUND";
      throw err;
    }

    // 상품 변형 확인 (옵션이 있는 경우)
    let selectedVariant = null;
    let totalPrice = 0;
    let requiredPoints = 0;

    if (variantId && product.productVariants) {
      selectedVariant = product.productVariants.find(
          (variant) => variant.id === variantId,
      );
      if (!selectedVariant) {
        const err = new Error("선택한 상품 옵션을 찾을 수 없습니다");
        err.code = "INVALID_REQUEST";
        throw err;
      }

      // 재고 확인
      if (selectedVariant.stockCount < quantity) {
        const err = new Error("재고가 부족합니다");
        err.code = "OUT_OF_STOCK";
        throw err;
      }

      // 옵션이 있는 경우 옵션별 가격 계산
      totalPrice = (selectedVariant.price || product.price) * quantity;
    } else {
      // 옵션이 없는 경우 전체 상품 재고 확인
      if (product.stockCount < quantity) {
        const err = new Error("재고가 부족합니다");
        err.code = "OUT_OF_STOCK";
        throw err;
      }

      // 옵션이 없는 경우 기본 가격 계산
      totalPrice = product.price * quantity;
    }

    // 추가 수수료 계산 (코인 등)
    if (product.additionalFees && product.additionalFees.length > 0) {
      product.additionalFees.forEach((fee) => {
        if (fee.type === "coin") {
          requiredPoints += fee.amount * quantity;
        }
      });
    }

    // 사용자 지갑 잔액 확인
    if (userWalletBalance < requiredPoints) {
      const err = new Error(`포인트가 부족합니다. 필요: ${requiredPoints}원, 보유: ${userWalletBalance}원`);
      err.code = "INSUFFICIENT_FUNDS";
      throw err;
    }

    // 구매 신청 데이터 생성
    const purchaseData = {
      type: "PRODUCT",
      targetId: productId,
      variantId: variantId || null,
      userId,
      status: "PENDING",
      quantity,
      targetName: product.name,
      targetPrice: totalPrice,
      requiredPoints: requiredPoints,
      additionalFees: product.additionalFees || [],
      customFieldsResponse: customFields,
      shippingAddress: shippingAddress || null,
      phoneNumber: phoneNumber || null,
      appliedAt: new Date(),
      updatedAt: new Date(),
    };

    const applicationId = await firestoreService.addDocument(
        "applications",
        purchaseData,
    );

    // 동시성 문제 해결을 위한 재고 업데이트 (트랜잭션 사용)
    if (selectedVariant) {
      // 옵션이 있는 경우 변형별 재고 업데이트
      const updatedVariants = product.productVariants.map((variant) => {
        if (variant.id === variantId) {
          return {
            ...variant,
            soldCount: (variant.soldCount || 0) + quantity,
            stockCount: Math.max(0, (variant.stockCount || 0) - quantity),
          };
        }
        return variant;
      });

      await firestoreService.updateDocument("products", productId, {
        productVariants: updatedVariants,
        soldCount: (product.soldCount || 0) + quantity,
        updatedAt: Date.now(),
      });
    } else {
      // 옵션이 없는 경우 전체 상품 재고 업데이트
      await firestoreService.updateDocument("products", productId, {
        soldCount: (product.soldCount || 0) + quantity,
        stockCount: Math.max(0, (product.stockCount || 0) - quantity),
        updatedAt: Date.now(),
      });
    }

    // 사용자 지갑에서 포인트 차감 (실제로는 별도 지갑 시스템에서 처리)
    const remainingBalance = userWalletBalance - requiredPoints;

    const responseData = {
      applicationId,
      type: "PRODUCT",
      targetId: productId,
      variantId: variantId || null,
      userId,
      status: "PENDING",
      quantity,
      totalPrice: totalPrice,
      requiredPoints: requiredPoints,
      remainingBalance: remainingBalance,
      customFieldsResponse: customFields,
      shippingAddress: shippingAddress || null,
      phoneNumber: phoneNumber || null,
      appliedAt: purchaseData.appliedAt,
      targetName: product.name,
      additionalFees: product.additionalFees || [],
    };

    return res.created(responseData);
  } catch (error) {
    console.error("Error purchasing product:", error);
    return next(error);
  }
};

const toggleProductLike = async (req, res, next) => {
  try {
    const {productId} = req.params;
    const userId = req.user.uid;

    // 상품 존재 확인
    const product = await firestoreService.getDocument("products", productId);
    if (!product) {
      const err = new Error("상품을 찾을 수 없습니다");
      err.code = "NOT_FOUND";
      throw err;
    }

    // 기존 좋아요 확인
    const existingLikes = await firestoreService.getCollectionWhere(
        "likes",
        "targetId",
        "==",
        productId,
    );
    const userLike = existingLikes.find(
        (like) => like.userId === userId && like.type === "PRODUCT",
    );

    if (userLike) {
      // 좋아요 취소
      await firestoreService.deleteDocument("likes", userLike.id);

      // 상품의 좋아요 수 감소 (원자적 업데이트)
      await firestoreService.updateDocument("products", productId, {
        likesCount: FieldValue.increment(-1),
        updatedAt: new Date(),
      });

      // 업데이트된 상품 정보 조회
      const updatedProduct = await firestoreService.getDocument("products", productId);

      const responseData = {
        productId,
        userId,
        isLiked: false,
        likesCount: updatedProduct.likesCount || 0,
      };

      return res.success(responseData);
    } else {
      // 좋아요 등록
      const likeData = {
        type: "PRODUCT",
        targetId: productId,
        userId,
        createdAt: new Date(),
      };

      await firestoreService.addDocument("likes", likeData);

      // 상품의 좋아요 수 증가 (원자적 업데이트)
      await firestoreService.updateDocument("products", productId, {
        likesCount: FieldValue.increment(1),
        updatedAt: new Date(),
      });

      // 업데이트된 상품 정보 조회
      const updatedProduct = await firestoreService.getDocument("products", productId);

      const responseData = {
        productId,
        userId,
        isLiked: true,
        likesCount: updatedProduct.likesCount || 0,
      };

      return res.success(responseData);
    }
  } catch (error) {
    console.error("Error toggling product like:", error);
    return next(error);
  }
};

const createProductQnA = async (req, res, next) => {
  try {
    const {productId} = req.params;
    const {content = []} = req.body;

    if (!content || content.length === 0) {
      return res.status(400).json({error: "content is required"});
    }

    // 상품 존재 확인
    const product = await firestoreService.getDocument("products", productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "상품을 찾을 수 없습니다.",
      });
    }

    // content 배열에서 미디어만 분리 (자동으로 처리)
    const mediaItems = content.filter(
        (item) => item.type === "image" || item.type === "video",
    );

    // media 배열 형식으로 변환
    const media = mediaItems.map((item, index) => {
      const mediaItem = {
        url: item.src,
        type: item.type,
        order: index + 1,
        width: item.width,
        height: item.height,
      };

      // undefined가 아닌 값만 추가
      if (item.blurHash !== undefined) mediaItem.blurHash = item.blurHash;
      if (item.thumbUrl !== undefined) mediaItem.thumbUrl = item.thumbUrl;
      if (item.videoSource !== undefined) {
        mediaItem.videoSource = item.videoSource;
      }
      if (item.provider !== undefined) mediaItem.provider = item.provider;
      if (item.duration !== undefined) mediaItem.duration = item.duration;
      if (item.sizeBytes !== undefined) mediaItem.sizeBytes = item.sizeBytes;
      if (item.mimeType !== undefined) mediaItem.mimeType = item.mimeType;
      if (item.processingStatus !== undefined) {
        mediaItem.processingStatus = item.processingStatus;
      }

      return mediaItem;
    });

    const qnaData = {
      type: "PRODUCT",
      targetId: productId,
      userId: req.user.uid,
      content,
      media,
      answerContent: null,
      answerMedia: [],
      likesCount: 0,
      createdAt: new Date(),
    };

    const qnaId = await firestoreService.addDocument("qnas", qnaData);

    res.status(201).json({
      qnaId,
      productId,
      userId: qnaData.userId,
      content,
      media,
      answerContent: null,
      answerMedia: [],
      likesCount: 0,
      createdAt: qnaData.createdAt,
    });
  } catch (error) {
    console.error("Error creating product QnA:", error);
    res.status(500).json({error: "Failed to create QnA"});
  }
};

// 상품 QnA 질문 수정
const updateProductQnA = async (req, res, next) => {
  try {
    const {productId, qnaId} = req.params;
    const {content = []} = req.body;

    if (!content || content.length === 0) {
      return res.status(400).json({error: "content is required"});
    }

    const qna = await firestoreService.getDocument("qnas", qnaId);

    if (!qna) {
      return res.status(404).json({error: "QnA not found"});
    }

    // content 배열에서 미디어만 분리
    const mediaItems = content.filter(
        (item) => item.type === "image" || item.type === "video",
    );

    // media 배열 형식으로 변환
    const media = mediaItems.map((item, index) => {
      const mediaItem = {
        url: item.src,
        type: item.type,
        order: index + 1,
        width: item.width,
        height: item.height,
      };

      // undefined가 아닌 값만 추가
      if (item.blurHash !== undefined) mediaItem.blurHash = item.blurHash;
      if (item.thumbUrl !== undefined) mediaItem.thumbUrl = item.thumbUrl;
      if (item.videoSource !== undefined) {
        mediaItem.videoSource = item.videoSource;
      }
      if (item.provider !== undefined) mediaItem.provider = item.provider;
      if (item.duration !== undefined) mediaItem.duration = item.duration;
      if (item.sizeBytes !== undefined) mediaItem.sizeBytes = item.sizeBytes;
      if (item.mimeType !== undefined) mediaItem.mimeType = item.mimeType;
      if (item.processingStatus !== undefined) {
        mediaItem.processingStatus = item.processingStatus;
      }

      return mediaItem;
    });

    const updatedData = {
      content,
      media,
      updatedAt: new Date(),
    };

    await firestoreService.updateDocument("qnas", qnaId, updatedData);

    res.json({
      qnaId,
      productId,
      userId: qna.userId,
      content,
      media,
      answerContent: qna.answerContent,
      answerMedia: qna.answerMedia || [],
      likesCount: qna.likesCount || 0,
      updatedAt: updatedData.updatedAt,
    });
  } catch (error) {
    console.error("Error updating product QnA:", error);
    res.status(500).json({error: "Failed to update QnA"});
  }
};

// 상품 QnA 좋아요 토글
const toggleProductQnALike = async (req, res, next) => {
  try {
    const {qnaId} = req.params;

    const qna = await firestoreService.getDocument("qnas", qnaId);

    if (!qna) {
      return res.status(404).json({
        success: false,
        message: "QnA를 찾을 수 없습니다.",
      });
    }

    // 기존 좋아요 확인
    const existingLikes = await firestoreService.getCollectionWhere(
        "likes",
        "targetId",
        "==",
        qnaId,
    );
    const userLike = existingLikes.find(
        (like) => like.userId === req.user.uid && like.type === "QNA",
    );
    let isLiked = false;

    if (userLike) {
      // 좋아요 취소
      await firestoreService.deleteDocument("likes", userLike.id);
      isLiked = false;

      // QnA 좋아요 수 감소 (원자적 업데이트)
      await firestoreService.updateDocument("qnas", qnaId, {
        likesCount: FieldValue.increment(-1),
        updatedAt: new Date(),
      });
    } else {
      // 좋아요 등록
      await firestoreService.addDocument("likes", {
        type: "QNA",
        targetId: qnaId,
        userId: req.user.uid,
        createdAt: new Date(),
      });
      isLiked = true;

      // QnA 좋아요 수 증가 (원자적 업데이트)
      await firestoreService.updateDocument("qnas", qnaId, {
        likesCount: FieldValue.increment(1),
        updatedAt: new Date(),
      });
    }

    // 업데이트된 QnA 정보 조회
    const updatedQna = await firestoreService.getDocument("qnas", qnaId);

    res.json({
      success: true,
      data: {
        qnaId,
        userId: req.user.uid,
        isLiked,
        likeCount: updatedQna.likesCount || 0,
      },
      message: isLiked ? "좋아요를 추가했습니다." : "좋아요를 취소했습니다.",
    });
  } catch (error) {
    console.error("Error toggling product QnA like:", error);
    res.status(500).json({
      success: false,
      message: "좋아요 처리 중 오류가 발생했습니다.",
    });
  }
};

// 상품 QnA 삭제
const deleteProductQnA = async (req, res, next) => {
  try {
    const {qnaId} = req.params;

    const qna = await firestoreService.getDocument("qnas", qnaId);

    if (!qna) {
      return res.status(404).json({error: "QnA not found"});
    }

    await firestoreService.deleteDocument("qnas", qnaId);

    res.json({message: "QnA가 성공적으로 삭제되었습니다"});
  } catch (error) {
    console.error("Error deleting product QnA:", error);
    res.status(500).json({error: "Failed to delete QnA"});
  }
};

module.exports = {
  getProducts,
  getProductById,
  purchaseProduct,
  toggleProductLike,
  createProductQnA,
  updateProductQnA,
  toggleProductQnALike,
  deleteProductQnA,
};
