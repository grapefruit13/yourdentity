const express = require("express");
const reportContentController = require("../controllers/reportContentController");
const authGuard = require("../middleware/authGuard");



const router = express.Router();



/**
 * @swagger
 * tags:
 *   name: Reports
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
 * /reports:
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

//router.post("/", authGuard, reportContentController.createReport);
router.post("/", reportContentController.createReport);



/**
 * @swagger
 * /reportContent/syncNotionReports:
 *   get:
 *     summary: Notion 전체 DB를 Firebase reports 컬렉션으로 동기화
 *     description: 노션에 있는 모든 신고 데이터를 가져와서 Firebase reports 컬렉션에 저장합니다.
 *     tags:
 *       - Report
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
 * /reports/my:
 *   post:
 *     summary: 내가 신고한 목록 조회
 *     description: reporterId를 기준으로 사용자가 신고한 목록을 조회합니다.
 *     tags: [Reports]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reporterId:
 *                 type: string
 *                 description: 조회할 사용자 ID
 *                 example: RpqG32COF2Q3UbpDGp6PEAgiqtui_5
 *               page:
 *                 type: integer
 *                 description: 페이지 번호 (0부터 시작)
 *                 example: 0
 *               size:
 *                 type: integer
 *                 description: 페이지당 항목 수
 *                 example: 10
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
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Report'
 *       400:
 *         description: 필수 값 누락 (reporterId)
 *       500:
 *         description: 서버 오류
 */
//router.post("/my", reportContentController.getMyReports);
router.post("/my", authGuard, reportContentController.getMyReports);

/**
 * @swagger
 * /reports/{reportId}:
 *   get:
 *     summary: 신고 상세 조회
 *     description: 특정 신고의 상세 정보를 조회합니다.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *         description: 신고 ID
 *         example: "report_123"
 *     responses:
 *       200:
 *         description: 신고 상세 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Report'
 *       404:
 *         description: 신고를 찾을 수 없음
 *       401:
 *         description: 인증 필요
 *       500:
 *         description: 서버 오류
 */
router.get("/:reportId", reportContentController.getReportById);






module.exports = router;