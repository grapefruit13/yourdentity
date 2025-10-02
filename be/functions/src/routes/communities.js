const express = require("express");
const router = express.Router();
const communityController = require("../controllers/communityController");
const CommunityControllerDocs = require("../docs/CommunityControllerDocs");

// 커뮤니티 목록 조회
CommunityControllerDocs.getCommunities();
router.get("/", communityController.getCommunities);

// 전체 커뮤니티 포스트 조회
CommunityControllerDocs.getAllCommunityPosts();
router.get("/posts", communityController.getAllCommunityPosts);

// 커뮤니티 상세 조회
CommunityControllerDocs.getCommunityById();
router.get("/:communityId", communityController.getCommunityById);

// 커뮤니티 멤버 목록 조회
CommunityControllerDocs.getCommunityMembers();
router.get("/:communityId/members", communityController.getCommunityMembers);

// 커뮤니티 게시글 목록 조회
CommunityControllerDocs.getCommunityPosts();
router.get("/:communityId/posts", communityController.getCommunityPosts);

// 커뮤니티 게시글 작성
CommunityControllerDocs.createPost();
router.post("/:communityId/posts", communityController.createPost);

// 커뮤니티 게시글 상세 조회
CommunityControllerDocs.getPostById();
router.get("/:communityId/posts/:postId", communityController.getPostById);

// 커뮤니티 게시글 수정
CommunityControllerDocs.updatePost();
router.put("/:communityId/posts/:postId", communityController.updatePost);

// 커뮤니티 게시글 삭제
CommunityControllerDocs.deletePost();
router.delete("/:communityId/posts/:postId", communityController.deletePost);

// 커뮤니티 게시글 좋아요 토글
CommunityControllerDocs.togglePostLike();
router.post(
    "/:communityId/posts/:postId/like",
    communityController.togglePostLike,
);

module.exports = router;
