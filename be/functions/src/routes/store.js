const express = require("express");
const router = express.Router();
const storeController = require("../controllers/storeController");
const authGuard = require("../middleware/authGuard");

/**
 * @swagger
 * components:
 *   schemas:
 *     ProductListItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: 상품 ID (Notion 페이지 ID)
 *           example: "29f1f705-fa4a-803c-9fdd-000b02c4884f"
 *         name:
 *           type: string
 *           description: 상품 이름
 *           example: "온라인 상품권 3만원 권"
 *         description:
 *           type: string
 *           description: 상품 설명
 *           example: "다양한 온라인 쇼핑몰에서 사용할 수 있는 3만원 상품권입니다."
 *         thumbnail:
 *           type: array
 *           description: 썸네일 이미지 배열
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 파일명
 *               url:
 *                 type: string
 *                 description: 이미지 URL
 *               type:
 *                 type: string
 *                 description: 파일 타입 (external/file)
 *         requiredPoints:
 *           type: number
 *           description: 필요한 나다움 포인트
 *           example: 350
 *         onSale:
 *           type: boolean
 *           description: 판매 여부
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 생성일
 *           example: "2025-11-02T14:48:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 수정일
 *           example: "2025-11-02T14:51:00.000Z"
 *
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: 상품 ID (Notion 페이지 ID)
 *           example: "29f1f705-fa4a-803c-9fdd-000b02c4884f"
 *         name:
 *           type: string
 *           description: 상품 이름
 *           example: "온라인 상품권 3만원 권"
 *         description:
 *           type: string
 *           description: 상품 설명
 *           example: "다양한 온라인 쇼핑몰에서 사용할 수 있는 3만원 상품권입니다."
 *         thumbnail:
 *           type: array
 *           description: 썸네일 이미지 배열
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               url:
 *                 type: string
 *               type:
 *                 type: string
 *         requiredPoints:
 *           type: number
 *           description: 필요한 나다움 포인트
 *           example: 350
 *         onSale:
 *           type: boolean
 *           description: 판매 여부
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 생성일
 *           example: "2025-11-02T14:48:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 수정일
 *           example: "2025-11-02T14:51:00.000Z"
 *         pageContent:
 *           type: array
 *           description: 상품 페이지 상세 내용 (Notion 블록)
 *           items:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 description: 블록 타입 (paragraph, heading_1, image 등)
 *                 example: "paragraph"
 *               id:
 *                 type: string
 *                 description: 블록 ID
 *               text:
 *                 type: string
 *                 description: 텍스트 내용
 *               url:
 *                 type: string
 *                 description: 이미지/비디오 URL
 *               caption:
 *                 type: string
 *                 description: 캡션
 *               links:
 *                 type: array
 *                 description: 포함된 링크
 *                 items:
 *                   type: object
 *                   properties:
 *                     text:
 *                       type: string
 *                     url:
 *                       type: string
 *               richText:
 *                 type: array
 *                 description: 리치 텍스트 (상세 정보)
 *               hasChildren:
 *                 type: boolean
 *                 description: 하위 블록 존재 여부
 *
 *     Purchase:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: 구매 ID
 *         productId:
 *           type: string
 *           description: 상품 ID
 *         userId:
 *           type: string
 *           description: 사용자 ID
 *         quantity:
 *           type: integer
 *           description: 구매 수량
 *         totalPrice:
 *           type: number
 *           description: 총 가격
 *         status:
 *           type: string
 *           enum: [PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED]
 *           description: 구매 상태
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 구매일
 */

// 스토어 상품 목록 조회
/**
 * @swagger
 * /store/products:
 *   get:
 *     tags: [Store]
 *     summary: 스토어 상품 목록 조회 (Notion 기반)
 *     description: Notion 스토어 관리 DB에서 상품 목록을 커서 기반 페이지네이션으로 조회
 *     parameters:
 *       - in: query
 *         name: onSale
 *         schema:
 *           type: boolean
 *         description: 판매 여부 필터 (true=판매중만, false=미판매만, 생략=전체)
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 20
 *           minimum: 1
 *           maximum: 100
 *         description: 페이지 크기 (1-100)
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *         description: 페이지네이션 커서 (다음 페이지 조회 시 사용)
 *     responses:
 *       200:
 *         description: 상품 목록 조회 성공
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
 *                     message:
 *                       type: string
 *                       example: "상품 목록을 성공적으로 조회했습니다."
 *                     products:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ProductListItem'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         hasMore:
 *                           type: boolean
 *                           description: 다음 페이지 존재 여부
 *                           example: false
 *                         nextCursor:
 *                           type: string
 *                           nullable: true
 *                           description: 다음 페이지 커서
 *                           example: null
 *                         totalCount:
 *                           type: integer
 *                           description: 현재 페이지 항목 수
 *                           example: 3
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
 *                   example: "페이지 크기는 1-100 사이의 숫자여야 합니다."
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
router.get("/products", storeController.getProducts);

// 스토어 상품 상세 조회 (Notion 페이지 내용 포함)
/**
 * @swagger
 * /store/products/{productId}:
 *   get:
 *     tags: [Store]
 *     summary: 스토어 상품 상세 조회 (Notion 기반)
 *     description: Notion 페이지 ID로 상품의 상세 정보 및 페이지 블록 내용 전체를 조회
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: 상품 ID (Notion 페이지 ID)
 *         example: "29f1f705-fa4a-803c-9fdd-000b02c4884f"
 *     responses:
 *       200:
 *         description: 상품 상세 조회 성공
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
 *                     message:
 *                       type: string
 *                       example: "상품 상세 정보를 성공적으로 조회했습니다."
 *                     product:
 *                       $ref: '#/components/schemas/Product'
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
 *                   example: "상품 ID가 필요합니다."
 *       404:
 *         description: 상품을 찾을 수 없음
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
 *                   example: "해당 상품을 찾을 수 없습니다."
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
router.get("/products/:productId", storeController.getProductById);

// 상품 구매 신청
/**
 * @swagger
 * /store/purchase:
 *   post:
 *     tags: [Store]
 *     summary: 상품 구매 신청
 *     description: 특정 상품 구매 신청
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: string
 *                 description: 상품 ID
 *                 example: "product123"
 *               quantity:
 *                 type: integer
 *                 default: 1
 *                 description: 구매 수량
 *               selectedVariant:
 *                 type: string
 *                 description: 선택된 옵션
 *               customFieldsRequest:
 *                 type: object
 *                 description: 커스텀 필드 요청
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
 *         description: 상품 구매 신청 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 201
 *                 data:
 *                   $ref: '#/components/schemas/Purchase'
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
 *                   example: "잘못된 요청입니다"
 *       404:
 *         description: 상품을 찾을 수 없음
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
 *                   example: "상품을 찾을 수 없습니다"
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
router.post("/purchase", authGuard, storeController.purchaseProduct);

// 상품 좋아요 토글
/**
 * @swagger
 * /store/products/{productId}/like:
 *   post:
 *     tags: [Store]
 *     summary: 상품 좋아요 토글
 *     description: 특정 상품의 좋아요 토글
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: 상품 ID
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
 *                     productId:
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
 *         description: 상품을 찾을 수 없음
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
 *                   example: "상품을 찾을 수 없습니다"
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
router.post("/products/:productId/like", authGuard, storeController.toggleProductLike);

// 상품 QnA 질문 작성
/**
 * @swagger
 * /store/products/{productId}/qna:
 *   post:
 *     tags: [Store]
 *     summary: 상품 Q&A 질문 작성
 *     description: 특정 상품에 Q&A 질문 작성
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: 상품 ID
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
 *                     text: "이 상품의 배송비는 얼마인가요?"
 *                   - type: "text"
 *                     text: "교환/환불 정책이 어떻게 되나요?"
 *                   - type: "image"
 *                     src: "https://example.com/product-question.jpg"
 *                     width: 1080
 *                     height: 1080
 *                     blurHash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4"
 *                   - type: "video"
 *                     src: "https://example.com/product-video.mp4"
 *                     width: 1920
 *                     height: 1080
 *                     duration: 25
 *                     thumbUrl: "https://example.com/product-thumb.jpg"
 *                     videoSource: "uploaded"
 *                     provider: "self"
 *                     sizeBytes: 1572864
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
 *                     productId:
 *                       type: string
 *                       description: 상품 ID
 *                       example: "CP:ONLINE_GIFT_30K"
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
 *                       description: 미디어 파일들
 *                       items:
 *                         type: object
 *                         properties:
 *                           url:
 *                             type: string
 *                           type:
 *                             type: string
 *                             enum: [image, video]
 *                           order:
 *                             type: integer
 *                           width:
 *                             type: integer
 *                           height:
 *                             type: integer
 *                           blurHash:
 *                             type: string
 *                           thumbUrl:
 *                             type: string
 *                           videoSource:
 *                             type: string
 *                           provider:
 *                             type: string
 *                           duration:
 *                             type: number
 *                           sizeBytes:
 *                             type: integer
 *                           mimeType:
 *                             type: string
 *                           processingStatus:
 *                             type: string
 *                     answerContent:
 *                       type: array
 *                       nullable: true
 *                       description: 답변 내용 (초기에는 null)
 *                       example: null
 *                     answerMedia:
 *                       type: array
 *                       description: 답변 미디어 (초기에는 빈 배열)
 *                       example: []
 *                     likesCount:
 *                       type: integer
 *                       description: 좋아요 수
 *                       example: 0
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: 생성일시
 *                       example: "2025-01-16T10:30:00.000Z"
 *                 likesCount:
 *                   type: integer
 *                   example: 0
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: 잘못된 요청
 *       500:
 *         description: 서버 오류
 */
router.post("/products/:productId/qna", authGuard, storeController.createProductQnA);

// 상품 QnA 질문 수정
/**
 * @swagger
 * /store/products/{productId}/qna/{qnaId}:
 *   put:
 *     tags: [Store]
 *     summary: 상품 Q&A 질문 수정
 *     description: 특정 상품의 Q&A 질문 수정
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: 상품 ID
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
 *                     text: "이 상품의 배송비는 얼마인가요? (수정됨)"
 *                   - type: "text"
 *                     text: "교환/환불 정책이 어떻게 되나요?"
 *                   - type: "image"
 *                     src: "https://example.com/updated-product-question.jpg"
 *                     width: 1080
 *                     height: 1080
 *                     blurHash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4"
 *                   - type: "video"
 *                     src: "https://example.com/updated-product-video.mp4"
 *                     width: 1920
 *                     height: 1080
 *                     duration: 25
 *                     thumbUrl: "https://example.com/updated-product-thumb.jpg"
 *                     videoSource: "uploaded"
 *                     provider: "self"
 *                     sizeBytes: 1572864
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
router.put("/products/:productId/qna/:qnaId", authGuard, storeController.updateProductQnA);

// 상품 QnA 좋아요 토글
/**
 * @swagger
 * /store/qna/{qnaId}/like:
 *   post:
 *     tags: [Store]
 *     summary: 상품 Q&A 좋아요 토글
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
 *       500:
 *         description: 서버 오류
 */
router.post("/qna/:qnaId/like", authGuard, storeController.toggleProductQnALike);

// 상품 QnA 삭제
/**
 * @swagger
 * /store/qna/{qnaId}:
 *   delete:
 *     tags: [Store]
 *     summary: 상품 Q&A 삭제
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
 *                   example: "Q&A 삭제 권한이 없습니다"
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
router.delete("/qna/:qnaId", authGuard, storeController.deleteProductQnA);

module.exports = router;
