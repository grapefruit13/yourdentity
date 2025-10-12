const RoutineService = require("../services/routineService");

// 서비스 인스턴스 생성
const routineService = new RoutineService();

class RoutineController {
  /**
   * 루틴 목록 조회 (페이지네이션 지원)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllRoutines(req, res) {
    try {
      const page = parseInt(req.query.page) || 0;
      const size = parseInt(req.query.size) || 10;

      const result = await routineService.getAllRoutines({page, size});
      res.json({
        success: true,
        data: result.content,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error("Get all routines error:", error);
      return req.next ? req.next(error) : res.status(500).json({
        success: false,
        message: "루틴 목록 조회 중 오류가 발생했습니다.",
      });
    }
  }

  /**
   * 루틴 상세 조회
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getRoutineById(req, res) {
    try {
      const {routineId} = req.params;
      const routine = await routineService.getRoutineById(routineId);

      res.json({
        success: true,
        data: routine,
      });
    } catch (error) {
      console.error("Get routine by ID error:", error);
      if (error.code === "NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "루틴을 찾을 수 없습니다.",
        });
      }
      return req.next ? req.next(error) : res.status(500).json({
        success: false,
        message: "루틴 조회 중 오류가 발생했습니다.",
      });
    }
  }

  /**
   * 루틴 신청하기
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async applyToRoutine(req, res) {
    try {
      const {routineId} = req.params;
      const {uid: userId} = req.user;
      const applicationData = req.body;

      const result = await routineService.applyToRoutine(routineId, userId, applicationData);

      res.status(201).json({
        success: true,
        data: result,
        message: "루틴 신청이 완료되었습니다.",
      });
    } catch (error) {
      console.error("Apply to routine error:", error);
      if (error.code === "NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "루틴을 찾을 수 없습니다.",
        });
      }
      if (error.code === "OUT_OF_STOCK") {
        return res.status(400).json({
          success: false,
          message: "루틴이 품절되었습니다.",
        });
      }
      return req.next ? req.next(error) : res.status(500).json({
        success: false,
        message: "루틴 신청 중 오류가 발생했습니다.",
      });
    }
  }

  /**
   * QnA 질문 작성
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createQnA(req, res) {
    try {
      const {routineId} = req.params;
      const {content} = req.body;
      const {uid: userId} = req.user;

      const result = await routineService.createQnA(routineId, userId, content);

      res.status(201).json(result);
    } catch (error) {
      console.error("Create QnA error:", error);
      if (error.code === "BAD_REQUEST") {
        return res.status(400).json({error: "content is required"});
      }
      return req.next ? req.next(error) : res.status(500).json({error: "Failed to create QnA"});
    }
  }

  /**
   * QnA 질문 수정
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateQnA(req, res) {
    try {
      const {qnaId} = req.params;
      const {content} = req.body;

      const result = await routineService.updateQnA(qnaId, content);

      res.json(result);
    } catch (error) {
      console.error("Update QnA error:", error);
      if (error.code === "BAD_REQUEST") {
        return res.status(400).json({error: "content is required"});
      }
      if (error.code === "NOT_FOUND") {
        return res.status(404).json({error: "QnA not found"});
      }
      return req.next ? req.next(error) : res.status(500).json({error: "Failed to update QnA"});
    }
  }

  /**
   * QnA 답변 작성
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createQnAAnswer(req, res) {
    try {
      const {qnaId} = req.params;
      const {content, media = []} = req.body;
      const {uid: userId} = req.user;

      const result = await routineService.createQnAAnswer(qnaId, userId, content, media);

      res.json(result);
    } catch (error) {
      console.error("Create QnA answer error:", error);
      if (error.code === "BAD_REQUEST") {
        return res.status(400).json({error: "content is required"});
      }
      if (error.code === "NOT_FOUND") {
        return res.status(404).json({error: "QnA not found"});
      }
      return req.next ? req.next(error) : res.status(500).json({error: "Failed to create QnA answer"});
    }
  }

  /**
   * QnA 좋아요 토글
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async toggleQnALike(req, res) {
    try {
      const {qnaId} = req.params;
      const {uid: userId} = req.user;

      const result = await routineService.toggleQnALike(qnaId, userId);

      res.json({
        success: true,
        data: result,
        message: result.isLiked ? "좋아요를 추가했습니다." : "좋아요를 취소했습니다.",
      });
    } catch (error) {
      console.error("Toggle QnA like error:", error);
      if (error.code === "NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "QnA를 찾을 수 없습니다.",
        });
      }
      return req.next ? req.next(error) : res.status(500).json({
        success: false,
        message: "좋아요 처리 중 오류가 발생했습니다.",
      });
    }
  }

  /**
   * QnA 삭제
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteQnA(req, res) {
    try {
      const {qnaId} = req.params;

      await routineService.deleteQnA(qnaId);

      res.json({message: "QnA가 성공적으로 삭제되었습니다"});
    } catch (error) {
      console.error("Delete QnA error:", error);
      if (error.code === "NOT_FOUND") {
        return res.status(404).json({error: "QnA not found"});
      }
      return req.next ? req.next(error) : res.status(500).json({error: "Failed to delete QnA"});
    }
  }

  /**
   * 루틴 좋아요 토글
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async toggleRoutineLike(req, res) {
    try {
      const {routineId} = req.params;
      const {uid: userId} = req.user;

      const result = await routineService.toggleRoutineLike(routineId, userId);

      res.json({
        success: true,
        data: result,
        message: result.isLiked ? "좋아요를 추가했습니다." : "좋아요를 취소했습니다.",
      });
    } catch (error) {
      console.error("Toggle routine like error:", error);
      if (error.code === "NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "루틴을 찾을 수 없습니다.",
        });
      }
      return req.next ? req.next(error) : res.status(500).json({
        success: false,
        message: "좋아요 처리 중 오류가 발생했습니다.",
      });
    }
  }
}

module.exports = new RoutineController();
