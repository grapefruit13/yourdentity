const express = require("express");
const fileController = require("../controllers/fileController");
const authGuard = require("../middleware/authGuard");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Files
 *   description: 파일 관리 API
 */
/**
 * @swagger
 * /files/upload-multiple:
 *   post:
 *     summary: 여러 파일 업로드 (multipart/form-data)
 *     description: 업로드 대상 폴더는 자동으로 files 로 지정되며, 한 번에 최대 5개의 파일만 업로드됩니다.
 *     tags: [Files]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: 업로드할 파일들
 *     responses:
 *       201:
 *         description: 파일 업로드 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FileUploadResponse'
 *       400:
 *         description: 잘못된 요청
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
router.post(
    "/upload-multiple",
    authGuard,
    fileController.uploadMultipleFiles,
);

/**
 * @swagger
 * /files/{fileName}:
 *   delete:
 *     summary: 파일 삭제
 *     description: Cloud Storage에서 파일을 삭제합니다
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fileName
 *         required: true
 *         schema:
 *           type: string
 *         description: Cloud Storage 내 파일 경로
 *         example: "files/user123/document_abc123.pdf"
 *     responses:
 *       204:
 *         description: 파일 삭제 성공 (No Content)
 *       400:
 *         description: 잘못된 요청
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
router.delete("/:fileName", authGuard, fileController.deleteFile);


module.exports = router;