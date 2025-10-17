const {FieldValue} = require("firebase-admin/firestore");
const FirestoreService = require("./firestoreService");

/**
 * Gathering Service (비즈니스 로직 계층)
 * 소모임 관련 모든 비즈니스 로직 처리
 */
class GatheringService {
  constructor() {
    this.firestoreService = new FirestoreService("gatherings");
  }

  /**
   * 소모임 목록 조회 (페이지네이션 지원)
   * @param {Object} options - 페이지네이션 옵션
   * @return {Promise<Object>} 페이지네이션된 소모임 목록
   */
  async getAllGatherings(options = {}) {
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

      return {
        content: result.content || [],
        pagination: result.pageable || {},
      };
    } catch (error) {
      console.error("Get all gatherings error:", error.message);
      throw new Error("Failed to get gatherings");
    }
  }

  /**
   * 소모임 상세 조회
   * @param {string} gatheringId - 소모임 ID
   * @return {Promise<Object>} 소모임 상세 정보
   */
  async getGatheringById(gatheringId) {
    try {
      const gathering = await this.firestoreService.getDocument("gatherings", gatheringId);

      if (!gathering) {
        const error = new Error("Gathering not found");
        error.code = "NOT_FOUND";
        throw error;
      }

      // 조회수 증가
      const newViewCount = (gathering.viewCount || 0) + 1;
      this.firestoreService.updateDocument("gatherings", gatheringId, {
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
        gatheringId,
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

      // 커뮤니티 게시글 조회 (소모임 후기글)
      let communityPosts = [];
      try {
        const communityPostsService = new FirestoreService(`communities/${gatheringId}/posts`);
        const posts = await communityPostsService.getWithPagination({
          page: 0,
          size: 10,
          orderBy: "createdAt",
          orderDirection: "desc",
          where: [{field: "type", operator: "==", value: "GATHERING_REVIEW"}],
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
      }

      return {
        id: gathering.id,
        name: gathering.name,
        description: gathering.description,
        status: gathering.status,
        price: gathering.price,
        currency: gathering.currency,
        stockCount: gathering.stockCount,
        soldCount: gathering.soldCount,
        viewCount: newViewCount,
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
    } catch (error) {
      console.error("Get gathering by ID error:", error.message);
      if (error.code === "NOT_FOUND") {
        throw error;
      }
      throw new Error("Failed to get gathering");
    }
  }

  /**
   * 소모임 신청하기
   * @param {string} gatheringId - 소모임 ID
   * @param {string} userId - 사용자 ID
   * @param {Object} applicationData - 신청 데이터
   * @return {Promise<Object>} 신청 결과
   */
  async applyToGathering(gatheringId, userId, applicationData) {
    try {
      const {
        selectedVariant = null,
        quantity = 1,
        customFieldsResponse = {},
      } = applicationData;

      const result = await this.firestoreService.runTransaction(async (transaction) => {
        const gatheringRef = this.firestoreService.db.collection("gatherings").doc(gatheringId);
        const gatheringDoc = await transaction.get(gatheringRef);
        
        if (!gatheringDoc.exists) {
          const error = new Error("Gathering not found");
          error.code = "NOT_FOUND";
          throw error;
        }

        // 결정적 문서 ID로 중복 신청 방지
        const applicationRef = this.firestoreService.db
          .collection("applications")
          .doc(`GATHERING:${gatheringId}:${userId}`);
        const applicationDoc = await transaction.get(applicationRef);
        
        if (applicationDoc.exists) {
          const error = new Error("Already applied to this gathering");
          error.code = "ALREADY_APPLIED";
          throw error;
        }

        const gathering = gatheringDoc.data();
        const currentStockCount = gathering.stockCount || 0;

        if (currentStockCount < quantity) {
          const error = new Error("Gathering is out of stock");
          error.code = "OUT_OF_STOCK";
          throw error;
        }

        const applicationPayload = {
          type: "GATHERING",
          targetId: gatheringId,
          userId,
          status: "PENDING",
          selectedVariant,
          quantity,
          targetName: gathering.name,
          targetPrice: gathering.price,
          customFieldsResponse,
          appliedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        };

        transaction.set(applicationRef, applicationPayload);

        transaction.update(gatheringRef, {
          soldCount: FieldValue.increment(quantity),
          stockCount: FieldValue.increment(-quantity),
          updatedAt: FieldValue.serverTimestamp(),
        });

        return {
          applicationId: applicationRef.id,
          gathering,
          applicationPayload,
        };
      });

      const application = await this.firestoreService.getDocument("applications", result.applicationId);
      const appliedAtIso = application?.appliedAt?.toDate
        ? application.appliedAt.toDate().toISOString()
        : undefined;

      return {
        applicationId: result.applicationId,
        type: "GATHERING",
        targetId: gatheringId,
        userId,
        status: "PENDING",
        selectedVariant,
        quantity,
        customFieldsResponse,
        appliedAt: appliedAtIso,
        targetName: result.gathering.name,
        targetPrice: result.gathering.price,
      };
    } catch (error) {
      console.error("Apply to gathering error:", error.message);
      if (error.code === "NOT_FOUND" || error.code === "OUT_OF_STOCK" || error.code === "ALREADY_APPLIED") {
        throw error;
      }
      throw new Error("Failed to apply to gathering");
    }
  }

  /**
   * QnA 질문 작성
   * @param {string} gatheringId - 소모임 ID
   * @param {string} userId - 사용자 ID
   * @param {Array} content - 질문 내용
   * @return {Promise<Object>} 생성된 QnA
   */
  async createQnA(gatheringId, userId, content) {
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
        type: "GATHERING",
        targetId: gatheringId,
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
        gatheringId,
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
        gatheringId: qna.targetId,
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
   * @param {string} userId - 사용자 ID (소유권 검증용)
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

      // 소유권 검증
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
   * 소모임 좋아요 토글
   * @param {string} gatheringId - 소모임 ID
   * @param {string} userId - 사용자 ID
   * @return {Promise<Object>} 좋아요 결과
   */
  async toggleGatheringLike(gatheringId, userId) {
    try {
      const result = await this.firestoreService.runTransaction(async (transaction) => {
        const gatheringRef = this.firestoreService.db.collection("gatherings").doc(gatheringId);
        const gatheringDoc = await transaction.get(gatheringRef);
        
        if (!gatheringDoc.exists) {
          const error = new Error("Gathering not found");
          error.code = "NOT_FOUND";
          throw error;
        }

        // 결정적 문서 ID로 중복 생성 방지
        const likeRef = this.firestoreService.db
          .collection("likes")
          .doc(`GATHERING:${gatheringId}:${userId}`);
        const likeDoc = await transaction.get(likeRef);
        let isLiked = false;

        if (likeDoc.exists) {
          transaction.delete(likeRef);
          isLiked = false;

          transaction.update(gatheringRef, {
            likesCount: FieldValue.increment(-1),
            updatedAt: FieldValue.serverTimestamp(),
          });
        } else {
          transaction.set(likeRef, {
            type: "GATHERING",
            targetId: gatheringId,
            userId,
            createdAt: FieldValue.serverTimestamp(),
          });
          isLiked = true;

          transaction.update(gatheringRef, {
            likesCount: FieldValue.increment(1),
            updatedAt: FieldValue.serverTimestamp(),
          });
        }

        const gathering = gatheringDoc.data();
        const currentLikesCount = gathering.likesCount || 0;

        return {
          gatheringId,
          userId,
          isLiked,
          likesCount: isLiked ? currentLikesCount + 1 : Math.max(0, currentLikesCount - 1),
        };
      });

      return result;
    } catch (error) {
      console.error("Toggle gathering like error:", error.message);
      if (error.code === "NOT_FOUND") {
        throw error;
      }
      throw new Error("Failed to toggle gathering like");
    }
  }
}

module.exports = GatheringService;
