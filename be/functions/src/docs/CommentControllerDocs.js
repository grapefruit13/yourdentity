/**
 * @fileoverview 댓글 컨트롤러 Swagger 문서
 */

class CommentControllerDocs {
  /**
   * 댓글 목록 조회 API 문서
   */
  static getComments() {
    /**
     * @swagger
     * /communities/{communityId}/posts/{postId}/comments:
     *   get:
     *     tags: [Comments]
     *     summary: 댓글 목록 조회
     *     description: 특정 게시글의 댓글 목록을 조회합니다 (부모 댓글과 대댓글 포함)
     *     parameters:
     *       - in: path
     *         name: communityId
     *         required: true
     *         schema:
     *           type: string
     *         description: 커뮤니티 ID
     *         example: "routine-planner"
     *       - in: path
     *         name: postId
     *         required: true
     *         schema:
     *           type: string
     *         description: 게시글 ID
     *         example: "CERT_1234567890"
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *           default: 0
     *         description: 페이지 번호
     *       - in: query
     *         name: size
     *         schema:
     *           type: integer
     *           default: 20
     *         description: 페이지 크기
     *     responses:
     *       200:
     *         description: 댓글 목록 조회 성공
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/CommentWithReplies'
     *                 pagination:
     *                   $ref: '#/components/schemas/PaginationResponse'
     *       404:
     *         description: 커뮤니티 또는 게시글을 찾을 수 없음
     */
  }

  /**
   * 댓글 작성 API 문서
   */
  static createComment() {
    /**
     * @swagger
     * /communities/{communityId}/posts/{postId}/comments:
     *   post:
     *     tags: [Comments]
     *     summary: 댓글 작성
     *     description: 특정 게시글에 댓글을 작성합니다
     *     parameters:
     *       - in: path
     *         name: communityId
     *         required: true
     *         schema:
     *           type: string
     *         description: 커뮤니티 ID
     *         example: "routine-planner"
     *       - in: path
     *         name: postId
     *         required: true
     *         schema:
     *           type: string
     *         description: 게시글 ID
     *         example: "CERT_1234567890"
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
     *                 description: 댓글 내용 (텍스트, 이미지, 비디오, 파일 등)
     *                 example:
     *                   - type: "text"
     *                     order: 1
     *                     content: "정말 좋은 게시글이네요! 👍"
     *                   - type: "text"
     *                     order: 2
     *                     content: "저도 비슷한 경험이 있어요."
     *                   - type: "image"
     *                     order: 3
     *                     url: "https://example.com/image.jpg"
     *                     width: 800
     *                     height: 600
     *                     blurHash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4"
     *                     thumbUrl: "https://example.com/thumb.jpg"
     *                     fileName: "image.jpg"
     *                     sizeBytes: 1024000
     *                     mimeType: "image/jpeg"
     *                   - type: "video"
     *                     order: 4
     *                     url: "https://example.com/video.mp4"
     *                     width: 1920
     *                     height: 1080
     *                     thumbUrl: "https://example.com/video-thumb.jpg"
     *                     fileName: "video.mp4"
     *                     sizeBytes: 5242880
     *                     mimeType: "video/mp4"
     *                     duration: 30
     *                   - type: "file"
     *                     order: 5
     *                     url: "https://example.com/document.pdf"
     *                     fileName: "document.pdf"
     *                     sizeBytes: 2048000
     *                     mimeType: "application/pdf"
     *                 items:
     *                   type: object
     *                   properties:
     *                     type:
     *                       type: string
     *                       enum: [text, image, video, file]
     *                       example: "text"
     *                     order:
     *                       type: number
     *                       example: 1
     *                     content:
     *                       type: string
     *                       example: "정말 좋은 게시글이네요!"
     *                     url:
     *                       type: string
     *                       description: 미디어 URL (type이 image/video/file일 때)
     *                       example: "https://example.com/image.jpg"
     *                     width:
     *                       type: integer
     *                       description: 너비
     *                       example: 800
     *                     height:
     *                       type: integer
     *                       description: 높이
     *                       example: 600
     *                     blurHash:
     *                       type: string
     *                       description: 블러 해시
     *                       example: "L6PZfSi_.AyE_3t7t7R**0o#DgR4"
     *                     thumbUrl:
     *                       type: string
     *                       description: 썸네일 URL
     *                       example: "https://example.com/thumb.jpg"
     *                     fileName:
     *                       type: string
     *                       description: 파일명
     *                       example: "image.jpg"
     *                     sizeBytes:
     *                       type: integer
     *                       description: 파일 크기 (바이트)
     *                       example: 1024000
     *                     mimeType:
     *                       type: string
     *                       description: MIME 타입
     *                       example: "image/jpeg"
     *                     duration:
     *                       type: number
     *                       description: 비디오 길이 (초)
     *                       example: 30
     *               parentId:
     *                 type: string
     *                 description: 부모 댓글 ID (대댓글인 경우)
     *                 example: "comment_123"
     *     responses:
     *       201:
     *         description: 댓글 작성 성공
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: string
     *                       example: "comment_123"
     *                     type:
     *                       type: string
     *                       example: "ROUTINE_CERT"
     *                     targetId:
     *                       type: string
     *                       example: "CERT_1234567890"
     *                     targetPath:
     *                       type: string
     *                       example: "communities/routine-planner/posts/CERT_1234567890"
     *                     userId:
     *                       type: string
     *                       example: "user123"
     *                     userNickname:
     *                       type: string
     *                       example: "사용자닉네임"
     *                     content:
     *                       type: array
     *                       items:
     *                         $ref: '#/components/schemas/ContentItem'
     *                     mediaBlocks:
     *                       type: array
     *                       items:
     *                         $ref: '#/components/schemas/MediaItem'
     *                     parentId:
     *                       type: string
     *                       nullable: true
     *                       example: "comment_456"
     *                     depth:
     *                       type: integer
     *                       example: 0
     *                     isReply:
     *                       type: boolean
     *                       example: false
     *                     isLocked:
     *                       type: boolean
     *                       example: false
     *                     reportsCount:
     *                       type: integer
     *                       example: 0
     *                     likesCount:
     *                       type: integer
     *                       example: 3
     *                     deleted:
     *                       type: boolean
     *                       example: false
     *                     deletedAt:
     *                       type: string
     *                       format: date-time
     *                       nullable: true
     *                       example: null
     *                     createdAt:
     *                       type: string
     *                       format: date-time
     *                       example: "2025-09-28T15:30:00Z"
     *                     updatedAt:
     *                       type: string
     *                       format: date-time
     *                       example: "2025-09-28T15:30:00Z"
     *                 message:
     *                   type: string
     *                   example: "댓글이 성공적으로 작성되었습니다."
     *       400:
     *         description: 잘못된 요청
     *       404:
     *         description: 커뮤니티 또는 게시글을 찾을 수 없음
     */
  }

  /**
   * 댓글 수정 API 문서
   */
  static updateComment() {
    /**
     * @swagger
     * /comments/{commentId}:
     *   put:
     *     tags: [Comments]
     *     summary: 댓글 수정
     *     description: 특정 댓글을 수정합니다
     *     parameters:
     *       - in: path
     *         name: commentId
     *         required: true
     *         schema:
     *           type: string
     *         description: 댓글 ID
     *         example: "comment_123"
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
     *                 description: 댓글 내용 (텍스트, 이미지, 비디오, 파일 등)
     *                 example:
     *                   - type: "text"
     *                     order: 1
     *                     content: "수정된 댓글 내용입니다! 🔥"
     *                   - type: "text"
     *                     order: 2
     *                     content: "추가로 말씀드리자면..."
     *                   - type: "image"
     *                     order: 3
     *                     url: "https://example.com/updated-image.jpg"
     *                     width: 1024
     *                     height: 768
     *                     blurHash: "L8PZfSi_.AyE_3t7t7R**0o#DgR4"
     *                     thumbUrl: "https://example.com/updated-thumb.jpg"
     *                     fileName: "updated-image.jpg"
     *                     sizeBytes: 1536000
     *                     mimeType: "image/jpeg"
     *                   - type: "video"
     *                     order: 4
     *                     url: "https://example.com/updated-video.mp4"
     *                     width: 1280
     *                     height: 720
     *                     thumbUrl: "https://example.com/updated-video-thumb.jpg"
     *                     fileName: "updated-video.mp4"
     *                     sizeBytes: 10485760
     *                     mimeType: "video/mp4"
     *                     duration: 45
     *                   - type: "file"
     *                     order: 5
     *                     url: "https://example.com/updated-document.pdf"
     *                     fileName: "updated-document.pdf"
     *                     sizeBytes: 3072000
     *                     mimeType: "application/pdf"
     *                 items:
     *                   type: object
     *                   properties:
     *                     type:
     *                       type: string
     *                       enum: [text, image, video, file]
     *                       example: "text"
     *                     order:
     *                       type: number
     *                       example: 1
     *                     content:
     *                       type: string
     *                       example: "수정된 댓글 내용입니다."
     *                     url:
     *                       type: string
     *                       description: 미디어 URL (type이 image/video/file일 때)
     *                       example: "https://example.com/image.jpg"
     *                     width:
     *                       type: integer
     *                       description: 너비
     *                       example: 800
     *                     height:
     *                       type: integer
     *                       description: 높이
     *                       example: 600
     *                     blurHash:
     *                       type: string
     *                       description: 블러 해시
     *                       example: "L6PZfSi_.AyE_3t7t7R**0o#DgR4"
     *                     thumbUrl:
     *                       type: string
     *                       description: 썸네일 URL
     *                       example: "https://example.com/thumb.jpg"
     *                     fileName:
     *                       type: string
     *                       description: 파일명
     *                       example: "image.jpg"
     *                     sizeBytes:
     *                       type: integer
     *                       description: 파일 크기 (바이트)
     *                       example: 1024000
     *                     mimeType:
     *                       type: string
     *                       description: MIME 타입
     *                       example: "image/jpeg"
     *                     duration:
     *                       type: number
     *                       description: 비디오 길이 (초)
     *                       example: 30
     *     responses:
     *       200:
     *         description: 댓글 수정 성공
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: string
     *                       example: "comment_123"
     *                     type:
     *                       type: string
     *                       example: "ROUTINE_CERT"
     *                     targetId:
     *                       type: string
     *                       example: "CERT_1234567890"
     *                     targetPath:
     *                       type: string
     *                       example: "communities/routine-planner/posts/CERT_1234567890"
     *                     userId:
     *                       type: string
     *                       example: "user123"
     *                     userNickname:
     *                       type: string
     *                       example: "사용자닉네임"
     *                     content:
     *                       type: array
     *                       items:
     *                         $ref: '#/components/schemas/ContentItem'
     *                     mediaBlocks:
     *                       type: array
     *                       items:
     *                         $ref: '#/components/schemas/MediaItem'
     *                     parentId:
     *                       type: string
     *                       nullable: true
     *                       example: "comment_456"
     *                     depth:
     *                       type: integer
     *                       example: 0
     *                     isReply:
     *                       type: boolean
     *                       example: false
     *                     isLocked:
     *                       type: boolean
     *                       example: false
     *                     reportsCount:
     *                       type: integer
     *                       example: 0
     *                     likesCount:
     *                       type: integer
     *                       example: 5
     *                     deleted:
     *                       type: boolean
     *                       example: false
     *                     deletedAt:
     *                       type: string
     *                       format: date-time
     *                       nullable: true
     *                       example: null
     *                     createdAt:
     *                       type: string
     *                       format: date-time
     *                       example: "2025-09-28T15:30:00Z"
     *                     updatedAt:
     *                       type: string
     *                       format: date-time
     *                       example: "2025-09-28T16:45:00Z"
     *                 message:
     *                   type: string
     *                   example: "댓글이 성공적으로 수정되었습니다."
     *       403:
     *         description: 권한 없음
     *       404:
     *         description: 댓글을 찾을 수 없음
     */
  }

  /**
   * 댓글 삭제 API 문서
   */
  static deleteComment() {
    /**
     * @swagger
     * /comments/{commentId}:
     *   delete:
     *     tags: [Comments]
     *     summary: 댓글 삭제
     *     description: 특정 댓글을 삭제합니다 (소프트 삭제)
     *     parameters:
     *       - in: path
     *         name: commentId
     *         required: true
     *         schema:
     *           type: string
     *         description: 댓글 ID
     *         example: "comment_123"
     *     requestBody:
     *       required: false
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties: {}
     *     responses:
     *       200:
     *         description: 댓글 삭제 성공
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: "댓글이 성공적으로 삭제되었습니다."
     *       403:
     *         description: 권한 없음
     *       404:
     *         description: 댓글을 찾을 수 없음
     */
  }

  /**
   * 댓글 좋아요 토글 API 문서
   */
  static toggleCommentLike() {
    /**
     * @swagger
     * /comments/{commentId}/like:
     *   post:
     *     tags: [Comments]
     *     summary: 댓글 좋아요 토글
     *     description: 특정 댓글에 좋아요를 토글합니다 (userId는 하드코딩됨)
     *     parameters:
     *       - in: path
     *         name: commentId
     *         required: true
     *         schema:
     *           type: string
     *         description: 댓글 ID
     *         example: "comment_123"
     *     responses:
     *       200:
     *         description: 좋아요 토글 성공
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: "좋아요가 등록되었습니다."
     *                 isLiked:
     *                   type: boolean
     *                   example: true
     *                 likesCount:
     *                   type: integer
     *                   example: 3
     *       404:
     *         description: 댓글을 찾을 수 없음
     */
  }
}

module.exports = CommentControllerDocs;
