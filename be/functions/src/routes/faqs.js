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
 *     summary: FAQ 목록 조회 (Notion Database Query)
 *     tags: [FAQs]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: 프론트 파라미터명 category (노션 속성 '주제'로 매핑)
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         description: 페이지 크기 (기본 20)
 *       - in: query
 *         name: startCursor
 *         schema:
 *           type: string
 *         description: 페이지네이션 커서
 *     responses:
 *       200:
 *         description: Notion 원본 JSON
 */
router.get("/", faqController.getFaqList);

/**
 * @swagger
 * /faqs/{pageId}/blocks:
 *   get:
 *     summary: 특정 FAQ 페이지의 블록(children) 조회
 *     tags: [FAQs]
 *     parameters:
 *       - in: path
 *         name: pageId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         description: 페이지 크기 (기본 50, 최대 100)
 *       - in: query
 *         name: startCursor
 *         schema:
 *           type: string
 *         description: 페이지네이션 커서
 *     responses:
 *       200:
 *         description: Notion 원본 JSON
 */
router.get("/:pageId/blocks", faqController.getFaqPageBlocks);

module.exports = router;


