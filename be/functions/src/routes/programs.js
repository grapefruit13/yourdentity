const express = require('express');
const router = express.Router();
const programController = require('../controllers/programController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Program:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: 프로그램 ID
 *         title:
 *           type: string
 *           description: 프로그램 제목
 *         programName:
 *           type: string
 *           description: 프로그램명
 *         description:
 *           type: string
 *           description: 프로그램 소개글
 *         recruitmentStatus:
 *           type: string
 *           enum: [모집 전, 모집 중, 모집 완료, 모집 취소]
 *           description: 모집상태
 *         programStatus:
 *           type: string
 *           enum: [진행 전, 진행 중, 종료됨, 진행 취소됨]
 *           description: 프로그램 진행여부
 *         startDate:
 *           type: string
 *           format: date
 *           description: 활동 시작 날짜
 *         endDate:
 *           type: string
 *           format: date
 *           description: 활동 종료 날짜
 *         recruitmentStartDate:
 *           type: string
 *           format: date
 *           description: 모집 시작 날짜
 *         recruitmentEndDate:
 *           type: string
 *           format: date
 *           description: 모집 종료 날짜
 *         targetAudience:
 *           type: string
 *           description: 참여 대상
 *         thumbnail:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               url:
 *                 type: string
 *               type:
 *                 type: string
 *           description: 썸네일
 *         linkUrl:
 *           type: string
 *           description: 바로 보러 가기 URL
 *         isReviewRegistered:
 *           type: boolean
 *           description: 프로그램 후기 등록 여부
 *         isBannerRegistered:
 *           type: boolean
 *           description: 하단 배너 등록 여부
 *         participants:
 *           type: array
 *           items:
 *             type: string
 *           description: 참여자 별명
 *         notes:
 *           type: string
 *           description: 참고 사항
 *         userIds:
 *           type: string
 *           description: 사용자ID
 *         faqRelation:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *           description: FAQ 관계
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 최근 수정 날짜
 *         notionPageTitle:
 *           type: string
 *           description: 상세페이지(노션) 제목
 *     
 *     FaqItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: FAQ ID
 *         title:
 *           type: string
 *           description: FAQ 제목
 *         category:
 *           type: array
 *           items:
 *             type: string
 *           description: FAQ 카테고리
 *         content:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *               id:
 *                 type: string
 *               text:
 *                 type: string
 *           description: FAQ 내용 (블록 형태)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 생성일시
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 수정일시
 *     
 *     PageContent:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           description: 블록 타입
 *         id:
 *           type: string
 *           description: 블록 ID
 *         text:
 *           type: string
 *           description: 텍스트 내용
 *         richText:
 *           type: array
 *           items:
 *             type: object
 *           description: Rich Text 형태의 내용
 *         hasChildren:
 *           type: boolean
 *           description: 하위 블록 존재 여부
 *         checked:
 *           type: boolean
 *           description: 체크박스 상태 (to_do 타입)
 *         icon:
 *           type: object
 *           description: 아이콘 정보 (callout 타입)
 *         url:
 *           type: string
 *           description: 미디어 URL (image, video, file 타입)
 *         caption:
 *           type: string
 *           description: 캡션 (미디어 타입)
 *     
 *     ProgramDetail:
 *       allOf:
 *         - $ref: '#/components/schemas/Program'
 *         - type: object
 *           properties:
 *             pageContent:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PageContent'
 *               description: 프로그램 페이지 상세 내용
 *             faqList:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FaqItem'
 *               description: 관련 FAQ 목록
 */

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
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     programs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Program'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         hasMore:
 *                           type: boolean
 *                         nextCursor:
 *                           type: string
 *                         totalCount:
 *                           type: number
 *       400:
 *         description: 잘못된 요청
 *       500:
 *         description: 서버 오류
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
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     programs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Program'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         hasMore:
 *                           type: boolean
 *                         nextCursor:
 *                           type: string
 *                         totalCount:
 *                           type: number
 *                     searchTerm:
 *                       type: string
 *       400:
 *         description: 잘못된 요청
 *       500:
 *         description: 서버 오류
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
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     program:
 *                       $ref: '#/components/schemas/ProgramDetail'
 *       404:
 *         description: 프로그램을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.get('/:programId', programController.getProgramById);

module.exports = router;
