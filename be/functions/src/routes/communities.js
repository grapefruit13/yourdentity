const express = require("express");
const router = express.Router();
const communityController = require("../controllers/communityController");
const authGuard = require("../middleware/authGuard");

/**
 * @swagger
 * components:
 *   schemas:
 *     Community:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: 커뮤니티 ID
 *         name:
 *           type: string
 *           description: 커뮤니티 이름
 *         type:
 *           type: string
 *           enum: [interest, anonymous]
 *           description: 커뮤니티 타입
 *         channel:
 *           type: string
 *           description: 채널 정보
 *         postType:
 *           type: string
 *           enum: [ROUTINE_CERT, GATHERING_REVIEW, TMI]
 *           description: 게시글 타입
 *         membersCount:
 *           type: integer
 *           description: 멤버 수
 *         postsCount:
 *           type: integer
 *           description: 게시글 수
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 생성일
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 수정일
 *
     *     CommunityPost:
     *       type: object
     *       properties:
     *         id:
     *           type: string
     *           description: 게시글 ID
     *           example: "AMrsQRg9tBY0ZGJMbKG2"
     *         type:
     *           type: string
     *           enum: [ROUTINE_CERT, GATHERING_REVIEW, TMI]
     *           description: 게시글 타입
     *           example: "TMI"
     *         authorId:
     *           type: string
     *           description: 작성자 ID (uid)
     *           example: "user123"
     *         author:
     *           type: string
     *           description: 작성자 닉네임
     *           example: "사용자닉네임"
     *         title:
     *           type: string
     *           description: 제목
     *           example: "오늘의 루틴 인증!"
     *         preview:
     *           type: object
     *           description: 미리보기 정보
     *           properties:
     *             description:
     *               type: string
     *               description: 미리보기 설명
     *               example: "string"
     *             thumbnail:
     *               type: object
     *               nullable: true
     *               description: 썸네일 정보 (null 가능)
     *               properties:
     *                 url:
     *                   type: string
     *                   description: 썸네일 URL
     *                   example: "https://example.com/updated-image.jpg"
     *                 blurHash:
     *                   type: string
     *                   description: 블러 해시
     *                   example: "L6PZfSi_.AyE_3t7t7R**0o#DgR4"
     *                 width:
     *                   type: integer
     *                   description: 너비
     *                   example: 1080
     *                 height:
     *                   type: integer
     *                   description: 높이
     *                   example: 1080
     *                 ratio:
     *                   type: string
     *                   description: 비율
     *                   example: "1080:1080"
     *             isVideo:
     *               type: boolean
     *               description: 비디오 여부
     *               example: false
     *             hasImage:
     *               type: boolean
     *               description: 이미지 포함 여부
     *               example: false
     *             hasVideo:
     *               type: boolean
     *               description: 동영상 포함 여부
     *               example: false
     *         mediaCount:
     *           type: integer
     *           description: 미디어 개수
     *           example: 0
     *         channel:
     *           type: string
     *           description: 채널명
     *           example: "TMI 자아탐색"
     *         category:
     *           type: string
     *           nullable: true
     *           description: 카테고리
     *           example: "string"
     *         tags:
     *           type: array
     *           description: 태그 목록
     *           items:
     *             type: string
     *           example: ["string"]
     *         scheduledDate:
     *           type: string
     *           format: date-time
     *           nullable: true
     *           description: 예약 발행 날짜
     *           example: "2025-10-03T17:15:04.882Z"
     *         isLocked:
     *           type: boolean
     *           description: 잠금 여부
     *           example: false
     *         visibility:
     *           type: string
     *           description: 공개 범위
     *           example: "public"
     *         likesCount:
     *           type: integer
     *           description: 좋아요 수
     *           example: 0
     *         commentsCount:
     *           type: integer
     *           description: 댓글 수
     *           example: 0
     *         createdAt:
     *           type: string
     *           format: date-time
     *           description: 생성일
     *           example: "2025-10-03T17:15:07.862Z"
 *         timeAgo:
 *           type: string
 *           description: 상대적 시간
 *           example: "2분 전"
 *
 *     CommunityMember:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: 멤버 ID
 *           example: "member_123"
 *         userId:
 *           type: string
 *           description: 사용자 ID
 *           example: "user_123"
 *         nickname:
 *           type: string
 *           description: 사용자 닉네임
 *           example: "사용자닉네임"
 *         avatar:
 *           type: string
 *           nullable: true
 *           description: 프로필 이미지 URL
 *           example: "https://example.com/avatar.jpg"
 *         role:
 *           type: string
 *           enum: [member, admin, moderator]
 *           description: 멤버 역할
 *           example: "member"
 *         status:
 *           type: string
 *           enum: [active, inactive, banned]
 *           description: 멤버 상태
 *           example: "active"
 *         joinedAt:
 *           type: string
 *           format: date-time
 *           description: 가입일시
 *           example: "2025-10-03T17:15:07.862Z"
 *         lastActiveAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: 마지막 활동일시
 *           example: "2025-10-03T18:30:15.123Z"
 */

// 커뮤니티 목록 조회
/**
 * @swagger
 * /communities:
 *   get:
 *     tags: [Communities]
 *     summary: 커뮤니티 목록 조회
 *     description: 한끗루틴, 월간 소모임, TMI 등 모든 프로그램 활동 조회
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [interest, anonymous]
 *         description: 커뮤니티 타입 필터
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
 *         description: 커뮤니티 목록 조회 성공
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
 *                     communities:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Community'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         size:
 *                           type: integer
 *                         totalElements:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         hasNext:
 *                           type: boolean
 *                         hasPrevious:
 *                           type: boolean
 *                         isFirst:
 *                           type: boolean
 *                         isLast:
 *                           type: boolean
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "커뮤니티 목록 조회 중 오류가 발생했습니다."
 */
router.get("/", communityController.getCommunities);

// 전체 커뮤니티 포스트 조회
/**
 * @swagger
 * /communities/posts:
 *   get:
 *     tags: [Communities]
 *     summary: 전체 커뮤니티 포스트 조회
 *     description: 모든 커뮤니티의 게시글을 통합 조회
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
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           enum: [routine, gathering, tmi]
 *         description: 게시글 타입 필터
 *     responses:
 *       200:
 *         description: 전체 커뮤니티 포스트 조회 성공
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
 *                         $ref: '#/components/schemas/CommunityPostListItem'
 *                       example:
 *                         - id: "AMrsQRg9tBY0ZGJMbKG2"
 *                           type: "TMI"
 *                           authorId: "user123"
 *                           author: "사용자닉네임"
 *                           title: "오늘의 루틴 인증!"
 *                           preview:
 *                             description: "string"
 *                             thumbnail: null
 *                             isVideo: false
 *                             hasImage: false
 *                             hasVideo: false
 *                           mediaCount: 0
 *                           channel: "TMI 자아탐색"
 *                           category: "string"
 *                           tags: ["string"]
 *                           scheduledDate: "2025-10-03T17:15:04.882Z"
 *                           isLocked: false
 *                           visibility: "public"
 *                           likesCount: 0
 *                           commentsCount: 0
 *                           createdAt: "2025-10-03T17:15:07.862Z"
 *                           timeAgo: "2분 전"
 *                         - id: "jpb8WjP7poOmI07Z7tU8"
 *                           type: "TMI"
 *                           authorId: "user456"
 *                           author: "사용자닉네임"
 *                           title: "수정된 TMI 인증!"
 *                           preview:
 *                             description: "수정된 내용입니다!"
 *                             thumbnail:
 *                               url: "https://example.com/updated-image.jpg"
 *                               blurHash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4"
 *                               width: 1080
 *                               height: 1080
 *                               ratio: "1080:1080"
 *                             isVideo: false
 *                             hasImage: true
 *                             hasVideo: false
 *                           mediaCount: 1
 *                           channel: "TMI 자아탐색"
 *                           category: "string"
 *                           tags: ["string"]
 *                           scheduledDate: "2025-10-03T17:15:04.882Z"
 *                           isLocked: false
 *                           visibility: "public"
 *                           likesCount: 0
 *                           commentsCount: 0
 *                           createdAt: "2025-10-03T17:15:07.862Z"
 *                           timeAgo: "2분 전"
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 0
 *                         size:
 *                           type: integer
 *                           example: 10
 *                         totalElements:
 *                           type: integer
 *                           example: 100
 *                         totalPages:
 *                           type: integer
 *                           example: 10
 *                         hasNext:
 *                           type: boolean
 *                           example: true
 *                         hasPrevious:
 *                           type: boolean
 *                         isFirst:
 *                           type: boolean
 *                         isLast:
 *                           type: boolean
 *                           example: false
 *       500:
 *         description: 서버 오류
 */
router.get("/posts", communityController.getAllCommunityPosts);

// 커뮤니티 상세 조회
/**
 * @swagger
 * /communities/{communityId}:
 *   get:
 *     tags: [Communities]
 *     summary: 커뮤니티 상세 조회
 *     description: 특정 커뮤니티의 상세 정보 조회
 *     parameters:
 *       - in: path
 *         name: communityId
 *         required: true
 *         schema:
 *           type: string
 *         description: 커뮤니티 ID
 *     responses:
 *       200:
 *         description: 커뮤니티 상세 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   $ref: '#/components/schemas/Community'
 *       404:
 *         description: 커뮤니티를 찾을 수 없음
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
 *                   example: "커뮤니티를 찾을 수 없습니다"
 *       500:
 *         description: 서버 오류
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
 *                   example: "서버 내부 오류가 발생했습니다"
 */
router.get("/:communityId", communityController.getCommunityById);

// 커뮤니티 멤버 목록 조회
/**
 * @swagger
 * /communities/{communityId}/members:
 *   get:
 *     tags: [Communities]
 *     summary: 커뮤니티 멤버 목록 조회
 *     description: 특정 커뮤니티의 멤버 목록 조회
 *     parameters:
 *       - in: path
 *         name: communityId
 *         required: true
 *         schema:
 *           type: string
 *         description: 커뮤니티 ID
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
 *           default: 20
 *         description: 페이지 크기
 *     responses:
 *       200:
 *         description: 멤버 목록 조회 성공
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
 *                     members:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/CommunityMember'
 *                       example:
 *                         - id: "member_123"
 *                           userId: "user_123"
 *                           nickname: "사용자닉네임"
 *                           avatar: "https://example.com/avatar.jpg"
 *                           role: "member"
 *                           status: "active"
 *                           joinedAt: "2025-10-03T17:15:07.862Z"
 *                           lastActiveAt: "2025-10-03T18:30:15.123Z"
 *                         - id: "member_456"
 *                           userId: "user_456"
 *                           nickname: "관리자닉네임"
 *                           avatar: null
 *                           role: "admin"
 *                           status: "active"
 *                           joinedAt: "2025-10-02T10:00:00.000Z"
 *                           lastActiveAt: "2025-10-03T19:00:00.000Z"
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 0
 *                         size:
 *                           type: integer
 *                           example: 20
 *                         totalElements:
 *                           type: integer
 *                           example: 150
 *                         totalPages:
 *                           type: integer
 *                           example: 8
 *                         hasNext:
 *                           type: boolean
 *                           example: true
 *                         hasPrevious:
 *                           type: boolean
 *                         isFirst:
 *                           type: boolean
 *                         isLast:
 *                           type: boolean
 *                           example: false
 *       404:
 *         description: 커뮤니티를 찾을 수 없음
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
 *                   example: "커뮤니티를 찾을 수 없습니다"
 *       500:
 *         description: 서버 오류
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
 *                   example: "서버 내부 오류가 발생했습니다"
 */
router.get("/:communityId/members", communityController.getCommunityMembers);

// 커뮤니티 게시글 목록 조회
/**
 * @swagger
 * /communities/{communityId}/posts:
 *   get:
 *     tags: [Communities]
 *     summary: 커뮤니티 게시글 목록 조회
 *     description: 특정 커뮤니티의 게시글 목록 조회
 *     parameters:
 *       - in: path
 *         name: communityId
 *         required: true
 *         schema:
 *           type: string
 *         description: 커뮤니티 ID
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
 *         description: 게시글 목록 조회 성공
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
 *                         $ref: '#/components/schemas/CommunityPost'
 *                       example:
 *                         - id: "AMrsQRg9tBY0ZGJMbKG2"
 *                           type: "TMI"
 *                           authorId: "user123"
 *                           author: "사용자닉네임"
 *                           title: "오늘의 루틴 인증!"
 *                           preview:
 *                             description: "string"
 *                             thumbnail: null
 *                             isVideo: false
 *                             hasImage: false
 *                             hasVideo: false
 *                           mediaCount: 0
 *                           channel: "TMI 자아탐색"
 *                           category: "string"
 *                           tags: ["string"]
 *                           scheduledDate: "2025-10-03T17:15:04.882Z"
 *                           isLocked: false
 *                           visibility: "public"
 *                           likesCount: 0
 *                           commentsCount: 0
 *                           createdAt: "2025-10-03T17:15:07.862Z"
 *                           timeAgo: "2분 전"
 *                         - id: "jpb8WjP7poOmI07Z7tU8"
 *                           type: "TMI"
 *                           authorId: "user456"
 *                           author: "사용자닉네임"
 *                           title: "수정된 TMI 인증!"
 *                           preview:
 *                             description: "수정된 내용입니다!"
 *                             thumbnail:
 *                               url: "https://example.com/updated-image.jpg"
 *                               blurHash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4"
 *                               width: 1080
 *                               height: 1080
 *                               ratio: "1080:1080"
 *                             isVideo: false
 *                             hasImage: true
 *                             hasVideo: false
 *                           mediaCount: 1
 *                           channel: "TMI 자아탐색"
 *                           category: "string"
 *                           tags: ["string"]
 *                           scheduledDate: "2025-10-03T17:15:04.882Z"
 *                           isLocked: false
 *                           visibility: "public"
 *                           likesCount: 0
 *                           commentsCount: 0
 *                           createdAt: "2025-10-03T17:15:07.862Z"
 *                           timeAgo: "2분 전"
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         size:
 *                           type: integer
 *                         totalElements:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         hasNext:
 *                           type: boolean
 *                         hasPrevious:
 *                           type: boolean
 *                         isFirst:
 *                           type: boolean
 *                         isLast:
 *                           type: boolean
 *       404:
 *         description: 커뮤니티를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.get("/:communityId/posts", communityController.getCommunityPosts);

// 커뮤니티 게시글 작성
/**
 * @swagger
 * /communities/{communityId}/posts:
 *   post:
 *     tags: [Communities]
 *     summary: 커뮤니티 게시글 작성
 *     description: 특정 커뮤니티에 게시글 작성
 *     parameters:
 *       - in: path
 *         name: communityId
 *         required: true
 *         schema:
 *           type: string
 *         description: 커뮤니티 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 description: 게시글 제목
 *                 example: "오늘의 루틴 인증!"
 *               content:
 *                 type: array
 *                 description: 게시글 내용
 *                 items:
 *                   $ref: '#/components/schemas/ContentItem'
 *                 example:
 *                   - type: "text"
 *                     order: 1
 *                     content: "오늘도 화이팅!"
 *                   - type: "image"
 *                     order: 2
 *                     url: "https://example.com/image.jpg"
 *                     width: 1080
 *                     height: 1080
 *                     blurHash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4"
 *                     mimeType: "image/jpeg"
 *                     processingStatus: "ready"
 *               refId:
 *                 type: string
 *                 description: 참조 ID (루틴/소모임/TMI 프로젝트 ID)
 *                 example: "routine_123"
 *               visibility:
 *                 type: string
 *                 enum: [public, private]
 *                 default: public
 *                 description: 게시글 공개 범위
 *                 example: "public"
 *               category:
 *                 type: string
 *                 description: 카테고리
 *                 example: "한끗루틴"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 태그 목록
 *                 example: ["운동", "루틴", "인증"]
 *               scheduledDate:
 *                 type: string
 *                 format: date-time
 *                 description: 예약 발행 날짜
 *                 example: "2025-10-03T17:15:04.882Z"
 *           example:
 *             title: "오늘의 루틴 인증!"
 *             content:
 *               - type: "text"
 *                 order: 1
 *                 content: "오늘도 화이팅!"
 *               - type: "image"
 *                 order: 2
 *                 url: "https://example.com/image.jpg"
 *                 width: 1080
 *                 height: 1080
 *                 blurHash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4"
 *                 mimeType: "image/jpeg"
 *                 processingStatus: "ready"
 *             refId: "routine_123"
 *             visibility: "public"
 *             category: "한끗루틴"
 *             tags: ["운동", "루틴", "인증"]
 *             scheduledDate: "2025-10-03T17:15:04.882Z"
 *     responses:
 *       201:
 *         description: 게시글 작성 성공
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
 *                     id:
 *                       type: string
 *                       description: 생성된 게시글 ID
 *                       example: "AMrsQRg9tBY0ZGJMbKG2"
 *                     type:
 *                       type: string
 *                       description: 게시글 타입
 *                       example: "TMI"
 *                     refId:
 *                       type: string
 *                       nullable: true
 *                       description: 참조 ID (루틴/소모임/TMI 프로젝트 ID)
 *                       example: "routine_123"
 *                     authorId:
 *                       type: string
 *                       description: 작성자 ID
 *                       example: "user123"
 *                     author:
 *                       type: string
 *                       description: 작성자 닉네임
 *                       example: "사용자닉네임"
 *                     communityPath:
 *                       type: string
 *                       description: 커뮤니티 경로
 *                       example: "communities/tmi-community"
 *                     title:
 *                       type: string
 *                       description: 게시글 제목
 *                       example: "오늘의 루틴 인증!"
 *                     content:
 *                       type: array
 *                       description: 게시글 내용
 *                       items:
 *                         $ref: '#/components/schemas/ContentItem'
 *                     media:
 *                       type: array
 *                       description: 미디어 목록
 *                       items:
 *                         $ref: '#/components/schemas/MediaItem'
 *                     channel:
 *                       type: string
 *                       description: 채널명
 *                       example: "TMI 자아탐색"
 *                     category:
 *                       type: string
 *                       description: 카테고리
 *                       example: "한끗루틴"
 *                     tags:
 *                       type: array
 *                       description: 태그 목록
 *                       items:
 *                         type: string
 *                       example: ["운동", "루틴", "인증"]
 *                     scheduledDate:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                       description: 예약 발행 날짜
 *                       example: "2025-10-03T17:15:04.882Z"
 *                     isLocked:
 *                       type: boolean
 *                       description: 잠금 여부
 *                       example: false
 *                     visibility:
 *                       type: string
 *                       description: 공개 범위
 *                       example: "public"
 *                     rewardGiven:
 *                       type: boolean
 *                       description: 리워드 지급 여부
 *                       example: false
 *                     reactionsCount:
 *                       type: number
 *                       description: 반응 수
 *                       example: 0
 *                     likesCount:
 *                       type: number
 *                       description: 좋아요 수
 *                       example: 0
 *                     commentsCount:
 *                       type: number
 *                       description: 댓글 수
 *                       example: 0
 *                     reportsCount:
 *                       type: number
 *                       description: 신고 수
 *                       example: 0
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: 생성일시
 *                       example: "2025-10-03T17:15:07.862Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       description: 수정일시
 *                       example: "2025-10-03T17:15:07.862Z"
 *                 message:
 *                   type: string
 *                   example: "게시글이 성공적으로 작성되었습니다."
 *       400:
 *         description: 잘못된 요청
 *       404:
 *         description: 커뮤니티를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.post("/:communityId/posts", authGuard, communityController.createPost);

// 커뮤니티 게시글 상세 조회
/**
 * @swagger
 * /communities/{communityId}/posts/{postId}:
 *   get:
 *     tags: [Communities]
 *     summary: 커뮤니티 게시글 상세 조회
 *     description: 특정 커뮤니티의 게시글 상세 정보 조회
 *     parameters:
 *       - in: path
 *         name: communityId
 *         required: true
 *         schema:
 *           type: string
 *         description: 커뮤니티 ID
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: 게시글 ID
 *     responses:
 *       200:
 *         description: 게시글 상세 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/CommunityPost'
 *                     - type: object
 *                       properties:
 *                         replies:
 *                           type: array
 *                           description: 댓글 목록
 *       404:
 *         description: 게시글을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.get("/:communityId/posts/:postId", communityController.getPostById);

// 커뮤니티 게시글 수정
/**
 * @swagger
 * /communities/{communityId}/posts/{postId}:
 *   put:
 *     tags: [Communities]
 *     summary: 커뮤니티 게시글 수정
 *     description: 특정 커뮤니티의 게시글 수정
 *     parameters:
 *       - in: path
 *         name: communityId
 *         required: true
 *         schema:
 *           type: string
 *         description: 커뮤니티 ID
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: 게시글 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: 게시글 제목
 *                 example: "수정된 루틴 인증!"
 *               content:
 *                 type: array
 *                 description: 게시글 내용
 *                 items:
 *                   $ref: '#/components/schemas/ContentItem'
 *                 example:
 *                   - type: "text"
 *                     order: 1
 *                     content: "수정된 내용입니다!"
 *                   - type: "image"
 *                     order: 2
 *                     url: "https://example.com/updated-image.jpg"
 *                     width: 1080
 *                     height: 1080
 *                     blurHash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4"
 *                     mimeType: "image/jpeg"
 *                     processingStatus: "ready"
 *               refId:
 *                 type: string
 *                 description: 참조 ID (루틴/소모임/TMI 프로젝트 ID)
 *                 example: "routine_123"
 *               visibility:
 *                 type: string
 *                 enum: [public, private]
 *                 default: public
 *                 description: 게시글 공개 범위
 *                 example: "public"
 *               category:
 *                 type: string
 *                 description: 카테고리
 *                 example: "한끗루틴"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 태그 목록
 *                 example: ["운동", "루틴", "인증"]
 *               scheduledDate:
 *                 type: string
 *                 format: date-time
 *                 description: 예약 발행 날짜
 *                 example: "2025-10-03T17:15:04.882Z"
 *           example:
 *             title: "수정된 루틴 인증!"
 *             content:
 *               - type: "text"
 *                 order: 1
 *                 content: "수정된 내용입니다!"
 *               - type: "image"
 *                 order: 2
 *                 url: "https://example.com/updated-image.jpg"
 *                 width: 1080
 *                 height: 1080
 *                 blurHash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4"
 *                 mimeType: "image/jpeg"
 *                 processingStatus: "ready"
 *             refId: "routine_123"
 *             visibility: "public"
 *             category: "한끗루틴"
 *             tags: ["운동", "루틴", "인증"]
 *             scheduledDate: "2025-10-03T17:15:04.882Z"
 *     responses:
 *       200:
 *         description: 게시글 수정 성공
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
 *                       description: 게시글 ID
 *                       example: "AMrsQRg9tBY0ZGJMbKG2"
 *                     type:
 *                       type: string
 *                       description: 게시글 타입
 *                       example: "TMI"
 *                     refId:
 *                       type: string
 *                       nullable: true
 *                       description: 참조 ID (루틴/소모임/TMI 프로젝트 ID)
 *                       example: "routine_123"
 *                     authorId:
 *                       type: string
 *                       description: 작성자 ID
 *                       example: "user123"
 *                     author:
 *                       type: string
 *                       description: 작성자 닉네임
 *                       example: "사용자닉네임"
 *                     communityPath:
 *                       type: string
 *                       description: 커뮤니티 경로
 *                       example: "communities/tmi-community"
 *                     title:
 *                       type: string
 *                       description: 게시글 제목
 *                       example: "수정된 루틴 인증!"
 *                     content:
 *                       type: array
 *                       description: 게시글 내용
 *                       items:
 *                         $ref: '#/components/schemas/ContentItem'
 *                     media:
 *                       type: array
 *                       description: 미디어 목록
 *                       items:
 *                         $ref: '#/components/schemas/MediaItem'
 *                     channel:
 *                       type: string
 *                       description: 채널명
 *                       example: "TMI 자아탐색"
 *                     category:
 *                       type: string
 *                       description: 카테고리
 *                       example: "한끗루틴"
 *                     tags:
 *                       type: array
 *                       description: 태그 목록
 *                       items:
 *                         type: string
 *                       example: ["운동", "루틴", "인증"]
 *                     scheduledDate:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                       description: 예약 발행 날짜
 *                       example: "2025-10-03T17:15:04.882Z"
 *                     isLocked:
 *                       type: boolean
 *                       description: 잠금 여부
 *                       example: false
 *                     visibility:
 *                       type: string
 *                       description: 공개 범위
 *                       example: "public"
 *                     rewardGiven:
 *                       type: boolean
 *                       description: 리워드 지급 여부
 *                       example: false
 *                     reactionsCount:
 *                       type: number
 *                       description: 반응 수
 *                       example: 0
 *                     likesCount:
 *                       type: number
 *                       description: 좋아요 수
 *                       example: 0
 *                     commentsCount:
 *                       type: number
 *                       description: 댓글 수
 *                       example: 0
 *                     reportsCount:
 *                       type: number
 *                       description: 신고 수
 *                       example: 0
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: 생성일시
 *                       example: "2025-10-03T17:15:07.862Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       description: 수정일시
 *                       example: "2025-10-03T18:30:15.123Z"
 *                 message:
 *                   type: string
 *                   example: "게시글이 성공적으로 수정되었습니다."
 *       400:
 *         description: 잘못된 요청
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 게시글을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.put("/:communityId/posts/:postId", authGuard, communityController.updatePost);

// 커뮤니티 게시글 삭제
/**
 * @swagger
 * /communities/{communityId}/posts/{postId}:
 *   delete:
 *     tags: [Communities]
 *     summary: 커뮤니티 게시글 삭제
 *     description: 특정 커뮤니티의 게시글 삭제
 *     parameters:
 *       - in: path
 *         name: communityId
 *         required: true
 *         schema:
 *           type: string
 *         description: 커뮤니티 ID
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: 게시글 ID
 *     responses:
 *       204:
 *         description: 게시글 삭제 성공
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
 *                   example: "잘못된 요청입니다"
 *       403:
 *         description: 권한 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 403
 *                 message:
 *                   type: string
 *                   example: "권한이 없습니다"
 *       404:
 *         description: 게시글을 찾을 수 없음
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
 *                   example: "게시글을 찾을 수 없습니다"
 *       500:
 *         description: 서버 오류
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
 *                   example: "서버 내부 오류가 발생했습니다"
 */
router.delete("/:communityId/posts/:postId", authGuard, communityController.deletePost);

// 커뮤니티 게시글 좋아요 토글
/**
 * @swagger
 * /communities/{communityId}/posts/{postId}/like:
 *   post:
 *     tags: [Communities]
 *     summary: 커뮤니티 게시글 좋아요 토글
 *     description: 특정 커뮤니티 게시글의 좋아요 토글
 *     parameters:
 *       - in: path
 *         name: communityId
 *         required: true
 *         schema:
 *           type: string
 *         description: 커뮤니티 ID
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: 게시글 ID
 *     responses:
 *       200:
 *         description: 좋아요 토글 성공
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
 *                     postId:
 *                       type: string
 *                       description: 게시글 ID
 *                       example: "45Sb6iETW1lNgyHBVS75"
 *                     userId:
 *                       type: string
 *                       description: 사용자 ID
 *                       example: "Z0brK3uiqrVBf4mWNCtRgXDzIbtP"
 *                     isLiked:
 *                       type: boolean
 *                       description: 좋아요 여부
 *                       example: true
 *                     likesCount:
 *                       type: integer
 *                       description: 좋아요 수
 *                       example: 1
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
 *                   example: "잘못된 요청입니다"
 *       404:
 *         description: 게시글을 찾을 수 없음
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
 *                   example: "게시글을 찾을 수 없습니다"
 *       500:
 *         description: 서버 오류
 */
router.post(
    "/:communityId/posts/:postId/like",
    authGuard,
    communityController.togglePostLike,
);

module.exports = router;
