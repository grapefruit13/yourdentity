const express = require("express");
const router = express.Router();
const communityController = require("../controllers/communityController");
const authGuard = require("../middleware/authGuard");
const optionalAuth = require("../middleware/optionalAuth");

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
 *         programType:
 *           type: string
 *           enum: [ROUTINE, GATHERING, TMI]
 *           description: 프로그램 타입 (루틴/소모임/TMI)
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
     *           example: "TzZcfj7sTrhQdOvUW4f5"
     *         author:
     *           type: string
     *           description: 작성자 닉네임
     *           example: "익명"
     *         title:
     *           type: string
     *           description: 제목
     *           example: "오늘의 루틴 인증!"
     *         type:
     *           type: string
     *           description: 게시글 타입
     *           example: "GENERAL"
 *         content:
 *           type: string
 *           description: 게시글 HTML 내용
 *           example: "<p>게시글 내용입니다!</p>"
 *         communityId:
 *           type: string
 *           description: 커뮤니티 ID
 *           example: "CP:VYTTZW33IH"
     *         channel:
     *           type: string
     *           description: 채널명
     *           example: "TMI 자아탐색"
     *         category:
     *           type: string
     *           description: 카테고리
     *           example: "한끗루틴"
     *         scheduledDate:
 *           type: string
 *           format: date-time
 *           description: 예약 발행 날짜
 *           example: "2025-10-03T17:15:04.882Z"
     *         isLocked:
     *           type: boolean
     *           description: 잠금 여부
     *           example: false
*         isPublic:
*           type: boolean
*           description: 게시글 공개 여부
*           example: true
 *         rewardGiven:
 *           type: boolean
 *           description: 리워드 지급 여부
 *           example: false
 *         likesCount:
 *           type: integer
 *           description: 좋아요 수
 *           example: 0
 *         commentsCount:
 *           type: integer
 *           description: 댓글 수
 *           example: 0
 *         reportsCount:
 *           type: integer
 *           description: 신고 수
 *           example: 0
 *         viewCount:
 *           type: integer
 *           description: 조회수
 *           example: 0
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 생성일
 *           example: "2025-10-03T17:15:07.862Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 수정일
 *           example: "2025-10-03T18:30:15.123Z"
     *         timeAgo:
     *           type: string
     *           description: 상대적 시간
     *           example: "2분 전"
     *         communityPath:
     *           type: string
     *           description: 커뮤니티 경로
     *           example: "communities/CP:VYTTZW33IH"
     *         community:
     *           type: object
     *           description: 커뮤니티 정보
     *           properties:
 *             id:
 *               type: string
 *               description: 커뮤니티 ID
 *               example: "CP:VYTTZW33IH"
 *             name:
 *               type: string
 *               description: 커뮤니티 이름
 *               example: "TMI 자아탐색"
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
 *                         pageNumber:
 *                           type: integer
 *                         pageSize:
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
 *     summary: "전체 커뮤니티 게시글 조회(필터링 가능), 로그인 시 isPublic: false인 게시글 조회 가능"
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
 *         name: programType
 *         schema:
 *           type: string
 *           enum: [ROUTINE, GATHERING, TMI]
 *         description: "프로그램 타입 필터 (예: programType=ROUTINE,GATHERING 또는 programType=ROUTINE&programType=GATHERING)"
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
 *                         $ref: '#/components/schemas/CommunityPost'
 *                       example:
 *                         - id: "jpb8WjP7poOmI07Z7tU8"
 *                           type: "TMI_CERT"
 *                           programType: "TMI"
 *                           isReview: false
 *                           author: "사용자닉네임"
 *                           title: "수정된 TMI 인증!"
 *                           preview:
 *                             description: "오늘도 화이팅!"
 *                             thumbnail:
 *                               url: "https://example.com/image.jpg"
 *                               width: 1080
 *                               height: 1080
 *                               blurHash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4"
 *                           channel: "TMI 자아탐색"
 *                           category: "string"
 *                           scheduledDate: "2025-10-03T17:15:04.882Z"
 *                           isLocked: false
 *                           isPublic: true
 *                           rewardGiven: false
 *                           reportsCount: 0
 *                           viewCount: 0
 *                           likesCount: 0
 *                           commentsCount: 0
 *                           createdAt: "2025-10-03T17:15:07.862Z"
 *                           updatedAt: "2025-10-23T16:37:23.780Z"
 *                           community:
 *                             id: "CP:VYTTZW33IH"
 *                             name: "TMI 자아탐색"
 *                           timeAgo: "2분 전"
 *                           communityPath: "communities/CP:VYTTZW33IH"
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         pageNumber:
 *                           type: integer
 *                           example: 0
 *                         pageSize:
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
router.get("/posts", optionalAuth,communityController.getAllCommunityPosts);




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
 *                 type: string
 *                 description: 게시글 HTML 내용
 *                 example: "<p>오늘도 화이팅!</p><img src=\"https://example.com/image.jpg\" width=\"1080\" height=\"1080\" data-blurhash=\"L6PZfSi_.AyE_3t7t7R**0o#DgR4\" data-mimetype=\"image/jpeg\"/>"
 *               media:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 미디어 파일 경로 목록 (파일 업로드 후 받은 fileName 값들)
 *                 example: ["files/user123/image_abc123.jpg", "files/user123/video_def456.mp4"]
 *               category:
 *                 type: string
 *                 description: 카테고리
 *                 example: "한끗루틴"
 *               scheduledDate:
 *                 type: string
 *                 format: date-time
 *                 description: 예약 발행 날짜
 *                 example: "2025-10-03"
 *               isReview:
 *                 type: boolean
 *                 description: 후기 글 여부(true=후기, false=인증)
 *                 example: false
 *               isPublic:
 *                 type: boolean
 *                 description: 게시글 공개 여부
 *                 example: true
 *           example:
 *             title: "오늘의 루틴 인증!"
 *             content: "<p>오늘도 화이팅!</p><img src=\"https://example.com/image.jpg\" width=\"1080\" height=\"1080\" data-blurhash=\"L6PZfSi_.AyE_3t7t7R**0o#DgR4\" data-mimetype=\"image/jpeg\"/>"
 *             media: ["files/user123/image_abc123.jpg"]
 *             category: "한끗루틴"
 *             scheduledDate: "2025-10-03"
 *             isReview: false
 *             isPublic: true
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
 *                       example: "TMI_CERT"
 *                     programType:
 *                       type: string
 *                       description: 프로그램 타입
 *                       example: "TMI"
 *                     isReview:
 *                       type: boolean
 *                       description: 후기 글 여부
 *                       example: false
 *                     communityId:
 *                       type: string
 *                       description: 커뮤니티 ID
 *                       example: "CP:VYTTZW33IH"
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
 *                       type: string
 *                       description: 게시글 HTML 내용
 *                       example: "<p>게시글 내용입니다!</p>"
 *                     media:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: 미디어 파일 경로 목록
 *                       example: ["files/eVyK7rI0-_PM/qr_x4WtsPDPmozu.png"]
 *                     channel:
 *                       type: string
 *                       description: 채널명
 *                       example: "TMI 자아탐색"
 *                     category:
 *                       type: string
 *                       description: 카테고리
 *                       example: "한끗루틴"
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
*                     isPublic:
*                       type: boolean
*                       description: 게시글 공개 여부
*                       example: true
 *                     rewardGiven:
 *                       type: boolean
 *                       description: 리워드 지급 여부
 *                       example: false
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
 *                     viewCount:
 *                       type: number
 *                       description: 조회수
 *                       example: 0
 *                     community:
 *                       type: object
 *                       description: 커뮤니티 정보
 *                       properties:
 *                         id:
 *                           type: string
 *                           description: 커뮤니티 ID
 *                           example: "CP:VYTTZW33IH"
 *                         name:
 *                           type: string
 *                           description: 커뮤니티 이름
 *                           example: "TMI 자아탐색"
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
 *                 type: string
 *                 description: 게시글 HTML 내용
 *                 example: "<p>수정된 내용입니다!</p><img src=\"https://example.com/updated-image.jpg\" width=\"1080\" height=\"1080\" data-blurhash=\"L6PZfSi_.AyE_3t7t7R**0o#DgR4\" data-mimetype=\"image/jpeg\"/>"
 *               media:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 미디어 파일 경로 목록 (파일 업로드 후 받은 fileName 값들)
 *                 example: ["files/user123/image_abc123.jpg", "files/user123/video_def456.mp4"]
 *               category:
 *                 type: string
 *                 description: 카테고리
 *                 example: "한끗루틴"
 *               scheduledDate:
 *                 type: string
 *                 format: date-time
 *                 description: 예약 발행 날짜
 *                 example: "2025-10-03"
 *           example:
 *             title: "수정된 루틴 인증!"
 *             content: "<p>수정된 내용입니다!</p><img src=\"https://example.com/updated-image.jpg\" width=\"1080\" height=\"1080\" data-blurhash=\"L6PZfSi_.AyE_3t7t7R**0o#DgR4\" data-mimetype=\"image/jpeg\"/>"
 *             media: ["files/user123/image_abc123.jpg"]
 *             category: "한끗루틴"
 *             scheduledDate: "2025-10-03"
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
 *                     communityId:
 *                       type: string
 *                       description: 커뮤니티 ID
 *                       example: "CP:VYTTZW33IH"
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
 *                       type: string
 *                       description: 게시글 HTML 내용
 *                       example: "<p>게시글 내용입니다!</p>"
 *                     media:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: 미디어 파일 경로 목록
 *                       example: ["files/eVyK7rI0-_PM/qr_x4WtsPDPmozu.png"]
 *                     channel:
 *                       type: string
 *                       description: 채널명
 *                       example: "TMI 자아탐색"
 *                     category:
 *                       type: string
 *                       description: 카테고리
 *                       example: "한끗루틴"
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
*                     isPublic:
*                       type: boolean
*                       description: 게시글 공개 여부
*                       example: true
 *                     rewardGiven:
 *                       type: boolean
 *                       description: 리워드 지급 여부
 *                       example: false
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
 *                     viewCount:
 *                       type: number
 *                       description: 조회수
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
 *                     community:
 *                       type: object
 *                       description: 커뮤니티 정보
 *                       properties:
 *                         id:
 *                           type: string
 *                           description: 커뮤니티 ID
 *                           example: "CP:VYTTZW33IH"
 *                         name:
 *                           type: string
 *                           description: 커뮤니티 이름
 *                           example: "TMI 자아탐색"
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
