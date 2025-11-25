const QnAService = require("../services/qnaService");

// 서비스 인스턴스 생성
const qnaService = new QnAService();

class QnAController {
  /**
   * QnA 생성 API
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async createQnA(req, res, next) {
    try {
      const {pageId} = req.params;
      const {uid: userId} = req.user;
      const {pageType, ...qnaData} = req.body;

      if (!pageType) {
        return res.error(400, "pageType is required");
      }

      const result = await qnaService.createQnA(pageId, pageType, userId, qnaData);

      return res.created(result);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * QnA 목록 조회 API
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getQnAs(req, res, next) {
    try {
      const {pageId} = req.params;
      const page = parseInt(req.query.page, 10) || 0;
      const size = Math.min(parseInt(req.query.size, 10) || 10, 10); 

      const viewerId = req.user?.uid || null;
      const result = await qnaService.getQnAs(pageId, {page, size}, viewerId);
      
      // data 객체 안에 qnas 배열과 pagination 객체 분리
      const responseData = {
        qnas: result.content || [],
        pagination: result.pagination || {}
      };
      
      return res.success(responseData);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * QnA 수정 API
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async updateQnA(req, res, next) {
    try {
      const {qnaId} = req.params;
      const updateData = req.body;
      const userId = req.user.uid;

      const result = await qnaService.updateQnA(qnaId, updateData, userId);
      return res.success(result);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * QnA 삭제 API
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async deleteQnA(req, res, next) {
    try {
      const {qnaId} = req.params;
      const userId = req.user.uid;

      await qnaService.deleteQnA(qnaId, userId);
      return res.noContent();
    } catch (error) {
      return next(error);
    }
  }

  /**
   * QnA 좋아요 토글 API
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async toggleQnALike(req, res, next) {
    try {
      const {qnaId} = req.params;
      const {uid: userId} = req.user;

      const result = await qnaService.toggleQnALike(qnaId, userId);
      return res.success(result);
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = new QnAController();

