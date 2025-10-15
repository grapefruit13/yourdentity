const express = require("express");
const router = express.Router();
const fcmController = require("../controllers/fcmController");
const authGuard = require("../middleware/authGuard");

/**
 * @swagger
 * /fcm/token:
 *   post:
 *     summary: FCM 토큰 저장/업데이트
 *     description: 사용자의 FCM 토큰을 저장하거나 업데이트합니다. 중복 토큰은 업데이트되고, 최대 5개까지 저장 가능합니다.
 *     tags: [FCM]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FCMToken'
 *           example:
 *             userId: "user_123"
 *             token: "fcm_token_example_123456789"
 *             deviceInfo: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
 *             deviceType: "pwa"
 *     responses:
 *       200:
 *         description: 토큰 저장/업데이트 성공
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/StandardResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/FCMTokenResponse'
 *       400:
 *         description: 잘못된 요청 (필수 필드 누락)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/token", authGuard, fcmController.saveToken.bind(fcmController));

/**
 * @swagger
 * /fcm/tokens/{userId}:
 *   get:
 *     summary: 사용자 FCM 토큰 목록 조회
 *     description: 특정 사용자의 모든 FCM 토큰 목록을 조회합니다.
 *     tags: [FCM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: 사용자 ID
 *         example: "user_123"
 *     responses:
 *       200:
 *         description: 토큰 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/StandardResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/FCMTokenListResponse'
 *       400:
 *         description: 잘못된 요청 (사용자 ID 누락)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/tokens/:userId", authGuard, fcmController.getUserTokens.bind(fcmController));

/**
 * @swagger
 * /fcm/token/{userId}/{deviceId}:
 *   delete:
 *     summary: FCM 토큰 삭제
 *     description: 특정 사용자의 특정 디바이스 FCM 토큰을 삭제합니다.
 *     tags: [FCM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: 사용자 ID
 *         example: "user_123"
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
 *         description: 디바이스 ID
 *         example: "device_abc123"
 *     responses:
 *       200:
 *         description: 토큰 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/StandardResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/FCMDeleteResponse'
 *       400:
 *         description: 잘못된 요청 (사용자 ID 또는 디바이스 ID 누락)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete("/token/:userId/:deviceId", authGuard, fcmController.deleteToken.bind(fcmController));


module.exports = router;
