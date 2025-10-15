const CommentService = require("../services/commentService");

// 서비스 인스턴스 생성
const commentService = new CommentService();

class CommentController {
  /**
   * 댓글 생성 API
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async createComment(req, res, next) {
    try {
      const {communityId, postId} = req.params;
      const {uid: userId} = req.user;
      const commentData = req.body;

      const result = await commentService.createComment(communityId, postId, userId, commentData);
      return res.created(result);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * 댓글 목록 조회 API
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getComments(req, res, next) {
    try {
      const {communityId, postId} = req.params;
      const page = parseInt(req.query.page, 10) || 0;
      const size = parseInt(req.query.size, 10) || 10;

      const result = await commentService.getComments(communityId, postId, {page, size});
      return res.paginate(result.content, result.pagination);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * 댓글 수정 API
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async updateComment(req, res, next) {
    try {
      const {commentId} = req.params;
      const updateData = req.body;

      const result = await commentService.updateComment(commentId, updateData);
      return res.success(result);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * 댓글 삭제 API
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async deleteComment(req, res, next) {
    try {
      const {commentId} = req.params;

      await commentService.deleteComment(commentId);
      return res.noContent();
    } catch (error) {
      return next(error);
    }
  }

  /**
   * 댓글 좋아요 토글 API
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async toggleCommentLike(req, res, next) {
    try {
      const {commentId} = req.params;
      const {uid: userId} = req.user;

      const result = await commentService.toggleCommentLike(commentId, userId);
      return res.success(result);
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = new CommentController();
