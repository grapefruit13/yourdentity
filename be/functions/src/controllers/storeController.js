const StoreService = require("../services/storeService");

// 서비스 인스턴스 생성
const storeService = new StoreService();

// 상수 정의
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const MIN_PAGE_SIZE = 1;

class StoreController {
  /**
   * 상품 목록 조회 (Notion 기반)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getProducts(req, res, next) {
    try {
      const {
        onSale,
        pageSize = DEFAULT_PAGE_SIZE,
        cursor
      } = req.query;

      // 필터 조건 구성
      const filters = {};
      if (onSale !== undefined) {
        filters.onSale = onSale === 'true' || onSale === true;
      }

      // 페이지 크기 검증
      const pageSizeNum = parseInt(pageSize, 10);
      if (isNaN(pageSizeNum) || pageSizeNum < MIN_PAGE_SIZE || pageSizeNum > MAX_PAGE_SIZE) {
        const error = new Error("페이지 크기는 1-100 사이의 숫자여야 합니다.");
        error.code = 'BAD_REQUEST';
        error.statusCode = 400;
        return next(error);
      }

      const result = await storeService.getProducts(filters, pageSizeNum, cursor);

      return res.success({
        message: "상품 목록을 성공적으로 조회했습니다.",
        products: result.products,
        pagination: {
          hasMore: result.hasMore,
          nextCursor: result.nextCursor,
          totalCount: result.totalCount
        }
      });

    } catch (error) {
      console.error("[StoreController] 상품 목록 조회 오류:", error.message);
      return next(error);
    }
  }

  /**
   * 상품 상세 조회 (Notion 기반 - 페이지 내용 포함)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getProductById(req, res, next) {
    try {
      const {productId} = req.params;

      if (!productId) {
        const error = new Error("상품 ID가 필요합니다.");
        error.code = 'BAD_REQUEST';
        error.statusCode = 400;
        return next(error);
      }

      const product = await storeService.getProductById(productId);

      return res.success({
        message: "상품 상세 정보를 성공적으로 조회했습니다.",
        product
      });

    } catch (error) {
      console.error("[StoreController] 상품 상세 조회 오류:", error.message);
      return next(error);
    }
  }

  /**
   * 상품 구매
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async purchaseProduct(req, res, next) {
    try {
      const {productId, ...purchaseData} = req.body;
      const {uid: userId} = req.user;

      if (!productId) {
        return res.error(400, "상품 ID가 필요합니다.");
      }

      const result = await storeService.purchaseProduct(productId, userId, purchaseData);
      return res.created(result);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * 상품 좋아요 토글
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async toggleProductLike(req, res, next) {
    try {
      const {productId} = req.params;
      const {uid: userId} = req.user;

      const result = await storeService.toggleProductLike(productId, userId);
      return res.success(result);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * 상품 Q&A 질문 작성
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async createProductQnA(req, res, next) {
    try {
      const {productId} = req.params;
      const {content} = req.body;
      const {uid: userId} = req.user;

      if (!content) {
        return res.error(400, "content is required");
      }

      const result = await storeService.createProductQnA(productId, userId, content);
      return res.created(result);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * 상품 Q&A 질문 수정
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async updateProductQnA(req, res, next) {
    try {
      const {qnaId} = req.params;
      const {content} = req.body;
      const userId = req.user.uid;

      if (!content) {
        return res.error(400, "content is required");
      }

      const result = await storeService.updateProductQnA(qnaId, content, userId);
      return res.success(result);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * 상품 Q&A 좋아요 토글
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async toggleProductQnALike(req, res, next) {
    try {
      const {qnaId} = req.params;
      const {uid: userId} = req.user;

      const result = await storeService.toggleProductQnALike(qnaId, userId);
      return res.success(result);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * 상품 Q&A 삭제
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async deleteProductQnA(req, res, next) {
    try {
      const {qnaId} = req.params;
      const userId = req.user.uid;

      await storeService.deleteProductQnA(qnaId, userId);
      return res.noContent();
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = new StoreController();
