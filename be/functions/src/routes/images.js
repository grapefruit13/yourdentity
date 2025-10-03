const express = require("express");
const imageController = require("../controllers/imageController");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Images
 *   description: 이미지 관리 API
 */

/**
 * @swagger
 * /images/upload-image:
 *   post:
 *     summary: 이미지 업로드
 *     description: Base64 인코딩된 이미지를 업로드합니다
 *     tags: [Images]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 description: Base64 인코딩된 이미지 데이터
 *                 example: data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...
 *               name:
 *                 type: string
 *                 description: 이미지 이름
 *                 example: profile.jpg
 *                 default: upload
 *     responses:
 *       200:
 *         description: 이미지 업로드 성공
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
 *                         imageUrl:
 *                           type: string
 *                           example: https://i.ibb.co/abc123/image.jpg
 *                         deleteUrl:
 *                           type: string
 *                           example: https://ibb.co/delete/abc123
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
router.post("/upload-image", imageController.uploadImage);

/**
 * @swagger
 * /images/users/{userId}/profile-image:
 *   put:
 *     summary: 프로필 이미지 업데이트
 *     description: 사용자의 프로필 이미지를 업데이트합니다
 *     tags: [Images]
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
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 description: Base64 인코딩된 이미지 데이터
 *                 example: data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...
 *     responses:
 *       200:
 *         description: 프로필 이미지 업데이트 성공
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
 *                         userId:
 *                           type: string
 *                           example: abc123def456
 *                         profileImageUrl:
 *                           type: string
 *                           example: https://i.ibb.co/abc123/profile.jpg
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
router.put("/users/:userId/profile-image", imageController.updateProfileImage);

module.exports = router;
