const express = require("express");
const router = express.Router();
const missionController = require("../controllers/missionController");
const optionalAuth = require("../middleware/optionalAuth");

/**
 * @swagger
 * tags:
 *   name: Missions
 *   description: 미션 관리 API
 */

/**
 * @swagger
 * /missions:
 *   get:
 *     summary: 미션 목록 조회 (MVP)
 *     tags: [Missions]
 *     description: |
 *       전체 미션 목록을 조회합니다. (약 30~100개, 페이지네이션 없음)
 *       
 *       정렬:
 *       - latest: 최신순 (기본값)
 *       - popular: 인기순 (반응 수 많은 순)
 *       
 *       필터:
 *       - category: 카테고리 칩 (예: 자기 탐색, 자기 만족 등)
 *       - excludeParticipated: 참여한 미션 제외 (로그인 필요)
 *     parameters:
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [latest, popular]
 *           default: latest
 *         description: 정렬 기준
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: 카테고리 필터
 *       - in: query
 *         name: excludeParticipated
 *         schema:
 *           type: boolean
 *         description: 참여한 미션 제외 (로그인 필요)
 *     responses:
 *       200:
 *         description: 미션 목록 조회 성공
 */
router.get("/", optionalAuth, missionController.getMissions);

/**
 * @swagger
 * /missions/{missionId}:
 *   get:
 *     summary: 미션 상세 조회
 *     tags: [Missions]
 *     parameters:
 *       - in: path
 *         name: missionId
 *         required: true
 *         schema:
 *           type: string
 *         description: 미션 ID (Notion 페이지 ID)
 *     responses:
 *       200:
 *         description: 미션 상세 조회 성공
 *       404:
 *         description: 미션을 찾을 수 없음
 */
router.get("/:missionId", optionalAuth, missionController.getMissionById);

module.exports = router;


