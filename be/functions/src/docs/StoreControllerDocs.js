/**
 * @swagger
 * components:
 *   schemas:
 *     ProductSummary:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: 상품 고유 ID
 *           example: "CP:45HBVVFPYEFOI"
 *         name:
 *           type: string
 *           description: 상품명
 *           example: "[모어포모레] 에브리 립밤"
 *         description:
 *           type: string
 *           description: 상품 설명
 *         status:
 *           type: string
 *           enum: [onSale, soldOut, discontinued]
 *           description: 상품 상태
 *         price:
 *           type: number
 *           description: 가격
 *         currency:
 *           type: string
 *           description: 통화
 *         stockCount:
 *           type: number
 *           description: 재고 수량
 *         soldCount:
 *           type: number
 *           description: 판매 수량
 *         viewCount:
 *           type: number
 *           description: 조회수
 *         buyable:
 *           type: boolean
 *           description: 구매 가능 여부
 *         sellerId:
 *           type: string
 *           description: 판매자 ID
 *         sellerName:
 *           type: string
 *           description: 판매자명
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 생성일시
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 수정일시
 *     ProductDetail:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: 상품 고유 ID
 *         name:
 *           type: string
 *           description: 상품명
 *         description:
 *           type: string
 *           description: 상품 설명
 *         status:
 *           type: string
 *           enum: [onSale, soldOut, discontinued]
 *           description: 상품 상태
 *         price:
 *           type: number
 *           description: 가격
 *         currency:
 *           type: string
 *           description: 통화
 *         stockCount:
 *           type: number
 *           description: 재고 수량
 *         soldCount:
 *           type: number
 *           description: 판매 수량
 *         viewCount:
 *           type: number
 *           description: 조회수
 *         buyable:
 *           type: boolean
 *           description: 구매 가능 여부
 *         sellerId:
 *           type: string
 *           description: 판매자 ID
 *         sellerName:
 *           type: string
 *           description: 판매자명
 *         content:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ContentItem'
 *           description: 상품 상세 내용
 *         media:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/MediaItem'
 *           description: 미디어 목록
 *         productVariants:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: 옵션 ID
 *               name:
 *                 type: string
 *                 description: 옵션명
 *               price:
 *                 type: number
 *                 description: 옵션 가격
 *               stockCount:
 *                 type: number
 *                 description: 옵션 재고
 *               soldCount:
 *                 type: number
 *                 description: 옵션 판매수
 *         additionalFees:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 description: 수수료 타입
 *               amount:
 *                 type: number
 *                 description: 수수료 금액
 *               name:
 *                 type: string
 *                 description: 수수료명
 *         qna:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/QnA'
 *           description: Q&A 목록
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 생성일시
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 수정일시
 *     PurchaseApplication:
 *       type: object
 *       properties:
 *         applicationId:
 *           type: string
 *           description: 신청 ID
 *         type:
 *           type: string
 *           description: 신청 타입
 *         targetId:
 *           type: string
 *           description: 대상 상품 ID
 *         variantId:
 *           type: string
 *           description: 상품 옵션 ID
 *         userId:
 *           type: string
 *           description: 사용자 ID
 *         status:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED, CANCELLED]
 *           description: 신청 상태
 *         quantity:
 *           type: number
 *           description: 구매 수량
 *         totalPrice:
 *           type: number
 *           description: 총 가격
 *         requiredPoints:
 *           type: number
 *           description: 필요 포인트
 *         remainingBalance:
 *           type: number
 *           description: 잔여 포인트
 *         customFieldsResponse:
 *           type: object
 *           description: 커스텀 필드 응답
 *         shippingAddress:
 *           type: string
 *           description: 배송 주소
 *         phoneNumber:
 *           type: string
 *           description: 전화번호
 *         appliedAt:
 *           type: string
 *           format: date-time
 *           description: 신청일시
 *         targetName:
 *           type: string
 *           description: 상품명
 *         additionalFees:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 description: 수수료 타입
 *               amount:
 *                 type: number
 *                 description: 수수료 금액
 *               name:
 *                 type: string
 *                 description: 수수료명
 *     Pagination:
 *       type: object
 *       properties:
 *         page:
 *           type: number
 *           description: 현재 페이지
 *         size:
 *           type: number
 *           description: 페이지 크기
 *         totalElements:
 *           type: number
 *           description: 전체 항목 수
 *         totalPages:
 *           type: number
 *           description: 전체 페이지 수
 */

/**
 * @swagger
 * /store/products:
 *   get:
 *     summary: 스토어 상품 목록 조회
 *     description: 페이지네이션을 지원하는 상품 목록을 조회합니다.
 *     tags: [Store]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [onSale, soldOut, discontinued]
 *         description: 상품 상태 필터
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
 *                     $ref: '#/components/schemas/ProductSummary'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommonErrorResponse'
 */

/**
 * @swagger
 * /store/products/{productId}:
 *   get:
 *     summary: 스토어 상품 상세 조회
 *     description: 상품 ID로 상세 정보를 조회합니다. 조회 시 자동으로 조회수가 증가합니다.
 *     tags: [Store]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *           example: CP:45HBVVFPYEFOI
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
 *                   $ref: '#/components/schemas/ProductDetail'
 *       404:
 *         description: 상품을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommonErrorResponse'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommonErrorResponse'
 */

/**
 * @swagger
 * /store/purchase:
 *   post:
 *     summary: 상품 구매 신청
 *     description: 상품을 구매 신청합니다. 포인트 시스템과 재고 관리를 포함합니다.
 *     tags: [Store]
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
 *                 example: CP:45HBVVFPYEFOI
 *               variantId:
 *                 type: string
 *                 description: 상품 옵션 ID (퓨어/레드 등)
 *                 example: H6POQ92WZK
 *               quantity:
 *                 type: integer
 *                 description: 구매 수량
 *                 default: 1
 *                 minimum: 1
 *                 example: 2
 *               customFields:
 *                 type: object
 *                 description: 커스텀 필드 응답
 *                 example:
 *                   custom_1: "서울시 강남구 테헤란로 123"
 *               shippingAddress:
 *                 type: string
 *                 description: 배송 주소
 *                 example: "서울시 강남구 테헤란로 123"
 *               phoneNumber:
 *                 type: string
 *                 description: 전화번호
 *                 example: "010-1234-5678"
 *     responses:
 *       201:
 *         description: 구매 신청 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/PurchaseApplication'
 *                 message:
 *                   type: string
 *                   example: "상품 구매 신청이 완료되었습니다. (총 300원, 포인트 600원 사용)"
 *       400:
 *         description: 잘못된 요청 (재고 부족, 포인트 부족 등)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommonErrorResponse'
 *       404:
 *         description: 상품을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommonErrorResponse'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommonErrorResponse'
 */

/**
 * @swagger
 * /store/products/{productId}/like:
 *   post:
 *     summary: 상품 좋아요 토글
 *     description: 상품에 좋아요를 등록하거나 취소합니다.
 *     tags: [Store]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *           example: CP:45HBVVFPYEFOI
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
 *                 message:
 *                   type: string
 *                   example: "좋아요가 등록되었습니다."
 *                 isLiked:
 *                   type: boolean
 *                   example: true
 *                 likesCount:
 *                   type: integer
 *                   example: 5
 *       404:
 *         description: 상품을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommonErrorResponse'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommonErrorResponse'
 */

/**
 * @swagger
 * /store/products/{productId}/qna:
 *   post:
 *     summary: 상품 QnA 질문 작성
 *     description: 상품에 대한 QnA 질문을 작성합니다.
 *     tags: [Store]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *           example: CP:45HBVVFPYEFOI
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
 *                 description: 콘텐츠 배열 (텍스트, 이미지 등)
 *                 items:
 *                   $ref: '#/components/schemas/ContentItem'
 *                 example:
 *                   - type: text
 *                     content: "이 상품은 언제 배송되나요?"
 *                   - type: image
 *                     src: "https://example.com/question-image.jpg"
 *                     width: 400
 *                     height: 300
 *     responses:
 *       201:
 *         description: QnA 질문 작성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/QnA'
 *                 message:
 *                   type: string
 *                   example: "QnA 질문이 작성되었습니다."
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommonErrorResponse'
 *       404:
 *         description: 상품을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommonErrorResponse'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommonErrorResponse'
 */

/**
 * @swagger
 * /store/products/{productId}/qna/{qnaId}:
 *   put:
 *     summary: 상품 QnA 질문 수정
 *     description: 기존 QnA 질문을 수정합니다.
 *     tags: [Store]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *           example: CP:45HBVVFPYEFOI
 *         description: 상품 ID
 *       - in: path
 *         name: qnaId
 *         required: true
 *         schema:
 *           type: string
 *           example: qna_123
 *         description: QnA ID
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
 *                 description: 수정된 콘텐츠 배열
 *                 items:
 *                   $ref: '#/components/schemas/ContentItem'
 *     responses:
 *       200:
 *         description: QnA 질문 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/QnA'
 *                 message:
 *                   type: string
 *                   example: "QnA 질문이 수정되었습니다."
 *       404:
 *         description: QnA를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommonErrorResponse'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommonErrorResponse'
 */

/**
 * @swagger
 * /store/qna/{qnaId}/answer:
 *   post:
 *     summary: 상품 QnA 답변 작성
 *     description: QnA 질문에 답변을 작성합니다.
 *     tags: [Store]
 *     parameters:
 *       - in: path
 *         name: qnaId
 *         required: true
 *         schema:
 *           type: string
 *           example: qna_123
 *         description: QnA ID
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
 *                 description: 답변 콘텐츠 배열
 *                 items:
 *                   $ref: '#/components/schemas/ContentItem'
 *                 example:
 *                   - type: text
 *                     content: "영업일 기준 3-5일 내 배송됩니다."
 *     responses:
 *       200:
 *         description: QnA 답변 작성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/QnA'
 *                 message:
 *                   type: string
 *                   example: "QnA 답변이 작성되었습니다."
 *       404:
 *         description: QnA를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommonErrorResponse'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommonErrorResponse'
 */

/**
 * @swagger
 * /store/qna/{qnaId}/like:
 *   post:
 *     summary: 상품 QnA 좋아요 토글
 *     description: QnA에 좋아요를 등록하거나 취소합니다.
 *     tags: [Store]
 *     parameters:
 *       - in: path
 *         name: qnaId
 *         required: true
 *         schema:
 *           type: string
 *           example: qna_123
 *         description: QnA ID
 *     responses:
 *       200:
 *         description: QnA 좋아요 토글 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "좋아요가 등록되었습니다."
 *                 isLiked:
 *                   type: boolean
 *                   example: true
 *                 likesCount:
 *                   type: integer
 *                   example: 3
 *       404:
 *         description: QnA를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommonErrorResponse'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommonErrorResponse'
 */

/**
 * @swagger
 * /store/qna/{qnaId}:
 *   delete:
 *     summary: 상품 QnA 삭제
 *     description: QnA를 삭제합니다.
 *     tags: [Store]
 *     parameters:
 *       - in: path
 *         name: qnaId
 *         required: true
 *         schema:
 *           type: string
 *           example: qna_123
 *         description: QnA ID
 *     responses:
 *       200:
 *         description: QnA 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "QnA가 삭제되었습니다."
 *       404:
 *         description: QnA를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommonErrorResponse'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommonErrorResponse'
 */

module.exports = {};
