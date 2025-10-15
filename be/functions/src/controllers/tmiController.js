const TmiService = require("../services/tmiService");

// 서비스 인스턴스 생성
const tmiService = new TmiService();

class TmiController {
  /**
   * TMI 프로젝트 목록 조회 (페이지네이션 지원)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getAllTmiProjects(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 0;
      const size = parseInt(req.query.size) || 10;

      const result = await tmiService.getAllTmiProjects({page, size});
      return res.paginate(result.content, result.pagination);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * TMI 프로젝트 상세 조회
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getTmiProjectById(req, res, next) {
    try {
      const {projectId} = req.params;
      const tmi = await tmiService.getTmiProjectById(projectId);
      return res.success(tmi);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * TMI 프로젝트 신청하기
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async applyToTmiProject(req, res, next) {
    try {
      const {projectId} = req.params;
      const {uid: userId} = req.user;
      const applicationData = req.body;

      const result = await tmiService.applyToTmiProject(projectId, userId, applicationData);
      return res.created(result);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Q&A 질문 작성
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async createQnA(req, res, next) {
    try {
      const {projectId} = req.params;
      const {content} = req.body;
      const {uid: userId} = req.user;

      if (!content) {
        return res.error(400, "content is required");
      }

      const result = await tmiService.createQnA(projectId, userId, content);
      return res.created(result);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Q&A 질문 수정
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

      const result = await tmiService.updateQnA(qnaId, content);
      return res.success(result);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Q&A 좋아요 토글
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async toggleQnALike(req, res, next) {
    try {
      const {qnaId} = req.params;
      const {uid: userId} = req.user;

      const result = await tmiService.toggleQnALike(qnaId, userId);
      return res.success(result);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Q&A 삭제
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async deleteQnA(req, res, next) {
    try {
      const {qnaId} = req.params;
      const userId = req.user.uid;

      await tmiService.deleteQnA(qnaId, userId);
      return res.noContent();
    } catch (error) {
      return next(error);
    }
  }

  /**
   * TMI 프로젝트 좋아요 토글
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async toggleTmiProjectLike(req, res, next) {
    try {
      const {projectId} = req.params;
      const {uid: userId} = req.user;

      const result = await tmiService.toggleTmiProjectLike(projectId, userId);
      return res.success(result);
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = new TmiController();
