const {FieldValue} = require("firebase-admin/firestore");
const FirestoreService = require("./firestoreService");

/**
 * TMI Service (비즈니스 로직 계층)
 * TMI 프로젝트 관련 모든 비즈니스 로직 처리
 */
class TmiService {
  constructor() {
    this.firestoreService = new FirestoreService("tmis");
  }

  /**
   * TMI 프로젝트 목록 조회 (페이지네이션 지원)
   * @param {Object} options - 페이지네이션 옵션
   * @return {Promise<Object>} 페이지네이션된 TMI 프로젝트 목록
   */
  async getAllTmiProjects(options = {}) {
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
        result.content = result.content.map((tmi) => ({
          id: tmi.id,
          name: tmi.name || tmi.title,
          description: tmi.description,
          status: tmi.status,
          price: tmi.price,
          currency: tmi.currency,
          stockCount: tmi.stockCount,
          soldCount: tmi.soldCount,
          viewCount: tmi.viewCount,
          buyable: tmi.buyable,
          sellerId: tmi.sellerId,
          sellerName: tmi.sellerName,
          deadline: tmi.deadline,
          createdAt: tmi.createdAt,
          updatedAt: tmi.updatedAt,
        }));
      }

      return {
        content: result.content || [],
        pagination: result.pageable || {},
      };
    } catch (error) {
      console.error("Get all TMI projects error:", error.message);
      throw new Error("Failed to get TMI projects");
    }
  }

  /**
   * TMI 프로젝트 상세 조회
   * @param {string} tmiId - TMI 프로젝트 ID
   * @return {Promise<Object>} TMI 프로젝트 상세 정보
   */
  async getTmiProjectById(tmiId) {
    try {
      const tmi = await this.firestoreService.getDocument("tmis", tmiId);

      if (!tmi) {
        const error = new Error("TMI project not found");
        error.code = "NOT_FOUND";
        throw error;
      }

      // 조회수 증가
      const newViewCount = (tmi.viewCount || 0) + 1;
      this.firestoreService.updateDocument("tmis", tmiId, {
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
        tmiId,
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
        id: tmi.id,
        name: tmi.name || tmi.title,
        description: tmi.description,
        status: tmi.status,
        price: tmi.price,
        currency: tmi.currency,
        stockCount: tmi.stockCount,
        soldCount: tmi.soldCount,
        viewCount: newViewCount,
        buyable: tmi.buyable,
        sellerId: tmi.sellerId,
        sellerName: tmi.sellerName,
        content: tmi.content || [],
        media: tmi.media || [],
        options: tmi.options || [],
        primaryDetails: tmi.primaryDetails || [],
        variants: tmi.variants || [],
        customFields: tmi.customFields || [],
        deadline: tmi.deadline,
        createdAt: tmi.createdAt,
        updatedAt: tmi.updatedAt,
        qna: formattedQnas,
      };
    } catch (error) {
      console.error("Get TMI project by ID error:", error.message);
      if (error.code === "NOT_FOUND") {
        throw error;
      }
      throw new Error("Failed to get TMI project");
    }
  }

  /**
   * TMI 프로젝트 신청하기
   * @param {string} tmiId - TMI 프로젝트 ID
   * @param {string} userId - 사용자 ID
   * @param {Object} applicationData - 신청 데이터
   * @return {Promise<Object>} 신청 결과
   */
  async applyToTmiProject(tmiId, userId, applicationData) {
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

      const result = await this.firestoreService.runTransaction(async (transaction) => {
        const tmiRef = this.firestoreService.db.collection("tmis").doc(tmiId);
        const tmiDoc = await transaction.get(tmiRef);
        
        if (!tmiDoc.exists) {
          const error = new Error("TMI project not found");
          error.code = "NOT_FOUND";
          throw error;
        }


        // 결정적 문서 ID로 중복 신청 방지
        const applicationRef = this.firestoreService.db
          .collection("applications")
          .doc(`TMI:${tmiId}:${userId}`);
        const applicationDoc = await transaction.get(applicationRef);
        
        if (applicationDoc.exists) {
          const error = new Error("Already applied to this TMI project");
          error.code = "ALREADY_APPLIED";
          throw error;
        }

        const tmi = tmiDoc.data();
        const currentStockCount = tmi.stockCount || 0;

        if (currentStockCount < quantity) {
          const error = new Error("TMI project is full");
          error.code = "OUT_OF_STOCK";
          throw error;
        }

        const applicationPayload = {
          type: "TMI",
          targetId: tmiId,
          userId,
          status: "PENDING",
          selectedVariant,
          quantity,
          targetName: tmi.name || tmi.title,
          targetPrice: tmi.price,
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

        transaction.update(tmiRef, {
          soldCount: FieldValue.increment(quantity),
          stockCount: FieldValue.increment(-quantity),
          updatedAt: FieldValue.serverTimestamp(),
        });

        return {
          applicationId: applicationRef.id,
          tmi,
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
        type: "TMI",
        targetId: tmiId,
        userId,
        status: "PENDING",
        selectedVariant,
        quantity,
        customFieldsRequest,
        activityNickname,
        activityPhoneNumber,
        region,
        currentSituation,
        applicationSource,
        applicationMotivation,
        canAttendEvents,
        appliedAt: appliedAtIso,
        targetName: result.tmi.name || result.tmi.title,
        targetPrice: result.tmi.price,
      };
    } catch (error) {
      console.error("Apply to TMI project error:", error.message);
      if (error.code === "NOT_FOUND" || error.code === "OUT_OF_STOCK" || error.code === "ALREADY_APPLIED" || error.code === "BAD_REQUEST") {
        throw error;
      }
      throw new Error("Failed to apply to TMI project");
    }
  }

  /**
   * Q&A 질문 작성
   * @param {string} tmiId - TMI 프로젝트 ID
   * @param {string} userId - 사용자 ID
   * @param {Array} content - 질문 내용
   * @return {Promise<Object>} 생성된 Q&A
   */
  async createQnA(tmiId, userId, content) {
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
        type: "TMI",
        targetId: tmiId,
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
        tmiId,
        userId,
        content,
        media,
        answerContent: null,
        answerMedia: [],
        likesCount: 0,
        createdAt: qnaData.createdAt,
      };
    } catch (error) {
      console.error("Create Q&A error:", error.message);
      if (error.code === "BAD_REQUEST") {
        throw error;
      }
      throw new Error("Failed to create Q&A");
    }
  }

  /**
   * Q&A 질문 수정
   * @param {string} qnaId - Q&A ID
   * @param {Array} content - 수정할 내용
   * @param {string} userId - 사용자 ID (소유권 검증용)
   * @return {Promise<Object>} 수정된 Q&A
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
        const error = new Error("Q&A not found");
        error.code = "NOT_FOUND";
        throw error;
      }

      // 소유권 검증
      if (qna.userId !== userId) {
        const error = new Error("Q&A 수정 권한이 없습니다");
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
        tmiId: qna.targetId,
        userId: qna.userId,
        content,
        media,
        answerContent: qna.answerContent,
        answerMedia: qna.answerMedia || [],
        likesCount: qna.likesCount || 0,
        updatedAt: updatedData.updatedAt,
      };
    } catch (error) {
      console.error("Update Q&A error:", error.message);
      if (error.code === "BAD_REQUEST" || error.code === "NOT_FOUND" || error.code === "FORBIDDEN") {
        throw error;
      }
      throw new Error("Failed to update Q&A");
    }
  }

  /**
   * Q&A 답변 작성
   * @param {string} qnaId - Q&A ID
   * @param {string} userId - 답변자 ID
   * @param {Array} content - 답변 내용
   * @param {Array} media - 답변 미디어
   * @return {Promise<Object>} 답변이 추가된 Q&A
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
      console.error("Create Q&A answer error:", error.message);
      if (error.code === "BAD_REQUEST" || error.code === "NOT_FOUND") {
        throw error;
      }
      throw new Error("Failed to create Q&A answer");
    }
  }

  /**
   * Q&A 좋아요 토글
   * @param {string} qnaId - Q&A ID
   * @param {string} userId - 사용자 ID
   * @return {Promise<Object>} 좋아요 결과
   */
  async toggleQnALike(qnaId, userId) {
    try {
      const result = await this.firestoreService.runTransaction(async (transaction) => {
        const qnaRef = this.firestoreService.db.collection("qnas").doc(qnaId);
        const qnaDoc = await transaction.get(qnaRef);
        
        if (!qnaDoc.exists) {
          const error = new Error("Q&A not found");
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
      console.error("Toggle Q&A like error:", error.message);
      if (error.code === "NOT_FOUND") {
        throw error;
      }
      throw new Error("Failed to toggle Q&A like");
    }
  }

  /**
   * Q&A 삭제
   * @param {string} qnaId - Q&A ID
   * @param {string} userId - 사용자 ID (소유권 검증용)
   * @return {Promise<void>}
   */
  async deleteQnA(qnaId, userId) {
    try {
      const qna = await this.firestoreService.getDocument("qnas", qnaId);
      if (!qna) {
        const error = new Error("Q&A not found");
        error.code = "NOT_FOUND";
        throw error;
      }

      // 소유권 검증
      if (qna.userId !== userId) {
        const error = new Error("Q&A 삭제 권한이 없습니다");
        error.code = "FORBIDDEN";
        throw error;
      }

      await this.firestoreService.deleteDocument("qnas", qnaId);
    } catch (error) {
      console.error("Delete Q&A error:", error.message);
      if (error.code === "NOT_FOUND" || error.code === "FORBIDDEN") {
        throw error;
      }
      throw new Error("Failed to delete Q&A");
    }
  }

  /**
   * TMI 프로젝트 좋아요 토글
   * @param {string} tmiId - TMI 프로젝트 ID
   * @param {string} userId - 사용자 ID
   * @return {Promise<Object>} 좋아요 결과
   */
  async toggleTmiProjectLike(tmiId, userId) {
    try {
      const result = await this.firestoreService.runTransaction(async (transaction) => {
        const tmiRef = this.firestoreService.db.collection("tmis").doc(tmiId);
        const tmiDoc = await transaction.get(tmiRef);
        
        if (!tmiDoc.exists) {
          const error = new Error("TMI project not found");
          error.code = "NOT_FOUND";
          throw error;
        }

        // 결정적 문서 ID로 중복 생성 방지
        const likeRef = this.firestoreService.db
          .collection("likes")
          .doc(`TMI:${tmiId}:${userId}`);
        const likeDoc = await transaction.get(likeRef);
        let isLiked = false;

        if (likeDoc.exists) {
          transaction.delete(likeRef);
          isLiked = false;

          transaction.update(tmiRef, {
            likesCount: FieldValue.increment(-1),
            updatedAt: FieldValue.serverTimestamp(),
          });
        } else {
          transaction.set(likeRef, {
            type: "TMI",
            targetId: tmiId,
            userId,
            createdAt: FieldValue.serverTimestamp(),
          });
          isLiked = true;

          transaction.update(tmiRef, {
            likesCount: FieldValue.increment(1),
            updatedAt: FieldValue.serverTimestamp(),
          });
        }

        const tmi = tmiDoc.data();
        const currentLikesCount = tmi.likesCount || 0;

        return {
          tmiId,
          userId,
          isLiked,
          likesCount: isLiked ? currentLikesCount + 1 : Math.max(0, currentLikesCount - 1),
        };
      });

      return result;
    } catch (error) {
      console.error("Toggle TMI project like error:", error.message);
      if (error.code === "NOT_FOUND") {
        throw error;
      }
      throw new Error("Failed to toggle TMI project like");
    }
  }
}

module.exports = TmiService;
