const express = require("express");
const userController = require("../controllers/userController");
const authGuard = require("../middleware/authGuard");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: 사용자 관리 API
 */

/**
 * @swagger
 * /users/provision:
 *   post:
 *     summary: 사용자 프로비저닝 (개발/테스트용)
 *     description: |
 *       ⚠️ **개발/테스트용 API**
 *       
 *       Auth Trigger로 생성된 사용자 문서를 수동으로 업데이트할 때 사용
 *       
 *       **실제 프로덕션 플로우:**
 *       1. FE에서 회원가입 (Firebase Client SDK)
 *       2. authTrigger 자동 실행 → Firestore 문서 생성
 *       3. 온보딩 API로 추가 정보 입력
 *       
 *       **이 API 사용 시나리오 (개발/테스트만):**
 *       - authTrigger 실패 시 수동 복구
 *       - 테스트 데이터 수정
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               name:
 *                 type: string
 *                 example: 홍길동
 *               profileImageUrl:
 *                 type: string
 *                 example: https://example.com/photo.jpg
 *               birthYear:
 *                 type: number
 *                 example: 1990
 *               authType:
 *                 type: string
 *                 enum: [email, sns]
 *                 example: sns
 *               snsProvider:
 *                 type: string
 *                 enum: [kakao, google]
 *                 example: kakao
 *     responses:
 *       200:
 *         description: 프로비저닝 성공
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/StandardResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *       401:
 *         description: 인증 실패
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
router.post("/provision", authGuard, userController.provisionUser);

/**
 * @swagger
 * /users/me/onboarding:
 *   patch:
 *     summary: 온보딩 정보 업데이트 (본인)
 *     description: 이름/닉네임/출생년도/생년월일/전화번호 등 온보딩 정보를 업데이트합니다.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               nickname:
 *                 type: string
 *               birthYear:
 *                 type: number
 *               birthDate:
 *                 type: string
 *                 example: 2000-01-31
 *               phoneNumber:
 *                 type: string
 *             example:
 *               name: 홍길동
 *               nickname: gildong
 *               birthYear: 1998
 *               birthDate: 1998-01-02
 *               phoneNumber: 010-1234-5678
 *     responses:
 *       200:
 *         description: 온보딩 업데이트 성공
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
 *                     onboardingCompleted:
 *                       type: boolean
 *                       example: true
 *                 message:
 *                   type: string
 *                   example: ONBOARDING_UPDATED
 *       400:
 *         description: 잘못된 입력 (필드 형식 오류/필수값 누락)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: 닉네임 중복 등 충돌(NICKNAME_TAKEN)
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
router.patch("/me/onboarding", authGuard, userController.updateOnboarding);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: 사용자 생성 (테스트용 - Admin SDK)
 *     description: |
 *       ⚠️ **테스트용 API** - Firebase Admin SDK 방식
 *       
 *       **프로덕션에서는 사용하지 마세요!**
 *       - 실제 회원가입: 프론트엔드에서 Firebase Client SDK 사용
 *       - `createUserWithEmailAndPassword(auth, email, password)`
 *       - Auth Trigger가 자동으로 Firestore 문서 생성
 *       
 *       이 API는 백엔드 테스트 및 개발용으로만 사용됩니다.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: 홍길동
 *               email:
 *                 type: string
 *                 format: email
 *                 example: hong@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *               profileImageUrl:
 *                 type: string
 *                 example: https://example.com/profile.jpg
 *               birthYear:
 *                 type: number
 *                 example: 1990
 *               authType:
 *                 type: string
 *                 enum: [email, sns]
 *                 default: email
 *                 example: email
 *               snsProvider:
 *                 type: string
 *                 enum: [kakao, google]
 *                 example: null
 *     responses:
 *       200:
 *         description: 사용자 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/StandardResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
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
router.post("/", userController.createUser);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: 모든 사용자 조회
 *     description: 시스템의 모든 사용자 목록을 조회합니다
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: 사용자 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/StandardResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         users:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/User'
 *                         count:
 *                           type: number
 *                           example: 1
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/", userController.getAllUsers);

/**
 * @swagger
 * /users/{userId}:
 *   get:
 *     summary: 사용자 상세 조회
 *     description: 특정 사용자의 상세 정보를 조회합니다
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: 사용자 ID
 *         example: abc123def456
 *     responses:
 *       200:
 *         description: 사용자 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/StandardResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       404:
 *         description: 사용자를 찾을 수 없음
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
router.get("/:userId", userController.getUserById);

/**
 * @swagger
 * /users/{userId}:
 *   put:
 *     summary: 사용자 정보 수정 (관리자용)
 *     description: |
 *       사용자의 다양한 정보를 수정합니다
 *       
 *       ⚠️ **주의:**
 *       - nickname은 authTrigger에 없음 (온보딩 브랜치에서 추가됨)
 *       - 현재 브랜치에서는 name, profileImageUrl 등만 수정 가능
 *     tags: [Users]
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
 *             properties:
 *               name:
 *                 type: string
 *                 example: 홍길동
 *               profileImageUrl:
 *                 type: string
 *                 example: https://example.com/new-profile.jpg
 *               birthYear:
 *                 type: number
 *                 example: 1990
 *               rewardPoints:
 *                 type: number
 *                 example: 1000
 *               level:
 *                 type: number
 *                 example: 5
 *               badges:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["first_mission", "early_bird"]
 *               points:
 *                 type: string
 *                 example: "1500"
 *               mainProfileId:
 *                 type: string
 *                 example: profile_abc123
 *               onBoardingComplete:
 *                 type: boolean
 *                 example: true
 *               uploadQuotaBytes:
 *                 type: number
 *                 example: 1073741824
 *               usedStorageBytes:
 *                 type: number
 *                 example: 52428800
 *     responses:
 *       200:
 *         description: 사용자 정보 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/StandardResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
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
router.put("/:userId", userController.updateUser);

/**
 * @swagger
 * /users/{userId}:
 *   delete:
 *     summary: 사용자 삭제
 *     description: 특정 사용자를 삭제합니다 (Firebase Auth + Firestore)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: 사용자 ID
 *         example: abc123def456
 *     responses:
 *       200:
 *         description: 사용자 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/StandardResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: 사용자가 성공적으로 삭제되었습니다
 *                     data:
 *                       type: object
 *                       properties:
 *                         userId:
 *                           type: string
 *                           example: abc123def456
 *       404:
 *         description: 사용자를 찾을 수 없음
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
router.delete("/:userId", userController.deleteUser);

module.exports = router;

