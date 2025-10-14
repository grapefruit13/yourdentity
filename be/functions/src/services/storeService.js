const {FieldValue} = require("firebase-admin/firestore");
const FirestoreService = require("./firestoreService");

/**
 * Store Service (비즈니스 로직 계층)
 * 상품 관련 모든 비즈니스 로직 처리
 */
class StoreService {
  constructor() {
    this.firestoreService = new FirestoreService("products");
  }

  /**
   * 상품 목록 조회
   * @param {Object} options - 조회 옵션
   * @return {Promise<Object>} 상품 목록
   */
  async getProducts(options = {}) {
    try {
      const {page = 0, size = 10, status = "onSale"} = options;

      // 인덱스 없이 작동하도록 쿼리 단순화
      const result = await this.firestoreService.getWithPagination({
        page: parseInt(page),
        size: parseInt(size),
        orderBy: "createdAt",
        orderDirection: "desc",
        where: [],
      });

      // 메모리에서 상태 필터링
      if (result.content && status) {
        result.content = result.content.filter(
          (product) => product.status === status,
        );
      }

      // 목록에서는 간소화된 정보만 반환
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

      return {
        content: result.content || [],
        pagination: result.pageable || {},
      };
    } catch (error) {
      console.error("Get products error:", error.message);
      throw new Error("Failed to get products");
    }
  }

  /**
   * 상품 상세 조회
   * @param {string} productId - 상품 ID
   * @return {Promise<Object>} 상품 상세 정보
   */
  async getProductById(productId) {
    try {
      const product = await this.firestoreService.getDocument("products", productId);

      if (!product) {
        const error = new Error("Product not found");
        error.code = "NOT_FOUND";
        throw error;
      }

      // 조회수 증가
      const newViewCount = (product.view_count || 0) + 1;
      this.firestoreService.updateDocument("products", productId, {
        view_count: newViewCount,
        updatedAt: Date.now(),
      }).catch(error => {
        console.error("조회수 증가 실패:", error);
      });

      // Q&A 조회
      const qnas = await this.firestoreService.getCollectionWhere(
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

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        status: product.status,
        price: product.price,
        currency: product.currency,
        stockCount: product.stockCount,
        soldCount: product.soldCount,
        viewCount: newViewCount,
        buyable: product.buyable,
        sellerId: product.sellerId,
        sellerName: product.sellerName,
        content: product.content || [],
        media: product.media || [],
        options: product.options || [],
        primaryDetails: product.primaryDetails || [],
        variants: product.variants || [],
        customFields: product.customFields || [],
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        qna: formattedQnas,
      };
    } catch (error) {
      console.error("Get product by ID error:", error.message);
      if (error.code === "NOT_FOUND") {
        throw error;
      }
      throw new Error("Failed to get product");
    }
  }

  /**
   * 상품 구매
   * @param {string} productId - 상품 ID
   * @param {string} userId - 사용자 ID
   * @param {Object} purchaseData - 구매 데이터
   * @return {Promise<Object>} 구매 결과
   */
  async purchaseProduct(productId, userId, purchaseData) {
    try {
      const {
        selectedVariant = null,
        quantity = 1,
        customFieldsResponse = {},
      } = purchaseData;

      // 상품 정보 조회
      const product = await this.firestoreService.getDocument("products", productId);
      if (!product) {
        const error = new Error("Product not found");
        error.code = "NOT_FOUND";
        throw error;
      }

      // 재고 확인
      if (product.stockCount <= 0) {
        const error = new Error("Product is out of stock");
        error.code = "OUT_OF_STOCK";
        throw error;
      }

      const purchasePayload = {
        type: "PRODUCT",
        targetId: productId,
        userId,
        status: "PENDING",
        selectedVariant,
        quantity,
        targetName: product.name,
        targetPrice: product.price,
        customFieldsResponse,
        purchasedAt: new Date(),
        updatedAt: new Date(),
      };

      const purchaseId = await this.firestoreService.addDocument(
        "purchases",
        purchasePayload,
      );

      // 상품 카운트 업데이트 (구매 시 즉시 반영)
      await this.firestoreService.updateDocument("products", productId, {
        soldCount: (product.soldCount || 0) + quantity,
        stockCount: Math.max(0, (product.stockCount || 0) - quantity),
        updatedAt: Date.now(),
      });

      return {
        purchaseId,
        type: "PRODUCT",
        targetId: productId,
        userId,
        status: "PENDING",
        selectedVariant,
        quantity,
        customFieldsResponse,
        purchasedAt: purchasePayload.purchasedAt,
        targetName: product.name,
        targetPrice: product.price,
      };
    } catch (error) {
      console.error("Purchase product error:", error.message);
      if (error.code === "NOT_FOUND" || error.code === "OUT_OF_STOCK") {
        throw error;
      }
      throw new Error("Failed to purchase product");
    }
  }

  /**
   * 상품 좋아요 토글
   * @param {string} productId - 상품 ID
   * @param {string} userId - 사용자 ID
   * @return {Promise<Object>} 좋아요 결과
   */
  async toggleProductLike(productId, userId) {
    try {
      // 상품 존재 확인
      const product = await this.firestoreService.getDocument("products", productId);
      if (!product) {
        const error = new Error("Product not found");
        error.code = "NOT_FOUND";
        throw error;
      }

      // 기존 좋아요 확인
      const existingLikes = await this.firestoreService.getCollectionWhere(
        "likes",
        "targetId",
        "==",
        productId,
      );
      const userLike = existingLikes.find(
        (like) => like.userId === userId && like.type === "PRODUCT",
      );

      let isLiked = false;

      if (userLike) {
        // 좋아요 취소
        await this.firestoreService.deleteDocument("likes", userLike.id);
        isLiked = false;

        // 상품 좋아요 수 감소
        await this.firestoreService.updateDocument("products", productId, {
          likesCount: FieldValue.increment(-1),
          updatedAt: new Date(),
        });
      } else {
        // 좋아요 등록
        await this.firestoreService.addDocument("likes", {
          type: "PRODUCT",
          targetId: productId,
          userId,
          createdAt: new Date(),
        });
        isLiked = true;

        // 상품 좋아요 수 증가
        await this.firestoreService.updateDocument("products", productId, {
          likesCount: FieldValue.increment(1),
          updatedAt: new Date(),
        });
      }

      // 업데이트된 상품 정보 조회
      const updatedProduct = await this.firestoreService.getDocument("products", productId);

      return {
        productId,
        userId,
        isLiked,
        likesCount: updatedProduct.likesCount || 0,
      };
    } catch (error) {
      console.error("Toggle product like error:", error.message);
      if (error.code === "NOT_FOUND") {
        throw error;
      }
      throw new Error("Failed to toggle product like");
    }
  }

  /**
   * 상품 Q&A 질문 작성
   * @param {string} productId - 상품 ID
   * @param {string} userId - 사용자 ID
   * @param {Array} content - 질문 내용
   * @return {Promise<Object>} 생성된 Q&A
   */
  async createProductQnA(productId, userId, content) {
    try {
      if (!content || content.length === 0) {
        const error = new Error("Content is required");
        error.code = "BAD_REQUEST";
        throw error;
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
        if (item.videoSource !== undefined) mediaItem.videoSource = item.videoSource;
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
        userId,
        content,
        media,
        answerContent: null,
        answerMedia: [],
        likesCount: 0,
        createdAt: new Date(),
      };

      const qnaId = await this.firestoreService.addDocument("qnas", qnaData);

      return {
        qnaId,
        productId,
        userId,
        content,
        media,
        answerContent: null,
        answerMedia: [],
        likesCount: 0,
        createdAt: qnaData.createdAt,
      };
    } catch (error) {
      console.error("Create product Q&A error:", error.message);
      if (error.code === "BAD_REQUEST") {
        throw error;
      }
      throw new Error("Failed to create product Q&A");
    }
  }

  /**
   * 상품 Q&A 질문 수정
   * @param {string} qnaId - Q&A ID
   * @param {Array} content - 수정할 내용
   * @return {Promise<Object>} 수정된 Q&A
   */
  async updateProductQnA(qnaId, content) {
    try {
      if (!content || content.length === 0) {
        const error = new Error("Content is required");
        error.code = "BAD_REQUEST";
        throw error;
      }

      const qna = await this.firestoreService.getDocument("qnas", qnaId);
      if (!qna) {
        const error = new Error("Q&A not found");
        error.code = "NOT_FOUND";
        throw error;
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
        if (item.videoSource !== undefined) mediaItem.videoSource = item.videoSource;
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

      await this.firestoreService.updateDocument("qnas", qnaId, updatedData);

      return {
        qnaId,
        productId: qna.targetId,
        userId: qna.userId,
        content,
        media,
        answerContent: qna.answerContent,
        answerMedia: qna.answerMedia || [],
        likesCount: qna.likesCount || 0,
        updatedAt: updatedData.updatedAt,
      };
    } catch (error) {
      console.error("Update product Q&A error:", error.message);
      if (error.code === "BAD_REQUEST" || error.code === "NOT_FOUND") {
        throw error;
      }
      throw new Error("Failed to update product Q&A");
    }
  }

  /**
   * 상품 Q&A 답변 작성
   * @param {string} qnaId - Q&A ID
   * @param {string} userId - 답변자 ID
   * @param {Array} content - 답변 내용
   * @param {Array} media - 답변 미디어
   * @return {Promise<Object>} 답변이 추가된 Q&A
   */
  async createProductQnAAnswer(qnaId, userId, content, media = []) {
    try {
      if (!content || content.length === 0) {
        const error = new Error("Content is required");
        error.code = "BAD_REQUEST";
        throw error;
      }

      const qna = await this.firestoreService.getDocument("qnas", qnaId);
      if (!qna) {
        const error = new Error("Q&A not found");
        error.code = "NOT_FOUND";
        throw error;
      }

      const updatedData = {
        answerContent: content,
        answerMedia: media,
        answerUserId: userId,
        answerCreatedAt: new Date(),
        updatedAt: new Date(),
      };

      await this.firestoreService.updateDocument("qnas", qnaId, updatedData);

      return {
        qnaId,
        content: qna.content,
        media: qna.media || [],
        answerContent: content,
        answerMedia: media,
        answerUserId: userId,
        likesCount: qna.likesCount || 0,
        createdAt: qna.createdAt,
        answerCreatedAt: updatedData.answerCreatedAt,
      };
    } catch (error) {
      console.error("Create product Q&A answer error:", error.message);
      if (error.code === "BAD_REQUEST" || error.code === "NOT_FOUND") {
        throw error;
      }
      throw new Error("Failed to create product Q&A answer");
    }
  }

  /**
   * 상품 Q&A 좋아요 토글
   * @param {string} qnaId - Q&A ID
   * @param {string} userId - 사용자 ID
   * @return {Promise<Object>} 좋아요 결과
   */
  async toggleProductQnALike(qnaId, userId) {
    try {
      const qna = await this.firestoreService.getDocument("qnas", qnaId);
      if (!qna) {
        const error = new Error("Q&A not found");
        error.code = "NOT_FOUND";
        throw error;
      }

      // 기존 좋아요 확인 (복합 쿼리로 최적화)
      const userLikes = await this.firestoreService.getCollectionWhereMultiple(
        "likes",
        [
          { field: "targetId", operator: "==", value: qnaId },
          { field: "userId", operator: "==", value: userId },
          { field: "type", operator: "==", value: "QNA" },
        ]
      );
      const userLike = userLikes[0];

      let isLiked = false;

      if (userLike) {
        // 좋아요 취소
        await this.firestoreService.deleteDocument("likes", userLike.id);
        isLiked = false;

        // Q&A 좋아요 수 감소
        await this.firestoreService.updateDocument("qnas", qnaId, {
          likesCount: FieldValue.increment(-1),
          updatedAt: new Date(),
        });
      } else {
        // 좋아요 등록
        await this.firestoreService.addDocument("likes", {
          type: "QNA",
          targetId: qnaId,
          userId,
          createdAt: new Date(),
        });
        isLiked = true;

        // Q&A 좋아요 수 증가
        await this.firestoreService.updateDocument("qnas", qnaId, {
          likesCount: FieldValue.increment(1),
          updatedAt: new Date(),
        });
      }

      // 업데이트된 Q&A 정보 조회
      const updatedQna = await this.firestoreService.getDocument("qnas", qnaId);

      return {
        qnaId,
        userId,
        isLiked,
        likesCount: updatedQna.likesCount || 0,
      };
    } catch (error) {
      console.error("Toggle product Q&A like error:", error.message);
      if (error.code === "NOT_FOUND") {
        throw error;
      }
      throw new Error("Failed to toggle product Q&A like");
    }
  }

  /**
   * 상품 Q&A 삭제
   * @param {string} qnaId - Q&A ID
   * @return {Promise<void>}
   */
  async deleteProductQnA(qnaId) {
    try {
      const qna = await this.firestoreService.getDocument("qnas", qnaId);
      if (!qna) {
        const error = new Error("Q&A not found");
        error.code = "NOT_FOUND";
        throw error;
      }

      await this.firestoreService.deleteDocument("qnas", qnaId);
    } catch (error) {
      console.error("Delete product Q&A error:", error.message);
      if (error.code === "NOT_FOUND") {
        throw error;
      }
      throw new Error("Failed to delete product Q&A");
    }
  }
}

module.exports = StoreService;
