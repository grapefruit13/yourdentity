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
 *           description: 상품 ID
 *           example: "CP:ONLINE_GIFT_30K"
 *         name:
 *           type: string
 *           description: 상품 이름
 *           example: "온라인 상품권 3만원 권"
 *         description:
 *           type: string
 *           description: 상품 설명
 *           example: "다양한 온라인 쇼핑몰에서 사용할 수 있는 3만원 상품권입니다."
 *         status:
 *           type: string
 *           description: 상품 상태
 *           example: "onSale"
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
 *           example: 0
 *         soldCount:
 *           type: integer
 *           description: 판매 수량
 *           example: 4
 *         viewCount:
 *           type: integer
 *           description: 조회수
 *           example: 207
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
 *           example: "유스-잇"
 *         createdAt:
 *           type: number
 *           description: 생성일 (timestamp)
 *           example: 1759409210457
 *         updatedAt:
 *           oneOf:
 *             - type: string
 *               format: date-time
 *               description: 수정일 (문자열)
 *               example: "2025-10-03T17:38:07.609Z"
 *             - type: number
 *               description: 수정일 (timestamp)
 *               example: 1759409210457
 *
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: 상품 ID
 *           example: "CP:ONLINE_GIFT_30K"
 *         name:
 *           type: string
 *           description: 상품 이름
 *           example: "온라인 상품권 3만원 권"
 *         description:
 *           type: string
 *           description: 상품 설명
 *           example: "다양한 온라인 쇼핑몰에서 사용할 수 있는 3만원 상품권입니다."
 *         price:
 *           type: number
 *           description: 가격
 *           example: 0
 *         originalPrice:
 *           type: number
 *           description: 원가
 *           example: 0
 *         normalPrice:
 *           type: number
 *           description: 정가
 *           example: 0
 *         currency:
 *           type: string
 *           description: 통화
 *           example: "KRW"
 *         additionalFees:
 *           type: array
 *           description: 추가 요금
 *           items:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 description: 요금 타입
 *                 example: "coin"
 *               resourceId:
 *                 type: string
 *                 description: 리소스 ID
 *                 example: "COIN-43TOZ4S9867"
 *               amount:
 *                 type: number
 *                 description: 금액
 *                 example: 350
 *         content:
 *           type: array
 *           description: 상품 상세 내용
 *           items:
 *             $ref: '#/components/schemas/ContentItem'
 *         media:
 *           type: array
 *           description: 상품 미디어
 *           items:
 *             $ref: '#/components/schemas/MediaItem'
 *         options:
 *           type: array
 *           description: 상품 옵션
 *           example: []
 *         productVariants:
 *           type: array
 *           description: 상품 변형
 *           example: []
 *         view_count_member:
 *           type: integer
 *           description: 회원 조회수
 *           example: 30
 *         soldCount:
 *           type: integer
 *           description: 판매 수량
 *           example: 3
 *         soldAmount:
 *           type: number
 *           description: 판매 금액
 *           example: 0
 *         buyersCount:
 *           type: integer
 *           description: 구매자 수
 *           example: 3
 *         status:
 *           type: string
 *           description: 상품 상태
 *           example: "onSale"
 *         shippingRequired:
 *           type: boolean
 *           description: 배송 필요 여부
 *           example: false
 *         sellerId:
 *           type: string
 *           description: 판매자 ID
 *           example: "CS:NOZU0HZP"
 *         sellerName:
 *           type: string
 *           description: 판매자 이름
 *           example: "유스-잇"
 *         shippingFee:
 *           type: number
 *           description: 배송비
 *           example: 0
 *         customFields:
 *           type: array
 *           description: 커스텀 필드
 *           example: []
 *         completeMessage:
 *           type: object
 *           description: 완료 메시지
 *           properties:
 *             title:
 *               type: object
 *               properties:
 *                 ko:
 *                   type: string
 *                   description: 한국어 제목
 *                   example: "상품권이 이메일로 발송됩니다!"
 *             description:
 *               type: object
 *               description: 설명
 *         primaryDetails:
 *           type: array
 *           description: 주요 상세 정보
 *           example: []
 *         repliesCount:
 *           type: integer
 *           description: 답글 수
 *           example: 0
 *         reviewsCount:
 *           type: integer
 *           description: 리뷰 수
 *           example: 0
 *         ratingsCount:
 *           type: integer
 *           description: 평점 수
 *           example: 0
 *         commentsCount:
 *           type: integer
 *           description: 댓글 수
 *           example: 0
 *         avgRate:
 *           type: number
 *           description: 평균 평점
 *           example: 0
 *         deliveryType:
 *           type: string
 *           description: 배송 타입
 *           example: "online"
 *         isDisplayed:
 *           type: boolean
 *           description: 표시 여부
 *           example: true
 *         variantSkus:
 *           type: array
 *           description: 변형 SKU
 *           example: []
 *         creditAmount:
 *           type: number
 *           description: 크레딧 금액
 *           example: 0
 *         buyable:
 *           type: boolean
 *           description: 구매 가능 여부
 *           example: true
 *         createdAt:
 *           type: number
 *           description: 생성일 (timestamp)
 *           example: 1759409210457
 *         type:
 *           type: string
 *           description: 상품 타입
 *           example: "normal"
 *         likesCount:
 *           type: integer
 *           description: 좋아요 수
 *           example: 1
 *         view_count:
 *           type: integer
 *           description: 조회수
 *           example: 205
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 수정일
 *           example: "2025-10-03T13:48:14.648Z"
 *         viewCount:
 *           type: integer
 *           description: 조회수 (업데이트된 값)
 *           example: 206
 *         qna:
 *           type: array
 *           description: Q&A 목록
 *           items:
 *             $ref: '#/components/schemas/QnAItem'
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
 *     summary: 스토어 상품 목록 조회
 *     description: 모든 스토어 상품 목록을 페이지네이션으로 조회
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
 *         description: 상품 목록 조회 성공
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
 *                     $ref: '#/components/schemas/ProductListItem'
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
 */
router.get("/products", storeController.getProducts);

// 스토어 상품 상세 조회 (조회수 자동 증가)
/**
 * @swagger
 * /store/products/{productId}:
 *   get:
 *     tags: [Store]
 *     summary: 스토어 상품 상세 조회
 *     description: 특정 상품의 상세 정보 조회 (조회수 자동 증가)
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: 상품 ID
 *     responses:
 *       200:
 *         description: 상품 상세 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: 상품 ID
 *                       example: "CP:ONLINE_GIFT_30K"
 *                     name:
 *                       type: string
 *                       description: 상품 이름
 *                       example: "온라인 상품권 3만원 권"
 *                     description:
 *                       type: string
 *                       description: 상품 설명
 *                       example: "다양한 온라인 쇼핑몰에서 사용할 수 있는 3만원 상품권입니다."
 *                     price:
 *                       type: number
 *                       description: 가격
 *                       example: 0
 *                     originalPrice:
 *                       type: number
 *                       description: 원가
 *                       example: 0
 *                     normalPrice:
 *                       type: number
 *                       description: 정가
 *                       example: 0
 *                     currency:
 *                       type: string
 *                       description: 통화
 *                       example: "KRW"
 *                     additionalFees:
 *                       type: array
 *                       description: 추가 요금
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             description: 요금 타입
 *                             example: "coin"
 *                           resourceId:
 *                             type: string
 *                             description: 리소스 ID
 *                             example: "COIN-43TOZ4S9867"
 *                           amount:
 *                             type: number
 *                             description: 금액
 *                             example: 350
 *                     content:
 *                       type: array
 *                       description: 상품 상세 내용
 *                       items:
 *                         $ref: '#/components/schemas/ContentItem'
 *                       example:
 *                         - src: "https://example.com/gift-card-30k.jpg"
 *                           type: "image"
 *                           width: 400
 *                           height: 300
 *                         - type: "text"
 *                           content: "온라인 상품권 3만원 권"
 *                     media:
 *                       type: array
 *                       description: 상품 미디어
 *                       items:
 *                         $ref: '#/components/schemas/MediaItem'
 *                       example:
 *                         - src: "https://example.com/gift-card-30k.jpg"
 *                           type: "image"
 *                           width: 400
 *                           height: 300
 *                     options:
 *                       type: array
 *                       description: 상품 옵션
 *                       example: []
 *                     productVariants:
 *                       type: array
 *                       description: 상품 변형
 *                       example: []
 *                     view_count_member:
 *                       type: integer
 *                       description: 회원 조회수
 *                       example: 30
 *                     soldCount:
 *                       type: integer
 *                       description: 판매 수량
 *                       example: 3
 *                     soldAmount:
 *                       type: number
 *                       description: 판매 금액
 *                       example: 0
 *                     buyersCount:
 *                       type: integer
 *                       description: 구매자 수
 *                       example: 3
 *                     status:
 *                       type: string
 *                       description: 상품 상태
 *                       example: "onSale"
 *                     shippingRequired:
 *                       type: boolean
 *                       description: 배송 필요 여부
 *                       example: false
 *                     sellerId:
 *                       type: string
 *                       description: 판매자 ID
 *                       example: "CS:NOZU0HZP"
 *                     sellerName:
 *                       type: string
 *                       description: 판매자 이름
 *                       example: "유스-잇"
 *                     shippingFee:
 *                       type: number
 *                       description: 배송비
 *                       example: 0
 *                     customFields:
 *                       type: array
 *                       description: 커스텀 필드
 *                       example: []
 *                     completeMessage:
 *                       type: object
 *                       description: 완료 메시지
 *                       properties:
 *                         title:
 *                           type: object
 *                           properties:
 *                             ko:
 *                               type: string
 *                               description: 한국어 제목
 *                               example: "상품권이 이메일로 발송됩니다!"
 *                         description:
 *                           type: object
 *                           description: 설명
 *                     primaryDetails:
 *                       type: array
 *                       description: 주요 상세 정보
 *                       example: []
 *                     repliesCount:
 *                       type: integer
 *                       description: 답글 수
 *                       example: 0
 *                     reviewsCount:
 *                       type: integer
 *                       description: 리뷰 수
 *                       example: 0
 *                     ratingsCount:
 *                       type: integer
 *                       description: 평점 수
 *                       example: 0
 *                     commentsCount:
 *                       type: integer
 *                       description: 댓글 수
 *                       example: 0
 *                     avgRate:
 *                       type: number
 *                       description: 평균 평점
 *                       example: 0
 *                     deliveryType:
 *                       type: string
 *                       description: 배송 타입
 *                       example: "online"
 *                     isDisplayed:
 *                       type: boolean
 *                       description: 표시 여부
 *                       example: true
 *                     variantSkus:
 *                       type: array
 *                       description: 변형 SKU
 *                       example: []
 *                     creditAmount:
 *                       type: number
 *                       description: 크레딧 금액
 *                       example: 0
 *                     buyable:
 *                       type: boolean
 *                       description: 구매 가능 여부
 *                       example: true
 *                     createdAt:
 *                       type: number
 *                       description: 생성일 (timestamp)
 *                       example: 1759409210457
 *                     type:
 *                       type: string
 *                       description: 상품 타입
 *                       example: "normal"
 *                     likesCount:
 *                       type: integer
 *                       description: 좋아요 수
 *                       example: 1
 *                     view_count:
 *                       type: integer
 *                       description: 조회수
 *                       example: 205
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       description: 수정일
 *                       example: "2025-10-03T13:48:14.648Z"
 *                     viewCount:
 *                       type: integer
 *                       description: 조회수 (업데이트된 값)
 *                       example: 206
 *                     qna:
 *                       type: array
 *                       description: Q&A 목록
 *                       items:
 *                         $ref: '#/components/schemas/QnAItem'
 *                       example:
 *                         - id: "bsIZclTHY0hvx07rtnQS"
 *                           content:
 *                             - type: "text"
 *                               content: "이 상품은 언제 배송되나요?"
 *                             - type: "image"
 *                               src: "https://example.com/question-image.jpg"
 *                               width: 400
 *                               height: 300
 *                           media:
 *                             - url: "https://example.com/question-image.jpg"
 *                               type: "image"
 *                               order: 1
 *                               width: 400
 *                               height: 300
 *                           answerContent: null
 *                           answerMedia: []
 *                           answerUserId: null
 *                           askedBy: "user123"
 *                           askedAt: "2025-10-03T13:43:49.546Z"
 *                           answeredAt: null
 *                           likesCount: 1
 *       404:
 *         description: 상품을 찾을 수 없음
 *       500:
 *         description: 서버 오류
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
 *         description: 상품 구매 신청 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Purchase'
 *                 message:
 *                   type: string
 *                   example: "상품 구매 신청이 완료되었습니다."
 *       400:
 *         description: 잘못된 요청 또는 품절
 *       404:
 *         description: 상품을 찾을 수 없음
 *       500:
 *         description: 서버 오류
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
 *                 success:
 *                   type: boolean
 *                   example: true
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
 *                     likeCount:
 *                       type: integer
 *                       example: 5
 *                 message:
 *                   type: string
 *                   example: "좋아요를 추가했습니다."
 *       404:
 *         description: 상품을 찾을 수 없음
 *       500:
 *         description: 서버 오류
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
 *                 qnaId:
 *                   type: string
 *                 productId:
 *                   type: string
 *                 userId:
 *                   type: string
 *                 content:
 *                   type: array
 *                 media:
 *                   type: array
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
 *       404:
 *         description: Q&A를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.put("/products/:productId/qna/:qnaId", authGuard, storeController.updateProductQnA);

// 상품 QnA 답변 작성
/**
 * @swagger
 * /store/qna/{qnaId}/answer:
 *   post:
 *     tags: [Store]
 *     summary: 상품 Q&A 답변 작성
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
 *       404:
 *         description: Q&A를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.post("/qna/:qnaId/answer", authGuard, storeController.createProductQnAAnswer);

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
 *                 success:
 *                   type: boolean
 *                   example: true
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
 *                 message:
 *                   type: string
 *                   example: "좋아요를 추가했습니다."
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
router.delete("/qna/:qnaId", storeController.deleteProductQnA);

module.exports = router;
