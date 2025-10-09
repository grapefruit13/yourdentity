const express = require("express");
const announcementController = require("../controllers/announcementController");

const router = express.Router();

/**
 * @swagger
 * /notion/announcements:
 *   get:
 *     summary: 공지사항 목록 조회
 *     description: 삭제되지 않은 공지사항 목록을 조회합니다. 고정된 공지사항이 상단에 표시됩니다.
 *     tags: [Announcements]
 *     responses:
 *       200:
 *         description: 공지사항 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AnnouncementListResponse'
 *             example:
 *               status: 200
 *               data:
 *                 - id: "abc123def456"
 *                   title: "새로운 기능 업데이트 안내"
 *                   author: "user_123"
 *                   pinned: true
 *                   startDate: "2024-01-01T00:00:00.000Z"
 *                   endDate: "2024-12-31T23:59:59.000Z"
 *                   createdAt: "2024-01-01T00:00:00.000Z"
 *                   updatedAt: "2024-01-01T00:00:00.000Z"
 *                   isDeleted: false
 *                 - id: "def456ghi789"
 *                   title: "서비스 점검 안내"
 *                   author: "user_456"
 *                   pinned: false
 *                   startDate: null
 *                   endDate: null
 *                   createdAt: "2024-01-02T00:00:00.000Z"
 *                   updatedAt: "2024-01-02T00:00:00.000Z"
 *                   isDeleted: false
 *       500:
 *         description: 서버 내부 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/", announcementController.getAnnouncementList);

/**
 * @swagger
 * /notion/announcements/{pageId}/sync:
 *   get:
 *     summary: 공지사항 동기화
 *     description: 노션에서 특정 페이지의 공지사항을 동기화합니다.
 *     tags: [Announcements]
 *     parameters:
 *       - in: path
 *         name: pageId
 *         required: true
 *         description: 노션 페이지 ID
 *         schema:
 *           type: string
 *           example: "abc123def456"
 *     responses:
 *       200:
 *         description: 공지사항 동기화 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AnnouncementSyncResponse'
 *             example:
 *               status: 200
 *               data:
 *                 id: "abc123def456"
 *                 title: "새로운 기능 업데이트 안내"
 *                 author: "user_123"
 *                 contentRich: []
 *                 pinned: true
 *                 startDate: "2024-01-01T00:00:00.000Z"
 *                 endDate: "2024-12-31T23:59:59.000Z"
 *                 createdAt: "2024-01-01T00:00:00.000Z"
 *                 updatedAt: "2024-01-01T00:00:00.000Z"
 *                 isDeleted: false
 *       400:
 *         description: 잘못된 요청 (페이지 ID 누락)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               code: "MISSING_PAGE_ID"
 *               message: "페이지 ID가 필요합니다"
 *               timestamp: "2024-01-01T00:00:00.000Z"
 *       500:
 *         description: 서버 내부 오류 또는 노션 API 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               code: "NOTION_API_ERROR"
 *               message: "노션 API 키가 설정되지 않았습니다"
 *               timestamp: "2024-01-01T00:00:00.000Z"
 */
router.get("/:pageId/sync", announcementController.syncAnnouncement);

/**
 * @swagger
 * /notion/announcements/{pageId}/delete:
 *   get:
 *     summary: 공지사항 소프트 삭제
 *     description: 공지사항을 소프트 삭제합니다. 실제로는 isDeleted 플래그만 true로 설정됩니다.
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
 *         description: 공지사항 소프트 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AnnouncementDeleteResponse'
 *             example:
 *               status: 200
 *               data:
 *                 id: "abc123def456"
 *                 isDeleted: true
 *                 updatedAt: "2024-01-01T00:00:00.000Z"
 *       400:
 *         description: 잘못된 요청 (페이지 ID 누락)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               code: "MISSING_PAGE_ID"
 *               message: "페이지 ID가 필요합니다"
 *               timestamp: "2024-01-01T00:00:00.000Z"
 *       500:
 *         description: 서버 내부 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:pageId/delete", announcementController.softDeleteAnnouncement);

/**
 * @swagger
 * /notion/announcements/{pageId}:
 *   get:
 *     summary: 공지사항 상세 조회
 *     description: 특정 공지사항의 상세 정보를 조회합니다.
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
 *               $ref: '#/components/schemas/AnnouncementDetailResponse'
 *             example:
 *               status: 200
 *               data:
 *                 id: "abc123def456"
 *                 title: "새로운 기능 업데이트 안내"
 *                 author: "user_123"
 *                 contentRich:
 *                   - type: "paragraph"
 *                     paragraph:
 *                       rich_text:
 *                         - type: "text"
 *                           text:
 *                             content: "새로운 기능이 추가되었습니다."
 *                 pinned: true
 *                 startDate: "2024-01-01T00:00:00.000Z"
 *                 endDate: "2024-12-31T23:59:59.000Z"
 *                 createdAt: "2024-01-01T00:00:00.000Z"
 *                 updatedAt: "2024-01-01T00:00:00.000Z"
 *                 isDeleted: false
 *       400:
 *         description: 잘못된 요청 (페이지 ID 누락)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               code: "MISSING_PAGE_ID"
 *               message: "페이지 ID가 필요합니다"
 *               timestamp: "2024-01-01T00:00:00.000Z"
 *       404:
 *         description: 공지사항을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               code: "ANNOUNCEMENT_NOT_FOUND"
 *               message: "공지사항을 찾을 수 없습니다"
 *               timestamp: "2024-01-01T00:00:00.000Z"
 *       500:
 *         description: 서버 내부 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:pageId", announcementController.getAnnouncementDetail);

module.exports = router;


