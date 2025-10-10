const express = require("express");
const router = express.Router();
const routineController = require("../controllers/routineController");
const authGuard = require("../middleware/authGuard");

/**
 * @swagger
 * components:
 *   schemas:
 *     RoutineListItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: 루틴 ID
 *           example: "routine_123"
 *         name:
 *           type: string
 *           description: 루틴 이름
 *           example: "매일 운동하기"
 *         description:
 *           type: string
 *           description: 루틴 설명
 *           example: "하루 30분씩 운동하는 루틴입니다"
 *         status:
 *           type: string
 *           enum: [RECRUITING, IN_PROGRESS, COMPLETED]
 *           description: 루틴 상태
 *           example: "RECRUITING"
 *         price:
 *           type: number
 *           description: 가격
 *           example: 10000
 *         currency:
 *           type: string
 *           description: 통화
 *           example: "KRW"
 *         stockCount:
 *           type: integer
 *           description: 재고 수량
 *           example: 50
 *         soldCount:
 *           type: integer
 *           description: 판매 수량
 *           example: 10
 *         viewCount:
 *           type: integer
 *           description: 조회수
 *           example: 150
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
 *           example: "유스보이스"
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
 *
 *     RoutineDetail:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: 루틴 ID
 *           example: "routine_123"
 *         name:
 *           type: string
 *           description: 루틴 이름
 *           example: "매일 운동하기"
 *         description:
 *           type: string
 *           description: 루틴 설명
 *           example: "하루 30분씩 운동하는 루틴입니다"
 *         status:
 *           type: string
 *           enum: [RECRUITING, IN_PROGRESS, COMPLETED]
 *           description: 루틴 상태
 *           example: "RECRUITING"
 *         price:
 *           type: number
 *           description: 가격
 *           example: 10000
 *         currency:
 *           type: string
 *           description: 통화
 *           example: "KRW"
 *         stockCount:
 *           type: integer
 *           description: 재고 수량
 *           example: 50
 *         soldCount:
 *           type: integer
 *           description: 판매 수량
 *           example: 10
 *         viewCount:
 *           type: integer
 *           description: 조회수
 *           example: 151
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
 *           example: "유스보이스"
 *         content:
 *           type: array
 *           description: 루틴 상세 내용
 *           items:
 *             type: object
 *         media:
 *           type: array
 *           description: 미디어 파일
 *           items:
 *             type: object
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
 *           description: 커뮤니티 게시글 목록
 *           items:
 *             $ref: '#/components/schemas/CommunityPost'
 *
 *     QnAItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Q&A ID
 *           example: "qna_123"
 *         content:
 *           type: array
 *           description: 질문 내용
 *           items:
 *             type: object
 *         media:
 *           type: array
 *           description: 미디어 파일
 *           items:
 *             type: object
 *         answerContent:
 *           type: array
 *           nullable: true
 *           description: 답변 내용
 *           items:
 *             type: object
 *         answerMedia:
 *           type: array
 *           description: 답변 미디어
 *           items:
 *             type: object
 *         answerUserId:
 *           type: string
 *           nullable: true
 *           description: 답변자 ID
 *           example: "user_456"
 *         askedBy:
 *           type: string
 *           description: 질문자 ID
 *           example: "user_123"
 *         answeredBy:
 *           type: string
 *           nullable: true
 *           description: 답변자 ID
 *           example: "user_456"
 *         askedAt:
 *           type: string
 *           format: date-time
 *           description: 질문일
 *           example: "2024-01-01T00:00:00.000Z"
 *         answeredAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: 답변일
 *           example: "2024-01-02T00:00:00.000Z"
 *         likesCount:
 *           type: integer
 *           description: 좋아요 수
 *           example: 5
 *
 *     CommunityPost:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: 게시글 ID
 *           example: "post_123"
 *         type:
 *           type: string
 *           description: 게시글 타입
 *           example: "ROUTINE_CERT"
 *         author:
 *           type: string
 *           description: 작성자
 *           example: "사용자닉네임"
 *         title:
 *           type: string
 *           description: 제목
 *           example: "오늘의 루틴 인증!"
 *         content:
 *           type: array
 *           description: 내용
 *           items:
 *             type: object
 *         media:
 *           type: array
 *           description: 미디어
 *           items:
 *             type: object
 *         channel:
 *           type: string
 *           description: 채널명
 *           example: "플래너 인증 루틴"
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
 *           example: 10
 *         commentsCount:
 *           type: integer
 *           description: 댓글 수
 *           example: 3
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
 *
 *     ApplicationResponse:
 *       type: object
 *       properties:
 *         applicationId:
 *           type: string
 *           description: 신청 ID
 *           example: "app_123"
 *         type:
 *           type: string
 *           description: 신청 타입
 *           example: "ROUTINE"
 *         targetId:
 *           type: string
 *           description: 대상 ID
 *           example: "routine_123"
 *         userId:
 *           type: string
 *           description: 사용자 ID
 *           example: "user_123"
 *         status:
 *           type: string
 *           description: 신청 상태
 *           example: "PENDING"
 *         selectedVariant:
 *           type: string
 *           nullable: true
 *           description: 선택된 옵션
 *         quantity:
 *           type: integer
 *           description: 수량
 *           example: 1
 *         customFieldsResponse:
 *           type: object
 *           description: 커스텀 필드 응답
 *         appliedAt:
 *           type: string
 *           format: date-time
 *           description: 신청일
 *           example: "2024-01-01T00:00:00.000Z"
 *         targetName:
 *           type: string
 *           description: 대상 이름
 *           example: "매일 운동하기"
 *         targetPrice:
 *           type: number
 *           description: 대상 가격
 *           example: 10000
 *
 *     LikeToggleResponse:
 *       type: object
 *       properties:
 *         routineId:
 *           type: string
 *           description: 루틴 ID
 *           example: "routine_123"
 *         userId:
 *           type: string
 *           description: 사용자 ID
 *           example: "user_123"
 *         isLiked:
 *           type: boolean
 *           description: 좋아요 여부
 *           example: true
 *         likeCount:
 *           type: integer
 *           description: 좋아요 수
 *           example: 5
 *
 *     QnALikeToggleResponse:
 *       type: object
 *       properties:
 *         qnaId:
 *           type: string
 *           description: Q&A ID
 *           example: "qna_123"
 *         userId:
 *           type: string
 *           description: 사용자 ID
 *           example: "user_123"
 *         isLiked:
 *           type: boolean
 *           description: 좋아요 여부
 *           example: true
 *         likeCount:
 *           type: integer
 *           description: 좋아요 수
 *           example: 3
 */

// 루틴 목록 조회
/**
 * @swagger
 * /routines:
 *   get:
 *     tags: [Routines]
 *     summary: 루틴 목록 조회
 *     description: 모든 루틴 목록을 페이지네이션으로 조회
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
 *         description: 루틴 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/RoutineListItem'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 0
 *                     size:
 *                       type: integer
 *                       example: 10
 *                     totalElements:
 *                       type: integer
 *                       example: 100
 *                     totalPages:
 *                       type: integer
 *                       example: 10
 *                     hasNext:
 *                       type: boolean
 *                       example: true
 *                     hasPrevious:
 *                       type: boolean
 *                       example: false
 *       500:
 *         description: 서버 오류
 */
router.get("/", routineController.getAllRoutines);

// 루틴 상세 조회
/**
 * @swagger
 * /routines/{routineId}:
 *   get:
 *     tags: [Routines]
 *     summary: 루틴 상세 조회
 *     description: 특정 루틴의 상세 정보와 Q&A, 커뮤니티 게시글 조회
 *     parameters:
 *       - in: path
 *         name: routineId
 *         required: true
 *         schema:
 *           type: string
 *         description: 루틴 ID
 *     responses:
 *       200:
 *         description: 루틴 상세 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/RoutineDetail'
 *       404:
 *         description: 루틴을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.get("/:routineId", routineController.getRoutineById);

// 루틴 신청
/**
 * @swagger
 * /routines/{routineId}/apply:
 *   post:
 *     tags: [Routines]
 *     summary: 루틴 신청
 *     description: 특정 루틴에 신청
 *     parameters:
 *       - in: path
 *         name: routineId
 *         required: true
 *         schema:
 *           type: string
 *         description: 루틴 ID
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
 *         description: 루틴 신청 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ApplicationResponse'
 *                 message:
 *                   type: string
 *                   example: "루틴 신청이 완료되었습니다."
 *       400:
 *         description: 잘못된 요청 또는 품절
 *       404:
 *         description: 루틴을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.post("/:routineId/apply", authGuard, routineController.applyForRoutine);

// 루틴 좋아요 토글
/**
 * @swagger
 * /routines/{routineId}/like:
 *   post:
 *     tags: [Routines]
 *     summary: 루틴 좋아요 토글
 *     description: 특정 루틴의 좋아요 토글
 *     parameters:
 *       - in: path
 *         name: routineId
 *         required: true
 *         schema:
 *           type: string
 *         description: 루틴 ID
 *     responses:
 *       200:
 *         description: 좋아요 토글 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/LikeToggleResponse'
 *                 message:
 *                   type: string
 *                   example: "좋아요를 추가했습니다."
 *       404:
 *         description: 루틴을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.post("/:routineId/like", authGuard, routineController.toggleRoutineLike);

// 루틴 QnA 작성
/**
 * @swagger
 * /routines/{routineId}/qna:
 *   post:
 *     tags: [Routines]
 *     summary: 루틴 Q&A 질문 작성
 *     description: 특정 루틴에 Q&A 질문 작성
 *     parameters:
 *       - in: path
 *         name: routineId
 *         required: true
 *         schema:
 *           type: string
 *         description: 루틴 ID
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
 *                     text: "이 루틴은 초보자도 할 수 있나요?"
 *                   - type: "text"
 *                     text: "운동 시간은 언제가 가장 좋을까요?"
 *                   - type: "image"
 *                     src: "https://example.com/question-image.jpg"
 *                     width: 1080
 *                     height: 1080
 *                     blurHash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4"
 *                   - type: "video"
 *                     src: "https://example.com/question-video.mp4"
 *                     width: 1920
 *                     height: 1080
 *                     duration: 30
 *                     thumbUrl: "https://example.com/video-thumb.jpg"
 *                     videoSource: "uploaded"
 *                     provider: "self"
 *                     sizeBytes: 1048576
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
 *                 qnaId:
 *                   type: string
 *                   example: "qna_123"
 *                 routineId:
 *                   type: string
 *                   example: "routine_123"
 *                 userId:
 *                   type: string
 *                   example: "user_123"
 *                 content:
 *                   type: array
 *                   description: 질문 내용
 *                   items:
 *                     type: object
 *                 media:
 *                   type: array
 *                   description: 미디어 파일
 *                   items:
 *                     type: object
 *                 answerContent:
 *                   type: array
 *                   nullable: true
 *                   description: 답변 내용
 *                   items:
 *                     type: object
 *                 answerMedia:
 *                   type: array
 *                   description: 답변 미디어
 *                   items:
 *                     type: object
 *                 likesCount:
 *                   type: integer
 *                   example: 0
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-01T00:00:00.000Z"
 *       400:
 *         description: 잘못된 요청
 *       500:
 *         description: 서버 오류
 */
router.post("/:routineId/qna", authGuard, routineController.createQnA);

// 루틴 QnA 수정
/**
 * @swagger
 * /routines/{routineId}/qna/{qnaId}:
 *   put:
 *     tags: [Routines]
 *     summary: 루틴 Q&A 질문 수정
 *     description: 특정 루틴의 Q&A 질문 수정
 *     parameters:
 *       - in: path
 *         name: routineId
 *         required: true
 *         schema:
 *           type: string
 *         description: 루틴 ID
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
 *                     text: "이 루틴은 초보자도 할 수 있나요? (수정됨)"
 *                   - type: "text"
 *                     text: "운동 시간은 언제가 가장 좋을까요?"
 *                   - type: "image"
 *                     src: "https://example.com/updated-question-image.jpg"
 *                     width: 1080
 *                     height: 1080
 *                     blurHash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4"
 *                   - type: "video"
 *                     src: "https://example.com/updated-question-video.mp4"
 *                     width: 1920
 *                     height: 1080
 *                     duration: 30
 *                     thumbUrl: "https://example.com/updated-video-thumb.jpg"
 *                     videoSource: "uploaded"
 *                     provider: "self"
 *                     sizeBytes: 1048576
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
 *                 qnaId:
 *                   type: string
 *                   example: "qna_123"
 *                 routineId:
 *                   type: string
 *                   example: "routine_123"
 *                 userId:
 *                   type: string
 *                   example: "user_123"
 *                 content:
 *                   type: array
 *                   description: 수정된 질문 내용
 *                   items:
 *                     type: object
 *                 media:
 *                   type: array
 *                   description: 미디어 파일
 *                   items:
 *                     type: object
 *                 answerContent:
 *                   type: array
 *                   nullable: true
 *                   description: 답변 내용
 *                   items:
 *                     type: object
 *                 answerMedia:
 *                   type: array
 *                   description: 답변 미디어
 *                   items:
 *                     type: object
 *                 likesCount:
 *                   type: integer
 *                   example: 0
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-01T00:00:00.000Z"
 *       404:
 *         description: Q&A를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.put("/:routineId/qna/:qnaId", authGuard, routineController.updateQnA);

// 루틴 QnA 답변 작성
/**
 * @swagger
 * /routines/qna/{qnaId}/answer:
 *   post:
 *     tags: [Routines]
 *     summary: 루틴 Q&A 답변 작성
 *     description: 특정 Q&A에 답변 작성
 *     parameters:
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
 *                 description: 답변 내용
 *               media:
 *                 type: array
 *                 description: 답변 미디어
 *     responses:
 *       200:
 *         description: Q&A 답변 작성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 qnaId:
 *                   type: string
 *                   example: "qna_123"
 *                 content:
 *                   type: array
 *                   description: 원본 질문 내용
 *                   items:
 *                     type: object
 *                 media:
 *                   type: array
 *                   description: 원본 질문 미디어
 *                   items:
 *                     type: object
 *                 answerContent:
 *                   type: array
 *                   description: 답변 내용
 *                   items:
 *                     type: object
 *                 answerMedia:
 *                   type: array
 *                   description: 답변 미디어
 *                   items:
 *                     type: object
 *                 answerUserId:
 *                   type: string
 *                   description: 답변자 ID
 *                   example: "user_456"
 *                 likesCount:
 *                   type: integer
 *                   example: 0
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-01T00:00:00.000Z"
 *                 answerCreatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-02T00:00:00.000Z"
 *       404:
 *         description: Q&A를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.post("/qna/:qnaId/answer", authGuard, routineController.createQnAAnswer);

// 루틴 QnA 좋아요 토글
/**
 * @swagger
 * /routines/qna/{qnaId}/like:
 *   post:
 *     tags: [Routines]
 *     summary: 루틴 Q&A 좋아요 토글
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
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/QnALikeToggleResponse'
 *                 message:
 *                   type: string
 *                   example: "좋아요를 추가했습니다."
 *       404:
 *         description: Q&A를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.post("/qna/:qnaId/like", authGuard, routineController.toggleQnALike);

// 루틴 QnA 삭제
/**
 * @swagger
 * /routines/qna/{qnaId}:
 *   delete:
 *     tags: [Routines]
 *     summary: 루틴 Q&A 삭제
 *     description: 특정 Q&A 삭제
 *     parameters:
 *       - in: path
 *         name: qnaId
 *         required: true
 *         schema:
 *           type: string
 *         description: Q&A ID
 *     responses:
 *       200:
 *         description: Q&A 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "QnA가 성공적으로 삭제되었습니다"
 *       404:
 *         description: Q&A를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.delete("/qna/:qnaId", routineController.deleteQnA);

module.exports = router;
