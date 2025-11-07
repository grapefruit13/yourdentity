const express = require("express");
const notionUserController = require("../controllers/notionUserController");
const router = express.Router();

// 관리자 회원 동기화 라우트
/**
 * @swagger
 * /notionUsers/sync/active:
 *   get:
 *     summary: 회원 동기화
 *     description: |
 *       Firebase의 users 컬렉션에서 활동회원을 조회하여 Notion 데이터베이스와 동기화합니다.
 *       - Firebase의 lastUpdated 필드와 Notion의 마지막 업데이트 시간을 비교하여 동기화가 필요한 사용자만 처리
 *       - 동기화된 사용자 수를 반환
 *     tags: [NotionUsers]
 *     responses:
 *       200:
 *         description: 동기화 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: string
 *                   example: "회원 동기화 완료: 15명"
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "활동회원 동기화 중 오류가 발생했습니다."
 *                 error:
 *                   type: string
 *                   example: "TypeError: successResponse is not a function"
 */
router.get("/sync/active", notionUserController.syncUserAccounts);


/**
 * @swagger
 * /notionUsers/sync/full:
 *   get:
 *     summary: 회원 전체 재동기화
 *     description: |
 *       기존 Notion 사용자 데이터베이스를 모두 삭제하고,
 *       Firebase users 컬렉션의 전체 데이터를 다시 동기화합니다.
 *     tags: [NotionUsers]
 *     responses:
 *       200:
 *         description: 전체 동기화 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: string
 *                   example: "회원 전체 재동기화 완료: 150명"
 *       500:
 *         description: 서버 오류
 */
router.get("/sync/full", notionUserController.syncAllUserAccounts);


/**
 * @swagger
 * /notionUsers/sync/penalty:
 *   get:
 *     summary: 자격정지 회원 동기화
 *     description: |
 *       노션 DB에서 자격정지 적용이 체크된 회원만 조회하여 Firebase에 자격정지 정보를 반영하고,
 *       반영된 결과를 노션에도 동기화합니다.
 *     tags: [NotionUsers]
 *     responses:
 *       200:
 *         description: 동기화 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: string
 *                   example: "자격정지 회원 동기화 완료: 5명"
 *       500:
 *         description: 서버 오류
 */
router.get("/sync/penalty", notionUserController.syncPenaltyUsers);



/**
 * @swagger
 * /notionUsers/sync/selected:
 *   get:
 *     summary: 선택된 회원 동기화
 *     description: |
 *       노션 DB에서 "선택" 필드가 체크된 회원만 조회하여 Firebase users 컬렉션에 데이터를 업데이트합니다.
 *     tags: [NotionUsers]
 *     responses:
 *       200:
 *         description: 동기화 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: string
 *                   example: "선택된 회원 동기화 완료: 10명"
 *       500:
 *         description: 서버 오류
 */
router.get("/sync/selected", notionUserController.syncSelectedUsers);


/**
 * @swagger
 * /users/test/create:
 *   post:
 *     summary: 테스트 사용자 대량 생성
 *     description: |
 *       지정한 수만큼 테스트 사용자를 생성합니다.
 *       각 사용자는 `dev-user-{uuid}` 형식의 UID를 가집니다.
 *       Firebase Auth와 Firestore에 자동으로 생성되며, authTrigger가 자동으로 Firestore 문서를 생성합니다.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               count:
 *                 type: number
 *                 description: 생성할 사용자 수 (1~100)
 *                 example: 10
 *             required: [count]
 *     responses:
 *       200:
 *         description: 테스트 사용자 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: 10명의 테스트 사용자가 생성되었습니다
 *                     created:
 *                       type: number
 *                       example: 10
 *                     failed:
 *                       type: number
 *                       example: 0
 *                     users:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           uid:
 *                             type: string
 *                             example: dev-user-550e8400-e29b-41d4-a716-446655440000
 *                           email:
 *                             type: string
 *                             example: dev-user-550e8400-e29b-41d4-a716-446655440000@dev.example.com
 *                           displayName:
 *                             type: string
 *                             example: Dev User 550e8400-e29b-41d4-a716-446655440000
 *       400:
 *         description: 잘못된 요청 (count가 1~100 범위 밖)
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
router.post("/test/create", notionUserController.createTestUsers);


/**
 * @swagger
 * /notionUsers/sync/allUsersBackup:
 *   get:
 *     summary: 백업 DB에서 전체 회원 복원
 *     description: |
 *       백업 노션 DB(notionUserAccountBackupDB)의 모든 데이터를 조회하여 
 *       Firebase users 컬렉션에 데이터를 복원(업데이트)합니다.
 *       백업 시점의 전체 데이터로 Firebase를 복원하는 용도로 사용됩니다.
 *       - 백업 DB의 모든 페이지를 조회하여 Firebase에 업데이트
 *       - Firebase에 존재하지 않는 사용자는 건너뜀
 *     tags: [NotionUsers]
 *     responses:
 *       200:
 *         description: 복원 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: string
 *                   example: "백업 DB에서 전체 회원 복원 완료: 150명 업데이트, Firebase에 존재하지 않는 회원 건너뜀: 5명, 잘못된 값: 0명"
 *       500:
 *         description: 서버 오류
 */
router.get("/sync/allUsersBackup", notionUserController.syncAllUsersBackup);

module.exports = router;
