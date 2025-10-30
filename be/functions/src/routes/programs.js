const express = require('express');
const router = express.Router();
const programController = require('../controllers/programController');


/**
 * @swagger
 * /programs:
 *   get:
 *     summary: 프로그램 목록 조회
 *     description: 모집상태 및 프로그램진행여부로 필터링된 프로그램 목록을 조회합니다.
 *     tags: [Programs]
 *     parameters:
 *       - in: query
 *         name: recruitmentStatus
 *         schema:
 *           type: string
 *           enum: [before, ongoing, completed, cancelled]
 *         description: 모집상태 필터 (before=모집 전, ongoing=모집 중, completed=모집 완료, cancelled=모집 취소)
 *       - in: query
 *         name: programStatus
 *         schema:
 *           type: string
 *           enum: [before, ongoing, completed, cancelled]
 *         description: 프로그램진행여부 필터 (before=진행 전, ongoing=진행 중, completed=종료됨, cancelled=진행 취소됨)
 *       - in: query
 *         name: programType
 *         schema:
 *           type: string
 *           enum: [ROUTINE, TMI, GATHERING]
 *         description: 프로그램 종류 필터
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: 페이지 크기
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *         description: 페이지네이션 커서
 *     responses:
 *       200:
 *         description: 프로그램 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProgramListResponse'
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
router.get('/', programController.getPrograms);

/**
 * @swagger
 * /programs/search:
 *   get:
 *     summary: 프로그램 검색
 *     description: 제목, 설명을 기반으로 프로그램을 검색합니다.
 *     tags: [Programs]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: 검색어
 *       - in: query
 *         name: recruitmentStatus
 *         schema:
 *           type: string
 *           enum: [before, ongoing, completed, cancelled]
 *         description: 모집상태 필터 (before=모집 전, ongoing=모집 중, completed=모집 완료, cancelled=모집 취소)
 *       - in: query
 *         name: programStatus
 *         schema:
 *           type: string
 *           enum: [before, ongoing, completed, cancelled]
 *         description: 프로그램진행여부 필터 (before=진행 전, ongoing=진행 중, completed=종료됨, cancelled=진행 취소됨)
 *       - in: query
 *         name: programType
 *         schema:
 *           type: string
 *           enum: [ROUTINE, TMI, GATHERING]
 *         description: 프로그램 종류 필터
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: 페이지 크기
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *         description: 페이지네이션 커서
 *     responses:
 *       200:
 *         description: 검색 결과 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProgramSearchResponse'
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
router.get('/search', programController.searchPrograms);


/**
 * @swagger
 * /programs/{programId}:
 *   get:
 *     summary: 프로그램 상세 조회
 *     description: 특정 프로그램의 상세 정보를 조회합니다.
 *     tags: [Programs]
 *     parameters:
 *       - in: path
 *         name: programId
 *         required: true
 *         schema:
 *           type: string
 *         description: 프로그램 ID
 *     responses:
 *       200:
 *         description: 프로그램 상세 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProgramDetailResponse'
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 프로그램을 찾을 수 없음
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
router.get('/:programId', programController.getProgramById);

/**
 * @swagger
 * components:
 *   schemas:
 *     ProgramApplicationRequest:
 *       type: object
 *       required:
 *         - applicantId
 *         - nickname
 *       properties:
 *         applicantId:
 *           type: string
 *           description: 신청자 ID
 *           example: "user_123456"
 *         nickname:
 *           type: string
 *           minLength: 1
 *           maxLength: 50
 *           description: 참여용 닉네임
 *           example: "홍길동"
 *     
 *     ProgramApplicationResponse:
 *       type: object
 *       properties:
 *         applicationId:
 *           type: string
 *           description: 신청 ID
 *           example: "app_123456"
 *         programId:
 *           type: string
 *           description: 프로그램 ID
 *           example: "program_123"
 *         applicantId:
 *           type: string
 *           description: 신청자 ID
 *           example: "user_123456"
 *         nickname:
 *           type: string
 *           description: 참여용 닉네임
 *           example: "홍길동"
 *         appliedAt:
 *           type: string
 *           format: date-time
 *           description: 신청일시
 *           example: "2024-01-01T00:00:00.000Z"
 *         notionPageId:
 *           type: string
 *           description: Notion 페이지 ID
 *           example: "notion_page_123"
 *     
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "오류 메시지"
 *         code:
 *           type: string
 *           example: "ERROR_CODE"
 *         statusCode:
 *           type: integer
 *           example: 400
 */

/**
 * @swagger
 * /programs/{programId}/apply:
 *   post:
 *     summary: 프로그램 신청
 *     description: 특정 프로그램에 신청합니다.
 *     tags: [Programs]
 *     parameters:
 *       - in: path
 *         name: programId
 *         required: true
 *         schema:
 *           type: string
 *         description: 프로그램 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProgramApplicationRequest'
 *     responses:
 *       201:
 *         description: 프로그램 신청 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "프로그램 신청이 완료되었습니다."
 *                 data:
 *                   $ref: '#/components/schemas/ProgramApplicationResponse'
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: 중복 신청
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: 중복 신청 유형에 따른 메시지
 *                   examples:
 *                     SAME_NICKNAME_SAME_PERSON:
 *                       value: "이미 신청한 프로그램입니다."
 *                     NICKNAME_ALREADY_TAKEN:
 *                       value: "중복된 닉네임입니다."
 *                     SAME_EMAIL:
 *                       value: "이미 이 프로그램에 신청하셨습니다. (이메일 중복)"
 *                     SAME_PHONE:
 *                       value: "이미 이 프로그램에 신청하셨습니다. (전화번호 중복)"
 *                 code:
 *                   type: string
 *                   example: "DUPLICATE_APPLICATION"
 *                 statusCode:
 *                   type: integer
 *                   example: 409
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/:programId/apply', programController.applyToProgram);

/**
 * @swagger
 * /programs/{programId}/applications/{applicationId}/approve:
 *   get:
 *     summary: 프로그램 신청 승인
 *     description: 특정 프로그램 신청을 승인합니다. (Notion에서 링크로 호출)
 *     tags: [Programs]
 *     parameters:
 *       - in: path
 *         name: programId
 *         required: true
 *         schema:
 *           type: string
 *         description: 프로그램 ID
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *         description: 신청 ID (Firestore member ID)
 *     responses:
 *       200:
 *         description: 신청 승인 성공
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: "<html><body><h1>신청이 승인되었습니다!</h1><p>이 페이지를 닫아도 됩니다.</p></body></html>"
 *       404:
 *         description: 신청을 찾을 수 없음
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: "<html><body><h1>오류: 신청을 찾을 수 없습니다.</h1></body></html>"
 *       500:
 *         description: 서버 오류
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: "<html><body><h1>서버 오류가 발생했습니다.</h1></body></html>"
 */
router.get('/:programId/applications/:applicationId/approve', programController.approveApplication);

/**
 * @swagger
 * /programs/{programId}/applications/{applicationId}/reject:
 *   get:
 *     summary: 프로그램 신청 거부
 *     description: 특정 프로그램 신청을 거부합니다. (Notion에서 링크로 호출)
 *     tags: [Programs]
 *     parameters:
 *       - in: path
 *         name: programId
 *         required: true
 *         schema:
 *           type: string
 *         description: 프로그램 ID
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *         description: 신청 ID (Firestore member ID)
 *     responses:
 *       200:
 *         description: 신청 거부 성공
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: "<html><body><h1>신청이 거부되었습니다!</h1><p>이 페이지를 닫아도 됩니다.</p></body></html>"
 *       404:
 *         description: 신청을 찾을 수 없음
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: "<html><body><h1>오류: 신청을 찾을 수 없습니다.</h1></body></html>"
 *       500:
 *         description: 서버 오류
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: "<html><body><h1>서버 오류가 발생했습니다.</h1></body></html>"
 */
router.get('/:programId/applications/:applicationId/reject', programController.rejectApplication);

module.exports = router;
