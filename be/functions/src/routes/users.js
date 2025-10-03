const express = require("express");
const userController = require("../controllers/userController");
const authGuard = require("../middleware/authGuard");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: 사용자 관리 API
 */

/**
 * @swagger
 * /users/provision:
 *   post:
 *     summary: 사용자 프로비저닝
 *     description: Auth Trigger로 생성된 사용자 문서를 업데이트
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               displayName:
 *                 type: string
 *                 example: 홍길동
 *               photoURL:
 *                 type: string
 *                 example: https://example.com/photo.jpg
 *               providerId:
 *                 type: string
 *                 example: oidc.kakao
 *               birthYear:
 *                 type: number
 *                 example: 1990
 *     responses:
 *       200:
 *         description: 프로비저닝 성공
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/provision", authGuard, userController.provisionUser);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: 사용자 생성
 *     description: 새로운 사용자를 생성합니다
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: 홍길동
 *               email:
 *                 type: string
 *                 format: email
 *                 example: hong@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *               profileImageUrl:
 *                 type: string
 *                 example: https://example.com/profile.jpg
 *               birthYear:
 *                 type: number
 *                 example: 1990
 *               authType:
 *                 type: string
 *                 enum: [email, sns]
 *                 default: email
 *                 example: email
 *               snsProvider:
 *                 type: string
 *                 enum: [kakao, google]
 *                 example: null
 *     responses:
 *       200:
 *         description: 사용자 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/", userController.createUser);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: 모든 사용자 조회
 *     description: 시스템의 모든 사용자 목록을 조회합니다
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: 사용자 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", userController.getAllUsers);

/**
 * @swagger
 * /users/{userId}:
 *   get:
 *     summary: 사용자 상세 조회
 *     description: 특정 사용자의 상세 정보를 조회합니다
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: 사용자 ID
 *         example: abc123def456
 *     responses:
 *       200:
 *         description: 사용자 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       404:
 *         description: 사용자를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:userId", userController.getUserById);

/**
 * @swagger
 * /users/{userId}:
 *   put:
 *     summary: 사용자 정보 수정
 *     description: 사용자의 닉네임이나 프로필 이미지를 수정합니다
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: 사용자 ID
 *         example: abc123def456
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nickname:
 *                 type: string
 *                 example: 새로운닉네임
 *               profileImageUrl:
 *                 type: string
 *                 example: https://example.com/new-profile.jpg
 *     responses:
 *       200:
 *         description: 사용자 정보 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put("/:userId", userController.updateUser);
router.delete("/:userId", userController.deleteUser);

module.exports = router;
