const GatheringService = require("../services/gatheringService");

// 서비스 인스턴스 생성
const gatheringService = new GatheringService();

class GatheringController {
  /**
   * 소모임 목록 조회 (페이지네이션 지원)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getAllGatherings(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 0;
      const size = parseInt(req.query.size) || 10;

      const result = await gatheringService.getAllGatherings({page, size});
      return res.paginate(result.content, result.pagination);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * 소모임 상세 조회
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getGatheringById(req, res, next) {
    try {
      const {gatheringId} = req.params;
      const gathering = await gatheringService.getGatheringById(gatheringId);
      return res.success(gathering);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * 소모임 신청하기
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async applyToGathering(req, res, next) {
    try {
      const {gatheringId} = req.params;
      const {uid: userId} = req.user;
      const applicationData = req.body;

      const result = await gatheringService.applyToGathering(gatheringId, userId, applicationData);
      return res.created(result);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * QnA 질문 작성
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async createQnA(req, res, next) {
    try {
      const {gatheringId} = req.params;
      const {content} = req.body;
      const {uid: userId} = req.user;

      if (!content) {
        return res.error(400, "content is required");
      }

      const result = await gatheringService.createQnA(gatheringId, userId, content);
      return res.created(result);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * QnA 질문 수정
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async updateQnA(req, res, next) {
    try {
      const {qnaId} = req.params;
      const {content} = req.body;

      if (!content) {
        return res.error(400, "content is required");
      }

      const result = await gatheringService.updateQnA(qnaId, content);
      return res.success(result);
    } catch (error) {
      return next(error);
    }
  }
  /**
   * QnA 좋아요 토글
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async toggleQnALike(req, res, next) {
    try {
      const {qnaId} = req.params;
      const {uid: userId} = req.user;

      const result = await gatheringService.toggleQnALike(qnaId, userId);
      return res.success(result);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * QnA 삭제
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async deleteQnA(req, res, next) {
    try {
      const {qnaId} = req.params;
      const userId = req.user.uid;

      await gatheringService.deleteQnA(qnaId, userId);
      return res.noContent();
    } catch (error) {
      return next(error);
    }
  }

  /**
   * 소모임 좋아요 토글
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async toggleGatheringLike(req, res, next) {
    try {
      const {gatheringId} = req.params;
      const {uid: userId} = req.user;

      const result = await gatheringService.toggleGatheringLike(gatheringId, userId);
      return res.success(result);
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = new GatheringController();
