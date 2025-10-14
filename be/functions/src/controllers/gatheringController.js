const FirestoreService = require("../services/firestoreService");
const firestoreService = new FirestoreService("gatherings");
const {FieldValue} = require("firebase-admin/firestore");

// 소모임 목록 조회 - 페이지네이션 지원 (간소화된 정보만 반환)
const getAllGatherings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const size = parseInt(req.query.size) || 10;

    const result = await firestoreService.getWithPagination({
      page,
      size,
      orderBy: "createdAt",
      orderDirection: "desc",
    });

    // 목록에서는 간소화된 정보만 반환 (새로운 BaseItem 구조)
    if (result.content) {
      result.content = result.content.map((gathering) => ({
        id: gathering.id,
        name: gathering.name,
        description: gathering.description,
        status: gathering.status,
        price: gathering.price,
        currency: gathering.currency,
        stockCount: gathering.stockCount,
        soldCount: gathering.soldCount,
        viewCount: gathering.viewCount,
        buyable: gathering.buyable,
        sellerId: gathering.sellerId,
        sellerName: gathering.sellerName,
        deadline: gathering.deadline,
        createdAt: gathering.createdAt,
        updatedAt: gathering.updatedAt,
      }));
    }

    return res.paginate(result.content || [], result.pageable || {});
  } catch (error) {
    console.error("Error getting gatherings:", error);
    return next(error);
  }
};

// 소모임 상세 조회 (신청페이지 전용)
const getGatheringById = async (req, res, next) => {
  try {
    const {gatheringId} = req.params;
    const gathering = await firestoreService.getDocument(
        "gatherings",
        gatheringId,
    );

    if (!gathering) {
      const err = new Error("소모임을 찾을 수 없습니다");
      err.code = "NOT_FOUND";
      throw err;
    }

    // 조회수 증가 (원자적 업데이트)
    await firestoreService.updateDocument("gatherings", gatheringId, {
      viewCount: FieldValue.increment(1),
      updatedAt: new Date(),
    });

    // Q&A 조회
    const qnas = await firestoreService.getCollectionWhere(
        "qnas",
        "targetId",
        "==",
        gatheringId,
    );
    const formattedQnas = qnas.map((qna) => ({
      id: qna.id,
      content: qna.content || [],
      media: qna.media || [],
      answerContent: qna.answerContent || null,
      answerMedia: qna.answerMedia || [],
      answerUserId: qna.answerUserId || null,
      askedBy: qna.userId, // 실제로는 사용자 이름으로 변환 필요
      answeredBy: qna.answerUserId, // 실제로는 사용자 이름으로 변환 필요
      askedAt: qna.createdAt,
      answeredAt: qna.answerCreatedAt || null,
      likesCount: qna.likesCount || 0,
    }));

    // 커뮤니티 게시글 조회 (소모임 후기글)
    let communityPosts = [];
    try {
      // 소모임 ID와 동일한 커뮤니티 ID에서 해당 소모임과 관련된 게시글 조회
      const communityPostsService = new FirestoreService(`communities/${gatheringId}/posts`);
      const posts = await communityPostsService.getWithPagination({
        page: 0,
        size: 10,
        orderBy: "createdAt",
        orderDirection: "desc",
        where: [
          {field: "type", operator: "==", value: "GATHERING_REVIEW"},
        ],
      });

      communityPosts = (posts.content || []).map((post) => ({
        id: post.id,
        type: post.type,
        authorId: post.authorId,
        author: post.author,
        title: post.title,
        content: post.content,
        media: post.media,
        channel: post.channel,
        isLocked: post.isLocked,
        visibility: post.visibility,
        likesCount: post.likesCount || 0,
        commentsCount: post.commentsCount || 0,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        community: {
          id: gatheringId,
          name: "소모임 커뮤니티",
        },
      }));
    } catch (error) {
      console.warn("커뮤니티 게시글 조회 실패:", error.message);
      // 커뮤니티 게시글 조회 실패해도 소모임 정보는 정상 반환
    }

    // 화면에 필요한 정보만 필터링 (새로운 BaseItem 구조)
    const response = {
      id: gathering.id,
      name: gathering.name,
      description: gathering.description,
      status: gathering.status,
      price: gathering.price,
      currency: gathering.currency,
      stockCount: gathering.stockCount,
      soldCount: gathering.soldCount,
      viewCount: (gathering.viewCount || 0) + 1,
      buyable: gathering.buyable,
      sellerId: gathering.sellerId,
      sellerName: gathering.sellerName,
      content: gathering.content || [],
      media: gathering.media || [],
      options: gathering.options || [],
      primaryDetails: gathering.primaryDetails || [],
      variants: gathering.variants || [],
      customFields: gathering.customFields || [],
      deadline: gathering.deadline,
      createdAt: gathering.createdAt,
      updatedAt: gathering.updatedAt,
      qna: formattedQnas,
      communityPosts: communityPosts,
    };

    return res.success(response);
  } catch (error) {
    console.error("Error getting gathering:", error);
    return next(error);
  }
};

// 소모임 신청하기
const applyToGathering = async (req, res, next) => {
  try {
    const {gatheringId} = req.params;
    const {
      selectedVariant = null,
      quantity = 1,
      customFieldsResponse = {},
    } = req.body;

    // authGuard에서 검증된 사용자 ID 사용
    const userId = req.user.uid;

    // 소모임 정보 조회
    const gathering = await firestoreService.getDocument(
        "gatherings",
        gatheringId,
    );
    if (!gathering) {
      const err = new Error("소모임을 찾을 수 없습니다");
      err.code = "NOT_FOUND";
      throw err;
    }

    // 재고 확인
    if (gathering.stockCount <= 0) {
      const err = new Error("소모임이 품절되었습니다");
      err.code = "OUT_OF_STOCK";
      throw err;
    }

    const applicationData = {
      type: "GATHERING",
      targetId: gatheringId,
      userId,
      status: "PENDING",
      selectedVariant,
      quantity,
      targetName: gathering.name,
      targetPrice: gathering.price,
      customFieldsResponse,
      appliedAt: new Date(),
      updatedAt: new Date(),
    };

    const applicationId = await firestoreService.addDocument(
        "applications",
        applicationData,
    );

    // 소모임 카운트 업데이트 (신청 시 즉시 반영)
    await firestoreService.updateDocument("gatherings", gatheringId, {
      soldCount: (gathering.soldCount || 0) + quantity,
      stockCount: Math.max(0, (gathering.stockCount || 0) - quantity),
      updatedAt: new Date(),
    });

    const responseData = {
      applicationId,
      type: "GATHERING",
      targetId: gatheringId,
      userId,
      status: "PENDING",
      selectedVariant,
      quantity,
      targetName: gathering.name,
      targetPrice: gathering.price,
      customFieldsResponse,
      appliedAt: applicationData.appliedAt.toISOString(),
    };

    return res.created(responseData);
  } catch (error) {
    console.error("Error applying to gathering:", error);
    return next(error);
  }
};

// QnA 질문 작성
const createQnA = async (req, res, next) => {
  try {
    const {gatheringId} = req.params;
    const {content = []} = req.body;

    if (!content || content.length === 0) {
      const err = new Error("content is required");
      err.code = "INVALID_REQUEST";
      throw err;
    }

    // content 배열에서 미디어만 분리 (content는 그대로 유지)
    const mediaItems = content.filter(
        (item) => item.type === "image" || item.type === "video",
    );

    // media 배열 형식으로 변환 (url 필드 추가, undefined 값 제거)
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
      type: "GATHERING",
      targetId: gatheringId,
      userId: req.user.uid,
      content, // 원본 content 그대로 저장
      media,
      answerContent: null,
      answerMedia: [],
      likesCount: 0,
      createdAt: new Date(),
    };

    const qnaId = await firestoreService.addDocument("qnas", qnaData);

    const responseData = {
      qnaId,
      gatheringId,
      userId: qnaData.userId,
      content, // 원본 content 그대로 응답
      media,
      answerContent: null,
      answerMedia: [],
      likesCount: 0,
      createdAt: qnaData.createdAt,
    };

    return res.created(responseData);
  } catch (error) {
    console.error("Error creating QnA:", error);
    return next(error);
  }
};

// QnA 질문 수정
const updateQnA = async (req, res, next) => {
  try {
    const {gatheringId, qnaId} = req.params;
    const {content = []} = req.body;

    if (!content || content.length === 0) {
      const err = new Error("content is required");
      err.code = "INVALID_REQUEST";
      throw err;
    }

    const qna = await firestoreService.getDocument("qnas", qnaId);

    if (!qna) {
      const err = new Error("QnA not found");
      err.code = "NOT_FOUND";
      throw err;
    }

    // content 배열에서 미디어만 분리 (content는 그대로 유지)
    const mediaItems = content.filter(
        (item) => item.type === "image" || item.type === "video",
    );

    // media 배열 형식으로 변환 (url 필드 추가, undefined 값 제거)
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

    const responseData = {
      qnaId,
      gatheringId,
      userId: qna.userId,
      content,
      media,
      answerContent: qna.answerContent,
      answerMedia: qna.answerMedia || [],
      likesCount: qna.likesCount || 0,
      updatedAt: updatedData.updatedAt,
    };

    return res.success(responseData);
  } catch (error) {
    console.error("Error updating QnA:", error);
    return next(error);
  }
};

// QnA 답변 작성
const createQnAAnswer = async (req, res, next) => {
  try {
    const {qnaId} = req.params;
    const {content = [], media = []} = req.body;

    if (!content || content.length === 0) {
      const err = new Error("content is required");
      err.code = "INVALID_REQUEST";
      throw err;
    }

    const qna = await firestoreService.getDocument("qnas", qnaId);

    if (!qna) {
      const err = new Error("QnA not found");
      err.code = "NOT_FOUND";
      throw err;
    }

    const updatedData = {
      answerContent: content,
      answerMedia: media,
      answerUserId: req.user.uid,
      answerCreatedAt: new Date(),
      updatedAt: new Date(),
    };

    await firestoreService.updateDocument("qnas", qnaId, updatedData);

    const responseData = {
      qnaId,
      content: qna.content,
      media: qna.media || [],
      answerContent: content,
      answerMedia: media,
      answerUserId: updatedData.answerUserId,
      likesCount: qna.likesCount || 0,
      createdAt: qna.createdAt,
      answerCreatedAt: updatedData.answerCreatedAt,
    };

    return res.success(responseData);
  } catch (error) {
    console.error("Error creating QnA answer:", error);
    return next(error);
  }
};

// QnA 좋아요 토글
const toggleQnALike = async (req, res, next) => {
  try {
    const {qnaId} = req.params;

    const qna = await firestoreService.getDocument("qnas", qnaId);

    if (!qna) {
      const err = new Error("QnA를 찾을 수 없습니다");
      err.code = "NOT_FOUND";
      throw err;
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

    const responseData = {
      qnaId,
      userId: req.user.uid,
      isLiked,
      likeCount: updatedQna.likesCount || 0,
    };

    return res.success(responseData);
  } catch (error) {
    console.error("Error toggling QnA like:", error);
    return next(error);
  }
};

// QnA 삭제
const deleteQnA = async (req, res, next) => {
  try {
    const {qnaId} = req.params;

    const qna = await firestoreService.getDocument("qnas", qnaId);

    if (!qna) {
      const err = new Error("QnA not found");
      err.code = "NOT_FOUND";
      throw err;
    }

    await firestoreService.deleteDocument("qnas", qnaId);

    return res.noContent();
  } catch (error) {
    console.error("Error deleting QnA:", error);
    return next(error);
  }
};

// 소모임 좋아요 토글
const toggleGatheringLike = async (req, res, next) => {
  try {
    const {gatheringId} = req.params;

    // 소모임 조회
    const gathering = await firestoreService.getDocument(
        "gatherings",
        gatheringId,
    );
    if (!gathering) {
      const err = new Error("소모임을 찾을 수 없습니다");
      err.code = "NOT_FOUND";
      throw err;
    }

    // 기존 좋아요 확인
    const existingLikes = await firestoreService.getCollectionWhere(
        "likes",
        "targetId",
        "==",
        gatheringId,
    );
    const userLike = existingLikes.find(
        (like) => like.userId === req.user.uid && like.type === "GATHERING",
    );

    let isLiked = false;

    if (userLike) {
      // 좋아요 취소
      await firestoreService.deleteDocument("likes", userLike.id);
      isLiked = false;

      // 소모임 좋아요 수 감소 (원자적 업데이트)
      await firestoreService.updateDocument("gatherings", gatheringId, {
        likesCount: FieldValue.increment(-1),
        updatedAt: new Date(),
      });
    } else {
      // 좋아요 등록
      await firestoreService.addDocument("likes", {
        type: "GATHERING",
        targetId: gatheringId,
        userId: req.user.uid,
        createdAt: new Date(),
      });
      isLiked = true;

      // 소모임 좋아요 수 증가 (원자적 업데이트)
      await firestoreService.updateDocument("gatherings", gatheringId, {
        likesCount: FieldValue.increment(1),
        updatedAt: new Date(),
      });
    }

    // 업데이트된 소모임 정보 조회
    const updatedGathering = await firestoreService.getDocument("gatherings", gatheringId);

    const responseData = {
      gatheringId,
      userId: req.user.uid,
      isLiked,
      likeCount: updatedGathering.likesCount || 0,
    };

    return res.success(responseData);
  } catch (error) {
    console.error("Error toggling gathering like:", error);
    return next(error);
  }
};

module.exports = {
  getAllGatherings,
  getGatheringById,
  applyToGathering,
  createQnA,
  updateQnA,
  createQnAAnswer,
  toggleQnALike,
  deleteQnA,
  toggleGatheringLike,
};
