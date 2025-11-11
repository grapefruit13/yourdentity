const express = require("express");
const router = express.Router();
const announcementController = require("../controllers/announcementController");

/**
 * @swagger
 * /announcements:
 *   get:
 *     summary: 공지사항 목록 조회
 *     description: Notion에서 공지사항 목록을 직접 조회합니다. 고정된 공지사항이 상단에 표시됩니다. 페이지네이션을 지원합니다.
 *     tags: [Announcements]
 *     parameters:
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 20
 *           minimum: 1
 *           maximum: 100
 *         description: 페이지 크기 (1-100)
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *         description: 페이지네이션 커서 (다음 페이지 조회 시 사용)
 *     responses:
 *       200:
 *         description: 공지사항 목록 조회 성공
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
 *                     message:
 *                       type: string
 *                       example: "공지사항 목록을 성공적으로 조회했습니다."
 *                     announcements:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "abc123def456"
 *                           title:
 *                             type: string
 *                             example: "새로운 기능 업데이트 안내"
 *                           author:
 *                             type: string
 *                             example: "user_123"
 *                           pinned:
 *                             type: boolean
 *                             example: true
 *                           startDate:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-01-01T00:00:00.000Z"
 *                           endDate:
 *                             type: string
 *                             format: date-time
 *                             nullable: true
 *                             example: "2024-12-31T23:59:59.000Z"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-01-01T00:00:00.000Z"
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-01-01T00:00:00.000Z"
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         hasMore:
 *                           type: boolean
 *                           description: 다음 페이지 존재 여부
 *                           example: false
 *                         nextCursor:
 *                           type: string
 *                           nullable: true
 *                           description: 다음 페이지 커서
 *                           example: null
 *                         currentPageCount:
 *                           type: integer
 *                           description: 현재 페이지 항목 수
 *                           example: 3
 *       500:
 *         description: 서버 내부 오류 또는 Notion API 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: 500
 *               message: "Notion API 키가 설정되지 않았습니다"
 */
router.get("/", announcementController.getAnnouncements);

/**
 * @swagger
 * /announcements/{pageId}:
 *   get:
 *     summary: 공지사항 상세 조회
 *     description: Notion에서 특정 공지사항의 상세 정보를 직접 조회합니다.
 *     tags: [Announcements]
 *     parameters:
 *       - in: path
 *         name: pageId
 *         required: true
 *         description: 공지사항 ID (Notion 페이지 ID)
 *         schema:
 *           type: string
 *           example: "abc123def456"
 *     responses:
 *       200:
 *         description: 공지사항 상세 조회 성공
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
 *                     message:
 *                       type: string
 *                       example: "공지사항 상세 정보를 성공적으로 조회했습니다."
 *                     announcement:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "abc123def456"
 *                         title:
 *                           type: string
 *                           example: "새로운 기능 업데이트 안내"
 *                         author:
 *                           type: string
 *                           example: "user_123"
 *                         contentRich:
 *                           type: array
 *                           description: 공지사항 페이지 상세 내용 (Notion 블록)
 *                           items:
 *                             type: object
 *                         pinned:
 *                           type: boolean
 *                           example: true
 *                         startDate:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-01-01T00:00:00.000Z"
 *                         endDate:
 *                           type: string
 *                           format: date-time
 *                           nullable: true
 *                           example: "2024-12-31T23:59:59.000Z"
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-01-01T00:00:00.000Z"
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-01-01T00:00:00.000Z"
 *       400:
 *         description: 잘못된 요청 (페이지 ID 누락)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: 400
 *               message: "공지사항 ID가 필요합니다."
 *       404:
 *         description: 공지사항을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: 404
 *               message: "공지사항을 찾을 수 없습니다"
 *       500:
 *         description: 서버 내부 오류 또는 Notion API 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: 500
 *               message: "Notion API 키가 설정되지 않았습니다"
 */
router.get("/:pageId", announcementController.getAnnouncementById);

module.exports = router;


