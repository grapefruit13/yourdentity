const StoreService = require("../services/storeService");

// 서비스 인스턴스 생성
const storeService = new StoreService();

class StoreController {
  /**
   * 상품 목록 조회
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getProducts(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 0;
      const size = parseInt(req.query.size, 10) || 10;
      const {status = "onSale"} = req.query;

      const result = await storeService.getProducts({page, size, status});
      return res.paginate(result.content, result.pagination);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * 상품 상세 조회
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getProductById(req, res, next) {
    try {
      const {productId} = req.params;
      const product = await storeService.getProductById(productId);
      return res.success(product);
    } catch (error) {
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

      if (!content) {
        return res.error(400, "content is required");
      }

      const result = await storeService.updateProductQnA(qnaId, content);
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
