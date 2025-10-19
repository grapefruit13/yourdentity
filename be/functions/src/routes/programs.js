const express = require('express');
const router = express.Router();
const programController = require('../controllers/programController');


/**
 * @swagger
 * /api/programs:
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
 * /api/programs/search:
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
 * /api/programs/{programId}:
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

module.exports = router;
