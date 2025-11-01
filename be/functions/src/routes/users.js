const express = require("express");
const userController = require("../controllers/userController");
const authGuard = require("../middleware/authGuard");

const router = express.Router();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: Firebase ID Token
 *   schemas:
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: number
 *           example: 400
 *         message:
 *           type: string
 *           example: 잘못된 요청입니다
 *         code:
 *           type: string
 *           example: BAD_REQUEST
 *     StandardResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: number
 *           example: 200
 *         data:
 *           type: object
 *     User:
 *       type: object
 *       properties:
 *         uid:
 *           type: string
 *           example: abc123def456
 *         email:
 *           type: string
 *           example: user@example.com
 *         name:
 *           type: string
 *           example: 홍길동
 *         nickname:
 *           type: string
 *           example: gildong
 *         authType:
 *           type: string
 *           example: kakao
 *         snsProvider:
 *           type: string
 *           example: kakao
 *         phoneNumber:
 *           type: string
 *           example: 01012345678
 *         gender:
 *           type: string
 *           example: male
 *         birthDate:
 *           type: string
 *           example: 1990-01-01
 *         status:
 *           type: string
 *           enum: [pending, active, suspended]
 *           example: active
 *         serviceTermsVersion:
 *           type: string
 *           example: "v1"
 *         privacyTermsVersion:
 *           type: string
 *           example: "v1"
 *         age14TermsAgreed:
 *           type: boolean
 *           example: true
 *         pushTermsAgreed:
 *           type: boolean
 *           example: false
 *         termsAgreedAt:
 *           type: string
 *           format: date-time
 *           example: 2024-01-01T00:00:00Z
 *         profileImageUrl:
 *           type: string
 *           example: https://example.com/profile.jpg
 *         bio:
 *           type: string
 *           example: 안녕하세요!
 *         lastLogin:
 *           type: string
 *           format: date-time
 *           example: 2024-01-01T00:00:00Z
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2024-01-01T00:00:00Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: 2024-01-01T00:00:00Z
 * 
 * @swagger
 * tags:
 *   name: Users
 *   description: 사용자 관리 API
 */

/**
 * @swagger
 * /users/me/onboarding:
 *   patch:
 *     summary: 온보딩 정보 업데이트
 *     description: |
 *       최초 온보딩 정보를 업데이트합니다.
 *       - nickname (필수)
 *       - profileImageUrl (선택)
 *       - bio (선택)

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
 *               nickname:
 *                 type: string
 *                 description: 닉네임 (필수)
 *               profileImageUrl:
 *                 type: string
 *                 description: 프로필 이미지 URL (선택)
 *               bio:
 *                 type: string
 *                 description: 자기소개 (선택)
 *             required: [nickname]
 *             example:
 *               nickname: gildong
 *               profileImageUrl: https://example.com/profile.jpg
 *               bio: 안녕하세요!
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
 *                     status:
 *                       type: string
 *                       enum: [pending, active, suspended]
 *                       example: active
 *       400:
 *         description: 잘못된 입력 (필드 형식 오류/필수값 누락)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: 닉네임 중복 등 충돌(NICKNAME_TAKEN)
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

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: 본인 정보 조회
 *     description: 인증된 사용자의 정보를 조회합니다.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 사용자 정보 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/StandardResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
router.get("/me", authGuard, userController.getMe);

/**
 * @swagger
 * /users/me/my-page:
 *   get:
 *     summary: 마이페이지 정보 조회
 *     description: 인증된 사용자의 마이페이지 정보를 조회합니다.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 마이페이지 정보 조회 성공
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
 *                     activityParticipationCount:
 *                       type: number
 *                       example: 5
 *                     certificationPosts:
 *                       type: number
 *                       example: 10
 *                     rewardPoints:
 *                       type: number
 *                       example: 500
 *                     name:
 *                       type: string
 *                       example: 홍길동
 *                     profileImageUrl:
 *                       type: string
 *                       example: https://example.com/profile.jpg
 *                     bio:
 *                       type: string
 *                       example: 안녕하세요!
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
router.get("/me/my-page", authGuard, userController.getMyPage);

/**
 * @swagger
 * /users/me/posts:
 *   get:
 *     summary: 내가 작성한 게시글 조회
 *     description: 로그인한 사용자가 작성한 게시글 목록을 조회합니다.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 0
 *         description: 페이지 번호
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 페이지 크기
 *     responses:
 *       200:
 *         description: 게시글 조회 성공
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
 *                     posts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "62u4J1Dgjs1k7soZ7ltD"
 *                           author:
 *                             type: string
 *                             example: "익명"
 *                           title:
 *                             type: string
 *                             example: "수정된 루틴 인증!"
 *                           type:
 *                             type: string
 *                             example: "GATHERING_REVIEW"
 *                           channel:
 *                             type: string
 *                             example: "독서 모임 후기"
 *                           category:
 *                             type: string
 *                             example: "한끗루틴"
 *                           scheduledDate:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-10-03T00:00:00.000Z"
 *                           visibility:
 *                             type: string
 *                             example: "PUBLIC"
 *                           isLocked:
 *                             type: boolean
 *                             example: false
 *                           rewardGiven:
 *                             type: boolean
 *                             example: false
 *                           likesCount:
 *                             type: integer
 *                             example: 0
 *                           commentsCount:
 *                             type: integer
 *                             example: 0
 *                           reportsCount:
 *                             type: integer
 *                             example: 0
 *                           viewCount:
 *                             type: integer
 *                             example: 0
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-11-01T15:28:39.101Z"
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-11-01T15:28:39.101Z"
 *                           community:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: "CP:G7C66H69GK"
 *                               name:
 *                                 type: string
 *                                 example: "독서 모임"
 *                           timeAgo:
 *                             type: string
 *                             example: "1시간 전"
 *                           communityPath:
 *                             type: string
 *                             example: "communities/CP:G7C66H69GK"
 *                           preview:
 *                             type: object
 *                             properties:
 *                               description:
 *                                 type: string
 *                                 example: "수정된 내용입니다!"
 *                               thumbnail:
 *                                 type: object
 *                                 nullable: true
 *                                 properties:
 *                                   url:
 *                                     type: string
 *                                     example: "https://example.com/updated-image.jpg"
 *                                   width:
 *                                     type: integer
 *                                     example: 1080
 *                                   height:
 *                                     type: integer
 *                                     example: 1080
 *                                   blurHash:
 *                                     type: string
 *                                     example: "L6PZfSi_.AyE_3t7t7R**0o#DgR4"
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         pageNumber:
 *                           type: integer
 *                           example: 1
 *                         pageSize:
 *                           type: integer
 *                           example: 10
 *                         totalElements:
 *                           type: integer
 *                           example: 12
 *                         totalPages:
 *                           type: integer
 *                           example: 2
 *                         hasNext:
 *                           type: boolean
 *                           example: false
 *                         hasPrevious:
 *                           type: boolean
 *                           example: true
 *                         isFirst:
 *                           type: boolean
 *                           example: false
 *                         isLast:
 *                           type: boolean
 *                           example: true
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 */
router.get("/me/posts", authGuard, userController.getMyAuthoredPosts);

/**
 * @swagger
 * /users/me/liked-posts:
 *   get:
 *     summary: 내가 좋아요한 게시글 조회
 *     description: 로그인한 사용자가 좋아요한 게시글 목록을 조회합니다.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 0
 *         description: 페이지 번호
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 페이지 크기
 *     responses:
 *       200:
 *         description: 게시글 조회 성공
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
 *                     posts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "62u4J1Dgjs1k7soZ7ltD"
 *                           author:
 *                             type: string
 *                             example: "익명"
 *                           title:
 *                             type: string
 *                             example: "수정된 루틴 인증!"
 *                           type:
 *                             type: string
 *                             example: "GATHERING_REVIEW"
 *                           channel:
 *                             type: string
 *                             example: "독서 모임 후기"
 *                           category:
 *                             type: string
 *                             example: "한끗루틴"
 *                           scheduledDate:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-10-03T00:00:00.000Z"
 *                           visibility:
 *                             type: string
 *                             example: "PUBLIC"
 *                           isLocked:
 *                             type: boolean
 *                             example: false
 *                           rewardGiven:
 *                             type: boolean
 *                             example: false
 *                           likesCount:
 *                             type: integer
 *                             example: 0
 *                           commentsCount:
 *                             type: integer
 *                             example: 0
 *                           reportsCount:
 *                             type: integer
 *                             example: 0
 *                           viewCount:
 *                             type: integer
 *                             example: 0
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-11-01T15:28:39.101Z"
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-11-01T15:28:39.101Z"
 *                           community:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: "CP:G7C66H69GK"
 *                               name:
 *                                 type: string
 *                                 example: "독서 모임"
 *                           timeAgo:
 *                             type: string
 *                             example: "1시간 전"
 *                           communityPath:
 *                             type: string
 *                             example: "communities/CP:G7C66H69GK"
 *                           preview:
 *                             type: object
 *                             properties:
 *                               description:
 *                                 type: string
 *                                 example: "수정된 내용입니다!"
 *                               thumbnail:
 *                                 type: object
 *                                 nullable: true
 *                                 properties:
 *                                   url:
 *                                     type: string
 *                                     example: "https://example.com/updated-image.jpg"
 *                                   width:
 *                                     type: integer
 *                                     example: 1080
 *                                   height:
 *                                     type: integer
 *                                     example: 1080
 *                                   blurHash:
 *                                     type: string
 *                                     example: "L6PZfSi_.AyE_3t7t7R**0o#DgR4"
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         pageNumber:
 *                           type: integer
 *                           example: 1
 *                         pageSize:
 *                           type: integer
 *                           example: 10
 *                         totalElements:
 *                           type: integer
 *                           example: 12
 *                         totalPages:
 *                           type: integer
 *                           example: 2
 *                         hasNext:
 *                           type: boolean
 *                           example: false
 *                         hasPrevious:
 *                           type: boolean
 *                           example: true
 *                         isFirst:
 *                           type: boolean
 *                           example: false
 *                         isLast:
 *                           type: boolean
 *                           example: true
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 */
router.get("/me/liked-posts", authGuard, userController.getMyLikedPosts);

/**
 * @swagger
 * /users/me/commented-posts:
 *   get:
 *     summary: 내가 댓글 단 게시글 조회
 *     description: 로그인한 사용자가 댓글을 단 게시글 목록을 조회합니다.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 0
 *         description: 페이지 번호
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 페이지 크기
 *     responses:
 *       200:
 *         description: 게시글 조회 성공
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
 *                     posts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "62u4J1Dgjs1k7soZ7ltD"
 *                           author:
 *                             type: string
 *                             example: "익명"
 *                           title:
 *                             type: string
 *                             example: "수정된 루틴 인증!"
 *                           type:
 *                             type: string
 *                             example: "GATHERING_REVIEW"
 *                           channel:
 *                             type: string
 *                             example: "독서 모임 후기"
 *                           category:
 *                             type: string
 *                             example: "한끗루틴"
 *                           scheduledDate:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-10-03T00:00:00.000Z"
 *                           visibility:
 *                             type: string
 *                             example: "PUBLIC"
 *                           isLocked:
 *                             type: boolean
 *                             example: false
 *                           rewardGiven:
 *                             type: boolean
 *                             example: false
 *                           likesCount:
 *                             type: integer
 *                             example: 0
 *                           commentsCount:
 *                             type: integer
 *                             example: 0
 *                           reportsCount:
 *                             type: integer
 *                             example: 0
 *                           viewCount:
 *                             type: integer
 *                             example: 0
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-11-01T15:28:39.101Z"
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-11-01T15:28:39.101Z"
 *                           community:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: "CP:G7C66H69GK"
 *                               name:
 *                                 type: string
 *                                 example: "독서 모임"
 *                           timeAgo:
 *                             type: string
 *                             example: "1시간 전"
 *                           communityPath:
 *                             type: string
 *                             example: "communities/CP:G7C66H69GK"
 *                           preview:
 *                             type: object
 *                             properties:
 *                               description:
 *                                 type: string
 *                                 example: "수정된 내용입니다!"
 *                               thumbnail:
 *                                 type: object
 *                                 nullable: true
 *                                 properties:
 *                                   url:
 *                                     type: string
 *                                     example: "https://example.com/updated-image.jpg"
 *                                   width:
 *                                     type: integer
 *                                     example: 1080
 *                                   height:
 *                                     type: integer
 *                                     example: 1080
 *                                   blurHash:
 *                                     type: string
 *                                     example: "L6PZfSi_.AyE_3t7t7R**0o#DgR4"
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         pageNumber:
 *                           type: integer
 *                           example: 1
 *                         pageSize:
 *                           type: integer
 *                           example: 10
 *                         totalElements:
 *                           type: integer
 *                           example: 12
 *                         totalPages:
 *                           type: integer
 *                           example: 2
 *                         hasNext:
 *                           type: boolean
 *                           example: false
 *                         hasPrevious:
 *                           type: boolean
 *                           example: true
 *                         isFirst:
 *                           type: boolean
 *                           example: false
 *                         isLast:
 *                           type: boolean
 *                           example: true
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 */
router.get("/me/commented-posts", authGuard, userController.getMyCommentedPosts);

/**
 * @swagger
 * /users/nickname-availability:
 *   get:
 *     summary: 닉네임 가용성 확인
 *     description: 닉네임 중복 여부를 확인합니다.
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: nickname
 *         required: true
 *         schema:
 *           type: string
 *         description: 확인할 닉네임
 *     responses:
 *       200:
 *         description: 가용성 확인 성공
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
 *                     available:
 *                       type: boolean
 *                       example: true
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
router.get("/nickname-availability", userController.checkNicknameAvailability);

router.patch("/me/onboarding", authGuard, userController.updateOnboarding);


/**
 * @swagger
 * /users/me/sync-kakao-profile:
 *   post:
 *     summary: 카카오 프로필 동기화
 *     description: 카카오 Access Token으로 OIDC userinfo를 조회해 사용자 정보를 저장합니다.
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
 *               accessToken:
 *                 type: string
 *             required: [accessToken]
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
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: 잘못된 입력 또는 카카오 호출 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
router.post("/me/sync-kakao-profile", authGuard, userController.syncKakaoProfile);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: 모든 사용자 조회 (인증 필요)
 *     description: 시스템의 모든 사용자 목록을 조회합니다.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
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
router.get("/", authGuard, userController.getAllUsers);

/**
 * @swagger
 * /users/{userId}:
 *   get:
 *     summary: 사용자 상세 조회
 *     description: 특정 사용자의 상세 정보를 조회합니다 (본인만 조회 가능)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
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
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: 권한 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
router.get("/:userId", authGuard, userController.getUserById);

/**
 * @swagger
 * /users/{userId}:
 *   put:
 *     summary: 사용자 정보 수정 (관리자용)
 *     description: |
 *       사용자의 다양한 정보를 수정합니다 (모든 필드 수정 가능)
 *       
 *       **수정 가능한 필드:**
 *       - email, nickname, name, birthDate, gender, phoneNumber
 *       - profileImageUrl, bio, authType, snsProvider
 *       - status, 약관 관련 필드들
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
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               nickname:
 *                 type: string
 *                 example: gildong
 *               name:
 *                 type: string
 *                 example: 홍길동
 *               birthDate:
 *                 type: string
 *                 example: 1990-01-01
 *               gender:
 *                 type: string
 *                 enum: [MALE, FEMALE]
 *                 example: MALE
 *               phoneNumber:
 *                 type: string
 *                 example: 01012345678
 *               profileImageUrl:
 *                 type: string
 *                 example: https://example.com/profile.jpg
 *               bio:
 *                 type: string
 *                 example: 안녕하세요!
 *               rewards:
 *                 type: number
 *                 description: 리워드 총합
 *                 example: 0
 *               authType:
 *                 type: string
 *                 example: sns
 *               snsProvider:
 *                 type: string
 *                 example: kakao
 *               status:
 *                 type: string
 *                 enum: [pending, active, suspended]
 *                 example: active
 *               serviceTermsVersion:
 *                 type: string
 *                 example: "v1"
 *               privacyTermsVersion:
 *                 type: string
 *                 example: "v1"
 *               age14TermsAgreed:
 *                 type: boolean
 *                 example: true
 *               pushTermsAgreed:
 *                 type: boolean
 *                 example: false
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

