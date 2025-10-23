const {FieldValue} = require("firebase-admin/firestore");
const FirestoreService = require("./firestoreService");
const CommunityService = require("./communityService");
const {successResponse, maskPhoneNumber, isValidPhoneNumber} = require("../utils/helpers");

/**
 * Routine Service (비즈니스 로직 계층)
 * 루틴 관련 모든 비즈니스 로직 처리
 */
class RoutineService {
  constructor() {
    this.firestoreService = new FirestoreService("routines");
    this.communityService = new CommunityService();
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
      let {
        selectedVariant = null,
        quantity = 1,
        customFieldsRequest = {},
        activityNickname,
        activityPhoneNumber,
        region,
        currentSituation,
        applicationSource,
        applicationMotivation,
        canAttendEvents,
      } = applicationData;

      // 수량 검증 (트랜잭션 진입 전)
      quantity = Number(quantity);
      if (!Number.isInteger(quantity) || quantity <= 0) {
        const error = new Error("수량은 1 이상의 정수여야 합니다");
        error.code = "BAD_REQUEST";
        throw error;
      }

      // 전화번호 형식 검증
      if (activityPhoneNumber && !isValidPhoneNumber(activityPhoneNumber)) {
        const error = new Error("올바른 전화번호 형식이 아닙니다");
        error.code = "BAD_REQUEST";
        throw error;
      }

      if (activityNickname) {
        const isNicknameAvailable = await this.communityService.checkNicknameAvailability(routineId, activityNickname);
        if (!isNicknameAvailable) {
          const error = new Error("이미 사용 중인 닉네임입니다");
          error.code = "NICKNAME_DUPLICATE";
          throw error;
        }
      }

      const result = await this.firestoreService.runTransaction(async (transaction) => {
        const routineRef = this.firestoreService.db.collection("routines").doc(routineId);
        const routineDoc = await transaction.get(routineRef);
        
        if (!routineDoc.exists) {
          const error = new Error("Routine not found");
          error.code = "NOT_FOUND";
          throw error;
        }

        // 결정적 문서 ID로 중복 신청 방지
        const applicationRef = this.firestoreService.db
          .collection("applications")
          .doc(`ROUTINE:${routineId}:${userId}`);
        const applicationDoc = await transaction.get(applicationRef);
        
        if (applicationDoc.exists) {
          const error = new Error("Already applied to this routine");
          error.code = "ALREADY_APPLIED";
          throw error;
        }

        const routine = routineDoc.data();
        const currentStockCount = routine.stockCount || 0;

        if (currentStockCount < quantity) {
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
          customFieldsRequest,
          activityNickname,
          activityPhoneNumber,
          region,
          currentSituation,
          applicationSource,
          applicationMotivation,
          canAttendEvents,
          appliedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        };

        transaction.set(applicationRef, applicationPayload);

        transaction.update(routineRef, {
          soldCount: FieldValue.increment(quantity),
          stockCount: FieldValue.increment(-quantity),
          updatedAt: FieldValue.serverTimestamp(),
        });

        if (activityNickname) {
          const memberRef = this.firestoreService.db
            .collection("communities")
            .doc(routineId)
            .collection("members")
            .doc(userId);
          
          const memberData = {
            userId,
            nickname: activityNickname,
            role: "member",
            status: "active",
            joinedAt: FieldValue.serverTimestamp(),
            lastActiveAt: FieldValue.serverTimestamp(),
          };

          transaction.set(memberRef, memberData);
        }

        return {
          applicationId: applicationRef.id,
          routine,
          applicationPayload,
        };
      });

      // 커밋 후 문서 재조회로 서버 타임스탬프 해석
      const application = await this.firestoreService.getDocument("applications", result.applicationId);
      const appliedAtIso = application?.appliedAt?.toDate
        ? application.appliedAt.toDate().toISOString()
        : undefined;

      return {
        applicationId: result.applicationId,
        type: "ROUTINE",
        targetId: routineId,
        userId,
        status: "PENDING",
        selectedVariant,
        quantity,
        customFieldsRequest,
        activityNickname,
        activityPhoneNumber: maskPhoneNumber(activityPhoneNumber),
        region,
        currentSituation,
        applicationSource,
        applicationMotivation,
        canAttendEvents,
        appliedAt: appliedAtIso,
        targetName: result.routine.name,
        targetPrice: result.routine.price,
      };
    } catch (error) {
      console.error("Apply to routine error:", error.message);
      if (error.code === "NOT_FOUND" || error.code === "OUT_OF_STOCK" || error.code === "ALREADY_APPLIED" || error.code === "BAD_REQUEST" || error.code === "NICKNAME_DUPLICATE") {
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
      const result = await this.firestoreService.runTransaction(async (transaction) => {
        const qnaRef = this.firestoreService.db.collection("qnas").doc(qnaId);
        const qnaDoc = await transaction.get(qnaRef);
        
        if (!qnaDoc.exists) {
          const error = new Error("QnA not found");
          error.code = "NOT_FOUND";
          throw error;
        }

        // 결정적 문서 ID로 중복 생성 방지
        const likeRef = this.firestoreService.db
          .collection("likes")
          .doc(`QNA:${qnaId}:${userId}`);
        const likeDoc = await transaction.get(likeRef);
        let isLiked = false;

        if (likeDoc.exists) {
          transaction.delete(likeRef);
          isLiked = false;

          transaction.update(qnaRef, {
            likesCount: FieldValue.increment(-1),
            updatedAt: FieldValue.serverTimestamp(),
          });
        } else {
          transaction.set(likeRef, {
            type: "QNA",
            targetId: qnaId,
            userId,
            createdAt: FieldValue.serverTimestamp(),
          });
          isLiked = true;

          transaction.update(qnaRef, {
            likesCount: FieldValue.increment(1),
            updatedAt: FieldValue.serverTimestamp(),
          });
        }

        const qna = qnaDoc.data();
        const currentLikesCount = qna.likesCount || 0;

        return {
          qnaId,
          userId,
          isLiked,
          likesCount: isLiked ? currentLikesCount + 1 : Math.max(0, currentLikesCount - 1),
        };
      });

      return result;
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
      const result = await this.firestoreService.runTransaction(async (transaction) => {
        const routineRef = this.firestoreService.db.collection("routines").doc(routineId);
        const routineDoc = await transaction.get(routineRef);
        
        if (!routineDoc.exists) {
          const error = new Error("Routine not found");
          error.code = "NOT_FOUND";
          throw error;
        }

        // 결정적 문서 ID로 중복 생성 방지
        const likeRef = this.firestoreService.db
          .collection("likes")
          .doc(`ROUTINE:${routineId}:${userId}`);
        const likeDoc = await transaction.get(likeRef);
        let isLiked = false;

        if (likeDoc.exists) {
          transaction.delete(likeRef);
          isLiked = false;

          transaction.update(routineRef, {
            likesCount: FieldValue.increment(-1),
            updatedAt: FieldValue.serverTimestamp(),
          });
        } else {
          transaction.set(likeRef, {
            type: "ROUTINE",
            targetId: routineId,
            userId,
            createdAt: FieldValue.serverTimestamp(),
          });
          isLiked = true;

          transaction.update(routineRef, {
            likesCount: FieldValue.increment(1),
            updatedAt: FieldValue.serverTimestamp(),
          });
        }

        const routine = routineDoc.data();
        const currentLikesCount = routine.likesCount || 0;

        return {
          routineId,
          userId,
          isLiked,
          likesCount: isLiked ? currentLikesCount + 1 : Math.max(0, currentLikesCount - 1),
        };
      });

      return result;
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
