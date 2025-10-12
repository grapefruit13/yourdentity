const CommentService = require("../services/commentService");

// 서비스 인스턴스 생성
const commentService = new CommentService();

class CommentController {
  /**
   * 댓글 생성 API
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createComment(req, res) {
    try {
      const {communityId, postId} = req.params;
      const {uid: userId} = req.user;
      const commentData = req.body;

      const result = await commentService.createComment(communityId, postId, userId, commentData);

      res.status(201).json({
        success: true,
        data: result,
        message: "댓글이 성공적으로 작성되었습니다.",
      });
    } catch (error) {
      console.error("Create comment error:", error);
      if (error.code === "BAD_REQUEST") {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      if (error.code === "NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      return req.next ? req.next(error) : res.status(500).json({
        success: false,
        message: "댓글 작성 중 오류가 발생했습니다.",
      });
    }
  }

  /**
   * 댓글 목록 조회 API
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getComments(req, res) {
    try {
      const {communityId, postId} = req.params;
      const {page = 0, size = 10} = req.query;

      const result = await commentService.getComments(communityId, postId, {page, size});

      res.json({
        success: true,
        data: result.content,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error("Get comments error:", error);
      if (error.code === "NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      return req.next ? req.next(error) : res.status(500).json({
        success: false,
        message: "댓글 목록 조회 중 오류가 발생했습니다.",
      });
    }
  }

  /**
   * 댓글 수정 API
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateComment(req, res) {
    try {
      const {commentId} = req.params;
      const updateData = req.body;

      const result = await commentService.updateComment(commentId, updateData);

      res.json({
        success: true,
        data: result,
        message: "댓글이 성공적으로 수정되었습니다.",
      });
    } catch (error) {
      console.error("Update comment error:", error);
      if (error.code === "BAD_REQUEST") {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      if (error.code === "NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      return req.next ? req.next(error) : res.status(500).json({
        success: false,
        message: "댓글 수정 중 오류가 발생했습니다.",
      });
    }
  }

  /**
   * 댓글 삭제 API
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteComment(req, res) {
    try {
      const {commentId} = req.params;

      await commentService.deleteComment(commentId);

      res.json({
        success: true,
        message: "댓글이 성공적으로 삭제되었습니다.",
      });
    } catch (error) {
      console.error("Delete comment error:", error);
      if (error.code === "BAD_REQUEST") {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      if (error.code === "NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      return req.next ? req.next(error) : res.status(500).json({
        success: false,
        message: "댓글 삭제 중 오류가 발생했습니다.",
      });
    }
  }

  /**
   * 댓글 좋아요 토글 API
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async toggleCommentLike(req, res) {
    try {
      const {commentId} = req.params;
      const {uid: userId} = req.user;

      const result = await commentService.toggleCommentLike(commentId, userId);

      res.json({
        success: true,
        data: result,
        message: result.isLiked ? "좋아요를 추가했습니다." : "좋아요를 취소했습니다.",
      });
    } catch (error) {
      console.error("Toggle comment like error:", error);
      if (error.code === "BAD_REQUEST") {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      if (error.code === "NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      return req.next ? req.next(error) : res.status(500).json({
        success: false,
        message: "좋아요 처리 중 오류가 발생했습니다.",
      });
    }
  }
}

module.exports = new CommentController();
