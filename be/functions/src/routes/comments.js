const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const CommentControllerDocs = require("../docs/CommentControllerDocs");

// 댓글 목록 조회
CommentControllerDocs.getComments();
router.get(
    "/communities/:communityId/posts/:postId/comments",
    commentController.getComments,
);

// 댓글 작성
CommentControllerDocs.createComment();
router.post(
    "/communities/:communityId/posts/:postId/comments",
    commentController.createComment,
);

// 댓글 수정
CommentControllerDocs.updateComment();
router.put("/comments/:commentId", commentController.updateComment);

// 댓글 삭제
CommentControllerDocs.deleteComment();
router.delete("/comments/:commentId", commentController.deleteComment);

// 댓글 좋아요 토글
CommentControllerDocs.toggleCommentLike();
router.post("/comments/:commentId/like", commentController.toggleCommentLike);

module.exports = router;
