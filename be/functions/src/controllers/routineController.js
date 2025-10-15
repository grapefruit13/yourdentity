const RoutineService = require("../services/routineService");

// 서비스 인스턴스 생성
const routineService = new RoutineService();

class RoutineController {
  /**
   * 루틴 목록 조회 (페이지네이션 지원)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getAllRoutines(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 0;
      const size = parseInt(req.query.size) || 10;

      const result = await routineService.getAllRoutines({page, size});
      return res.paginate(result.content, result.pagination);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * 루틴 상세 조회
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getRoutineById(req, res, next) {
    try {
      const {routineId} = req.params;
      const routine = await routineService.getRoutineById(routineId);
      return res.success(routine);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * 루틴 신청하기
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async applyToRoutine(req, res, next) {
    try {
      const {routineId} = req.params;
      const {uid: userId} = req.user;
      const applicationData = req.body;

      const result = await routineService.applyToRoutine(routineId, userId, applicationData);
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
      const {routineId} = req.params;
      const {content} = req.body;
      const {uid: userId} = req.user;

      if (!content) {
        return res.error(400, "content is required");
      }

      const result = await routineService.createQnA(routineId, userId, content);
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

      const result = await routineService.updateQnA(qnaId, content);
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

      const result = await routineService.toggleQnALike(qnaId, userId);
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

      await routineService.deleteQnA(qnaId, userId);
      return res.noContent();
    } catch (error) {
      return next(error);
    }
  }

  /**
   * 루틴 좋아요 토글
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async toggleRoutineLike(req, res, next) {
    try {
      const {routineId} = req.params;
      const {uid: userId} = req.user;

      const result = await routineService.toggleRoutineLike(routineId, userId);
      return res.success(result);
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = new RoutineController();
