const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const authGuard = require("../middleware/authGuard");

/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: 댓글 ID
 *         author:
 *           type: string
 *           description: 작성자 ID
 *         content:
 *           type: array
 *           description: 댓글 내용
 *         media:
 *           type: array
 *           description: 미디어 파일
 *         parent_id:
 *           type: string
 *           nullable: true
 *           description: 부모 댓글 ID (대댓글인 경우)
 *         vote_score:
 *           type: integer
 *           description: 투표 점수
 *         up_vote_score:
 *           type: integer
 *           description: 추천 점수
 *         deleted:
 *           type: boolean
 *           description: 삭제 여부
 *         replies_count:
 *           type: integer
 *           description: 대댓글 수
 *         created_at:
 *           type: integer
 *           description: 생성일 (timestamp)
 *         updated_at:
 *           type: integer
 *           description: 수정일 (timestamp)
 *         isMine:
 *           type: boolean
 *           description: 내가 작성한 댓글 여부
 *         hasVideo:
 *           type: boolean
 *           description: 비디오 포함 여부
 *         hasImage:
 *           type: boolean
 *           description: 이미지 포함 여부
 *         hasAuthorReply:
 *           type: boolean
 *           description: 작성자 답글 여부
 *         hasAuthorVote:
 *           type: boolean
 *           description: 작성자 투표 여부
 *         isOriginalAuthor:
 *           type: boolean
 *           description: 원글 작성자 여부
 */

// 댓글 목록 조회
/**
 * @swagger
 * /comments/communities/{communityId}/posts/{postId}:
 *   get:
 *     tags: [Comments]
 *     summary: 댓글 목록 조회
 *     description: 특정 게시글의 댓글 목록 조회
 *     parameters:
 *       - in: path
 *         name: communityId
 *         required: true
 *         schema:
 *           type: string
 *         description: 커뮤니티 ID
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: 게시글 ID
 *     responses:
 *       200:
 *         description: 댓글 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     comments:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             description: 댓글 ID
 *                             example: "comment_123"
 *                           type:
 *                             type: string
 *                             description: 댓글 타입
 *                             example: "TMI"
 *                           targetId:
 *                             type: string
 *                             description: 대상 게시글 ID
 *                             example: "post_123"
 *                           targetPath:
 *                             type: string
 *                             description: 대상 경로
 *                             example: "communities/tmi-community/posts/post_123"
 *                           userId:
 *                             type: string
 *                             description: 작성자 ID
 *                             example: "user123"
 *                           userNickname:
 *                             type: string
 *                             description: 작성자 닉네임
 *                             example: "사용자닉네임"
 *                           content:
 *                             type: array
 *                             description: 댓글 내용
 *                             items:
 *                               $ref: '#/components/schemas/ContentItem'
 *                           media:
 *                             type: array
 *                             description: 미디어 파일
 *                             items:
 *                               $ref: '#/components/schemas/MediaItem'
 *                           parentId:
 *                             type: string
 *                             nullable: true
 *                             description: 부모 댓글 ID
 *                             example: "comment_456"
 *                           depth:
 *                             type: number
 *                             description: 댓글 깊이
 *                             example: 0
 *                           isReply:
 *                             type: boolean
 *                             description: 답글 여부
 *                             example: false
 *                           isLocked:
 *                             type: boolean
 *                             description: 잠금 여부
 *                             example: false
 *                           reportsCount:
 *                             type: number
 *                             description: 신고 수
 *                             example: 0
 *                           likesCount:
 *                             type: number
 *                             description: 좋아요 수
 *                             example: 0
 *                           deleted:
 *                             type: boolean
 *                             description: 삭제 여부
 *                             example: false
 *                           deletedAt:
 *                             type: string
 *                             format: date-time
 *                             nullable: true
 *                             description: 삭제일시
 *                             example: null
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             description: 생성일시
 *                             example: "2025-10-03T17:15:07.862Z"
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             description: 수정일시
 *                             example: "2025-10-03T17:15:07.862Z"
 *                           replies:
 *                             type: array
 *                             description: 대댓글 목록
 *                             items:
 *                               type: object
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         pageNumber:
 *                           type: integer
 *                           example: 0
 *                         pageSize:
 *                           type: integer
 *                           example: 20
 *                         totalElements:
 *                           type: integer
 *                           example: 50
 *                         totalPages:
 *                           type: integer
 *                           example: 3
 *                         hasNext:
 *                           type: boolean
 *                           example: true
 *                         hasPrevious:
 *                           type: boolean
 *                           example: false
 *                         isFirst:
 *                           type: boolean
 *                           example: true
 *                         isLast:
 *                           type: boolean
 *                           example: false
 *       404:
 *         description: 게시글을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.get(
    "/communities/:communityId/posts/:postId",
    commentController.getComments,
);

// 댓글 작성
/**
 * @swagger
 * /comments/communities/{communityId}/posts/{postId}:
 *   post:
 *     tags: [Comments]
 *     summary: 댓글 작성
 *     description: 특정 게시글에 댓글 작성
 *     parameters:
 *       - in: path
 *         name: communityId
 *         required: true
 *         schema:
 *           type: string
 *         description: 커뮤니티 ID
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: 게시글 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: array
 *                 description: 댓글 내용
 *                 items:
 *                   $ref: '#/components/schemas/ContentItem'
 *                 example:
 *                   - type: "text"
 *                     order: 1
 *                     content: "정말 좋은 글이네요!"
 *                   - type: "image"
 *                     order: 2
 *                     url: "https://example.com/comment-image.jpg"
 *                     width: 1080
 *                     height: 1080
 *                     blurHash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4"
 *                     mimeType: "image/jpeg"
 *                     processingStatus: "ready"
 *               parentId:
 *                 type: string
 *                 nullable: true
 *                 description: 부모 댓글 ID (대댓글인 경우)
 *                 example: "comment_123"
 *           example:
 *             content:
 *               - type: "text"
 *                 order: 1
 *                 content: "정말 좋은 글이네요!"
 *               - type: "image"
 *                 order: 2
 *                 url: "https://example.com/comment-image.jpg"
 *                 width: 1080
 *                 height: 1080
 *                 blurHash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4"
 *                 mimeType: "image/jpeg"
 *                 processingStatus: "ready"
 *             parentId: "comment_123"
 *     responses:
 *       201:
 *         description: 댓글 작성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 201
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: 댓글 ID
 *                       example: "comment_123"
 *                     type:
 *                       type: string
 *                       description: 댓글 타입
 *                       example: "TMI"
 *                     targetId:
 *                       type: string
 *                       description: 대상 게시글 ID
 *                       example: "post_123"
 *                     targetPath:
 *                       type: string
 *                       description: 대상 경로
 *                       example: "communities/tmi-community/posts/post_123"
 *                     userId:
 *                       type: string
 *                       description: 작성자 ID
 *                       example: "user123"
 *                     userNickname:
 *                       type: string
 *                       description: 작성자 닉네임
 *                       example: "사용자닉네임"
 *                     content:
 *                       type: array
 *                       description: 댓글 내용
 *                       items:
 *                         $ref: '#/components/schemas/ContentItem'
 *                     media:
 *                       type: array
 *                       description: 미디어 블록
 *                       items:
 *                         $ref: '#/components/schemas/MediaItem'
 *                     parentId:
 *                       type: string
 *                       nullable: true
 *                       description: 부모 댓글 ID
 *                       example: "comment_456"
 *                     depth:
 *                       type: number
 *                       description: 댓글 깊이
 *                       example: 0
 *                     isReply:
 *                       type: boolean
 *                       description: 답글 여부
 *                       example: false
 *                     isLocked:
 *                       type: boolean
 *                       description: 잠금 여부
 *                       example: false
 *                     reportsCount:
 *                       type: number
 *                       description: 신고 수
 *                       example: 0
 *                     likesCount:
 *                       type: number
 *                       description: 좋아요 수
 *                       example: 0
 *                     deleted:
 *                       type: boolean
 *                       description: 삭제 여부
 *                       example: false
 *                     deletedAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                       description: 삭제일시
 *                       example: null
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: 생성일시
 *                       example: "2025-10-03T17:15:07.862Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       description: 수정일시
 *                       example: "2025-10-03T17:15:07.862Z"
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: "잘못된 요청입니다"
 *       404:
 *         description: 게시글을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: "게시글을 찾을 수 없습니다"
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "서버 내부 오류가 발생했습니다"
 */
router.post(
    "/communities/:communityId/posts/:postId",
    authGuard,
    commentController.createComment,
);

// 댓글 수정
/**
 * @swagger
 * /comments/{commentId}:
 *   put:
 *     tags: [Comments]
 *     summary: 댓글 수정
 *     description: 특정 댓글 수정
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: 댓글 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: array
 *                 description: 수정된 댓글 내용
 *                 items:
 *                   $ref: '#/components/schemas/ContentItem'
 *                 example:
 *                   - type: "text"
 *                     order: 1
 *                     content: "수정된 댓글 내용입니다!"
 *                   - type: "image"
 *                     order: 2
 *                     url: "https://example.com/updated-comment-image.jpg"
 *                     width: 1080
 *                     height: 1080
 *                     blurHash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4"
 *                     mimeType: "image/jpeg"
 *                     processingStatus: "ready"
 *           example:
 *             content:
 *               - type: "text"
 *                 order: 1
 *                 content: "수정된 댓글 내용입니다!"
 *               - type: "image"
 *                 order: 2
 *                 url: "https://example.com/updated-comment-image.jpg"
 *                 width: 1080
 *                 height: 1080
 *                 blurHash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4"
 *                 mimeType: "image/jpeg"
 *                 processingStatus: "ready"
 *     responses:
 *       200:
 *         description: 댓글 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: 댓글 ID
 *                       example: "comment_123"
 *                     type:
 *                       type: string
 *                       description: 댓글 타입
 *                       example: "TMI"
 *                     targetId:
 *                       type: string
 *                       description: 대상 게시글 ID
 *                       example: "post_123"
 *                     targetPath:
 *                       type: string
 *                       description: 대상 경로
 *                       example: "communities/tmi-community/posts/post_123"
 *                     userId:
 *                       type: string
 *                       description: 작성자 ID
 *                       example: "user123"
 *                     userNickname:
 *                       type: string
 *                       description: 작성자 닉네임
 *                       example: "사용자닉네임"
 *                     content:
 *                       type: array
 *                       description: 댓글 내용
 *                       items:
 *                         $ref: '#/components/schemas/ContentItem'
 *                     media:
 *                       type: array
 *                       description: 미디어 블록
 *                       items:
 *                         $ref: '#/components/schemas/MediaItem'
 *                     parentId:
 *                       type: string
 *                       nullable: true
 *                       description: 부모 댓글 ID
 *                       example: "comment_456"
 *                     depth:
 *                       type: number
 *                       description: 댓글 깊이
 *                       example: 0
 *                     isReply:
 *                       type: boolean
 *                       description: 답글 여부
 *                       example: false
 *                     isLocked:
 *                       type: boolean
 *                       description: 잠금 여부
 *                       example: false
 *                     reportsCount:
 *                       type: number
 *                       description: 신고 수
 *                       example: 0
 *                     likesCount:
 *                       type: number
 *                       description: 좋아요 수
 *                       example: 0
 *                     deleted:
 *                       type: boolean
 *                       description: 삭제 여부
 *                       example: false
 *                     deletedAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                       description: 삭제일시
 *                       example: null
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: 생성일시
 *                       example: "2025-10-03T17:15:07.862Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       description: 수정일시
 *                       example: "2025-10-03T18:30:15.123Z"
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: "잘못된 요청입니다"
 *       403:
 *         description: 권한 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 403
 *                 message:
 *                   type: string
 *                   example: "권한이 없습니다"
 *       404:
 *         description: 댓글을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: "댓글을 찾을 수 없습니다"
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "서버 내부 오류가 발생했습니다"
 */
router.put("/:commentId", authGuard, commentController.updateComment);

// 댓글 삭제
/**
 * @swagger
 * /comments/{commentId}:
 *   delete:
 *     tags: [Comments]
 *     summary: 댓글 삭제
 *     description: 특정 댓글 삭제
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: 댓글 ID
 *     responses:
 *       204:
 *         description: 댓글 삭제 성공
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: "잘못된 요청입니다"
 *       403:
 *         description: 권한 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 403
 *                 message:
 *                   type: string
 *                   example: "권한이 없습니다"
 *       404:
 *         description: 댓글을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: "댓글을 찾을 수 없습니다"
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "서버 내부 오류가 발생했습니다"
 */
router.delete("/:commentId", authGuard, commentController.deleteComment);

// 댓글 좋아요 토글
/**
 * @swagger
 * /comments/{commentId}/like:
 *   post:
 *     tags: [Comments]
 *     summary: 댓글 좋아요 토글
 *     description: 특정 댓글의 좋아요 토글
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: 댓글 ID
 *     responses:
 *       200:
 *         description: 댓글 좋아요 토글 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     commentId:
 *                       type: string
 *                     userId:
 *                       type: string
 *                     isLiked:
 *                       type: boolean
 *                       example: true
 *                     likesCount:
 *                       type: integer
 *                       example: 3
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: "잘못된 요청입니다"
 *       404:
 *         description: 댓글을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: "댓글을 찾을 수 없습니다"
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "서버 내부 오류가 발생했습니다"
 */
router.post("/:commentId/like", authGuard, commentController.toggleCommentLike);

module.exports = router;
