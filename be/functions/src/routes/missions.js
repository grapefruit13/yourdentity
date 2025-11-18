const express = require("express");
const router = express.Router();
const missionController = require("../controllers/missionController");
const optionalAuth = require("../middleware/optionalAuth");
const authGuard = require("../middleware/authGuard");

/**
 * @swagger
 * tags:
 *   name: Missions
 *   description: 미션 관리 API
 */

/**
 * @swagger
 * /missions/categories:
 *   get:
 *     summary: 미션 카테고리 목록 조회
 *     tags: [Missions]
 *     description: 노션 DB에 정의된 모든 미션 카테고리를 조회합니다.
 *     responses:
 *       200:
 *         description: 카테고리 목록 조회 성공
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
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["자기 탐색", "자기 만족", "자기 계발", "바깥 활동", "관계 형성"]
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.get("/categories", missionController.getCategories);

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
 *                     missions:
 *                       type: array
 *                       items:
 *                         $ref: "#/components/schemas/Mission"
 *                     totalCount:
 *                       type: integer
 *                       example: 30
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
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
 *                     mission:
 *                       $ref: "#/components/schemas/Mission"
 *       404:
 *         description: 미션을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.get("/:missionId", optionalAuth, missionController.getMissionById);

/**
 * @swagger
 * /missions/{missionId}/apply:
 *   post:
 *     summary: 미션 신청
 *     description: 주어진 미션 ID로 사용자가 미션을 신청합니다. (동일 미션은 하루 한 번만 신청 가능)
 *     tags: [Missions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: missionId
 *         required: true
 *         schema:
 *           type: string
 *         description: 미션 ID (Notion 페이지 ID)
 *     responses:
 *       201:
 *         description: 미션 신청 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 201
 *                 data:
 *                   type: object
 *                   properties:
 *                     missionId:
 *                       type: string
 *                       example: "2a645f52-4cd0-80ea-9d7f-fe3ca69df522"
 *                     status:
 *                       type: string
 *                       example: "IN_PROGRESS"
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       401:
 *         description: 인증 필요
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       409:
 *         description: 신청 제한 초과 혹은 중복 신청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.post("/:missionId/apply", authGuard, missionController.applyMission);

module.exports = router;


