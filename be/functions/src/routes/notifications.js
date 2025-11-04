const express = require("express");
const notificationController = require("../controllers/notificationController");

const router = express.Router();

/**
 * @swagger
 * /notifications/send-all-pending:
 *   post:
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

module.exports = router;

