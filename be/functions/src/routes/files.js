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
 *     security:
 *       - bearerAuth: []
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
 *             examples:
 *               invalidContentType:
 *                 summary: 잘못된 Content-Type
 *                 value:
 *                   status: 400
 *                   message: "Content-Type은 multipart/form-data여야 합니다"
 *               noFiles:
 *                 summary: 업로드된 파일 없음
 *                 value:
 *                   status: 400
 *                   message: "업로드된 파일이 없습니다"
 *               invalidFileType:
 *                 summary: 허용되지 않은 파일 형식
 *                 value:
 *                   status: 400
 *                   message: "허용되지 않은 파일 형식입니다"
 *       401:
 *         description: 인증 필요
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: 401
 *               message: "인증이 필요합니다"

 *       423:
 *         description: 계정 자격정지
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AccountSuspendedResponse'
 *       403:
 *         description: 권한 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: 403
 *               message: "권한이 없습니다"
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: 500
 *               message: "서버 내부 오류가 발생했습니다"
 */
router.post(
    "/upload-multiple",
    authGuard,
    fileController.uploadMultipleFiles,
);

/**
 * @swagger
 * /files/{filePath}:
 *   delete:
 *     summary: 파일 삭제
 *     description: Cloud Storage에서 파일을 삭제합니다. 파일 경로에 슬래시(/)가 포함될 수 있습니다.
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filePath
 *         required: true
 *         schema:
 *           type: string
 *         description: Cloud Storage 내 파일 경로 (슬래시 포함 가능)
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
 *             examples:
 *               missingFilePath:
 *                 summary: 파일 경로 누락
 *                 value:
 *                   status: 400
 *                   message: "파일 경로가 필요합니다"
 *       401:
 *         description: 인증 필요
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: 401
 *               message: "인증이 필요합니다"

 *       423:
 *         description: 계정 자격정지
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AccountSuspendedResponse'
 *       403:
 *         description: 권한 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: 403
 *               message: "권한이 없습니다"
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: 500
 *               message: "서버 내부 오류가 발생했습니다"
 */
router.delete("/:filePath(*)", authGuard, fileController.deleteFile);


module.exports = router;