const express = require("express");
const reportContentController = require("../controllers/reportContentController");
const authGuard = require("../middleware/authGuard");


const router = express.Router();


/**
 * @swagger
 * tags:
 *   name: reportContent
 *   description: 신고 관리 API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Report:
 *       type: object
 *       required:
 *         - targetType
 *         - targetId
 *         - reportReason
 *       properties:
 *         id:
 *           type: string
 *           description: 신고 ID
 *           example: "report_123"
 *         targetType:
 *           type: string
 *           enum: [post, comment]
 *           description: 신고 대상 타입
 *           example: "post"
 *         targetId:
 *           type: string
 *           description: 신고 대상 ID
 *           example: "post_456"
 *         communityId:
 *           type: string
 *           nullable: true
 *           description: 커뮤니티 ID (게시글 신고 시 필수)
 *           example: "community_123"
 *         reporterId:
 *           type: string
 *           description: 신고자 ID
 *           example: "user_789"
 *         reporterName:
 *           type: string
 *           description: 신고자 이름
 *           example: "홍길동"
 *         reportReason:
 *           type: string
 *           description: 신고 사유
 *           example: "욕설"
 *         status:
 *           type: string
 *           enum: [pending, reviewed, dismissed, resolved]
 *           description: 처리 상태
 *           example: "pending"
 *         reviewedBy:
 *           type: string
 *           nullable: true
 *           description: 처리한 관리자 ID
 *         reviewedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: 처리 시각
 *         memo:
 *           type: string
 *           nullable: true
 *           description: 관리자 메모
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 신고 일시
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 수정 일시
 */


/**
 * @swagger
 * /reportContent:
 *   post:
 *     summary: 게시글/댓글 신고 생성
 *     description: 게시글 또는 댓글을 신고합니다. Firebase와 Notion에 동시 저장됩니다.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetType
 *               - targetId
 *               - targetUserId
 *               - reporterId
 *               - reportReason
 *             properties:
 *               targetType:
 *                 type: string
 *                 enum: [post, comment]
 *                 description: 신고 대상 타입
 *                 example: "post"
 *               targetId:
 *                 type: string
 *                 description: 신고 대상 ID
 *                 example: "post_123"
 *               targetUserId:
 *                  type: string
 *                  description: 신고 대상 사용자 ID
 *                  example: "user1"
 *               reporterId:
 *                  type: string
 *                  description: 신고자
 *                  example: "user2"
 *               communityId:
 *                 type: string
 *                 nullable: true
 *                 description: 커뮤니티 ID (게시글 신고 시 필수)
 *                 example: "community_456"
 *               reportReason:
 *                 type: string
 *                 description: 신고 사유
 *                 example: "욕설"
 *     responses:
 *       201:
 *         description: 신고 접수 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 201
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "신고가 접수되었습니다."
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: "이미 신고한 콘텐츠입니다."
 *       401:
 *         description: 인증 필요
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: "인증이 필요합니다."
 *       404:
 *         description: 신고 대상을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: "해당 reporterId를 가진 사용자를 찾을 수 없습니다."
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "서버 내부 오류가 발생했습니다."
 */

// router.post("/", authGuard, reportContentController.createReport);
router.post("/", reportContentController.createReport);


/**
 * @swagger
 * /reportContent/syncNotionReports:
 *   get:
 *     summary: Notion 전체 DB를 Firebase reports 컬렉션으로 동기화
 *     description: 노션에 있는 모든 신고 데이터를 가져와서 Firebase reports 컬렉션에 저장합니다.
 *     tags: [Reports]
 *     responses:
 *       200:
 *         description: 동기화 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "동기화가 완료되었습니다."
 *                     count:
 *                       type: integer
 *                       example: 10
 *       500:
 *         description: 동기화 실패
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "Notion 동기화 중 오류가 발생했습니다."
 */
// 노션 → Firebase 동기화 라우트 추가
router.get("/syncNotionReports", reportContentController.syncNotionReports);


/**
 * @swagger
 * /reportContent/my:
 *   post:
 *     tags: [Reports]
 *     summary: 내가 신고한 목록 조회 (로그인 필요)
 *     description: 로그인된 사용자의 신고 목록을 조회합니다. 페이지네이션은 cursor 기반입니다.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               size:
 *                 type: integer
 *                 description: 한 번에 조회할 신고 개수
 *                 example: 10
 *               cursor:
 *                   type: string
 *                   description: 이전 페이지 마지막 cursor 값 (다음 페이지 조회용)
 *                   example: "abc123cursor"
 *     responses:
 *       200:
 *         description: 신고 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     reports:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           targetType:
 *                             type: string
 *                           targetId:
 *                             type: string
 *                           reporterId:
 *                             type: string
 *                           reporterName:
 *                             type: string
 *                           reportReason:
 *                             type: string
 *                           status:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           targetUserId:
 *                             type: string
 *                           communityId:
 *                             type: string
 *                             nullable: true
 *                           firebaseUpdatedAt:
 *                             type: string
 *                             format: date-time
 *                           notionUpdatedAt:
 *                             type: string
 *                             format: date-time
 *                     hasMore:
 *                       type: boolean
 *                       description: 다음 페이지 존재 여부
 *                     nextCursor:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: "인증이 필요합니다."
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "서버 내부 오류가 발생했습니다."
 */
router.post("/my", authGuard, reportContentController.getMyReports);


module.exports = router;
