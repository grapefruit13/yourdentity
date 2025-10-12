const StoreService = require("../services/storeService");

// 서비스 인스턴스 생성
const storeService = new StoreService();

class StoreController {
  /**
   * 상품 목록 조회
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getProducts(req, res) {
    try {
      const {page = 0, size = 10, status = "onSale"} = req.query;

      const result = await storeService.getProducts({page, size, status});

      res.json({
        success: true,
        data: result.content,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error("Get products error:", error);
      return req.next ? req.next(error) : res.status(500).json({
        success: false,
        message: "상품 목록 조회 중 오류가 발생했습니다.",
      });
    }
  }

  /**
   * 상품 상세 조회
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getProductById(req, res) {
    try {
      const {productId} = req.params;
      const product = await storeService.getProductById(productId);

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      console.error("Get product by ID error:", error);
      if (error.code === "NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "상품을 찾을 수 없습니다.",
        });
      }
      return req.next ? req.next(error) : res.status(500).json({
        success: false,
        message: "상품 조회 중 오류가 발생했습니다.",
      });
    }
  }

  /**
   * 상품 구매
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async purchaseProduct(req, res) {
    try {
      const {productId, ...purchaseData} = req.body;
      const {uid: userId} = req.user;

      if (!productId) {
        return res.status(400).json({
          success: false,
          message: "상품 ID가 필요합니다.",
        });
      }

      const result = await storeService.purchaseProduct(productId, userId, purchaseData);

      res.status(201).json({
        success: true,
        data: result,
        message: "상품 구매가 완료되었습니다.",
      });
    } catch (error) {
      console.error("Purchase product error:", error);
      if (error.code === "NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "상품을 찾을 수 없습니다.",
        });
      }
      if (error.code === "OUT_OF_STOCK") {
        return res.status(400).json({
          success: false,
          message: "상품이 품절되었습니다.",
        });
      }
      return req.next ? req.next(error) : res.status(500).json({
        success: false,
        message: "상품 구매 중 오류가 발생했습니다.",
      });
    }
  }

  /**
   * 상품 좋아요 토글
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async toggleProductLike(req, res) {
    try {
      const {productId} = req.params;
      const {uid: userId} = req.user;

      const result = await storeService.toggleProductLike(productId, userId);

      res.json({
        success: true,
        data: result,
        message: result.isLiked ? "좋아요를 추가했습니다." : "좋아요를 취소했습니다.",
      });
    } catch (error) {
      console.error("Toggle product like error:", error);
      if (error.code === "NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "상품을 찾을 수 없습니다.",
        });
      }
      return req.next ? req.next(error) : res.status(500).json({
        success: false,
        message: "좋아요 처리 중 오류가 발생했습니다.",
      });
    }
  }

  /**
   * 상품 Q&A 질문 작성
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createProductQnA(req, res) {
    try {
      const {productId} = req.params;
      const {content} = req.body;
      const {uid: userId} = req.user;

      const result = await storeService.createProductQnA(productId, userId, content);

      res.status(201).json(result);
    } catch (error) {
      console.error("Create product Q&A error:", error);
      if (error.code === "BAD_REQUEST") {
        return res.status(400).json({error: "content is required"});
      }
      return req.next ? req.next(error) : res.status(500).json({error: "Failed to create Q&A"});
    }
  }

  /**
   * 상품 Q&A 질문 수정
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateProductQnA(req, res) {
    try {
      const {qnaId} = req.params;
      const {content} = req.body;

      const result = await storeService.updateProductQnA(qnaId, content);

      res.json(result);
    } catch (error) {
      console.error("Update product Q&A error:", error);
      if (error.code === "BAD_REQUEST") {
        return res.status(400).json({error: "content is required"});
      }
      if (error.code === "NOT_FOUND") {
        return res.status(404).json({error: "Q&A not found"});
      }
      return req.next ? req.next(error) : res.status(500).json({error: "Failed to update Q&A"});
    }
  }

  /**
   * 상품 Q&A 답변 작성
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createProductQnAAnswer(req, res) {
    try {
      const {qnaId} = req.params;
      const {content, media = []} = req.body;
      const {uid: userId} = req.user;

      const result = await storeService.createProductQnAAnswer(qnaId, userId, content, media);

      res.json(result);
    } catch (error) {
      console.error("Create product Q&A answer error:", error);
      if (error.code === "BAD_REQUEST") {
        return res.status(400).json({error: "content is required"});
      }
      if (error.code === "NOT_FOUND") {
        return res.status(404).json({error: "Q&A not found"});
      }
      return req.next ? req.next(error) : res.status(500).json({error: "Failed to create Q&A answer"});
    }
  }

  /**
   * 상품 Q&A 좋아요 토글
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async toggleProductQnALike(req, res) {
    try {
      const {qnaId} = req.params;
      const {uid: userId} = req.user;

      const result = await storeService.toggleProductQnALike(qnaId, userId);

      res.json({
        success: true,
        data: result,
        message: result.isLiked ? "좋아요를 추가했습니다." : "좋아요를 취소했습니다.",
      });
    } catch (error) {
      console.error("Toggle product Q&A like error:", error);
      if (error.code === "NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Q&A를 찾을 수 없습니다.",
        });
      }
      return req.next ? req.next(error) : res.status(500).json({
        success: false,
        message: "좋아요 처리 중 오류가 발생했습니다.",
      });
    }
  }

  /**
   * 상품 Q&A 삭제
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteProductQnA(req, res) {
    try {
      const {qnaId} = req.params;

      await storeService.deleteProductQnA(qnaId);

      res.json({message: "Q&A가 성공적으로 삭제되었습니다"});
    } catch (error) {
      console.error("Delete product Q&A error:", error);
      if (error.code === "NOT_FOUND") {
        return res.status(404).json({error: "Q&A not found"});
      }
      return req.next ? req.next(error) : res.status(500).json({error: "Failed to delete Q&A"});
    }
  }
}

module.exports = new StoreController();
