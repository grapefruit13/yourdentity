const TmiService = require("../services/tmiService");

// 서비스 인스턴스 생성
const tmiService = new TmiService();

class TmiController {
  /**
   * TMI 프로젝트 목록 조회 (페이지네이션 지원)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllTmiProjects(req, res) {
    try {
      const page = parseInt(req.query.page) || 0;
      const size = parseInt(req.query.size) || 10;

      const result = await tmiService.getAllTmiProjects({page, size});

      res.json({
        success: true,
        data: result.content,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error("Get all TMI projects error:", error);
      return req.next ? req.next(error) : res.status(500).json({
        success: false,
        message: "TMI 프로젝트 목록 조회 중 오류가 발생했습니다.",
      });
    }
  }

  /**
   * TMI 프로젝트 상세 조회
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getTmiProjectById(req, res) {
    try {
      const {projectId} = req.params;
      const tmi = await tmiService.getTmiProjectById(projectId);

      res.json({
        success: true,
        data: tmi,
      });
    } catch (error) {
      console.error("Get TMI project by ID error:", error);
      if (error.code === "NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "TMI 프로젝트를 찾을 수 없습니다.",
        });
      }
      return req.next ? req.next(error) : res.status(500).json({
        success: false,
        message: "TMI 프로젝트 조회 중 오류가 발생했습니다.",
      });
    }
  }

  /**
   * TMI 프로젝트 신청하기
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async applyToTmiProject(req, res) {
    try {
      const {projectId} = req.params;
      const {uid: userId} = req.user;
      const applicationData = req.body;

      const result = await tmiService.applyToTmiProject(projectId, userId, applicationData);

      res.status(201).json({
        success: true,
        data: result,
        message: "TMI 프로젝트 신청이 완료되었습니다.",
      });
    } catch (error) {
      console.error("Apply to TMI project error:", error);
      if (error.code === "NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "TMI 프로젝트를 찾을 수 없습니다.",
        });
      }
      if (error.code === "OUT_OF_STOCK") {
        return res.status(400).json({
          success: false,
          message: "TMI 프로젝트 정원이 찼습니다.",
        });
      }
      return req.next ? req.next(error) : res.status(500).json({
        success: false,
        message: "TMI 프로젝트 신청 중 오류가 발생했습니다.",
      });
    }
  }

  /**
   * Q&A 질문 작성
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createQnA(req, res) {
    try {
      const {projectId} = req.params;
      const {content} = req.body;
      const {uid: userId} = req.user;

      const result = await tmiService.createQnA(projectId, userId, content);

      res.status(201).json(result);
    } catch (error) {
      console.error("Create Q&A error:", error);
      if (error.code === "BAD_REQUEST") {
        return res.status(400).json({error: "content is required"});
      }
      return req.next ? req.next(error) : res.status(500).json({error: "Failed to create Q&A"});
    }
  }

  /**
   * Q&A 질문 수정
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateQnA(req, res) {
    try {
      const {qnaId} = req.params;
      const {content} = req.body;

      const result = await tmiService.updateQnA(qnaId, content);

      res.json(result);
    } catch (error) {
      console.error("Update Q&A error:", error);
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
   * Q&A 답변 작성
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createQnAAnswer(req, res) {
    try {
      const {qnaId} = req.params;
      const {content, media = []} = req.body;
      const {uid: userId} = req.user;

      const result = await tmiService.createQnAAnswer(qnaId, userId, content, media);

      res.json(result);
    } catch (error) {
      console.error("Create Q&A answer error:", error);
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
   * Q&A 좋아요 토글
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async toggleQnALike(req, res) {
    try {
      const {qnaId} = req.params;
      const {uid: userId} = req.user;

      const result = await tmiService.toggleQnALike(qnaId, userId);

      res.json({
        success: true,
        data: result,
        message: result.isLiked ? "좋아요를 추가했습니다." : "좋아요를 취소했습니다.",
      });
    } catch (error) {
      console.error("Toggle Q&A like error:", error);
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
   * Q&A 삭제
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteQnA(req, res) {
    try {
      const {qnaId} = req.params;

      await tmiService.deleteQnA(qnaId);

      res.json({message: "Q&A가 성공적으로 삭제되었습니다"});
    } catch (error) {
      console.error("Delete Q&A error:", error);
      if (error.code === "NOT_FOUND") {
        return res.status(404).json({error: "Q&A not found"});
      }
      return req.next ? req.next(error) : res.status(500).json({error: "Failed to delete Q&A"});
    }
  }

  /**
   * TMI 프로젝트 좋아요 토글
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async toggleTmiProjectLike(req, res) {
    try {
      const {projectId} = req.params;
      const {uid: userId} = req.user;

      const result = await tmiService.toggleTmiProjectLike(projectId, userId);

      res.json({
        success: true,
        data: result,
        message: result.isLiked ? "좋아요를 추가했습니다." : "좋아요를 취소했습니다.",
      });
    } catch (error) {
      console.error("Toggle TMI project like error:", error);
      if (error.code === "NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "TMI 프로젝트를 찾을 수 없습니다.",
        });
      }
      return req.next ? req.next(error) : res.status(500).json({
        success: false,
        message: "좋아요 처리 중 오류가 발생했습니다.",
      });
    }
  }
}

module.exports = new TmiController();
