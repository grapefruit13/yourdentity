const express = require("express");
const authController = require("../controllers/authController");
const authGuard = require("../middleware/authGuard");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: 인증 관련 API (Firebase Client SDK 기반)
 */

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: 로그아웃
 *     description: |
 *       사용자의 모든 Refresh Token을 무효화하여 기존 토큰 사용 불가
 *       
 *       **작동 방식:**
 *       1. 프론트엔드에서 auth.signOut() 호출 (localStorage 토큰 삭제)
 *       2. 이 API 호출 (Refresh Token 무효화)
 *       3. authGuard에서 로그아웃된 토큰 자동 거부
 *       
 *       **효과:**
 *       - 모든 디바이스에서 강제 로그아웃
 *       - 토큰 탈취 방어
 *       - 이 시점 이전 발급된 모든 토큰 무효화
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 로그아웃 성공
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
 *                       example: Logout successful
 *                     revokedAt:
 *                       type: string
 *                       format: date-time
 *                       description: Refresh Token이 무효화된 시간
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
 *                   example: 토큰이 만료되었습니다
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
 *                   example: 서버 내부 오류가 발생했습니다
 */
router.post("/logout", authGuard, authController.logout);

/**
 * @swagger
 * /auth/verify:
 *   get:
 *     summary: 토큰 검증 테스트
 *     description: 현재 토큰의 유효성을 확인하고 사용자 정보 반환 (개발/디버깅용)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 토큰 검증 성공
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
 *                       example: Token is valid
 *                     user:
 *                       type: object
 *                       properties:
 *                         uid:
 *                           type: string
 *                           example: abc123def456
 *                         email:
 *                           type: string
 *                           example: user@example.com
 *                         emailVerified:
 *                           type: boolean
 *                           example: true
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
 *                   example: 토큰이 만료되었습니다
 */
router.get("/verify", authGuard, authController.verifyToken);

module.exports = router;

