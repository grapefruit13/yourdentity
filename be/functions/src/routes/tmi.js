const express = require("express");
const router = express.Router();
const tmiController = require("../controllers/tmiController");
const authGuard = require("../middleware/authGuard");

/**
 * @swagger
 * components:
 *   schemas:
 *     TmiProjectListItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: TMI 프로젝트 ID
 *           example: "CP:NX2YWH8MAH"
 *         name:
 *           type: string
 *           description: TMI 프로젝트 이름
 *           example: "자아탐색"
 *         description:
 *           type: string
 *           description: TMI 프로젝트 설명
 *           example: "내 안의 진짜 나를 찾는 6주 자아탐색 프로그램"
 *         status:
 *           type: string
 *           enum: [OPEN, CLOSED, COMPLETED]
 *           description: TMI 프로젝트 상태
 *           example: "OPEN"
 *         price:
 *           type: number
 *           description: 가격
 *           example: 0
 *         currency:
 *           type: string
 *           description: 통화
 *           example: "KRW"
 *         stockCount:
 *           type: integer
 *           description: 재고 수량
 *           example: 14
 *         soldCount:
 *           type: integer
 *           description: 판매 수량
 *           example: 6
 *         viewCount:
 *           type: integer
 *           description: 조회수
 *           example: 124
 *         buyable:
 *           type: boolean
 *           description: 구매 가능 여부
 *           example: true
 *         sellerId:
 *           type: string
 *           description: 판매자 ID
 *           example: "CS:NOZU0HZP"
 *         sellerName:
 *           type: string
 *           description: 판매자 이름
 *           example: "유스보이스"
 *         deadline:
 *           type: object
 *           description: 마감일 (Firestore timestamp)
 *           properties:
 *             _seconds:
 *               type: integer
 *               description: 초 단위 timestamp
 *               example: 1762001210
 *             _nanoseconds:
 *               type: integer
 *               description: 나노초 단위
 *               example: 409000000
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 생성일
 *           example: "2025-10-02T12:46:50.409Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 수정일
 *           example: "2025-10-03T17:45:34.831Z"
 *
 *     TmiProject:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: TMI 프로젝트 ID
 *           example: "tmi_123"
 *         name:
 *           type: string
 *           description: TMI 프로젝트 이름
 *           example: "자아탐색 프로젝트"
 *         description:
 *           type: string
 *           description: TMI 프로젝트 설명
 *           example: "나를 더 깊이 알아가는 프로젝트입니다"
 *         status:
 *           type: string
 *           enum: [RECRUITING, IN_PROGRESS, COMPLETED]
 *           description: TMI 프로젝트 상태
 *           example: "RECRUITING"
 *         price:
 *           type: number
 *           description: 가격
 *           example: 3000
 *         currency:
 *           type: string
 *           description: 통화
 *           example: "KRW"
 *         stockCount:
 *           type: integer
 *           description: 재고 수량
 *           example: 15
 *         soldCount:
 *           type: integer
 *           description: 판매 수량
 *           example: 8
 *         viewCount:
 *           type: integer
 *           description: 조회수 (업데이트된 값)
 *           example: 45
 *         buyable:
 *           type: boolean
 *           description: 구매 가능 여부
 *           example: true
 *         sellerId:
 *           type: string
 *           description: 판매자 ID
 *           example: "seller_123"
 *         sellerName:
 *           type: string
 *           description: 판매자 이름
 *           example: "TMI 코치"
 *         content:
 *           type: array
 *           description: TMI 프로젝트 상세 내용
 *           items:
 *             $ref: '#/components/schemas/ContentItem'
 *         media:
 *           type: array
 *           description: 미디어 파일
 *           items:
 *             $ref: '#/components/schemas/MediaItem'
 *         options:
 *           type: array
 *           description: 옵션 목록
 *           items:
 *             type: object
 *         primaryDetails:
 *           type: array
 *           description: 주요 상세 정보
 *           items:
 *             type: object
 *         variants:
 *           type: array
 *           description: 변형 옵션
 *           items:
 *             type: object
 *         customFields:
 *           type: array
 *           description: 커스텀 필드
 *           items:
 *             type: object
 *         deadline:
 *           type: string
 *           format: date-time
 *           description: 마감일
 *           example: "2024-12-31T23:59:59.000Z"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 생성일
 *           example: "2024-01-01T00:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 수정일
 *           example: "2024-01-01T00:00:00.000Z"
 *         qna:
 *           type: array
 *           description: Q&A 목록
 *           items:
 *             $ref: '#/components/schemas/QnAItem'
 *         communityPosts:
 *           type: array
 *           description: 커뮤니티 게시글 목록 (TMI 소개글)
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: 게시글 ID
 *                 example: "post_123"
 *               type:
 *                 type: string
 *                 description: 게시글 타입
 *                 example: "TMI"
 *               author:
 *                 type: string
 *                 description: 작성자
 *                 example: "사용자닉네임"
 *               title:
 *                 type: string
 *                 description: 제목
 *                 example: "TMI 소개글입니다!"
 *               content:
 *                 type: array
 *                 description: 게시글 내용
 *                 items:
 *                   $ref: '#/components/schemas/ContentItem'
 *               media:
 *                 type: array
 *                 description: 미디어
 *                 items:
 *                   $ref: '#/components/schemas/MediaItem'
 *               channel:
 *                 type: string
 *                 description: 채널명
 *                 example: "TMI 자아탐색"
 *               isLocked:
 *                 type: boolean
 *                 description: 잠금 여부
 *                 example: false
 *               visibility:
 *                 type: string
 *                 description: 공개 범위
 *                 example: "public"
 *               likesCount:
 *                 type: integer
 *                 description: 좋아요 수
 *                 example: 5
 *               commentsCount:
 *                 type: integer
 *                 description: 댓글 수
 *                 example: 2
 *               createdAt:
 *                 type: string
 *                 format: date-time
 *                 description: 생성일
 *                 example: "2024-01-01T00:00:00.000Z"
 *               updatedAt:
 *                 type: string
 *                 format: date-time
 *                 description: 수정일
 *                 example: "2024-01-01T00:00:00.000Z"
 *               community:
 *                 type: object
 *                 description: 커뮤니티 정보
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: 커뮤니티 ID
 *                     example: "tmi_123"
 *                   name:
 *                     type: string
 *                     description: 커뮤니티 이름
 *                     example: "TMI 커뮤니티"
 */

// TMI 프로젝트 목록 조회
/**
 * @swagger
 * /tmis:
 *   get:
 *     tags: [TMI]
 *     summary: TMI 프로젝트 목록 조회
 *     description: 모든 TMI 프로젝트 목록을 페이지네이션으로 조회
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
 *         description: TMI 프로젝트 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TmiProjectListItem'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     pageNumber:
 *                       type: integer
 *                       example: 0
 *                     pageSize:
 *                       type: integer
 *                       example: 10
 *                     totalElements:
 *                       type: integer
 *                       example: 3
 *                     totalPages:
 *                       type: integer
 *                       example: 1
 *                     hasNext:
 *                       type: boolean
 *                       example: false
 *                     hasPrevious:
 *                       type: boolean
 *                       example: false
 *                     isFirst:
 *                       type: boolean
 *                       example: true
 *                     isLast:
 *                       type: boolean
 *                       example: true
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
router.get("/", tmiController.getAllTmiProjects);

// TMI 프로젝트 상세 조회
/**
 * @swagger
 * /tmis/{projectId}:
 *   get:
 *     tags: [TMI]
 *     summary: TMI 프로젝트 상세 조회
 *     description: 특정 TMI 프로젝트의 상세 정보와 Q&A, 커뮤니티 게시글 조회
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: TMI 프로젝트 ID
 *     responses:
 *       200:
 *         description: TMI 프로젝트 상세 조회 성공
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
 *                       description: TMI 프로젝트 ID
 *                       example: "tmi_123"
 *                     name:
 *                       type: string
 *                       description: TMI 프로젝트 이름
 *                       example: "자아탐색 프로젝트"
 *                     description:
 *                       type: string
 *                       description: TMI 프로젝트 설명
 *                       example: "나를 더 깊이 알아가는 프로젝트입니다"
 *                     status:
 *                       type: string
 *                       description: TMI 프로젝트 상태
 *                       example: "RECRUITING"
 *                     price:
 *                       type: number
 *                       description: 가격
 *                       example: 3000
 *                     currency:
 *                       type: string
 *                       description: 통화
 *                       example: "KRW"
 *                     stockCount:
 *                       type: integer
 *                       description: 재고 수량
 *                       example: 15
 *                     soldCount:
 *                       type: integer
 *                       description: 판매 수량
 *                       example: 8
 *                     viewCount:
 *                       type: integer
 *                       description: 조회수 (업데이트된 값)
 *                       example: 45
 *                     buyable:
 *                       type: boolean
 *                       description: 구매 가능 여부
 *                       example: true
 *                     sellerId:
 *                       type: string
 *                       description: 판매자 ID
 *                       example: "seller_123"
 *                     sellerName:
 *                       type: string
 *                       description: 판매자 이름
 *                       example: "TMI 코치"
 *                     content:
 *                       type: array
 *                       description: TMI 프로젝트 상세 내용
 *                       items:
 *                         $ref: '#/components/schemas/ContentItem'
 *                     media:
 *                       type: array
 *                       description: 미디어 파일
 *                       items:
 *                         $ref: '#/components/schemas/MediaItem'
 *                     options:
 *                       type: array
 *                       description: 옵션 목록
 *                       example: []
 *                     primaryDetails:
 *                       type: array
 *                       description: 주요 상세 정보
 *                       example: []
 *                     variants:
 *                       type: array
 *                       description: 변형 옵션
 *                       example: []
 *                     customFields:
 *                       type: array
 *                       description: 커스텀 필드
 *                       example: []
 *                     deadline:
 *                       type: string
 *                       format: date-time
 *                       description: 마감일
 *                       example: "2024-12-31T23:59:59.000Z"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: 생성일
 *                       example: "2024-01-01T00:00:00.000Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       description: 수정일
 *                       example: "2024-01-01T00:00:00.000Z"
     *                     qna:
     *                       type: array
     *                       description: Q&A 목록
     *                       items:
     *                         $ref: '#/components/schemas/QnAItem'
     *                       example:
     *                         - id: "qna_123"
     *                           userId: "user123"
     *                           content:
     *                             - type: "text"
     *                               content: "이 TMI 프로젝트는 어떻게 진행되나요?"
     *                           media: []
     *                           answerContent: null
     *                           answerMedia: []
     *                           answerUserId: null
     *                           askedBy: "user123"
     *                           answeredBy: null
     *                           askedAt: "2024-01-01T00:00:00.000Z"
     *                           answeredAt: null
     *                           likesCount: 0
 *                     communityPosts:
 *                       type: array
 *                       description: 커뮤니티 게시글 목록 (TMI 소개글)
 *                       items:
 *                         type: object
 *                         properties:
     *                           id:
     *                             type: string
     *                             description: 게시글 ID
     *                             example: "post_123"
     *                           type:
     *                             type: string
     *                             description: 게시글 타입
     *                             example: "TMI"
     *                           authorId:
     *                             type: string
     *                             description: 작성자 ID (uid)
     *                             example: "user_123"
     *                           author:
     *                             type: string
     *                             description: 작성자 닉네임
     *                             example: "사용자닉네임"
     *                           title:
     *                             type: string
     *                             description: 제목
     *                             example: "TMI 소개글입니다!"
 *                           content:
 *                             type: array
 *                             description: 게시글 내용
 *                             items:
 *                               $ref: '#/components/schemas/ContentItem'
 *                           media:
 *                             type: array
 *                             description: 미디어
 *                             items:
 *                               $ref: '#/components/schemas/MediaItem'
 *                           channel:
 *                             type: string
 *                             description: 채널명
 *                             example: "TMI 자아탐색"
 *                           isLocked:
 *                             type: boolean
 *                             description: 잠금 여부
 *                             example: false
 *                           visibility:
 *                             type: string
 *                             description: 공개 범위
 *                             example: "public"
 *                           likesCount:
 *                             type: integer
 *                             description: 좋아요 수
 *                             example: 5
 *                           commentsCount:
 *                             type: integer
 *                             description: 댓글 수
 *                             example: 2
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             description: 생성일
 *                             example: "2024-01-01T00:00:00.000Z"
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             description: 수정일
 *                             example: "2024-01-01T00:00:00.000Z"
 *                           community:
 *                             type: object
 *                             description: 커뮤니티 정보
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 description: 커뮤니티 ID
 *                                 example: "tmi_123"
 *                               name:
 *                                 type: string
 *                                 description: 커뮤니티 이름
 *                                 example: "TMI 커뮤니티"
 *                       example: []
 *       404:
 *         description: TMI 프로젝트를 찾을 수 없음
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
 *                   example: "TMI 프로젝트를 찾을 수 없습니다"
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
router.get("/:projectId", tmiController.getTmiProjectById);

// TMI 프로젝트 신청
/**
 * @swagger
 * /tmis/{projectId}/apply:
 *   post:
 *     tags: [TMI]
 *     summary: TMI 프로젝트 신청
 *     description: 특정 TMI 프로젝트에 신청
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: TMI 프로젝트 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               selectedVariant:
 *                 type: string
 *                 description: 선택된 옵션
 *               quantity:
 *                 type: integer
 *                 default: 1
 *                 description: 신청 수량
 *               customFieldsResponse:
 *                 type: object
 *                 description: 커스텀 필드 응답
 *                 example:
 *                   custom_1: "홍길동"
 *                   custom_2: "한끗러버"
 *                   custom_3: "20070712"
 *                   custom_4: "서울시 성동구"
 *                   custom_5: "5"
 *                   custom_6: "인스타그램"
 *                   custom_7: "네, 확인했습니다"
 *     responses:
 *       201:
 *         description: TMI 프로젝트 신청 성공
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
 *                     applicationId:
 *                       type: string
 *                     type:
 *                       type: string
 *                       example: "TMI"
 *                     targetId:
 *                       type: string
 *                     userId:
 *                       type: string
 *                     status:
 *                       type: string
 *                       example: "PENDING"
 *       400:
 *         description: 잘못된 요청 또는 품절
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
 *                   example: "TMI 프로젝트가 품절되었습니다"
 *       404:
 *         description: TMI 프로젝트를 찾을 수 없음
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
 *                   example: "TMI 프로젝트를 찾을 수 없습니다"
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
router.post("/:projectId/apply", authGuard, tmiController.applyToTmiProject);

// TMI 프로젝트 좋아요 토글
/**
 * @swagger
 * /tmis/{projectId}/like:
 *   post:
 *     tags: [TMI]
 *     summary: TMI 프로젝트 좋아요 토글
 *     description: 특정 TMI 프로젝트의 좋아요 토글
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: TMI 프로젝트 ID
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
 *                     projectId:
 *                       type: string
 *                     userId:
 *                       type: string
 *                     isLiked:
 *                       type: boolean
 *                       example: true
 *                     likeCount:
 *                       type: integer
 *                       example: 5
 *       404:
 *         description: TMI 프로젝트를 찾을 수 없음
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
 *                   example: "TMI 프로젝트를 찾을 수 없습니다"
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
router.post("/:projectId/like", authGuard, tmiController.toggleTmiProjectLike);

// TMI 프로젝트 QnA 작성
/**
 * @swagger
 * /tmis/{projectId}/qna:
 *   post:
 *     tags: [TMI]
 *     summary: TMI 프로젝트 Q&A 질문 작성
 *     description: 특정 TMI 프로젝트에 Q&A 질문 작성
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: TMI 프로젝트 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: array
 *                 description: 질문 내용
 *                 example:
 *                   - type: "text"
 *                     text: "TMI 프로젝트는 어떤 내용인가요?"
 *                   - type: "text"
 *                     text: "참여 기간은 얼마나 되나요?"
 *                   - type: "image"
 *                     src: "https://example.com/tmi-question.jpg"
 *                     width: 1080
 *                     height: 1080
 *                     blurHash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4"
 *                   - type: "video"
 *                     src: "https://example.com/tmi-video.mp4"
 *                     width: 1920
 *                     height: 1080
 *                     duration: 60
 *                     thumbUrl: "https://example.com/tmi-thumb.jpg"
 *                     videoSource: "uploaded"
 *                     provider: "self"
 *                     sizeBytes: 3145728
 *                     mimeType: "video/mp4"
 *                     processingStatus: "ready"
 *     responses:
 *       201:
 *         description: Q&A 질문 작성 성공
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
 *                     qnaId:
 *                       type: string
 *                       example: "qna_123"
 *                     projectId:
 *                       type: string
 *                       example: "tmi_123"
 *                     userId:
 *                       type: string
 *                       example: "user_123"
 *                     content:
 *                       type: array
 *                       description: 질문 내용
 *                       items:
 *                         type: object
 *                     media:
 *                       type: array
 *                       description: 미디어 파일
 *                       items:
 *                         type: object
 *                     answerContent:
 *                       type: array
 *                       nullable: true
 *                       description: 답변 내용
 *                       items:
 *                         type: object
 *                     answerMedia:
 *                       type: array
 *                       description: 답변 미디어
 *                       items:
 *                         type: object
 *                     likesCount:
 *                       type: integer
 *                       example: 0
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-01T00:00:00.000Z"
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
 *                   example: "질문 내용이 필요합니다"
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
router.post("/:projectId/qna", authGuard, tmiController.createQnA);

// TMI 프로젝트 QnA 수정
/**
 * @swagger
 * /tmis/{projectId}/qna/{qnaId}:
 *   put:
 *     tags: [TMI]
 *     summary: TMI 프로젝트 Q&A 질문 수정
 *     description: 특정 TMI 프로젝트의 Q&A 질문 수정
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: TMI 프로젝트 ID
 *       - in: path
 *         name: qnaId
 *         required: true
 *         schema:
 *           type: string
 *         description: Q&A ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: array
 *                 description: 수정된 질문 내용
 *                 example:
 *                   - type: "text"
 *                     text: "TMI 프로젝트는 어떤 내용인가요? (수정됨)"
 *                   - type: "text"
 *                     text: "참여 기간은 얼마나 되나요?"
 *                   - type: "image"
 *                     src: "https://example.com/updated-tmi-question.jpg"
 *                     width: 1080
 *                     height: 1080
 *                     blurHash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4"
 *                   - type: "video"
 *                     src: "https://example.com/updated-tmi-video.mp4"
 *                     width: 1920
 *                     height: 1080
 *                     duration: 60
 *                     thumbUrl: "https://example.com/updated-tmi-thumb.jpg"
 *                     videoSource: "uploaded"
 *                     provider: "self"
 *                     sizeBytes: 3145728
 *                     mimeType: "video/mp4"
 *                     processingStatus: "ready"
 *     responses:
 *       200:
 *         description: Q&A 질문 수정 성공
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
 *                     qnaId:
 *                       type: string
 *                       example: "qna_123"
 *                     projectId:
 *                       type: string
 *                       example: "tmi_123"
 *                     userId:
 *                       type: string
 *                       example: "user_123"
 *                     content:
 *                       type: array
 *                       description: 수정된 질문 내용
 *                       items:
 *                         type: object
 *                     media:
 *                       type: array
 *                       description: 미디어 파일
 *                       items:
 *                         type: object
 *                     answerContent:
 *                       type: array
 *                       nullable: true
 *                       description: 답변 내용
 *                       items:
 *                         type: object
 *                     answerMedia:
 *                       type: array
 *                       description: 답변 미디어
 *                       items:
 *                         type: object
 *                     likesCount:
 *                       type: integer
 *                       example: 0
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-01T00:00:00.000Z"
 *       404:
 *         description: Q&A를 찾을 수 없음
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
 *                   example: "Q&A를 찾을 수 없습니다"
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
router.put("/:projectId/qna/:qnaId", authGuard, tmiController.updateQnA);


// TMI 프로젝트 QnA 좋아요 토글
/**
 * @swagger
 * /tmis/qna/{qnaId}/like:
 *   post:
 *     tags: [TMI]
 *     summary: TMI 프로젝트 Q&A 좋아요 토글
 *     description: 특정 Q&A의 좋아요 토글
 *     parameters:
 *       - in: path
 *         name: qnaId
 *         required: true
 *         schema:
 *           type: string
 *         description: Q&A ID
 *     responses:
 *       200:
 *         description: Q&A 좋아요 토글 성공
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
 *                     qnaId:
 *                       type: string
 *                     userId:
 *                       type: string
 *                     isLiked:
 *                       type: boolean
 *                       example: true
 *                     likeCount:
 *                       type: integer
 *                       example: 3
 *       404:
 *         description: Q&A를 찾을 수 없음
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
 *                   example: "Q&A를 찾을 수 없습니다"
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
router.post("/qna/:qnaId/like", authGuard, tmiController.toggleQnALike);

// TMI 프로젝트 QnA 삭제
/**
 * @swagger
 * /tmis/qna/{qnaId}:
 *   delete:
 *     tags: [TMI]
 *     summary: TMI 프로젝트 Q&A 삭제
 *     description: 특정 Q&A 삭제
 *     parameters:
 *       - in: path
 *         name: qnaId
 *         required: true
 *         schema:
 *           type: string
 *         description: Q&A ID
 *     responses:
 *       204:
 *         description: Q&A 삭제 성공
 *       404:
 *         description: Q&A를 찾을 수 없음
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
 *                   example: "Q&A를 찾을 수 없습니다"
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
router.delete("/qna/:qnaId", tmiController.deleteQnA);

module.exports = router;
