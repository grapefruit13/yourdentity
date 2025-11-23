const express = require("express");
const router = express.Router();
const missionController = require("../controllers/missionController");
const optionalAuth = require("../middleware/optionalAuth");
const authGuard = require("../middleware/authGuard");

/**
 * @swagger
 * components:
 *   schemas:
 *     Mission:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: 미션 ID (Notion 페이지 ID)
 *           example: "2a645f52-4cd0-80ea-9d7f-fe3ca69df522"
 *         title:
 *           type: string
 *           description: 미션 제목
 *           example: "친구와 함께 요리하기"
 *         missionIntroduction:
 *           type: string
 *           nullable: true
 *           description: 미션 소개
 *           example: "내가 좋아하는 책을 한권 선정해서 읽고 그 책을 쓴 작가를 위한 책 추천사 써보기"
 *         coverImage:
 *           type: string
 *           nullable: true
 *           description: 노션 페이지 커버 이미지 URL (unsplash 등)
 *           example: "https://images.unsplash.com/photo-1234567890"
 *         isRecruiting:
 *           type: boolean
 *           description: 현재 모집 여부
 *           example: true
 *         isUnlimited:
 *           type: boolean
 *           description: 무제한 여부
 *           example: false
 *         applicationDeadline:
 *           type: string
 *           nullable: true
 *           format: date-time
 *           description: 신청 마감일시 (무제한이 아닐 경우)
 *           example: "2024-12-31T23:59:59.000Z"
 *         certificationDeadline:
 *           type: string
 *           nullable: true
 *           format: date-time
 *           description: 인증 마감일시
 *           example: "2024-12-31T23:59:59.000Z"
 *         categories:
 *           type: array
 *           items:
 *             type: string
 *           description: 카테고리 목록
 *           example: ["자기 탐색", "자기 만족"]
 *         detailTags:
 *           type: string
 *           nullable: true
 *           description: 상세 태그
 *           example: "일상, 요리"
 *         targetAudience:
 *           type: string
 *           nullable: true
 *           description: 참여 대상
 *           example: "누구나"
 *         notes:
 *           type: string
 *           nullable: true
 *           description: 참고 사항
 *           example: "매일 인증해주세요"
 *         certificationMethod:
 *           type: array
 *           nullable: true
 *           description: 인증 방법 (Multi-select)
 *           items:
 *             type: string
 *           example: ["사진과 함께 인증글 작성", "3줄 이상 글 작성"]
 *         reactionCount:
 *           type: integer
 *           description: 찜 수
 *           example: 10
 *         faqRelation:
 *           type: object
 *           nullable: true
 *           description: FAQ 연동 정보
 *           properties:
 *             relations:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *             has_more:
 *               type: boolean
 *           example:
 *             relations:
 *               - id: "faq-page-1"
 *               - id: "faq-page-2"
 *             has_more: false
 *         isReviewRegistered:
 *           type: boolean
 *           description: 미션 후기 등록 여부
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 생성일시
 *           example: "2024-01-01T00:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 수정일시
 *           example: "2024-01-01T00:00:00.000Z"
 *         pageContent:
 *           type: array
 *           description: 페이지 내용 (상세 조회 시에만 포함)
 *           items:
 *             type: object
 *
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
 *             examples:
 *               ServerError:
 *                 value:
 *                   status: 500
 *                   message: "서버 내부 오류가 발생했습니다"
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
 *       **자동 필터링:**
 *       - 현재 모집 여부가 체크된 미션만 조회됩니다.
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
 *             examples:
 *               ServerError:
 *                 value:
 *                   status: 500
 *                   message: "서버 내부 오류가 발생했습니다"
 */
router.get("/", optionalAuth, missionController.getMissions);

/**
 * @swagger
 * /missions/me:
 *   get:
 *     summary: 내 진행 중인 미션 목록 조회
 *     description: 로그인한 사용자가 진행 중인 미션 목록을 조회합니다.
 *     tags: [Missions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           minimum: 1
 *           maximum: 50
 *         description: 최대 조회 개수
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
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           missionNotionPageId:
 *                             type: string
 *                           missionTitle:
 *                             type: string
 *                           detailTags:
 *                             type: string
 *                             nullable: true
 *                             description: 미션 태그
 *                           startedAt:
 *                             type: string
 *                             format: date-time
 *             example:
 *               status: 200
 *               data:
 *                 missions:
 *                   - id: "mission-test-user_2a645f52-4cd0-803b-8da5-e9fb9d16d263"
 *                     missionNotionPageId: "2a645f52-4cd0-803b-8da5-e9fb9d16d263"
 *                     missionTitle: "친구와 함께 요리하기"
 *                     detailTags: "일상, 요리"
 *                     startedAt: "2025-11-21T10:13:31.809Z"
 *       401:
 *         description: 인증 필요
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               MissingBearer:
 *                 value:
 *                   status: 401
 *                   message: "Bearer 토큰이 필요합니다"
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               ServerError:
 *                 value:
 *                   status: 500
 *                   message: "서버 내부 오류가 발생했습니다"
 */
router.get("/me", authGuard, missionController.getMyMissions);

/**
 * @swagger
 * /missions/stats:
 *   get:
 *     summary: 미션 통계 조회
 *     description: 사용자의 미션 통계 정보를 조회합니다. (오늘의 미션 인증 현황, 연속 미션일, 진행 미션 수, 누적 게시글 수)
 *     tags: [Missions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 미션 통계 조회 성공
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
 *                     todayTotalCount:
 *                       type: integer
 *                       description: 오늘 신청한 미션 수 (QUIT 제외, IN_PROGRESS + COMPLETED)
 *                       example: 2
 *                     todayCompletedCount:
 *                       type: integer
 *                       description: 오늘 완료한 미션 수 (COMPLETED만)
 *                       example: 2
 *                     todayActiveCount:
 *                       type: integer
 *                       description: 진행 중인 미션 수 (오늘 신청한 미션 중 IN_PROGRESS만)
 *                       example: 0
 *                     consecutiveDays:
 *                       type: integer
 *                       description: 연속 미션일
 *                       example: 5
 *                     totalPostsCount:
 *                       type: integer
 *                       description: 누적 게시글 수
 *                       example: 15
 *             example:
 *               status: 200
 *               data:
 *                 todayTotalCount: 2
 *                 todayCompletedCount: 2
 *                 todayActiveCount: 0
 *                 consecutiveDays: 5
 *                 totalPostsCount: 15
 *       401:
 *         description: 인증 필요
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
router.get("/stats", authGuard, missionController.getMissionStats);

// 미션 인증글 목록 조회 (라우트 순서 중요: /posts가 /:missionId보다 먼저 정의되어야 함)
/**
 * @swagger
 * /missions/posts:
 *   get:
 *     summary: 미션 인증글 목록 조회
 *     tags: [Missions]
 *     description: 미션 인증글 목록을 조회합니다. 페이지네이션은 추후 추가 예정입니다. 인증은 선택사항이며, 인증 시 추가 정보를 제공할 수 있습니다.
 *     parameters:
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [latest, popular]
 *           default: latest
 *         description: 정렬 기준 (latest=최신순, popular=인기순)
 *         example: "latest"
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: 카테고리 필터 (추후 구현)
 *         example: "일상"
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: 내가 인증한 미션만 보기 (userId 필터)
 *         example: "user-123"
 *     responses:
 *       200:
 *         description: 미션 인증글 목록 조회 성공
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
 *                             example: "post-123"
 *                           title:
 *                             type: string
 *                             example: "오늘 하늘이 이뻤어요!"
 *                           missionTitle:
 *                             type: string
 *                             example: "일상 인증 미션"
 *                           missionNotionPageId:
 *                             type: string
 *                             example: "mission-page-123"
 *                           author:
 *                             type: string
 *                             example: "닉네임"
 *                           profileImageUrl:
 *                             type: string
 *                             nullable: true
 *                             example: "https://example.com/profile.jpg"
 *                           preview:
 *                             type: object
 *                             properties:
 *                               description:
 *                                 type: string
 *                                 example: "두줄까지 미리보기로 보이게!!! 구름이 뭉게뭉게..."
 *                               thumbnail:
 *                                 type: object
 *                                 nullable: true
 *                                 properties:
 *                                   url:
 *                                     type: string
 *                                     example: "https://example.com/image.jpg"
 *                                   width:
 *                                     type: number
 *                                     nullable: true
 *                                   height:
 *                                     type: number
 *                                     nullable: true
 *                                   blurHash:
 *                                     type: string
 *                                     nullable: true
 *                           mediaCount:
 *                             type: integer
 *                             example: 3
 *                           commentsCount:
 *                             type: integer
 *                             example: 12
 *                           viewCount:
 *                             type: integer
 *                             example: 100
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-01-20T10:00:00.000Z"
 *                           timeAgo:
 *                             type: string
 *                             example: "1시간 전"
 *             example:
 *               status: 200
 *               data:
 *                 posts:
 *                   - id: "post-123"
 *                     title: "오늘 하늘이 이뻤어요!"
 *                     missionTitle: "일상 인증 미션"
 *                     missionNotionPageId: "mission-page-123"
 *                     author: "닉네임"
 *                     profileImageUrl: "https://example.com/profile.jpg"
 *                     preview:
 *                       description: "두줄까지 미리보기로 보이게!!! 구름이 뭉게뭉게..."
 *                       thumbnail:
 *                         url: "https://example.com/image.jpg"
 *                         width: 1080
 *                         height: 1080
 *                         blurHash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4"
 *                     mediaCount: 3
 *                     commentsCount: 12
 *                     viewCount: 100
 *                     createdAt: "2024-01-20T10:00:00.000Z"
 *                     timeAgo: "1시간 전"
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               BadRequest:
 *                 value:
 *                   status: 400
 *                   message: "잘못된 요청입니다"
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               ServerError:
 *                 value:
 *                   status: 500
 *                   message: "인증글 목록을 조회할 수 없습니다."
 */
router.get("/posts", optionalAuth, missionController.getAllMissionPosts);

// 미션 인증글 상세 조회 (라우트 순서 중요: /posts/:postId가 /:missionId보다 먼저 정의되어야 함)
/**
 * @swagger
 * /missions/posts/{postId}:
 *   get:
 *     summary: 미션 인증글 상세 조회
 *     tags: [Missions]
 *     description: 특정 미션 인증글의 상세 정보를 조회합니다. 조회 시 조회수가 증가합니다. 인증은 선택사항이며, 인증 시 isAuthor 필드가 정확하게 표시됩니다.
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: 인증글 ID
 *         example: "post-123"
 *     responses:
 *       200:
 *         description: 미션 인증글 상세 조회 성공
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
 *                     id:
 *                       type: string
 *                       example: "post-123"
 *                     title:
 *                       type: string
 *                       example: "오늘 하늘이 이뻤어요!"
 *                     content:
 *                       type: string
 *                       example: "구름이 뭉게뭉게 있어서 하늘이 이뻐요!"
 *                     media:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]
 *                     missionTitle:
 *                       type: string
 *                       example: "일상 인증 미션"
 *                     missionNotionPageId:
 *                       type: string
 *                       example: "mission-page-123"
 *                     author:
 *                       type: string
 *                       example: "닉네임"
 *                     profileImageUrl:
 *                       type: string
 *                       nullable: true
 *                       example: "https://example.com/profile.jpg"
 *                     commentsCount:
 *                       type: integer
 *                       example: 12
 *                     viewCount:
 *                       type: integer
 *                       example: 101
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-20T10:00:00.000Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-20T10:00:00.000Z"
 *                     timeAgo:
 *                       type: string
 *                       example: "1시간 전"
 *                     isAuthor:
 *                       type: boolean
 *                       example: false
 *             example:
 *               status: 200
 *               data:
 *                 id: "post-123"
 *                 title: "오늘 하늘이 이뻤어요!"
 *                 content: "구름이 뭉게뭉게 있어서 하늘이 이뻐요!"
 *                 media: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]
 *                 missionTitle: "일상 인증 미션"
 *                 missionNotionPageId: "mission-page-123"
 *                 author: "닉네임"
 *                 profileImageUrl: "https://example.com/profile.jpg"
 *                 commentsCount: 12
 *                 viewCount: 101
 *                 createdAt: "2024-01-20T10:00:00.000Z"
 *                 updatedAt: "2024-01-20T10:00:00.000Z"
 *                 timeAgo: "1시간 전"
 *                 isAuthor: false
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               BadRequest:
 *                 value:
 *                   status: 400
 *                   message: "인증글 ID가 필요합니다."
 *       404:
 *         description: 인증글을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               NotFound:
 *                 value:
 *                   status: 404
 *                   message: "인증글을 찾을 수 없습니다."
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               ServerError:
 *                 value:
 *                   status: 500
 *                   message: "인증글을 조회할 수 없습니다."
 */
router.get("/posts/:postId", optionalAuth, missionController.getMissionPostById);

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
 *             examples:
 *               MissionNotFound:
 *                 value:
 *                   status: 404
 *                   message: "존재하지 않는 미션입니다."
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               ServerError:
 *                 value:
 *                   status: 500
 *                   message: "서버 내부 오류가 발생했습니다"
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
 *     requestBody:
 *       required: false
 *       description: 요청 본문은 필요 없습니다. Path 파라미터와 Bearer 토큰만 전송하세요.
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
 *             examples:
 *               MissingMissionId:
 *                 value:
 *                   status: 400
 *                   message: "미션 ID가 필요합니다."
 *       401:
 *         description: 인증 필요
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               MissingBearer:
 *                 value:
 *                   status: 401
 *                   message: "Bearer 토큰이 필요합니다"
 *       404:
 *         description: 미션을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               MissionNotFound:
 *                 value:
 *                   status: 404
 *                   message: "존재하지 않는 미션입니다."
 *       409:
 *         description: 신청 제한 초과 혹은 중복 신청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               DuplicateOrLimited:
 *                 value:
 *                   status: 409
 *                   message: "이미 참여한 미션입니다. 다음 리셋 이후에 다시 신청해주세요."
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               ServerError:
 *                 value:
 *                   status: 500
 *                   message: "서버 내부 오류가 발생했습니다"
 */
router.post("/:missionId/apply", authGuard, missionController.applyMission);

/**
 * @swagger
 * /missions/{missionId}/quit:
 *   post:
 *     summary: 미션 그만두기
 *     description: 사용자가 신청한 진행 중인 미션을 그만둡니다.
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
 *       200:
 *         description: 미션 그만두기 성공
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
 *                     missionId:
 *                       type: string
 *                       example: "2a645f52-4cd0-80ea-9d7f-fe3ca69df522"
 *                     status:
 *                       type: string
 *                       example: "QUIT"
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               BadRequest:
 *                 value:
 *                   status: 400
 *                   message: "미션 ID가 필요합니다."
 *       401:
 *         description: 인증 필요
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       403:
 *         description: 권한 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               Forbidden:
 *                 value:
 *                   status: 403
 *                   message: "본인의 미션만 그만둘 수 있습니다."
 *       404:
 *         description: 미션을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               MissionNotFound:
 *                 value:
 *                   status: 404
 *                   message: "신청한 미션이 없습니다."
 *       409:
 *         description: 충돌
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               MissionNotInProgress:
 *                 value:
 *                   status: 409
 *                   message: "진행 중인 미션만 그만둘 수 있습니다."
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.post("/:missionId/quit", authGuard, missionController.quitMission);

/**
 * @swagger
 * /missions/{missionId}/posts:
 *   post:
 *     summary: 미션 인증 글 작성 (완료 처리)
 *     description: 미션 인증 글을 작성하면서 해당 미션을 완료 상태로 전환합니다.
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: 인증 글 제목
 *                 example: "미션 인증 완료!"
 *               content:
 *                 type: string
 *                 description: 인증 내용 (HTML 허용)
 *                 example: "<p>오늘의 미션을 이렇게 수행했어요.</p>"
 *               media:
 *                 type: array
 *                 description: 업로드된 파일 경로 배열
 *                 items:
 *                   type: string
 *                 example: ["files/abc123/sample.png"]
 *               postType:
 *                 type: string
 *                 description: 게시글 유형 (기본 CERT)
 *                 example: "CERT"
 *     responses:
 *       201:
 *         description: 인증 글 작성 및 미션 완료 성공
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
 *                     postId:
 *                       type: string
 *                       example: "mission-post-123"
 *                     status:
 *                       type: string
 *                       example: "COMPLETED"
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               InvalidPayload:
 *                 value:
 *                   status: 400
 *                   message: "제목, 내용 또는 미디어 중 최소 한 가지는 필요합니다."
 *       401:
 *         description: 인증 필요
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               MissingBearer:
 *                 value:
 *                   status: 401
 *                   message: "Bearer 토큰이 필요합니다"
 *       404:
 *         description: 미션 신청 기록 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               MissionNotApplied:
 *                 value:
 *                   status: 404
 *                   message: "미션 신청 기록을 찾을 수 없습니다."
 *       409:
 *         description: 이미 완료된 미션
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               AlreadyCompleted:
 *                 value:
 *                   status: 409
 *                   message: "이미 완료되었거나 종료된 미션입니다."
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *             examples:
 *               ServerError:
 *                 value:
 *                   status: 500
 *                   message: "서버 내부 오류가 발생했습니다"
 */
router.post("/:missionId/posts", authGuard, missionController.createMissionPost);

module.exports = router;


