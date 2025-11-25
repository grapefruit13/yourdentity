const express = require("express");
const router = express.Router();
const qnaController = require("../controllers/qnaController");
const authGuard = require("../middleware/authGuard");
const optionalAuth = require("../middleware/optionalAuth");

/**
 * @swagger
 * components:
 *   schemas:
 *     QnA:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: QnA ID
 *         pageId:
 *           type: string
 *           description: Notion 페이지 ID
 *         pageType:
 *           type: string
 *           enum: [program, announcement, store]
 *           description: 페이지 타입
 *         author:
 *           type: string
 *           description: 작성자 닉네임
 *         content:
 *           type: string
 *           description: QnA HTML 내용
 *         parentId:
 *           type: string
 *           nullable: true
 *           description: 부모 QnA ID (답글인 경우)
 *         depth:
 *           type: integer
 *           description: "QnA 깊이 (0: 문의, 1: 답글)"
 *         isLocked:
 *           type: boolean
 *           description: 잠금 여부
 *         likesCount:
 *           type: integer
 *           description: 좋아요 수
 *         isLiked:
 *           type: boolean
 *           nullable: true
 *           description: 사용자가 좋아요를 눌렀다면 true (인증된 요청일 때만 포함)
 *         repliesCount:
 *           type: integer
 *           description: 답글 수
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 생성일시
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 수정일시
 *         replies:
 *           type: array
 *           description: 답글 목록
 *           items:
 *             type: object
 */

// QnA 목록 조회
/**
 * @swagger
 * /qna/{pageId}:
 *   get:
 *     tags: [QnA]
 *     summary: QnA 목록 조회
 *     description: 특정 Notion 페이지의 QnA 목록 조회
 *     parameters:
 *       - in: path
 *         name: pageId
 *         required: true
 *         schema:
 *           type: string
 *         description: Notion 페이지 ID
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
 *           default: 10
 *         description: 페이지 크기
 *     responses:
 *       200:
 *         description: QnA 목록 조회 성공
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
 *                     qnas:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             description: QnA ID
 *                             example: "qna_123"
 *                           pageId:
 *                             type: string
 *                             description: Notion 페이지 ID
 *                             example: "abc123def456"
 *                           pageType:
 *                             type: string
 *                             enum: [program, announcement, store]
 *                             description: 페이지 타입
 *                             example: "store"
 *                           author:
 *                             type: string
 *                             description: 작성자 닉네임
 *                             example: "사용자닉네임"
 *                           content:
 *                             type: string
 *                             description: QnA HTML 내용
 *                             example: "<p>문의 내용입니다!</p>"
 *                           parentId:
 *                             type: string
 *                             nullable: true
 *                             description: 부모 QnA ID
 *                             example: null
 *                           depth:
 *                             type: number
 *                             description: QnA 깊이
 *                             example: 0
 *                           isLocked:
 *                             type: boolean
 *                             description: 잠금 여부
 *                             example: false
 *                           likesCount:
 *                             type: number
 *                             description: 좋아요 수
 *                             example: 0
 *                           isLiked:
 *                             type: boolean
 *                             nullable: true
 *                             description: 사용자가 좋아요를 눌렀다면 true (인증된 요청일 때만 포함)
 *                           repliesCount:
 *                             type: number
 *                             description: 답글 수
 *                             example: 2
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
 *                             description: 답글 목록
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
 *                           example: 10
 *                         totalElements:
 *                           type: integer
 *                           example: 50
 *                         totalPages:
 *                           type: integer
 *                           example: 5
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
 *       500:
 *         description: 서버 오류
 */
router.get(
    "/:pageId",
    optionalAuth,
    qnaController.getQnAs,
);

// QnA 작성
/**
 * @swagger
 * /qna/{pageId}:
 *   post:
 *     tags: [QnA]
 *     summary: QnA 작성
 *     description: 특정 Notion 페이지에 QnA 작성
 *     parameters:
 *       - in: path
 *         name: pageId
 *         required: true
 *         schema:
 *           type: string
 *         description: Notion 페이지 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pageType
 *               - content
 *             properties:
 *               pageType:
 *                 type: string
 *                 enum: [program, announcement, store]
 *                 description: 페이지 타입
 *                 example: "store"
 *               content:
 *                 type: string
 *                 description: QnA HTML 내용
 *                 example: "<p>이 상품은 언제 배송되나요?</p><img src=\"https://example.com/image.jpg\" width=\"1080\" height=\"1080\" data-blurhash=\"L6PZfSi_.AyE_3t7t7R**0o#DgR4\" data-mimetype=\"image/jpeg\"/>"
 *               parentId:
 *                 type: string
 *                 nullable: true
 *                 description: 부모 QnA ID (답글인 경우)
 *                 example: null
 *           example:
 *             pageType: "store"
 *             content: "<p>이 상품은 언제 배송되나요?</p>"
 *             parentId: null
 *     responses:
 *       201:
 *         description: QnA 작성 성공
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
 *                       description: QnA ID
 *                       example: "qna_123"
 *                     pageId:
 *                       type: string
 *                       description: Notion 페이지 ID
 *                       example: "abc123def456"
 *                     pageType:
 *                       type: string
 *                       enum: [program, announcement, store]
 *                       description: 페이지 타입
 *                       example: "store"
 *                     author:
 *                       type: string
 *                       description: 작성자 닉네임
 *                       example: "사용자닉네임"
 *                     content:
 *                       type: string
 *                       description: QnA HTML 내용
 *                       example: "<p>문의드립니다!</p>"
 *                     parentId:
 *                       type: string
 *                       nullable: true
 *                       description: 부모 QnA ID
 *                       example: null
 *                     depth:
 *                       type: number
 *                       description: QnA 깊이
 *                       example: 0
 *                     isLocked:
 *                       type: boolean
 *                       description: 잠금 여부
 *                       example: false
 *                     likesCount:
 *                       type: number
 *                       description: 좋아요 수
 *                       example: 0
 *                     isLiked:
 *                       type: boolean
 *                       nullable: true
 *                       description: 사용자가 좋아요를 눌렀다면 true (인증된 요청일 때만 포함)
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
 *         description: 페이지를 찾을 수 없음
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
 *                   example: "페이지를 찾을 수 없습니다"
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
    "/:pageId",
    authGuard,
    qnaController.createQnA,
);

// QnA 수정
/**
 * @swagger
 * /qna/{qnaId}:
 *   put:
 *     tags: [QnA]
 *     summary: QnA 수정
 *     description: 특정 QnA 수정
 *     parameters:
 *       - in: path
 *         name: qnaId
 *         required: true
 *         schema:
 *           type: string
 *         description: QnA ID
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
 *                 type: string
 *                 description: 수정된 QnA HTML 내용
 *                 example: "<p>수정된 문의 내용입니다!</p><img src=\"https://example.com/updated-image.jpg\" width=\"1080\" height=\"1080\" data-blurhash=\"L6PZfSi_.AyE_3t7t7R**0o#DgR4\" data-mimetype=\"image/jpeg\"/>"
 *           example:
 *             content: "<p>수정된 문의 내용입니다!</p>"
 *     responses:
 *       200:
 *         description: QnA 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   $ref: '#/components/schemas/QnA'
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
 *         description: QnA를 찾을 수 없음
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
 *                   example: "QnA를 찾을 수 없습니다"
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
router.put("/:qnaId", authGuard, qnaController.updateQnA);

// QnA 삭제
/**
 * @swagger
 * /qna/{qnaId}:
 *   delete:
 *     tags: [QnA]
 *     summary: QnA 삭제
 *     description: 특정 QnA 삭제
 *     parameters:
 *       - in: path
 *         name: qnaId
 *         required: true
 *         schema:
 *           type: string
 *         description: QnA ID
 *     responses:
 *       204:
 *         description: QnA 삭제 성공
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
 *         description: QnA를 찾을 수 없음
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
 *                   example: "QnA를 찾을 수 없습니다"
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
router.delete("/:qnaId", authGuard, qnaController.deleteQnA);

// QnA 좋아요 토글
/**
 * @swagger
 * /qna/{qnaId}/like:
 *   post:
 *     tags: [QnA]
 *     summary: QnA 좋아요 토글
 *     description: 특정 QnA의 좋아요 토글
 *     parameters:
 *       - in: path
 *         name: qnaId
 *         required: true
 *         schema:
 *           type: string
 *         description: QnA ID
 *     responses:
 *       200:
 *         description: QnA 좋아요 토글 성공
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
 *                     qnaId:
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
 *         description: QnA를 찾을 수 없음
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
 *                   example: "QnA를 찾을 수 없습니다"
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
router.post("/:qnaId/like", authGuard, qnaController.toggleQnALike);

module.exports = router;

