const express = require("express");
const missionController = require("../controllers/missionController");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Missions
 *   description: 미션 관리 API
 */

/**
 * @swagger
 * /users/{userId}/missions:
 *   post:
 *     summary: 미션 생성
 *     description: 사용자에게 새로운 미션을 할당합니다
 *     tags: [Missions]
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
 *               - missionId
 *             properties:
 *               missionId:
 *                 type: string
 *                 example: mission_001
 *               status:
 *                 type: string
 *                 enum: [ONGOING, COMPLETED, EXPIRED, RETRY]
 *                 default: ONGOING
 *                 example: ONGOING
 *     responses:
 *       200:
 *         description: 미션 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Mission'
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
router.post("/users/:userId/missions", missionController.createMission);

/**
 * @swagger
 * /users/{userId}/missions:
 *   get:
 *     summary: 사용자 미션 목록 조회
 *     description: 특정 사용자의 미션 목록을 조회합니다
 *     tags: [Missions]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: 사용자 ID
 *         example: abc123def456
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [ONGOING, COMPLETED, EXPIRED, RETRY]
 *         description: 미션 상태 필터
 *         example: ONGOING
 *     responses:
 *       200:
 *         description: 미션 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Mission'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/users/:userId/missions",
    missionController.getUserMissions);

/**
 * @swagger
 * /users/{userId}/missions/{missionId}:
 *   get:
 *     summary: 미션 상세 조회
 *     description: 특정 미션의 상세 정보를 조회합니다
 *     tags: [Missions]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: 사용자 ID
 *         example: abc123def456
 *       - in: path
 *         name: missionId
 *         required: true
 *         schema:
 *           type: string
 *         description: 미션 ID
 *         example: mission_001
 *     responses:
 *       200:
 *         description: 미션 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Mission'
 *       404:
 *         description: 미션을 찾을 수 없음
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
router.get("/users/:userId/missions/:missionId",
    missionController.getMissionById);

/**
 * @swagger
 * /users/{userId}/missions/{missionId}:
 *   put:
 *     summary: 미션 업데이트
 *     description: 미션의 상태나 정보를 업데이트합니다
 *     tags: [Missions]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: 사용자 ID
 *         example: abc123def456
 *       - in: path
 *         name: missionId
 *         required: true
 *         schema:
 *           type: string
 *         description: 미션 ID
 *         example: mission_001
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ONGOING, COMPLETED, EXPIRED, RETRY]
 *                 example: COMPLETED
 *               certified:
 *                 type: boolean
 *                 example: true
 *               review:
 *                 type: string
 *                 example: 미션이 유익했습니다.
 *     responses:
 *       200:
 *         description: 미션 업데이트 성공
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Mission'
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
router.put("/users/:userId/missions/:missionId",
    missionController.updateMission);

/**
 * @swagger
 * /users/{userId}/missions/{missionId}:
 *   delete:
 *     summary: 미션 삭제
 *     description: 특정 미션을 삭제합니다
 *     tags: [Missions]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: 사용자 ID
 *         example: abc123def456
 *       - in: path
 *         name: missionId
 *         required: true
 *         schema:
 *           type: string
 *         description: 미션 ID
 *         example: mission_001
 *     responses:
 *       200:
 *         description: 미션 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/users/:userId/missions/:missionId",
    missionController.deleteMission);

module.exports = router;
