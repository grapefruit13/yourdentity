const {FieldValue} = require("firebase-admin/firestore");
const FirestoreService = require("./firestoreService");
const { Client } = require('@notionhq/client');
const {
  getTitleValue,
  getTextContent,
  getCheckboxValue,
  getNumberValue,
  getFileUrls,
  formatNotionBlocks
} = require('../utils/notionHelper');

// 상수 정의
const NOTION_VERSION = process.env.NOTION_VERSION || "2025-09-03";
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const MIN_PAGE_SIZE = 1;

// page_size 검증 및 클램프 함수
function normalizePageSize(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return DEFAULT_PAGE_SIZE;
  return Math.min(MAX_PAGE_SIZE, Math.max(MIN_PAGE_SIZE, Math.trunc(num)));
}

// 에러 코드 정의
const ERROR_CODES = {
  MISSING_API_KEY: 'MISSING_NOTION_API_KEY',
  MISSING_DB_ID: 'MISSING_NOTION_DB_ID',
  NOTION_API_ERROR: 'NOTION_API_ERROR',
  PRODUCT_NOT_FOUND: 'PRODUCT_NOT_FOUND',
  INVALID_PAGE_SIZE: 'INVALID_PAGE_SIZE'
};

// Notion 필드명 상수
const NOTION_FIELDS = {
  NAME: "이름",
  DESCRIPTION: "설명",
  THUMBNAIL: "썸네일",
  REQUIRED_POINTS: "필요한 나다움",
  ON_SALE: "판매 여부"
};

/**
 * Store Service (비즈니스 로직 계층)
 * Notion 기반 상품 조회 + Firestore 기반 구매/좋아요/QnA 처리
 */
class StoreService {
  constructor() {
    this.firestoreService = new FirestoreService("products");
    
    // Notion 클라이언트 초기화
    const { NOTION_API_KEY, NOTION_STORE_DB_ID } = process.env;
    
    if (NOTION_API_KEY && NOTION_STORE_DB_ID) {
      this.notion = new Client({
        auth: NOTION_API_KEY,
        notionVersion: NOTION_VERSION,
      });
      this.storeDataSource = NOTION_STORE_DB_ID;
    } else {
      console.warn('[StoreService] Notion 환경변수가 설정되지 않았습니다. Notion 기능이 비활성화됩니다.');
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
        const error = new Error('Notion이 설정되지 않았습니다.');
        error.code = ERROR_CODES.MISSING_API_KEY;
        error.statusCode = 500;
        throw error;
      }

      const queryBody = {
        page_size: normalizePageSize(pageSize),
        sorts: [
          {
            timestamp: "last_edited_time",
            direction: "descending"
          }
        ]
      };

      // 판매 여부 필터 추가
      if (filters.onSale !== undefined && filters.onSale !== null) {
        queryBody.filter = {
          property: NOTION_FIELDS.ON_SALE,
          checkbox: {
            equals: filters.onSale
          }
        };
      }

      if (startCursor) {
        queryBody.start_cursor = startCursor;
      }

      const data = await this.notion.dataSources.query({
        data_source_id: this.storeDataSource,
        ...queryBody
      });

      const products = data.results.map(page => this.formatProductData(page));

      return {
        products,
        hasMore: data.has_more,
        nextCursor: data.next_cursor,
        currentPageCount: data.results.length
      };

    } catch (error) {
      console.error('[StoreService] 상품 목록 조회 오류:', error.message);
      
      if (error.code === 'object_not_found') {
        const notFoundError = new Error('스토어 데이터 소스를 찾을 수 없습니다.');
        notFoundError.code = ERROR_CODES.MISSING_DB_ID;
        notFoundError.statusCode = 404;
        throw notFoundError;
      }
      
      if (error.code === 'rate_limited') {
        const rateLimitError = new Error('Notion API 요청 한도가 초과되었습니다. 잠시 후 다시 시도해주세요.');
        rateLimitError.code = 'RATE_LIMITED';
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
        const error = new Error('Notion이 설정되지 않았습니다.');
        error.code = ERROR_CODES.MISSING_API_KEY;
        error.statusCode = 500;
        throw error;
      }

      // 상품 페이지 정보 조회
      const page = await this.notion.pages.retrieve({
        page_id: productId
      });

      const productData = this.formatProductData(page, true);

      // 상품 페이지 블록 내용 조회
      const pageBlocks = await this.getProductPageBlocks(productId);
      productData.pageContent = pageBlocks;

      return productData;

    } catch (error) {
      console.error('[StoreService] 상품 상세 조회 오류:', error.message);
      
      if (error.code === 'object_not_found') {
        const notFoundError = new Error('해당 상품을 찾을 수 없습니다.');
        notFoundError.code = ERROR_CODES.PRODUCT_NOT_FOUND;
        notFoundError.statusCode = 404;
        throw notFoundError;
      }
      
      if (error.code === 'rate_limited') {
        const rateLimitError = new Error('Notion API 요청 한도가 초과되었습니다. 잠시 후 다시 시도해주세요.');
        rateLimitError.code = 'RATE_LIMITED';
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
   * @returns {Promise<Array>} 페이지 블록 내용
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
          start_cursor: cursor
        });
        blocks.push(...response.results);
        cursor = response.next_cursor;
        hasMore = response.has_more;
      }

      return formatNotionBlocks(blocks, {
        includeRichText: true,
        includeMetadata: true
      });
    } catch (error) {
      console.warn('[StoreService] 상품 페이지 블록 조회 오류:', error.message);
      return [];
    }
  }

  /**
   * 상품 데이터 포맷팅 (Notion DB 구조에 맞춤)
   * @param {Object} page - Notion 페이지 객체
   * @param {boolean} includeDetails - 상세 정보 포함 여부
   * @returns {Object} 포맷팅된 상품 데이터
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
      createdAt: page.created_time,
      updatedAt: page.last_edited_time
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
      const purchasedAtIso = purchase?.purchasedAt?.toDate
        ? purchase.purchasedAt.toDate().toISOString()
        : undefined;

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
      if (error.code === "NOT_FOUND" || error.code === "OUT_OF_STOCK" || error.code === "ALREADY_PURCHASED" || error.code === "BAD_REQUEST") {
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
}

module.exports = StoreService;
