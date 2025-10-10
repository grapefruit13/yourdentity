const express = require("express");
const faqController = require("../controllers/faqController");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: FAQs
 *   description: FAQ (Notion) 프록시 API
 */

/**
 * @swagger
 * /faqs:
 *   get:
 *     summary: FAQ 목록 조회
 *     description: 노션 데이터베이스에서 FAQ 목록을 조회합니다. 카테고리별 필터링과 페이지네이션을 지원합니다.
 *     tags: [FAQs]
 *     parameters:
 *       - in: query
 *         name: category
 *         description: "FAQ 카테고리 (노션 속성 '주제'로 매핑)"
 *         schema:
 *           type: string
 *           example: "공통"
 *       - in: query
 *         name: pageSize
 *         description: "페이지 크기 (기본값: 20, 최대: 100)"
 *         schema:
 *           type: integer
 *           default: 20
 *           minimum: 1
 *           maximum: 100
 *       - in: query
 *         name: startCursor
 *         description: "페이지네이션 커서 (이전 응답의 start_cursor 값 사용)"
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: FAQ 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     object:
 *                       type: string
 *                       example: "list"
 *                     results:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "abc123def456"
 *                           properties:
 *                             type: object
 *                             properties:
 *                               주제:
 *                                 type: object
 *                                 properties:
 *                                   multi_select:
 *                                     type: array
 *                                     items:
 *                                       type: object
 *                                       properties:
 *                                         name:
 *                                           type: string
 *                                           example: "공통"
 *                               제목:
 *                                 type: object
 *                                 properties:
 *                                   title:
 *                                     type: array
 *                                     items:
 *                                       type: object
 *                                       properties:
 *                                         plain_text:
 *                                           type: string
 *                                           example: "FAQ 제목"
 *                     next_cursor:
 *                       type: string
 *                       nullable: true
 *                       example: "cursor123"
 *                     has_more:
 *                       type: boolean
 *                       example: false
 *             example:
 *               status: 200
 *               data:
 *                 object: "list"
 *                 results:
 *                   - id: "abc123def456"
 *                     properties:
 *                       주제:
 *                         multi_select:
 *                           - name: "공통"
 *                       제목:
 *                         title:
 *                           - plain_text: "자주 묻는 질문"
 *                 next_cursor: null
 *                 has_more: false
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: "잘못된 페이지 크기입니다"
 *       500:
 *         description: 서버 내부 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "노션 FAQ 목록 조회 실패"
 */
router.get("/", faqController.getFaqList);

/**
 * @swagger
 * /faqs/{pageId}/blocks:
 *   get:
 *     summary: FAQ 페이지 블록 조회
 *     description: 특정 FAQ 페이지의 상세 내용(블록)을 조회합니다. 페이지네이션을 지원합니다.
 *     tags: [FAQs]
 *     parameters:
 *       - in: path
 *         name: pageId
 *         required: true
 *         description: "FAQ 페이지 ID"
 *         schema:
 *           type: string
 *           example: "abc123def456"
 *       - in: query
 *         name: pageSize
 *         description: "페이지 크기 (기본값: 50, 최대: 100)"
 *         schema:
 *           type: integer
 *           default: 50
 *           minimum: 1
 *           maximum: 100
 *       - in: query
 *         name: startCursor
 *         description: "페이지네이션 커서 (이전 응답의 start_cursor 값 사용)"
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: FAQ 페이지 블록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     object:
 *                       type: string
 *                       example: "list"
 *                     results:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "block123"
 *                           type:
 *                             type: string
 *                             example: "paragraph"
 *                           paragraph:
 *                             type: object
 *                             properties:
 *                               rich_text:
 *                                 type: array
 *                                 items:
 *                                   type: object
 *                                   properties:
 *                                     plain_text:
 *                                       type: string
 *                                       example: "FAQ 내용입니다"
 *                     next_cursor:
 *                       type: string
 *                       nullable: true
 *                       example: "cursor123"
 *                     has_more:
 *                       type: boolean
 *                       example: false
 *             example:
 *               status: 200
 *               data:
 *                 object: "list"
 *                 results:
 *                   - id: "block123"
 *                     type: "paragraph"
 *                     paragraph:
 *                       rich_text:
 *                         - plain_text: "FAQ 내용입니다"
 *                 next_cursor: null
 *                 has_more: false
 *       400:
 *         description: 잘못된 요청 (페이지 ID 누락)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: "페이지 ID가 필요합니다"
 *       404:
 *         description: 페이지를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: "페이지를 찾을 수 없습니다"
 *       500:
 *         description: 서버 내부 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "노션 블록 조회 실패"
 */
router.get("/:pageId/blocks", faqController.getFaqPageBlocks);

module.exports = router;


