const {FieldValue} = require("firebase-admin/firestore");
const FirestoreService = require("./firestoreService");
const {Client} = require("@notionhq/client");
const {
  getTitleValue,
  getTextContent,
  getCheckboxValue,
  getNumberValue,
  getFileUrls,
  getRelationValues,
  getPhoneNumberValue,
  formatNotionBlocks,
} = require("../utils/notionHelper");

// 상수 정의
const NOTION_VERSION = process.env.NOTION_VERSION || "2025-09-03";
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const MIN_PAGE_SIZE = 1;

// Notion 스토어 구매신청 DB ID
const STORE_PURCHASE_DB_ID = process.env.NOTION_STORE_PURCHASE_DB_ID;

// page_size 검증 및 클램프 함수
function normalizePageSize(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return DEFAULT_PAGE_SIZE;
  return Math.min(MAX_PAGE_SIZE, Math.max(MIN_PAGE_SIZE, Math.trunc(num)));
}

// 에러 코드 정의
const ERROR_CODES = {
  MISSING_API_KEY: "MISSING_NOTION_API_KEY",
  MISSING_DB_ID: "MISSING_NOTION_DB_ID",
  NOTION_API_ERROR: "NOTION_API_ERROR",
  PRODUCT_NOT_FOUND: "PRODUCT_NOT_FOUND",
  INVALID_PAGE_SIZE: "INVALID_PAGE_SIZE",
};

// Notion 필드명 상수
const NOTION_FIELDS = {
  NAME: "이름",
  DESCRIPTION: "설명",
  THUMBNAIL: "썸네일",
  REQUIRED_POINTS: "필요한 나다움",
  ON_SALE: "판매 여부",
  REQUIRES_DELIVERY: "배송 필요 여부",
};

// Notion 스토어 구매신청 필드명 상수
const PURCHASE_FIELDS = {
  ORDERER_ID: "주문자 ID",
  ORDERER_NICKNAME: "주문자 기본 닉네임",
  PRODUCT_NAME: "주문한 상품명",
  QUANTITY: "개수",
  RECIPIENT_NAME: "수령인 이름",
  RECIPIENT_ADDRESS: "수령인 주소지",
  RECIPIENT_DETAIL_ADDRESS: "수령인 상세 주소지",
  RECIPIENT_PHONE: "수령인 전화번호",
  DELIVERY_COMPLETED: "지급 완료 여부",
  ORDER_DATE: "주문 완료 일시",
};

/**
 * Store Service (비즈니스 로직 계층)
 * Notion 기반 상품 조회 + Firestore 기반 구매/좋아요/QnA 처리
 */
class StoreService {
  constructor() {
    this.firestoreService = new FirestoreService("products");

    // Notion 클라이언트 초기화
    const {NOTION_API_KEY, NOTION_STORE_DB_ID} = process.env;

    if (NOTION_API_KEY && NOTION_STORE_DB_ID) {
      this.notion = new Client({
        auth: NOTION_API_KEY,
        notionVersion: NOTION_VERSION,
      });
      this.storeDataSource = NOTION_STORE_DB_ID;
    } else {
      console.warn("[StoreService] Notion 환경변수가 설정되지 않았습니다. Notion 기능이 비활성화됩니다.");
    }
  }

  /**
   * 상품 목록 조회 (Notion 기반)
   * @param {Object} filters - 필터 조건
   * @param {boolean} [filters.onSale] - 판매 여부 필터
   * @param {number} [pageSize=20] - 페이지 크기 (1-100)
   * @param {string} [startCursor] - 페이지네이션 커서
   * @return {Promise<Object>} 상품 목록
   */
  async getProducts(filters = {}, pageSize = DEFAULT_PAGE_SIZE, startCursor = null) {
    try {
      if (!this.notion || !this.storeDataSource) {
        const error = new Error("Notion이 설정되지 않았습니다.");
        error.code = ERROR_CODES.MISSING_API_KEY;
        error.statusCode = 500;
        throw error;
      }

      const queryBody = {
        page_size: normalizePageSize(pageSize),
        sorts: [
          {
            timestamp: "last_edited_time",
            direction: "descending",
          },
        ],
      };

      // 판매 여부 필터 추가
      if (filters.onSale !== undefined && filters.onSale !== null) {
        queryBody.filter = {
          property: NOTION_FIELDS.ON_SALE,
          checkbox: {
            equals: filters.onSale,
          },
        };
      }

      if (startCursor) {
        queryBody.start_cursor = startCursor;
      }

      const data = await this.notion.dataSources.query({
        data_source_id: this.storeDataSource,
        ...queryBody,
      });

      const products = data.results.map((page) => this.formatProductData(page));

      return {
        products,
        hasMore: data.has_more,
        nextCursor: data.next_cursor,
        currentPageCount: data.results.length,
      };
    } catch (error) {
      console.error("[StoreService] 상품 목록 조회 오류:", error.message);

      if (error.code === "object_not_found") {
        const notFoundError = new Error("스토어 데이터 소스를 찾을 수 없습니다.");
        notFoundError.code = ERROR_CODES.MISSING_DB_ID;
        notFoundError.statusCode = 404;
        throw notFoundError;
      }

      if (error.code === "rate_limited") {
        const rateLimitError = new Error("Notion API 요청 한도가 초과되었습니다. 잠시 후 다시 시도해주세요.");
        rateLimitError.code = "RATE_LIMITED";
        rateLimitError.statusCode = 429;
        throw rateLimitError;
      }

      const serviceError = new Error(`상품 목록 조회 중 오류가 발생했습니다: ${error.message}`);
      serviceError.code = ERROR_CODES.NOTION_API_ERROR;
      throw serviceError;
    }
  }

  /**
   * 상품 상세 조회 (Notion 기반 - 페이지 내용 포함)
   * @param {string} productId - 상품 ID (Notion 페이지 ID)
   * @return {Promise<Object>} 상품 상세 정보
   */
  async getProductById(productId) {
    try {
      if (!this.notion || !this.storeDataSource) {
        const error = new Error("Notion이 설정되지 않았습니다.");
        error.code = ERROR_CODES.MISSING_API_KEY;
        error.statusCode = 500;
        throw error;
      }

      // 상품 페이지 정보 조회
      const page = await this.notion.pages.retrieve({
        page_id: productId,
      });

      const productData = this.formatProductData(page, true);

      // 상품 페이지 블록 내용 조회
      const pageBlocks = await this.getProductPageBlocks(productId);
      productData.pageContent = pageBlocks;

      return productData;
    } catch (error) {
      console.error("[StoreService] 상품 상세 조회 오류:", error.message);

      if (error.code === "object_not_found") {
        const notFoundError = new Error("해당 상품을 찾을 수 없습니다.");
        notFoundError.code = ERROR_CODES.PRODUCT_NOT_FOUND;
        notFoundError.statusCode = 404;
        throw notFoundError;
      }

      if (error.code === "rate_limited") {
        const rateLimitError = new Error("Notion API 요청 한도가 초과되었습니다. 잠시 후 다시 시도해주세요.");
        rateLimitError.code = "RATE_LIMITED";
        rateLimitError.statusCode = 429;
        throw rateLimitError;
      }

      const serviceError = new Error(`상품 상세 조회 중 오류가 발생했습니다: ${error.message}`);
      serviceError.code = ERROR_CODES.NOTION_API_ERROR;
      throw serviceError;
    }
  }

  /**
   * 상품 페이지 블록 내용 조회 (페이지네이션 처리)
   * @param {string} productId - 상품 ID
   * @return {Promise<Array>} 페이지 블록 내용
   */
  async getProductPageBlocks(productId) {
    try {
      const blocks = [];
      let cursor;
      let hasMore = true;

      // 모든 블록을 가져올 때까지 반복 (100개 제한 우회)
      while (hasMore) {
        const response = await this.notion.blocks.children.list({
          block_id: productId,
          start_cursor: cursor,
        });
        blocks.push(...response.results);
        cursor = response.next_cursor;
        hasMore = response.has_more;
      }

      return formatNotionBlocks(blocks, {
        includeRichText: true,
        includeMetadata: true,
      });
    } catch (error) {
      console.warn("[StoreService] 상품 페이지 블록 조회 오류:", error.message);
      return [];
    }
  }

  /**
   * 상품 데이터 포맷팅 (Notion DB 구조에 맞춤)
   * @param {Object} page - Notion 페이지 객체
   * @param {boolean} includeDetails - 상세 정보 포함 여부
   * @return {Object} 포맷팅된 상품 데이터
   */
  formatProductData(page, includeDetails = false) {
    const props = page.properties;

    return {
      id: page.id,
      name: getTitleValue(props[NOTION_FIELDS.NAME]),
      description: getTextContent(props[NOTION_FIELDS.DESCRIPTION]),
      thumbnail: getFileUrls(props[NOTION_FIELDS.THUMBNAIL]),
      requiredPoints: getNumberValue(props[NOTION_FIELDS.REQUIRED_POINTS]) || 0,
      onSale: getCheckboxValue(props[NOTION_FIELDS.ON_SALE]),
      requiresDelivery: getCheckboxValue(props[NOTION_FIELDS.REQUIRES_DELIVERY]),
      createdAt: page.created_time,
      updatedAt: page.last_edited_time,
    };
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
      let {
        selectedVariant = null,
        quantity = 1,
        customFieldsRequest = {},
      } = purchaseData;

      // 수량 검증 (트랜잭션 진입 전)
      quantity = Number(quantity);
      if (!Number.isInteger(quantity) || quantity <= 0) {
        const error = new Error("수량은 1 이상의 정수여야 합니다");
        error.code = "BAD_REQUEST";
        throw error;
      }

      const result = await this.firestoreService.runTransaction(async (transaction) => {
        const productRef = this.firestoreService.db.collection("products").doc(productId);
        const productDoc = await transaction.get(productRef);

        if (!productDoc.exists) {
          const error = new Error("Product not found");
          error.code = "NOT_FOUND";
          throw error;
        }

        const purchaseRef = this.firestoreService.db
            .collection("purchases")
            .doc(`PRODUCT:${productId}:${userId}`);
        const existingPurchaseDoc = await transaction.get(purchaseRef);

        if (existingPurchaseDoc.exists) {
          const error = new Error("Already purchased this product");
          error.code = "ALREADY_PURCHASED";
          throw error;
        }

        const product = productDoc.data();
        const currentStockCount = product.stockCount || 0;

        if (currentStockCount < quantity) {
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
          customFieldsRequest,
          purchasedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        };

        transaction.set(purchaseRef, purchasePayload);

        transaction.update(productRef, {
          soldCount: FieldValue.increment(quantity),
          stockCount: FieldValue.increment(-quantity),
          updatedAt: FieldValue.serverTimestamp(),
        });

        return {
          purchaseId: purchaseRef.id,
          product,
          purchasePayload,
        };
      });

      // 커밋 후 문서 재조회로 서버 타임스탬프 해석
      const purchase = await this.firestoreService.getDocument("purchases", result.purchaseId);
      const purchasedAtIso = purchase?.purchasedAt?.toDate ?
        purchase.purchasedAt.toDate().toISOString() :
        undefined;

      return {
        purchaseId: result.purchaseId,
        type: "PRODUCT",
        targetId: productId,
        userId,
        status: "PENDING",
        selectedVariant,
        quantity,
        customFieldsRequest,
        purchasedAt: purchasedAtIso,
        targetName: result.product.name,
        targetPrice: result.product.price,
      };
    } catch (error) {
      console.error("Purchase product error:", error.message);
      if (error.code === "NOT_FOUND" || error.code === "OUT_OF_STOCK" ||
          error.code === "ALREADY_PURCHASED" || error.code === "BAD_REQUEST") {
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
      const result = await this.firestoreService.runTransaction(async (transaction) => {
        const productRef = this.firestoreService.db.collection("products").doc(productId);
        const productDoc = await transaction.get(productRef);

        if (!productDoc.exists) {
          const error = new Error("Product not found");
          error.code = "NOT_FOUND";
          throw error;
        }

        // 결정적 문서 ID로 중복 생성 방지
        const likeRef = this.firestoreService.db
            .collection("likes")
            .doc(`PRODUCT:${productId}:${userId}`);
        const likeDoc = await transaction.get(likeRef);
        let isLiked = false;

        if (likeDoc.exists) {
          transaction.delete(likeRef);
          isLiked = false;

          transaction.update(productRef, {
            likesCount: FieldValue.increment(-1),
            updatedAt: FieldValue.serverTimestamp(),
          });
        } else {
          transaction.set(likeRef, {
            type: "PRODUCT",
            targetId: productId,
            userId,
            createdAt: FieldValue.serverTimestamp(),
          });
          isLiked = true;

          transaction.update(productRef, {
            likesCount: FieldValue.increment(1),
            updatedAt: FieldValue.serverTimestamp(),
          });
        }

        const product = productDoc.data();
        const currentLikesCount = product.likesCount || 0;

        return {
          productId,
          userId,
          isLiked,
          likesCount: isLiked ? currentLikesCount + 1 : Math.max(0, currentLikesCount - 1),
        };
      });

      return result;
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
   * @param {string} userId - 사용자 ID (소유권 검증용)
   * @return {Promise<Object>} 수정된 Q&A
   */
  async updateProductQnA(qnaId, content, userId) {
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
      if (error.code === "BAD_REQUEST" || error.code === "NOT_FOUND" || error.code === "FORBIDDEN") {
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
   * @param {string} userId - 사용자 ID (소유권 검증용)
   * @return {Promise<void>}
   */
  async deleteProductQnA(qnaId, userId) {
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
      console.error("Delete product Q&A error:", error.message);
      if (error.code === "NOT_FOUND" || error.code === "FORBIDDEN") {
        throw error;
      }
      throw new Error("Failed to delete product Q&A");
    }
  }

  /**
   * FIFO 방식으로 포인트 차감 (내부 메서드)
   * @private
   * @param {string} userId - 사용자 ID
   * @param {number} totalPoints - 차감할 포인트
   * @param {string} reason - 차감 사유
   * @param {Object} transaction - Firestore 트랜잭션 객체
   * @param {Object} userRef - 사용자 문서 참조 (rewards 필드 업데이트용)
   * @return {Promise<void>}
   */
  async _deductRewardsFIFO(userId, totalPoints, reason, transaction, userRef) {
    // 입력 검증
    if (!totalPoints || totalPoints <= 0) {
      const error = new Error("차감할 포인트는 0보다 커야 합니다.");
      error.code = "INVALID_INPUT";
      error.statusCode = 400;
      throw error;
    }

    // 1. 사용 가능한 포인트 이력 조회 (changeType: "add", isProcessed: false)
    const historyRef = this.firestoreService.db
        .collection(`users/${userId}/rewardsHistory`);

    const availableHistoryQuery = historyRef
        .where("changeType", "==", "add")
        .where("isProcessed", "==", false);

    const availableHistorySnapshot = await transaction.get(availableHistoryQuery);

    // 2. expiredAt 계산 (createdAt + 120일) 및 정렬
    const now = new Date();
    const availableHistory = availableHistorySnapshot.docs
        .map((doc) => {
          const data = doc.data();

          // createdAt이 없거나 유효하지 않으면 스킵
          if (!data.createdAt) {
            console.warn(`[StoreService] rewardsHistory에 createdAt이 없습니다: ${doc.id}`);
            return null;
          }

          // Firestore Timestamp를 Date로 변환
          const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt);

          // createdAt이 유효한 날짜인지 확인
          if (isNaN(createdAt.getTime())) {
            console.warn(`[StoreService] rewardsHistory에 유효하지 않은 createdAt: ${doc.id}`);
            return null;
          }

          // expiredAt 계산 (createdAt + 120일)
          const expiredAt = new Date(createdAt);
          expiredAt.setDate(expiredAt.getDate() + 120);

          return {
            id: doc.id,
            ...data,
            createdAt: createdAt,
            createdAtTimestamp: data.createdAt, // 원본 Timestamp 보관 (나중에 사용)
            expiredAt: expiredAt,
          };
        })
        .filter((item) => item !== null && item.amount > 0) // null 제거 및 amount가 0보다 큰 것만
        .filter((item) => item.expiredAt > now) // 만료되지 않은 것만
        .sort((a, b) => a.expiredAt.getTime() - b.expiredAt.getTime()); // 만료일이 가까운 순으로 정렬

    // 3. 사용 가능한 총 포인트 계산
    const totalAvailable = availableHistory.reduce((sum, item) => sum + (item.amount || 0), 0);

    if (totalAvailable < totalPoints) {
      const error = new Error(`리워드(나다움)가 부족합니다. (필요: ${totalPoints}, 사용 가능: ${totalAvailable})`);
      error.code = "INSUFFICIENT_REWARDS";
      error.statusCode = 400;
      throw error;
    }

    // 4. FIFO 방식으로 차감
    let remainingDeduct = totalPoints;

    for (const historyItem of availableHistory) {
      if (remainingDeduct <= 0) break;

      const historyDocRef = historyRef.doc(historyItem.id);
      const itemAmount = historyItem.amount || 0;

      // amount가 0 이하인 경우 스킵 (이미 필터링했지만 안전장치)
      if (itemAmount <= 0) continue;

      if (itemAmount <= remainingDeduct) {
        // 전체 금액 차감: 기존 이력을 만료 처리
        transaction.update(historyDocRef, {
          isProcessed: true,
        });
        remainingDeduct -= itemAmount;
      } else {
        // 부분 차감: 기존 이력 만료 처리 + 잔금으로 새 이력 생성
        transaction.update(historyDocRef, {
          isProcessed: true,
        });

        // 잔금으로 새 이력 생성 (expiredAt은 계산하지 않고 createdAt만 저장)
        const newHistoryRef = historyRef.doc();
        // 원본 Timestamp를 그대로 사용 (이미 Firestore Timestamp 객체)
        const createdAtTimestamp = historyItem.createdAtTimestamp || historyItem.createdAt;

        // createdAtTimestamp가 없으면 에러 발생
        if (!createdAtTimestamp) {
          console.error(`[StoreService] createdAtTimestamp가 없습니다: ${historyItem.id}`);
          const error = new Error("포인트 차감 처리 중 데이터 오류가 발생했습니다.");
          error.code = "DEDUCTION_ERROR";
          error.statusCode = 500;
          throw error;
        }

        transaction.set(newHistoryRef, {
          amount: itemAmount - remainingDeduct,
          changeType: "add",
          reason: historyItem.reason || "",
          isProcessed: false,
          createdAt: createdAtTimestamp, // 기존 createdAt 유지 (expiredAt은 createdAt + 120일로 계산)
          actionKey: historyItem.actionKey,
          metadata: {
            ...(historyItem.metadata || {}),
            // 롤백 시 식별을 위한 메타데이터 추가
            splitParentId: historyItem.id, // 원본 문서 ID
            originalCreatedAt: createdAtTimestamp, // 원본 createdAt (중복 확인용)
            isSplitRemainder: true, // 부분 차감으로 생성된 잔여 이력임을 표시
          },
        });

        remainingDeduct = 0;
      }
    }

    // 검증: remainingDeduct가 0이 아니면 로직 오류
    if (remainingDeduct > 0) {
      console.error(`[StoreService] 포인트 차감 로직 오류: remainingDeduct=${remainingDeduct}, totalPoints=${totalPoints}`);
      const error = new Error("포인트 차감 처리 중 오류가 발생했습니다.");
      error.code = "DEDUCTION_ERROR";
      error.statusCode = 500;
      throw error;
    }

    // 5. 차감 히스토리 기록
    const deductHistoryRef = historyRef.doc();
    transaction.set(deductHistoryRef, {
      amount: totalPoints,
      changeType: "deduct",
      reason: reason,
      isProcessed: false,
      createdAt: FieldValue.serverTimestamp(),
    });

    // 6. users rewards 차감
    if (userRef) {
      transaction.update(userRef, {
        rewards: FieldValue.increment(-totalPoints),
        lastUpdatedAt: FieldValue.serverTimestamp(),
      });
    }
  }

  /**
   * 포인트 복구 보상 트랜잭션 (내부 메서드)
   * FIFO 차감의 역순으로 복구: 차감 이력 삭제, 만료 처리된 이력 복구, 부분 차감으로 생성된 새 이력 삭제
   * @private
   * @param {string} userId - 사용자 ID
   * @param {number} totalPoints - 복구할 포인트
   * @param {string} productName - 상품명
   * @return {Promise<void>}
   */
  async _rollbackRewardsDeduction(userId, totalPoints, productName) {
    // 입력 검증
    if (!totalPoints || totalPoints <= 0) {
      console.warn(`[StoreService] 복구할 포인트가 0 이하입니다: ${totalPoints}`);
      return; // 0 이하면 복구할 필요 없음
    }

    await this.firestoreService.runTransaction(async (transaction) => {
      const userRef = this.firestoreService.db.collection("users").doc(userId);
      const historyRef = this.firestoreService.db
          .collection(`users/${userId}/rewardsHistory`);

      // 1. 가장 최근 차감 이력 찾기 (reason이 해당 상품명과 일치하는 것)
      const deductReason = `${productName} 구매`;
      const deductHistoryQuery = historyRef
          .where("changeType", "==", "deduct")
          .where("reason", "==", deductReason)
          .orderBy("createdAt", "desc")
          .limit(1);

      const deductHistorySnapshot = await transaction.get(deductHistoryQuery);

      if (deductHistorySnapshot.empty) {
        // 차감 이력을 찾을 수 없으면 단순히 포인트만 복구
        console.warn(`[StoreService] 차감 이력을 찾을 수 없습니다. 단순 포인트 복구만 수행: ${productName}`);
        transaction.update(userRef, {
          rewards: FieldValue.increment(totalPoints),
          lastUpdatedAt: FieldValue.serverTimestamp(),
        });
        return;
      }

      const deductHistoryDoc = deductHistorySnapshot.docs[0];
      const deductHistoryData = deductHistoryDoc.data();
      const deductCreatedAt = deductHistoryData.createdAt;

      // deductCreatedAt이 없으면 에러 발생
      if (!deductCreatedAt) {
        console.error(`[StoreService] 차감 이력에 createdAt이 없습니다: ${deductHistoryDoc.id}`);
        // createdAt이 없어도 포인트만 복구
        transaction.update(userRef, {
          rewards: FieldValue.increment(totalPoints),
          lastUpdatedAt: FieldValue.serverTimestamp(),
        });
        return;
      }

      // 2. 부분 차감으로 생성된 새 이력 찾기 (isSplitRemainder 메타데이터로 식별)
      // 차감 이력 생성 시점 이후에 생성된 splitRemainder만 조회 (성능 최적화)
      let splitRemainderSnapshot = null;
      try {
        const splitRemainderQuery = historyRef
            .where("changeType", "==", "add")
            .where("metadata.isSplitRemainder", "==", true)
            .where("createdAt", ">", deductCreatedAt)
            .orderBy("createdAt", "asc");

        splitRemainderSnapshot = await transaction.get(splitRemainderQuery);
      } catch (queryError) {
        // 인덱스가 없거나 쿼리 실패 시 빈 스냅샷으로 처리
        console.warn(`[StoreService] splitRemainderQuery 실패, 빈 결과로 처리: ${queryError.message}`);
        // 빈 스냅샷 객체 생성 (docs 속성만 있는 객체)
        splitRemainderSnapshot = {docs: []};
      }

      // 3. 차감 이력 생성 시점 이전에 만료 처리된 이력들 복구
      // createdAt이 차감 이력보다 이전이고, isProcessed가 true인 것들
      // Firestore 규칙: orderBy에 사용된 필드에 대한 where는 orderBy 바로 앞에 와야 함
      let processedHistorySnapshot = null;
      try {
        const processedHistoryQuery = historyRef
            .where("changeType", "==", "add")
            .where("isProcessed", "==", true)
            .where("createdAt", "<=", deductCreatedAt)
            .orderBy("createdAt", "asc");

        processedHistorySnapshot = await transaction.get(processedHistoryQuery);
      } catch (queryError) {
        // 인덱스가 없거나 쿼리 실패 시 빈 스냅샷으로 처리
        console.warn(`[StoreService] processedHistoryQuery 실패, 빈 결과로 처리: ${queryError.message}`);
        // 빈 스냅샷 객체 생성 (docs 속성만 있는 객체)
        processedHistorySnapshot = {docs: []};
      }

      // 4. 복구 작업 수행
      // 4-1. 만료 처리된 이력들 복구 (isProcessed: false로)
      // 단, splitParentId가 있는 경우는 제외 (부분 차감으로 생성된 원본은 복구하지 않음)
      let restoredAmount = 0;
      const splitParentIds = new Set(); // 부분 차감으로 생성된 원본 문서 ID들
      const splitRemainderDocIds = new Set(); // 삭제할 splitRemainder 문서 ID들 (중복 삭제 방지)

      // splitRemainder 문서들에서 splitParentId 수집 및 삭제 대상 문서 ID 수집
      if (splitRemainderSnapshot && splitRemainderSnapshot.docs) {
        for (const doc of splitRemainderSnapshot.docs) {
          const data = doc.data();
          const splitParentId = data.metadata?.splitParentId;
          if (splitParentId) {
            splitParentIds.add(splitParentId);
          }
          splitRemainderDocIds.add(doc.id);
        }
      }

      // 만료 처리된 이력들 복구
      // 중요: splitParentIds에 포함된 문서는 반드시 복구해야 함
      // 왜냐하면 잔여 문서(splitRemainder)를 삭제했으므로, 원본 문서를 복구해야 전체 금액이 복구됨
      if (processedHistorySnapshot && processedHistorySnapshot.docs) {
        for (const doc of processedHistorySnapshot.docs) {
          const data = doc.data();
          // 차감 이력 생성 시점 직전에 만료 처리된 것들만 복구 (안전장치)
          const docCreatedAt = data.createdAt;
          if (docCreatedAt && docCreatedAt <= deductCreatedAt) {
            // amount가 유효한 경우에만 복구
            const amount = data.amount || 0;
            if (amount > 0) {
              // splitParentIds에 포함된 문서는 반드시 복구 (잔여 문서를 삭제했으므로)
              // 일반 문서도 복구 (이번 차감으로 만료 처리된 것이므로)
              transaction.update(doc.ref, {
                isProcessed: false,
              });
              restoredAmount += amount;
            }
          }
        }
      }

      // 4-2. 부분 차감으로 생성된 새 이력 삭제
      // isSplitRemainder 메타데이터로 식별된 문서 삭제
      if (splitRemainderSnapshot && splitRemainderSnapshot.docs) {
        for (const doc of splitRemainderSnapshot.docs) {
          transaction.delete(doc.ref);
        }
      }

      // 4-3. 차감 이력 삭제
      transaction.delete(deductHistoryDoc.ref);

      // 5. users rewards 복구
      transaction.update(userRef, {
        rewards: FieldValue.increment(totalPoints),
        lastUpdatedAt: FieldValue.serverTimestamp(),
      });

      console.log(`[StoreService] 포인트 복구 완료: ${totalPoints}, 복구된 이력: ${restoredAmount}, 삭제된 splitRemainder: ${splitRemainderDocIds.size}`);
    });
  }

  /**
   * 스토어 구매신청 (Notion DB에 저장)
   * @param {string} userId - 사용자 ID (Firebase UID)
   * @param {Object} purchaseRequest - 구매신청 데이터
   * @param {string} purchaseRequest.productId - 상품 ID (Notion 페이지 ID)
   * @param {number} purchaseRequest.quantity - 구매 개수
   * @param {string} [purchaseRequest.recipientName] - 수령인 이름
   * @param {string} [purchaseRequest.recipientAddress] - 수령인 주소지
   * @param {string} [purchaseRequest.recipientDetailAddress] - 수령인 상세 주소지
   * @param {string} [purchaseRequest.recipientPhone] - 수령인 전화번호
   * @return {Promise<Object>} 구매신청 결과
   */
  async createStorePurchase(userId, purchaseRequest) {
    try {
      if (!this.notion || !STORE_PURCHASE_DB_ID) {
        const error = new Error("스토어 구매신청 DB가 설정되지 않았습니다.");
        error.code = ERROR_CODES.MISSING_DB_ID;
        error.statusCode = 500;
        throw error;
      }

      const {
        productId,
        quantity = 1,
        recipientName = "",
        recipientAddress = "",
        recipientDetailAddress = "",
        recipientPhone = "",
      } = purchaseRequest;

      // 필수 검증
      if (!productId) {
        const error = new Error("상품 ID가 필요합니다.");
        error.code = "BAD_REQUEST";
        error.statusCode = 400;
        throw error;
      }

      if (!Number.isInteger(quantity) || quantity <= 0) {
        const error = new Error("구매 개수는 1 이상의 정수여야 합니다.");
        error.code = "BAD_REQUEST";
        error.statusCode = 400;
        throw error;
      }

      // 1. Notion에서 상품 정보 조회 (requiredPoints, requiresDelivery, onSale 확인)
      const product = await this.getProductById(productId);
      const requiredPoints = product.requiredPoints || 0;
      const totalPoints = requiredPoints * quantity;

      // totalPoints가 0이면 구매 불가
      if (totalPoints <= 0) {
        const error = new Error("상품의 필요한 나다움이 0 이하입니다.");
        error.code = "BAD_REQUEST";
        error.statusCode = 400;
        throw error;
      }

      // 2. 판매 중지된 상품 차단
      if (!product.onSale) {
        const error = new Error("판매 중지된 상품은 구매신청할 수 없습니다.");
        error.code = "BAD_REQUEST";
        error.statusCode = 400;
        throw error;
      }

      // 3. 배송이 필요한 상품인 경우 주소 검증
      if (product.requiresDelivery && (!recipientName || !recipientAddress)) {
        const error = new Error("배송이 필요한 상품은 수령인 정보가 필요합니다.");
        error.code = "BAD_REQUEST";
        error.statusCode = 400;
        throw error;
      }

      // 4. 트랜잭션으로 사용자 정보 조회 + FIFO 방식 포인트 차감 + 히스토리 기록
      let userNickname = "";

      await this.firestoreService.runTransaction(async (transaction) => {
        const userRef = this.firestoreService.db.collection("users").doc(userId);
        const userDoc = await transaction.get(userRef);

        if (!userDoc.exists) {
          const error = new Error("사용자를 찾을 수 없습니다.");
          error.code = "NOT_FOUND";
          error.statusCode = 404;
          throw error;
        }

        const userData = userDoc.data();
        userNickname = userData.nickname || "";

        // FIFO 방식으로 포인트 차감 (rewards 필드도 함께 차감)
        await this._deductRewardsFIFO(userId, totalPoints, `${product.name} 구매`, transaction, userRef);
      });

      // 5. Notion 페이지 생성 (보상 트랜잭션 포함)
      const notionData = {
        parent: {database_id: STORE_PURCHASE_DB_ID},
        properties: {
          [PURCHASE_FIELDS.ORDERER_ID]: {
            title: [{text: {content: userId}}],
          },
          [PURCHASE_FIELDS.ORDERER_NICKNAME]: {
            rich_text: [{text: {content: userNickname || ""}}],
          },
          [PURCHASE_FIELDS.PRODUCT_NAME]: {
            relation: [{id: productId}],
          },
          [PURCHASE_FIELDS.QUANTITY]: {
            number: quantity,
          },
          [PURCHASE_FIELDS.RECIPIENT_NAME]: {
            rich_text: recipientName ? [{text: {content: recipientName}}] : [],
          },
          [PURCHASE_FIELDS.RECIPIENT_ADDRESS]: {
            rich_text: recipientAddress ? [{text: {content: recipientAddress}}] : [],
          },
          [PURCHASE_FIELDS.RECIPIENT_DETAIL_ADDRESS]: {
            rich_text: recipientDetailAddress ? [{text: {content: recipientDetailAddress}}] : [],
          },
          [PURCHASE_FIELDS.RECIPIENT_PHONE]: {
            phone_number: recipientPhone || null,
          },
          [PURCHASE_FIELDS.DELIVERY_COMPLETED]: {
            checkbox: false,
          },
        },
      };

      try {
        const response = await this.notion.pages.create(notionData);

        console.log("[StoreService] 스토어 구매신청 성공:", response.id);

        return {
          purchaseId: response.id,
          userId,
          productId,
          quantity,
          recipientName,
          recipientAddress,
          recipientDetailAddress,
          recipientPhone,
          orderDate: response.created_time,
          deliveryCompleted: false,
        };
      } catch (notionError) {
        // Notion API 실패 시 포인트 복구 (보상 트랜잭션)
        console.error("[StoreService] Notion 페이지 생성 실패, 포인트 복구 시작:", notionError.message);

        try {
          await this._rollbackRewardsDeduction(userId, totalPoints, product.name);
        } catch (rollbackError) {
          // 복구 실패 시 크리티컬 로그 (수동 처리 필요)
          console.error("[StoreService] 🚨 크리티컬: 포인트 복구 실패 🚨", {
            productId,
            productName: product.name,
            totalPoints,
            notionError: notionError.message,
            rollbackError: rollbackError.message,
            timestamp: new Date().toISOString(),
          });

          // 보안: userId는 로그에만 남기고 사용자 메시지에는 포함하지 않음
          const criticalError = new Error("구매신청 실패 및 포인트 복구 실패. 고객센터에 문의해주세요.");
          criticalError.code = "CRITICAL_ROLLBACK_FAILURE";
          criticalError.statusCode = 500;
          criticalError.originalError = notionError.message;
          throw criticalError;
        }

        // 원래 Notion 에러 재던지기
        throw notionError;
      }
    } catch (error) {
      console.error("[StoreService] 스토어 구매신청 오류:", error.message);

      // 명시적으로 처리해야 하는 에러 코드들
      if (
        error.code === "BAD_REQUEST" ||
        error.code === "NOT_FOUND" ||
        error.code === "INSUFFICIENT_REWARDS" ||
        error.code === "CRITICAL_ROLLBACK_FAILURE" ||
        error.code === ERROR_CODES.MISSING_DB_ID ||
        error.code === ERROR_CODES.PRODUCT_NOT_FOUND
      ) {
        throw error;
      }

      if (error.code === "object_not_found") {
        const notFoundError = new Error("스토어 구매신청 DB를 찾을 수 없습니다.");
        notFoundError.code = ERROR_CODES.MISSING_DB_ID;
        notFoundError.statusCode = 404;
        throw notFoundError;
      }

      if (error.code === "rate_limited") {
        const rateLimitError = new Error("Notion API 요청 한도가 초과되었습니다. 잠시 후 다시 시도해주세요.");
        rateLimitError.code = "RATE_LIMITED";
        rateLimitError.statusCode = 429;
        throw rateLimitError;
      }

      const serviceError = new Error(`스토어 구매신청 중 오류가 발생했습니다: ${error.message}`);
      serviceError.code = ERROR_CODES.NOTION_API_ERROR;
      serviceError.statusCode = 500;
      throw serviceError;
    }
  }

  /**
   * 스토어 구매신청내역 조회 (Notion DB에서 조회)
   * @param {string} userId - 사용자 ID (Firebase UID)
   * @param {number} [pageSize=20] - 페이지 크기
   * @param {string} [startCursor] - 페이지네이션 커서
   * @return {Promise<Object>} 구매신청내역 목록
   */
  async getStorePurchases(userId, pageSize = DEFAULT_PAGE_SIZE, startCursor = null) {
    try {
      if (!this.notion || !STORE_PURCHASE_DB_ID) {
        const error = new Error("스토어 구매신청 DB가 설정되지 않았습니다.");
        error.code = ERROR_CODES.MISSING_DB_ID;
        error.statusCode = 500;
        throw error;
      }

      const queryBody = {
        page_size: normalizePageSize(pageSize),
        filter: {
          property: PURCHASE_FIELDS.ORDERER_ID,
          title: {
            equals: userId,
          },
        },
        sorts: [
          {
            timestamp: "created_time",
            direction: "descending",
          },
        ],
      };

      if (startCursor) {
        queryBody.start_cursor = startCursor;
      }

      const data = await this.notion.dataSources.query({
        data_source_id: STORE_PURCHASE_DB_ID,
        ...queryBody,
      });

      const purchases = data.results.map((page) => this.formatPurchaseData(page));

      return {
        purchases,
        hasMore: data.has_more,
        nextCursor: data.next_cursor,
        currentPageCount: data.results.length,
      };
    } catch (error) {
      console.error("[StoreService] 스토어 구매신청내역 조회 오류:", error.message);

      if (error.code === "object_not_found") {
        const notFoundError = new Error("스토어 구매신청 DB를 찾을 수 없습니다.");
        notFoundError.code = ERROR_CODES.MISSING_DB_ID;
        notFoundError.statusCode = 404;
        throw notFoundError;
      }

      if (error.code === "rate_limited") {
        const rateLimitError = new Error("Notion API 요청 한도가 초과되었습니다. 잠시 후 다시 시도해주세요.");
        rateLimitError.code = "RATE_LIMITED";
        rateLimitError.statusCode = 429;
        throw rateLimitError;
      }

      const serviceError = new Error(`스토어 구매신청내역 조회 중 오류가 발생했습니다: ${error.message}`);
      serviceError.code = ERROR_CODES.NOTION_API_ERROR;
      throw serviceError;
    }
  }

  /**
   * 구매신청 데이터 포맷팅
   * @param {Object} page - Notion 페이지 객체
   * @return {Object} 포맷팅된 구매신청 데이터
   */
  formatPurchaseData(page) {
    const props = page.properties;

    // Relation에서 상품 ID 추출
    const productRelation = getRelationValues(props[PURCHASE_FIELDS.PRODUCT_NAME]);
    const productId = productRelation?.relations?.length > 0 ?
      productRelation.relations[0].id :
      null;

    return {
      purchaseId: page.id,
      userId: getTitleValue(props[PURCHASE_FIELDS.ORDERER_ID]),
      userNickname: getTextContent(props[PURCHASE_FIELDS.ORDERER_NICKNAME]),
      productId: productId,
      quantity: getNumberValue(props[PURCHASE_FIELDS.QUANTITY]) || 1,
      recipientName: getTextContent(props[PURCHASE_FIELDS.RECIPIENT_NAME]),
      recipientAddress: getTextContent(props[PURCHASE_FIELDS.RECIPIENT_ADDRESS]),
      recipientDetailAddress: getTextContent(props[PURCHASE_FIELDS.RECIPIENT_DETAIL_ADDRESS]),
      recipientPhone: getPhoneNumberValue(props[PURCHASE_FIELDS.RECIPIENT_PHONE]),
      deliveryCompleted: getCheckboxValue(props[PURCHASE_FIELDS.DELIVERY_COMPLETED]),
      orderDate: page.created_time,
      lastEditedTime: page.last_edited_time,
    };
  }
}

module.exports = StoreService;
