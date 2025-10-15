const {FieldValue} = require("firebase-admin/firestore");
const FirestoreService = require("./firestoreService");
const {successResponse} = require("../utils/helpers");

/**
 * Routine Service (비즈니스 로직 계층)
 * 루틴 관련 모든 비즈니스 로직 처리
 */
class RoutineService {
  constructor() {
    this.firestoreService = new FirestoreService("routines");
  }

  /**
   * 루틴 목록 조회 (페이지네이션 지원)
   * @param {Object} options - 페이지네이션 옵션
   * @return {Promise<Object>} 페이지네이션된 루틴 목록
   */
  async getAllRoutines(options = {}) {
    try {
      const {
        page = 0,
        size = 10,
        orderBy = "createdAt",
        orderDirection = "desc"
      } = options;

      const result = await this.firestoreService.getWithPagination({
        page,
        size,
        orderBy,
        orderDirection,
      });

      // 목록에서는 간소화된 정보만 반환 (BaseItem 구조)
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

      return {
        content: result.content || [],
        pagination: result.pageable || {},
      };
    } catch (error) {
      console.error("Get all routines error:", error.message);
      throw new Error("Failed to get routines");
    }
  }

  /**
   * 루틴 상세 조회
   * @param {string} routineId - 루틴 ID
   * @return {Promise<Object>} 루틴 상세 정보
   */
  async getRoutineById(routineId) {
    try {
      const routine = await this.firestoreService.getDocument("routines", routineId);

      if (!routine) {
        const error = new Error("Routine not found");
        error.code = "NOT_FOUND";
        throw error;
      }

      // 조회수 증가
      const newViewCount = (routine.viewCount || 0) + 1;
      this.firestoreService.updateDocument("routines", routineId, {
        viewCount: newViewCount,
        updatedAt: Date.now(),
      }).catch(error => {
        console.error("조회수 증가 실패:", error);
      });

      // Q&A 조회
      const qnas = await this.firestoreService.getCollectionWhere(
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
        askedBy: qna.userId,
        answeredBy: qna.answerUserId,
        askedAt: qna.createdAt,
        answeredAt: qna.answerCreatedAt || null,
        likesCount: qna.likesCount || 0,
      }));

      // 커뮤니티 게시글 조회 (루틴 인증글)
      let communityPosts = [];
      try {
        const communityPostsService = new FirestoreService(`communities/${routineId}/posts`);
        const posts = await communityPostsService.getWithPagination({
          page: 0,
          size: 10,
          orderBy: "createdAt",
          orderDirection: "desc",
          where: [{field: "type", operator: "==", value: "ROUTINE_CERT"}],
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
        }));
      } catch (error) {
        console.warn("커뮤니티 게시글 조회 실패:", error.message);
      }

      return {
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
    } catch (error) {
      console.error("Get routine by ID error:", error.message);
      if (error.code === "NOT_FOUND") {
        throw error;
      }
      throw new Error("Failed to get routine");
    }
  }

  /**
   * 루틴 신청하기
   * @param {string} routineId - 루틴 ID
   * @param {string} userId - 사용자 ID
   * @param {Object} applicationData - 신청 데이터
   * @return {Promise<Object>} 신청 결과
   */
  async applyToRoutine(routineId, userId, applicationData) {
    try {
      const {
        selectedVariant = null,
        quantity = 1,
        customFieldsResponse = {},
      } = applicationData;

      // 루틴 정보 조회
      const routine = await this.firestoreService.getDocument("routines", routineId);
      if (!routine) {
        const error = new Error("Routine not found");
        error.code = "NOT_FOUND";
        throw error;
      }

      // 재고 확인
      if (routine.stockCount <= 0) {
        const error = new Error("Routine is out of stock");
        error.code = "OUT_OF_STOCK";
        throw error;
      }

      const applicationPayload = {
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

      const applicationId = await this.firestoreService.addDocument(
        "applications",
        applicationPayload,
      );

      // 루틴 카운트 업데이트 (신청 시 즉시 반영)
      await this.firestoreService.updateDocument("routines", routineId, {
        soldCount: (routine.soldCount || 0) + quantity,
        stockCount: Math.max(0, (routine.stockCount || 0) - quantity),
        updatedAt: Date.now(),
      });

      return {
        applicationId,
        type: "ROUTINE",
        targetId: routineId,
        userId,
        status: "PENDING",
        selectedVariant,
        quantity,
        customFieldsResponse,
        appliedAt: applicationPayload.appliedAt,
        targetName: routine.name,
        targetPrice: routine.price,
      };
    } catch (error) {
      console.error("Apply to routine error:", error.message);
      if (error.code === "NOT_FOUND" || error.code === "OUT_OF_STOCK") {
        throw error;
      }
      throw new Error("Failed to apply to routine");
    }
  }

  /**
   * QnA 질문 작성
   * @param {string} routineId - 루틴 ID
   * @param {string} userId - 사용자 ID
   * @param {Array} content - 질문 내용
   * @return {Promise<Object>} 생성된 QnA
   */
  async createQnA(routineId, userId, content) {
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
        type: "ROUTINE",
        targetId: routineId,
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
        routineId,
        userId,
        content,
        media,
        answerContent: null,
        answerMedia: [],
        likesCount: 0,
        createdAt: qnaData.createdAt,
      };
    } catch (error) {
      console.error("Create QnA error:", error.message);
      if (error.code === "BAD_REQUEST") {
        throw error;
      }
      throw new Error("Failed to create QnA");
    }
  }

  /**
   * QnA 질문 수정
   * @param {string} qnaId - QnA ID
   * @param {Array} content - 수정할 내용
   * @param {string} userId - 사용자 ID (소유권 검증용)
   * @return {Promise<Object>} 수정된 QnA
   */
  async updateQnA(qnaId, content, userId) {
    try {
      if (!content || content.length === 0) {
        const error = new Error("Content is required");
        error.code = "BAD_REQUEST";
        throw error;
      }

      const qna = await this.firestoreService.getDocument("qnas", qnaId);
      if (!qna) {
        const error = new Error("QnA not found");
        error.code = "NOT_FOUND";
        throw error;
      }

      // 소유권 검증
      if (qna.userId !== userId) {
        const error = new Error("QnA 수정 권한이 없습니다");
        error.code = "FORBIDDEN";
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
        routineId: qna.targetId,
        userId: qna.userId,
        content,
        media,
        answerContent: qna.answerContent,
        answerMedia: qna.answerMedia || [],
        likesCount: qna.likesCount || 0,
        updatedAt: updatedData.updatedAt,
      };
    } catch (error) {
      console.error("Update QnA error:", error.message);
      if (error.code === "BAD_REQUEST" || error.code === "NOT_FOUND" || error.code === "FORBIDDEN") {
        throw error;
      }
      throw new Error("Failed to update QnA");
    }
  }

  /**
   * QnA 답변 작성
   * @param {string} qnaId - QnA ID
   * @param {string} userId - 답변자 ID
   * @param {Array} content - 답변 내용
   * @param {Array} media - 답변 미디어
   * @return {Promise<Object>} 답변이 추가된 QnA
   */
  async createQnAAnswer(qnaId, userId, content, media = []) {
    try {
      if (!content || content.length === 0) {
        const error = new Error("Content is required");
        error.code = "BAD_REQUEST";
        throw error;
      }

      const qna = await this.firestoreService.getDocument("qnas", qnaId);
      if (!qna) {
        const error = new Error("QnA not found");
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
      console.error("Create QnA answer error:", error.message);
      if (error.code === "BAD_REQUEST" || error.code === "NOT_FOUND") {
        throw error;
      }
      throw new Error("Failed to create QnA answer");
    }
  }

  /**
   * QnA 좋아요 토글
   * @param {string} qnaId - QnA ID
   * @param {string} userId - 사용자 ID
   * @return {Promise<Object>} 좋아요 결과
   */
  async toggleQnALike(qnaId, userId) {
    try {
      const qna = await this.firestoreService.getDocument("qnas", qnaId);
      if (!qna) {
        const error = new Error("QnA not found");
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

        // QnA 좋아요 수 감소
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

        // QnA 좋아요 수 증가
        await this.firestoreService.updateDocument("qnas", qnaId, {
          likesCount: FieldValue.increment(1),
          updatedAt: new Date(),
        });
      }

      // 업데이트된 QnA 정보 조회
      const updatedQna = await this.firestoreService.getDocument("qnas", qnaId);

      return {
        qnaId,
        userId,
        isLiked,
        likesCount: updatedQna.likesCount || 0,
      };
    } catch (error) {
      console.error("Toggle QnA like error:", error.message);
      if (error.code === "NOT_FOUND") {
        throw error;
      }
      throw new Error("Failed to toggle QnA like");
    }
  }

  /**
   * QnA 삭제
   * @param {string} qnaId - QnA ID
   * @param {string} userId 
   * @return {Promise<void>}
   */
  async deleteQnA(qnaId, userId) {
    try {
      const qna = await this.firestoreService.getDocument("qnas", qnaId);
      if (!qna) {
        const error = new Error("QnA not found");
        error.code = "NOT_FOUND";
        throw error;
      }
      if (qna.userId !== userId) {
        const error = new Error("QnA 삭제 권한이 없습니다");
        error.code = "FORBIDDEN";
        throw error;
      }

      await this.firestoreService.deleteDocument("qnas", qnaId);
    } catch (error) {
      console.error("Delete QnA error:", error.message);
      if (error.code === "NOT_FOUND" || error.code === "FORBIDDEN") {
        throw error;
      }
      throw new Error("Failed to delete QnA");
    }
  }

  /**
   * 루틴 좋아요 토글
   * @param {string} routineId - 루틴 ID
   * @param {string} userId - 사용자 ID
   * @return {Promise<Object>} 좋아요 결과
   */
  async toggleRoutineLike(routineId, userId) {
    try {
      // 루틴 존재 확인
      const routine = await this.firestoreService.getDocument("routines", routineId);
      if (!routine) {
        const error = new Error("Routine not found");
        error.code = "NOT_FOUND";
        throw error;
      }

      // 기존 좋아요 확인
      const existingLikes = await this.firestoreService.getCollectionWhere(
        "likes",
        "targetId",
        "==",
        routineId,
      );
      const userLike = existingLikes.find(
        (like) => like.userId === userId && like.type === "ROUTINE",
      );

      let isLiked = false;

      if (userLike) {
        // 좋아요 취소
        await this.firestoreService.deleteDocument("likes", userLike.id);
        isLiked = false;

        // 루틴 좋아요 수 감소
        await this.firestoreService.updateDocument("routines", routineId, {
          likesCount: FieldValue.increment(-1),
          updatedAt: new Date(),
        });
      } else {
        // 좋아요 등록
        await this.firestoreService.addDocument("likes", {
          type: "ROUTINE",
          targetId: routineId,
          userId,
          createdAt: new Date(),
        });
        isLiked = true;

        // 루틴 좋아요 수 증가
        await this.firestoreService.updateDocument("routines", routineId, {
          likesCount: FieldValue.increment(1),
          updatedAt: new Date(),
        });
      }

      // 업데이트된 루틴 정보 조회
      const updatedRoutine = await this.firestoreService.getDocument("routines", routineId);

      return {
        routineId,
        userId,
        isLiked,
        likesCount: updatedRoutine.likesCount || 0,
      };
    } catch (error) {
      console.error("Toggle routine like error:", error.message);
      if (error.code === "NOT_FOUND") {
        throw error;
      }
      throw new Error("Failed to toggle routine like");
    }
  }
}

module.exports = RoutineService;
