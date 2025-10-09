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
 *     summary: 이미지 업로드 (multipart/form-data)
 *     description: multipart/form-data 형식으로 이미지 파일을 업로드합니다
 *     tags: [Images]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: 업로드할 이미지 파일 (JPEG, PNG, GIF, WebP 지원, 최대 10MB)
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
 *                         displayUrl:
 *                           type: string
 *                           example: https://i.ibb.co/abc123/image.jpg
 *                         deleteUrl:
 *                           type: string
 *                           example: https://ibb.co/delete/abc123
 *                         size:
 *                           type: number
 *                           example: 1024000
 *                         title:
 *                           type: string
 *                           example: image.jpg
 *                         fileName:
 *                           type: string
 *                           example: image.jpg
 *                         mimeType:
 *                           type: string
 *                           example: image/jpeg
 *                         width:
 *                           type: number
 *                           description: 이미지 가로 크기 (픽셀)
 *                           example: 1920
 *                         height:
 *                           type: number
 *                           description: 이미지 세로 크기 (픽셀)
 *                           example: 1080
 *       400:
 *         description: 잘못된 요청 (파일 없음, 크기 초과, 지원하지 않는 형식)
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
