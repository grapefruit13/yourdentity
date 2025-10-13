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
      const {
        selectedVariant = null,
        quantity = 1,
        customFieldsResponse = {},
      } = applicationData;

      // TMI 프로젝트 정보 조회
      const tmi = await this.firestoreService.getDocument("tmis", tmiId);
      if (!tmi) {
        const error = new Error("TMI project not found");
        error.code = "NOT_FOUND";
        throw error;
      }

      // 재고 확인
      if (tmi.stockCount <= 0) {
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
        customFieldsResponse,
        appliedAt: new Date(),
        updatedAt: new Date(),
      };

      const applicationId = await this.firestoreService.addDocument(
        "applications",
        applicationPayload,
      );

      // TMI 프로젝트 카운트 업데이트 (신청 시 즉시 반영)
      await this.firestoreService.updateDocument("tmis", tmiId, {
        soldCount: (tmi.soldCount || 0) + quantity,
        stockCount: Math.max(0, (tmi.stockCount || 0) - quantity),
        updatedAt: Date.now(),
      });

      return {
        applicationId,
        type: "TMI",
        targetId: tmiId,
        userId,
        status: "PENDING",
        selectedVariant,
        quantity,
        customFieldsResponse,
        appliedAt: applicationPayload.appliedAt,
        targetName: tmi.name || tmi.title,
        targetPrice: tmi.price,
      };
    } catch (error) {
      console.error("Apply to TMI project error:", error.message);
      if (error.code === "NOT_FOUND" || error.code === "OUT_OF_STOCK") {
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
   * @return {Promise<Object>} 수정된 Q&A
   */
  async updateQnA(qnaId, content) {
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
      if (error.code === "BAD_REQUEST" || error.code === "NOT_FOUND") {
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
      const qna = await this.firestoreService.getDocument("qnas", qnaId);
      if (!qna) {
        const error = new Error("Q&A not found");
        error.code = "NOT_FOUND";
        throw error;
      }

      // 기존 좋아요 확인
      const existingLikes = await this.firestoreService.getCollectionWhere(
        "likes",
        "targetId",
        "==",
        qnaId,
      );
      const userLike = existingLikes.find(
        (like) => like.userId === userId && like.type === "QNA",
      );

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
   * @return {Promise<void>}
   */
  async deleteQnA(qnaId) {
    try {
      const qna = await this.firestoreService.getDocument("qnas", qnaId);
      if (!qna) {
        const error = new Error("Q&A not found");
        error.code = "NOT_FOUND";
        throw error;
      }

      await this.firestoreService.deleteDocument("qnas", qnaId);
    } catch (error) {
      console.error("Delete Q&A error:", error.message);
      if (error.code === "NOT_FOUND") {
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
      // TMI 프로젝트 존재 확인
      const tmi = await this.firestoreService.getDocument("tmis", tmiId);
      if (!tmi) {
        const error = new Error("TMI project not found");
        error.code = "NOT_FOUND";
        throw error;
      }

      // 기존 좋아요 확인
      const existingLikes = await this.firestoreService.getCollectionWhere(
        "likes",
        "targetId",
        "==",
        tmiId,
      );
      const userLike = existingLikes.find(
        (like) => like.userId === userId && like.type === "TMI",
      );

      let isLiked = false;

      if (userLike) {
        // 좋아요 취소
        await this.firestoreService.deleteDocument("likes", userLike.id);
        isLiked = false;

        // TMI 프로젝트 좋아요 수 감소
        await this.firestoreService.updateDocument("tmis", tmiId, {
          likesCount: FieldValue.increment(-1),
          updatedAt: new Date(),
        });
      } else {
        // 좋아요 등록
        await this.firestoreService.addDocument("likes", {
          type: "TMI",
          targetId: tmiId,
          userId,
          createdAt: new Date(),
        });
        isLiked = true;

        // TMI 프로젝트 좋아요 수 증가
        await this.firestoreService.updateDocument("tmis", tmiId, {
          likesCount: FieldValue.increment(1),
          updatedAt: new Date(),
        });
      }

      // 업데이트된 TMI 프로젝트 정보 조회
      const updatedTmi = await this.firestoreService.getDocument("tmis", tmiId);

      return {
        tmiId,
        userId,
        isLiked,
        likesCount: updatedTmi.likesCount || 0,
      };
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
