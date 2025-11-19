const express = require("express");
const notificationController = require("../controllers/notificationController");
const authGuard = require("../middleware/authGuard");

const router = express.Router();

/**
 * @swagger
 * /notifications/send-all-pending:
 *   get:
 *     summary: 모든 "전송 대기" 상태 알림 일괄 전송
 *     description: |
 *       "전송 대기" 상태인 모든 알림을 찾아서 전송합니다.
 *       - 성공: "전송 완료"로 상태 변경
 *       - 부분 성공: "부분 완료"로 상태 변경
 *       - 실패: "전송 실패"로 상태 변경
 *       
 *       **사용 방법:**
 *       1. Notion에서 전송 버튼 하나만 생성
 *       2. 버튼 URL: `https://your-api.com/notifications/send-all-pending`
 *       3. 버튼 클릭 시 모든 대기 상태 알림 자동 전송
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: 알림 전송 완료
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
 *                     success:
 *                       type: boolean
 *                       example: true
 *                     message:
 *                       type: string
 *                       example: "총 3개의 알림을 처리했습니다."
 *                     total:
 *                       type: integer
 *                       example: 3
 *                     successCount:
 *                       type: integer
 *                       example: 2
 *                     errorCount:
 *                       type: integer
 *                       example: 1
 *                     results:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           pageId:
 *                             type: string
 *                           success:
 *                             type: boolean
 *                           title:
 *                             type: string
 *                           totalUsers:
 *                             type: integer
 *                           successCount:
 *                             type: integer
 *                           failureCount:
 *                             type: integer
 *       500:
 *         description: 서버 오류
 */
router.get("/send-all-pending", notificationController.sendAllPending);

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: 알림 목록 조회
 *     description: 현재 로그인한 사용자의 알림 목록을 조회합니다. 읽지 않은 알림 개수도 함께 반환됩니다.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: 알림 목록 조회 성공
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
 *                     notifications:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           message:
 *                             type: string
 *                           type:
 *                             type: string
 *                           commentId:
 *                             type: string
 *                             description: COMMENT_LIKE, COMMENT 타입일 때 사용
 *                           communityId:
 *                             type: string
 *                           postId:
 *                             type: string
 *                           isRead:
 *                             type: boolean
 *                           createdAt:
 *                             type: string
 *                           updatedAt:
 *                             type: string
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         size:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         hasNext:
 *                           type: boolean
 *                     unreadCount:
 *                       type: integer
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 */
router.get("/", authGuard, notificationController.getNotifications);

/**
 * @swagger
 * /notifications/read-all:
 *   patch:
 *     summary: 전체 읽음 처리
 *     description: 현재 로그인한 사용자의 모든 읽지 않은 알림을 읽음 처리합니다.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 전체 읽음 처리 성공
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
 *                       example: "모든 알림이 읽음 처리되었습니다"
 *                     updatedCount:
 *                       type: integer
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 */
router.patch("/read-all", authGuard, notificationController.markAllAsRead);

/**
 * @swagger
 * /notifications/{notificationId}/read:
 *   patch:
 *     summary: 개별 알림 읽음 처리
 *     description: 특정 알림을 읽음 처리합니다.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         description: 알림 ID
 *     responses:
 *       200:
 *         description: 개별 읽음 처리 성공
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
 *                       example: "알림이 읽음 처리되었습니다"
 *                     updated:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: 잘못된 요청 (알림 ID 누락)
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 알림을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.patch("/:notificationId/read", authGuard, notificationController.markAsRead);

module.exports = router;

