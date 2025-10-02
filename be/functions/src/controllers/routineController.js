const firestoreService = require("../services/firestoreService");

// 루틴 목록 조회 (신청/진행/종료 모두 포함) - 페이지네이션 지원
const getAllRoutines = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const size = parseInt(req.query.size) || 10;

    const result = await firestoreService.getCollectionWithPagination(
        "routines",
        {
          page,
          size,
          orderBy: "createdAt",
          orderDirection: "desc",
        },
    );

    // 목록에서는 간소화된 정보만 반환 (새로운 BaseItem 구조)
    if (result.content) {
      result.content = result.content.map((routine) => ({
        id: routine.id,
        name: routine.name,
        description: routine.description,
        status: routine.status,
        price: routine.price,
        currency: routine.currency,
        stockCount: routine.stockCount,
        soldCount: routine.soldCount,
        viewCount: routine.viewCount,
        buyable: routine.buyable,
        sellerId: routine.sellerId,
        sellerName: routine.sellerName,
        deadline: routine.deadline,
        createdAt: routine.createdAt,
        updatedAt: routine.updatedAt,
      }));
    }

    res.json({
      success: true,
      data: result.content || [],
      pagination: result.pageable || {},
    });
  } catch (error) {
    console.error("Error getting routines:", error);
    res.status(500).json({
      success: false,
      message: "루틴 목록 조회 중 오류가 발생했습니다.",
    });
  }
};

// 루틴 상세 조회 (신청페이지 전용)
const getRoutineById = async (req, res) => {
  try {
    const {routineId} = req.params;
    const routine = await firestoreService.getDocument("routines", routineId);

    if (!routine) {
      return res.status(404).json({
        success: false,
        message: "루틴을 찾을 수 없습니다.",
      });
    }

    // 조회수 증가
    const newViewCount = (routine.viewCount || 0) + 1;
    await firestoreService.updateDocument("routines", routineId, {
      viewCount: newViewCount,
      updatedAt: Date.now(),
    });

    // Q&A 조회
    const qnas = await firestoreService.getCollectionWhere(
        "qnas",
        "targetId",
        "==",
        routineId,
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

    // 커뮤니티 게시글 조회 (루틴 인증글)
    let communityPosts = [];
    try {
      // routine-planner 커뮤니티에서 해당 루틴과 관련된 게시글 조회
      const posts = await firestoreService.getCollectionWithPagination(
          `communities/${routineId}/posts`,
          {
            page: 0,
            size: 10,
            orderBy: "createdAt",
            orderDirection: "desc",
            where: [
              {field: "type", operator: "==", value: "ROUTINE_CERT"},
              {field: "refId", operator: "==", value: routineId},
            ],
          },
      );

      communityPosts = (posts.content || []).map((post) => ({
        id: post.id,
        type: post.type,
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
      }));
    } catch (error) {
      console.warn("커뮤니티 게시글 조회 실패:", error.message);
      // 커뮤니티 게시글 조회 실패해도 루틴 정보는 정상 반환
    }

    // 화면에 필요한 정보만 필터링 (새로운 BaseItem 구조)
    const response = {
      id: routine.id,
      name: routine.name,
      description: routine.description,
      status: routine.status,
      price: routine.price,
      currency: routine.currency,
      stockCount: routine.stockCount,
      soldCount: routine.soldCount,
      viewCount: newViewCount,
      buyable: routine.buyable,
      sellerId: routine.sellerId,
      sellerName: routine.sellerName,
      content: routine.content || [],
      media: routine.media || [],
      options: routine.options || [],
      primaryDetails: routine.primaryDetails || [],
      variants: routine.variants || [],
      customFields: routine.customFields || [],
      deadline: routine.deadline,
      createdAt: routine.createdAt,
      updatedAt: routine.updatedAt,
      qna: formattedQnas,
      communityPosts: communityPosts,
    };

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Error getting routine:", error);
    res.status(500).json({
      success: false,
      message: "루틴 조회 중 오류가 발생했습니다.",
    });
  }
};

// 루틴 신청하기
const applyToRoutine = async (req, res) => {
  try {
    const {routineId} = req.params;
    const {
      userId,
      selectedVariant = null,
      quantity = 1,
      customFieldsResponse = {},
    } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId는 필수입니다.",
      });
    }

    // 루틴 정보 조회
    const routine = await firestoreService.getDocument("routines", routineId);
    if (!routine) {
      return res.status(404).json({
        success: false,
        message: "루틴을 찾을 수 없습니다.",
      });
    }

    // 재고 확인
    if (routine.stockCount <= 0) {
      return res.status(400).json({
        success: false,
        message: "루틴이 품절되었습니다.",
      });
    }

    const applicationData = {
      type: "ROUTINE",
      targetId: routineId,
      userId,
      status: "PENDING",
      selectedVariant,
      quantity,
      targetName: routine.name,
      targetPrice: routine.price,
      customFieldsResponse,
      appliedAt: new Date(),
      updatedAt: new Date(),
    };

    const applicationId = await firestoreService.addDocument(
        "applications",
        applicationData,
    );

    // 루틴 카운트 업데이트 (신청 시 즉시 반영)
    await firestoreService.updateDocument("routines", routineId, {
      soldCount: (routine.soldCount || 0) + quantity,
      stockCount: Math.max(0, (routine.stockCount || 0) - quantity),
      updatedAt: Date.now(),
    });

    res.status(201).json({
      success: true,
      data: {
        applicationId,
        type: "ROUTINE",
        targetId: routineId,
        userId,
        status: "PENDING",
        selectedVariant,
        quantity,
        customFieldsResponse,
        appliedAt: applicationData.appliedAt,
        targetName: routine.name,
        targetPrice: routine.price,
      },
      message: "루틴 신청이 완료되었습니다.",
    });
  } catch (error) {
    console.error("Error applying to routine:", error);
    res.status(500).json({
      success: false,
      message: "루틴 신청 중 오류가 발생했습니다.",
    });
  }
};

// QnA 질문 작성
const createQnA = async (req, res) => {
  try {
    const {routineId} = req.params;
    const {content = []} = req.body;

    if (!content || content.length === 0) {
      return res.status(400).json({error: "content is required"});
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
      type: "ROUTINE",
      targetId: routineId,
      userId: "user123", // 하드코딩된 사용자 ID
      content, // 원본 content 그대로 저장
      media,
      answerContent: null,
      answerMedia: [],
      likesCount: 0,
      createdAt: new Date(),
    };

    const qnaId = await firestoreService.addDocument("qnas", qnaData);

    res.status(201).json({
      qnaId,
      routineId,
      userId: qnaData.userId,
      content, // 원본 content 그대로 응답
      media,
      answerContent: null,
      answerMedia: [],
      likesCount: 0,
      createdAt: qnaData.createdAt,
    });
  } catch (error) {
    console.error("Error creating QnA:", error);
    res.status(500).json({error: "Failed to create QnA"});
  }
};

// QnA 질문 수정
const updateQnA = async (req, res) => {
  try {
    const {routineId, qnaId} = req.params;
    const {content = []} = req.body;

    if (!content || content.length === 0) {
      return res.status(400).json({error: "content is required"});
    }

    const qna = await firestoreService.getDocument("qnas", qnaId);

    if (!qna) {
      return res.status(404).json({error: "QnA not found"});
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

    res.json({
      qnaId,
      routineId,
      userId: qna.userId,
      content,
      media,
      answerContent: qna.answerContent,
      answerMedia: qna.answerMedia || [],
      likesCount: qna.likesCount || 0,
      updatedAt: updatedData.updatedAt,
    });
  } catch (error) {
    console.error("Error updating QnA:", error);
    res.status(500).json({error: "Failed to update QnA"});
  }
};

// QnA 답변 작성
const createQnAAnswer = async (req, res) => {
  try {
    const {qnaId} = req.params;
    const {content = [], media = []} = req.body;

    if (!content || content.length === 0) {
      return res.status(400).json({error: "content is required"});
    }

    const qna = await firestoreService.getDocument("qnas", qnaId);

    if (!qna) {
      return res.status(404).json({error: "QnA not found"});
    }

    const updatedData = {
      answerContent: content,
      answerMedia: media,
      answerUserId: req.body.userId || "anonymous",
      answerCreatedAt: new Date(),
      updatedAt: new Date(),
    };

    await firestoreService.updateDocument("qnas", qnaId, updatedData);

    res.json({
      qnaId,
      content: qna.content,
      media: qna.media || [],
      answerContent: content,
      answerMedia: media,
      answerUserId: updatedData.answerUserId,
      likesCount: qna.likesCount || 0,
      createdAt: qna.createdAt,
      answerCreatedAt: updatedData.answerCreatedAt,
    });
  } catch (error) {
    console.error("Error creating QnA answer:", error);
    res.status(500).json({error: "Failed to create QnA answer"});
  }
};

// QnA 좋아요 토글
const toggleQnALike = async (req, res) => {
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
    const existingLikesResult =
      await firestoreService.getCollectionWithPagination("likes", {
        page: 0,
        size: 1,
        where: [
          {field: "type", operator: "==", value: "QNA"},
          {field: "targetId", operator: "==", value: qnaId},
          {field: "userId", operator: "==", value: "user123"},
        ],
      });

    const existingLikes = existingLikesResult.content || [];
    let isLiked = false;
    let likeCount = qna.likesCount || 0;

    if (existingLikes.length === 0) {
      // 좋아요 추가
      await firestoreService.addDocument("likes", {
        type: "QNA",
        targetId: qnaId,
        userId: "user123",
        createdAt: new Date(),
      });
      likeCount += 1;
      isLiked = true;
    } else {
      // 좋아요 제거
      await firestoreService.deleteDocument("likes", existingLikes[0].id);
      likeCount = Math.max(0, likeCount - 1);
      isLiked = false;
    }

    // QnA 좋아요 수 업데이트
    await firestoreService.updateDocument("qnas", qnaId, {
      likesCount: likeCount,
      updatedAt: new Date(),
    });

    res.json({
      success: true,
      data: {
        qnaId,
        userId: "user123",
        isLiked,
        likeCount,
      },
      message: isLiked ? "좋아요를 추가했습니다." : "좋아요를 취소했습니다.",
    });
  } catch (error) {
    console.error("Error toggling QnA like:", error);
    res.status(500).json({
      success: false,
      message: "좋아요 처리 중 오류가 발생했습니다.",
    });
  }
};

// QnA 삭제
const deleteQnA = async (req, res) => {
  try {
    const {qnaId} = req.params;

    const qna = await firestoreService.getDocument("qnas", qnaId);

    if (!qna) {
      return res.status(404).json({error: "QnA not found"});
    }

    await firestoreService.deleteDocument("qnas", qnaId);

    res.json({message: "QnA가 성공적으로 삭제되었습니다"});
  } catch (error) {
    console.error("Error deleting QnA:", error);
    res.status(500).json({error: "Failed to delete QnA"});
  }
};

// 루틴 좋아요 토글
const toggleRoutineLike = async (req, res) => {
  try {
    const {routineId} = req.params;

    // 루틴 존재 확인
    const routine = await firestoreService.getDocument("routines", routineId);

    if (!routine) {
      return res.status(404).json({
        success: false,
        message: "루틴을 찾을 수 없습니다.",
      });
    }

    // 기존 좋아요 확인
    const existingLikesResult =
      await firestoreService.getCollectionWithPagination("likes", {
        page: 0,
        size: 1,
        where: [
          {field: "type", operator: "==", value: "ROUTINE"},
          {field: "targetId", operator: "==", value: routineId},
          {field: "userId", operator: "==", value: "user123"},
        ],
      });
    const existingLikes = existingLikesResult.content;

    let isLiked = false;
    let likeCount = routine.likesCount || 0;

    if (existingLikes.length === 0) {
      // 좋아요 추가
      await firestoreService.addDocument("likes", {
        type: "ROUTINE",
        targetId: routineId,
        userId: "user123",
        createdAt: new Date(),
      });

      isLiked = true;
      likeCount += 1;
    } else {
      // 좋아요 제거
      await firestoreService.deleteDocument("likes", existingLikes[0].id);

      isLiked = false;
      likeCount = Math.max(0, likeCount - 1);
    }

    // 루틴 좋아요 수 업데이트
    await firestoreService.updateDocument("routines", routineId, {
      likesCount: likeCount,
      updatedAt: new Date(),
    });

    res.json({
      success: true,
      data: {
        routineId,
        userId: "user123",
        isLiked,
        likeCount,
      },
      message: isLiked ? "좋아요를 추가했습니다." : "좋아요를 취소했습니다.",
    });
  } catch (error) {
    console.error("Error toggling routine like:", error);
    res.status(500).json({
      success: false,
      message: "좋아요 처리 중 오류가 발생했습니다.",
    });
  }
};

module.exports = {
  getAllRoutines,
  getRoutineById,
  applyForRoutine: applyToRoutine, // 별칭 추가
  createQnA,
  updateQnA,
  createQnAAnswer,
  toggleQnALike,
  deleteQnA,
  toggleRoutineLike,
};
