const express = require("express");
const router = express.Router();
const gatheringController = require("../controllers/gatheringController");
const authGuard = require("../middleware/authGuard");


// 소모임 목록 조회
/**
 * @swagger
 * /gatherings:
 *   get:
 *     tags: [Gatherings]
 *     summary: 소모임 목록 조회
 *     description: 모든 소모임 목록을 페이지네이션으로 조회
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
 *         description: 소모임 목록 조회 성공
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
 *                     $ref: '#/components/schemas/GatheringListItem'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     size:
 *                       type: integer
 *                     totalElements:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     hasNext:
 *                       type: boolean
 *                     hasPrevious:
 *                       type: boolean
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
router.get("/", gatheringController.getAllGatherings);

// 소모임 상세 조회
/**
 * @swagger
 * /gatherings/{gatheringId}:
 *   get:
 *     tags: [Gatherings]
 *     summary: 소모임 상세 조회
 *     description: 특정 소모임의 상세 정보와 Q&A, 커뮤니티 게시글 조회
 *     parameters:
 *       - in: path
 *         name: gatheringId
 *         required: true
 *         schema:
 *           type: string
 *         description: 소모임 ID
 *     responses:
 *       200:
 *         description: 소모임 상세 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   $ref: '#/components/schemas/GatheringDetail'
 *       404:
 *         description: 소모임을 찾을 수 없음
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
 *                   example: "소모임을 찾을 수 없습니다"
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
router.get("/:gatheringId", gatheringController.getGatheringById);

// 소모임 신청
/**
 * @swagger
 * /gatherings/{gatheringId}/apply:
 *   post:
 *     tags: [Gatherings]
 *     summary: 소모임 신청
 *     description: 특정 소모임에 신청
 *     parameters:
 *       - in: path
 *         name: gatheringId
 *         required: true
 *         schema:
 *           type: string
 *         description: 소모임 ID
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
 *         description: 소모임 신청 성공
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
 *                       example: "GATHERING"
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
 *                   example: "소모임이 품절되었습니다"
 *       404:
 *         description: 소모임을 찾을 수 없음
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
 *                   example: "소모임을 찾을 수 없습니다"
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
router.post("/:gatheringId/apply", authGuard, gatheringController.applyToGathering);

// 소모임 좋아요 토글
/**
 * @swagger
 * /gatherings/{gatheringId}/like:
 *   post:
 *     tags: [Gatherings]
 *     summary: 소모임 좋아요 토글
 *     description: 특정 소모임의 좋아요 토글
 *     parameters:
 *       - in: path
 *         name: gatheringId
 *         required: true
 *         schema:
 *           type: string
 *         description: 소모임 ID
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
 *                     gatheringId:
 *                       type: string
 *                     userId:
 *                       type: string
 *                     isLiked:
 *                       type: boolean
 *                       example: true
 *                     likesCount:
 *                       type: integer
 *                       example: 5
 *       404:
 *         description: 소모임을 찾을 수 없음
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
 *                   example: "소모임을 찾을 수 없습니다"
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
router.post("/:gatheringId/like", authGuard, gatheringController.toggleGatheringLike);

// 소모임 QnA 작성
/**
 * @swagger
 * /gatherings/{gatheringId}/qna:
 *   post:
 *     tags: [Gatherings]
 *     summary: 소모임 Q&A 질문 작성
 *     description: 특정 소모임에 Q&A 질문 작성
 *     parameters:
 *       - in: path
 *         name: gatheringId
 *         required: true
 *         schema:
 *           type: string
 *         description: 소모임 ID
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
 *                     text: "소모임 참여비는 어떻게 결제하나요?"
 *                   - type: "text"
 *                     text: "모임 장소는 어디인가요?"
 *                   - type: "image"
 *                     src: "https://example.com/gathering-question.jpg"
 *                     width: 1080
 *                     height: 1080
 *                     blurHash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4"
 *                   - type: "video"
 *                     src: "https://example.com/gathering-video.mp4"
 *                     width: 1920
 *                     height: 1080
 *                     duration: 45
 *                     thumbUrl: "https://example.com/gathering-thumb.jpg"
 *                     videoSource: "uploaded"
 *                     provider: "self"
 *                     sizeBytes: 2097152
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
 *                       description: Q&A ID
 *                       example: "qna_123"
 *                     gatheringId:
 *                       type: string
 *                       description: 소모임 ID
 *                       example: "gathering_123"
 *                     userId:
 *                       type: string
 *                       description: 사용자 ID
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
 *                       example: null
 *                     answerMedia:
 *                       type: array
 *                       description: 답변 미디어
 *                       example: []
 *                     likesCount:
 *                       type: integer
 *                       description: 좋아요 수
 *                       example: 0
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: 생성일
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
 *                   example: "content is required"
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
router.post("/:gatheringId/qna", authGuard, gatheringController.createQnA);

// 소모임 QnA 수정
/**
 * @swagger
 * /gatherings/{gatheringId}/qna/{qnaId}:
 *   put:
 *     tags: [Gatherings]
 *     summary: 소모임 Q&A 질문 수정
 *     description: 특정 소모임의 Q&A 질문 수정
 *     parameters:
 *       - in: path
 *         name: gatheringId
 *         required: true
 *         schema:
 *           type: string
 *         description: 소모임 ID
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
 *                     text: "소모임 참여비는 어떻게 결제하나요? (수정됨)"
 *                   - type: "text"
 *                     text: "모임 장소는 어디인가요?"
 *                   - type: "image"
 *                     src: "https://example.com/updated-gathering-question.jpg"
 *                     width: 1080
 *                     height: 1080
 *                     blurHash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4"
 *                   - type: "video"
 *                     src: "https://example.com/updated-gathering-video.mp4"
 *                     width: 1920
 *                     height: 1080
 *                     duration: 45
 *                     thumbUrl: "https://example.com/updated-gathering-thumb.jpg"
 *                     videoSource: "uploaded"
 *                     provider: "self"
 *                     sizeBytes: 2097152
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
 *                       description: Q&A ID
 *                       example: "qna_123"
 *                     gatheringId:
 *                       type: string
 *                       description: 소모임 ID
 *                       example: "gathering_123"
 *                     userId:
 *                       type: string
 *                       description: 사용자 ID
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
 *                       example: null
 *                     answerMedia:
 *                       type: array
 *                       description: 답변 미디어
 *                       example: []
 *                     likesCount:
 *                       type: integer
 *                       description: 좋아요 수
 *                       example: 0
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       description: 수정일
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
 *                   example: "content is required"
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
router.put("/:gatheringId/qna/:qnaId", authGuard, gatheringController.updateQnA);

// 소모임 QnA 좋아요 토글
/**
 * @swagger
 * /gatherings/qna/{qnaId}/like:
 *   post:
 *     tags: [Gatherings]
 *     summary: 소모임 Q&A 좋아요 토글
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
 *                     likesCount:
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
router.post("/qna/:qnaId/like", authGuard, gatheringController.toggleQnALike);

// 소모임 QnA 삭제
/**
 * @swagger
 * /gatherings/qna/{qnaId}:
 *   delete:
 *     tags: [Gatherings]
 *     summary: 소모임 Q&A 삭제
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
router.delete("/qna/:qnaId", gatheringController.deleteQnA);

module.exports = router;
