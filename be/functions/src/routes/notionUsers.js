const express = require("express");
const notionUserController = require("../controllers/notionUserController");
const router = express.Router();

// 활동회원 동기화 라우트
/**
 * @swagger
 * /notionUsers/sync/active:
 *   get:
 *     summary: 회원 동기화
 *     description: |
 *       Firebase의 users 컬렉션에서 활동회원을 조회하여 Notion 데이터베이스와 동기화합니다.
 *       - Firebase의 lastUpdated 필드와 Notion의 마지막 업데이트 시간을 비교하여 동기화가 필요한 사용자만 처리
 *       - 동기화된 사용자 수를 반환
 *     tags: [NotionUsers]
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
 *                   example: "회원 동기화 완료: 15명"
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
 *                   example: "활동회원 동기화 중 오류가 발생했습니다."
 *                 error:
 *                   type: string
 *                   example: "TypeError: successResponse is not a function"
 */
router.get("/sync/active", notionUserController.syncUserAccounts);


/**
 * @swagger
 * /notionUsers/sync/full:
 *   get:
 *     summary: 회원 전체 재동기화
 *     description: |
 *       기존 Notion 사용자 데이터베이스를 모두 삭제하고,
 *       Firebase users 컬렉션의 전체 데이터를 다시 동기화합니다.
 *     tags: [NotionUsers]
 *     responses:
 *       200:
 *         description: 전체 동기화 성공
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
 *                   example: "회원 전체 재동기화 완료: 150명"
 *       500:
 *         description: 서버 오류
 */
router.get("/sync/full", notionUserController.syncAllUserAccounts);


module.exports = router;
