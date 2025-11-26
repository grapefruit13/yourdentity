const express = require("express");
const notionMissionController = require("../controllers/notionMissionController");

const router = express.Router();

/**
 * @swagger
 * /notionMissions/reactions/sync:
 *   get:
 *     summary: 미션 반응 수 동기화 (Firestore → Notion)
 *     description: |
 *       Firestore의 미션 좋아요 통계(missionLikesStats)를 기준으로
 *       Notion 미션 DB의 "반응 수" 숫자 필드를 일괄 업데이트합니다.
 *       - 앱에서 사용하는 likesCount는 Firestore 기준이며,
 *         Notion의 반응 수는 운영/레포트 용도로 동기화합니다.
 *     tags: [NotionMissions]
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
 *                   type: string
 *                   example: "미션 반응 수 동기화 완료: 10개, 실패: 0개 (총 10개)"
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.get("/reactions/sync", notionMissionController.syncReactions);

module.exports = router;


