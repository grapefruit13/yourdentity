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
 *           examples:
 *             postReport:
 *               summary: 게시글 신고 예시
 *               value:
 *                 targetType: "post"
 *                 targetId: "post_123"
 *                 communityId: "community_456"
 *                 reportReason: "욕설"
 *             commentReport:
 *               summary: 댓글 신고 예시
 *               value:
 *                 targetType: "comment"
 *                 targetId: "comment_789"
 *                 reportReason: "스팸"
 *     responses:
 *       201:
 *         description: 신고 접수 성공
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
 *                   example: "신고가 접수되었습니다."
 *                 data:
 *                   $ref: '#/components/schemas/Report'
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "이미 신고한 콘텐츠입니다."
 *       401:
 *         description: 인증 필요
 *       404:
 *         description: 신고 대상을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */

// router.post("/", authGuard, reportContentController.createReport);
router.post("/", reportContentController.createReport);


/**
 * @swagger
 * /reportContent/syncNotionReports:
 *   get:
 *     summary: Notion 전체 DB를 Firebase reports 컬렉션으로 동기화
 *     description: 노션에 있는 모든 신고 데이터를 가져와서 Firebase reports 컬렉션에 저장합니다.
 *     tags:
 *       - Reports
 *     responses:
 *       200:
 *         description: 동기화 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 10
 *       500:
 *         description: 동기화 실패
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Notion -> Firebase 동기화 실패: ..."
 */
// 노션 → Firebase 동기화 라우트 추가
router.get("/syncNotionReports", reportContentController.syncNotionReports);


/**
 * @swagger
 * /reportContent/my:
 *   post:
 *     tags:
 *       - Reports
 *     summary: 내가 신고한 목록 조회 (로그인 필요)
 *     description: 로그인된 사용자의 신고 목록을 조회합니다. 페이지네이션은 cursor 기반입니다.
 *     security:
 *       - bearerAuth: []   #토큰 필요
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
 *               lastCreatedAt:
 *                 type: string
 *                 format: date-time
 *                 description: 이전 페이지 마지막 신고 createdAt 값 (다음 페이지 조회용)
 *                 example: "2025-10-08T20:31:33.028Z"
 *     responses:
 *       200:
 *         description: 신고 목록 조회 성공
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
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "서버 오류가 발생했습니다."
 */
router.post("/my", authGuard, reportContentController.getMyReports);

/**
 * @swagger
 * /reportContent:
 *   get:
 *     summary: 신고 상세 조회
 *     description: targetType, targetId, targetUserId를 기준으로 Notion DB에서 특정 신고 데이터를 조회합니다.
 *     tags:
 *       - Reports
 *     parameters:
 *       - in: query
 *         name: targetType
 *         schema:
 *           type: string
 *           example: post
 *         required: true
 *         description: "신고 대상 타입 (예: '게시글' 또는 '댓글')"
 *       - in: query
 *         name: targetId
 *         schema:
 *           type: string
 *           example: "abc123"
 *         required: true
 *         description: "신고 대상의 고유 ID"
 *       - in: query
 *         name: targetUserId
 *         schema:
 *           type: string
 *           example: "user567"
 *         required: true
 *         description: "신고된 사용자 ID"
 *     responses:
 *       200:
 *         description: "신고 상세 조회 성공"
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
 *                     notionPageId:
 *                       type: string
 *                       example: "a1b2c3d4e5"
 *                     targetType:
 *                       type: string
 *                       example: "post"
 *                     targetId:
 *                       type: string
 *                       example: "abc123"
 *                     targetUserId:
 *                       type: string
 *                       example: "user567"
 *                     reporterId:
 *                       type: string
 *                       example: "reporter999"
 *                     reportReason:
 *                       type: string
 *                       example: "부적절한 내용"
 *                     communityId:
 *                       type: string
 *                       example: "community001"
 *                     status:
 *                       type: string
 *                       example: "접수됨"
 *                     reportedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-10-10T12:00:00Z"
 *                     syncNotionAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-10-10T12:01:00Z"
 *                     syncNotionFirebase:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-10-10T12:02:00Z"
 *       400:
 *         description: "필수 쿼리 파라미터 누락"
 *       404:
 *         description: "신고 데이터 없음"
 *       500:
 *         description: "서버 내부 오류"
 */
router.get("/", reportContentController.getReportById);


module.exports = router;
