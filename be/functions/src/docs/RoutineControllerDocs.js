/**
 * @fileoverview Routines API Swagger 문서 정의
 * Spring Boot의 @Tag, @Operation과 유사한 패턴
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     RoutineResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: 루틴 고유 ID
 *           example: "CP:4BITHC4NB5HA7"
 *         name:
 *           type: string
 *           description: 루틴 제목
 *           example: "66일 한끗루틴"
 *         description:
 *           type: string
 *           description: 루틴 설명
 *           example: "66일 동안 나만의 루틴을 지속하면 정말 나의 습관이 된다고 해요!"
 *         status:
 *           type: string
 *           enum: [OPEN, CLOSED, SOLD_OUT]
 *           description: 루틴 상태
 *           example: "SOLD_OUT"
 *         price:
 *           type: number
 *           description: 가격
 *           example: 0
 *         currency:
 *           type: string
 *           description: 통화
 *           example: "KRW"
 *         stockCount:
 *           type: number
 *           description: 재고 수량
 *           example: 0
 *         deadline:
 *           type: string
 *           format: date-time
 *           description: 루틴 마감일
 *           example: "2025-09-30T09:00:00Z"
 *         soldCount:
 *           type: number
 *           description: 판매 수량
 *           example: 10
 *         viewCount:
 *           type: number
 *           description: 조회수
 *           example: 130
 *         buyable:
 *           type: boolean
 *           description: 구매 가능 여부
 *           example: false
 *         sellerId:
 *           type: string
 *           description: 판매자 ID
 *           example: "CS:NOZU0HZP"
 *         sellerName:
 *           type: string
 *           description: 판매자명
 *           example: "유스보이스"
 *         images:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SimpleImage'
 *           description: 이미지 목록
 *         content:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ContentItem'
 *           description: 루틴 상세 내용 (인증글 content와 동일한 구조)
 *         options:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SimpleOption'
 *           description: 상품 옵션 목록
 *         primaryDetails:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SimpleDetail'
 *           description: 상세 정보 목록
 *         variants:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SimpleVariant'
 *           description: 상품 변형 목록
 *         customFields:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CustomField'
 *           description: 신청 시 필요한 커스텀 필드 목록
 *         qna:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/QnAItem'
 *           description: Q&A 목록
 *         certifications:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CertificationPost'
 *           description: 루틴 인증글 목록 (최근 10개)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 생성일시
 *           example: "2025-09-23T06:39:30.983Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 수정일시
 *           example: "2025-09-26T07:19:13.435Z"
 *
 *     ContentItem:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           enum: [image, text, video, tagSet]
 *           description: 콘텐츠 타입
 *           example: "image"
 *         order:
 *           type: number
 *           description: 콘텐츠 순서
 *           example: 1
 *         src:
 *           type: string
 *           description: 미디어 소스 URL (type이 image 또는 video일 때)
 *           example: "https://youthvoice.vake.io/files/G059CHCD9D/FE2RT5HDV/2025-09-27_23_14_54.494895.png"
 *         width:
 *           type: number
 *           description: 미디어 너비 (type이 image 또는 video일 때)
 *           example: 1080
 *         height:
 *           type: number
 *           description: 미디어 높이 (type이 image 또는 video일 때)
 *           example: 1080
 *         content:
 *           type: string
 *           description: 텍스트 내용 또는 미디어 설명
 *           example: "듀오링고를 아시나요??"
 *         blurHash:
 *           type: string
 *           description: 이미지 블러 해시 (type이 image일 때)
 *           example: "L6PZfSi_.AyE_3t7t7R**0o#DgR4"
 *         thumbUrl:
 *           type: string
 *           description: 비디오 썸네일 URL (type이 video일 때)
 *           example: "https://example.com/video-thumb.jpg"
 *         videoSource:
 *           type: string
 *           description: 비디오 소스 (type이 video일 때)
 *           example: "uploaded"
 *         provider:
 *           type: string
 *           description: 비디오 제공자 (type이 video일 때)
 *           example: "self"
 *         duration:
 *           type: number
 *           description: 비디오 길이 (초, type이 video일 때)
 *           example: 30
 *         sizeBytes:
 *           type: number
 *           description: 파일 크기 (바이트, type이 video일 때)
 *           example: 5242880
 *         mimeType:
 *           type: string
 *           description: MIME 타입 (type이 video일 때)
 *           example: "video/mp4"
 *         processingStatus:
 *           type: string
 *           description: 처리 상태 (type이 video일 때)
 *           example: "ready"
 *
 *     QnAItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Q&A ID
 *           example: "QNA_001"
 *         question:
 *           type: string
 *           description: 질문 내용
 *           example: "루틴 시작일은 언제인가요?"
 *         answer:
 *           type: string
 *           description: 답변 내용
 *           example: "매월 1일에 시작됩니다."
 *         askedBy:
 *           type: string
 *           description: 질문자 ID
 *           example: "user123"
 *         askedAt:
 *           type: string
 *           format: date-time
 *           description: 질문 등록일시
 *           example: "2025-09-25T10:00:00.000Z"
 *
 *     CertificationPost:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: 인증글 ID
 *           example: "CERT_001"
 *         author:
 *           type: string
 *           description: 작성자 ID
 *           example: "user456"
 *         title:
 *           type: string
 *           description: 인증글 제목
 *           example: "9/27 [저녁] 라뽀"
 *         thumbnailUrl:
 *           type: string
 *           description: 썸네일 이미지 URL
 *           example: "https://youthvoice.vake.io/files/G059CHCD9D/FE2RT5HDV/2025-09-27_23_14_54.494895.png"
 *         likesCount:
 *           type: number
 *           description: 좋아요 수
 *           example: 15
 *         commentsCount:
 *           type: number
 *           description: 댓글 수
 *           example: 3
 *         content:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ContentItem'
 *           description: 인증글 내용 (이미지, 텍스트, 태그셋 등)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 작성일시
 *           example: "2025-09-27T19:00:00.000Z"
 *         isMine:
 *           type: boolean
 *           description: 내가 작성한 글인지 여부
 *           example: false
 *
 *     CertificationDetailResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: 인증글 ID
 *           example: "CERT_001"
 *         author:
 *           type: string
 *           description: 작성자 ID
 *           example: "user456"
 *         title:
 *           type: string
 *           description: 인증글 제목
 *           example: "9/27 [저녁] 라뽀"
 *         content:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ContentBlock'
 *           description: 인증글 내용 (이미지, 텍스트 블록)
 *         likesCount:
 *           type: number
 *           description: 좋아요 수
 *           example: 15
 *         commentsCount:
 *           type: number
 *           description: 댓글 수
 *           example: 3
 *         isLiked:
 *           type: boolean
 *           description: 현재 사용자가 좋아요 했는지 여부
 *           example: false
 *         isMine:
 *           type: boolean
 *           description: 내가 작성한 글인지 여부
 *           example: false
 *         comments:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CommentResponse'
 *           description: 댓글 목록
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 작성일시
 *           example: "2025-09-27T19:00:00.000Z"
 *
 *     ContentBlock:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           enum: [image, text]
 *           description: 콘텐츠 블록 타입
 *           example: "image"
 *         src:
 *           type: string
 *           description: 이미지 URL (type이 image일 때)
 *           example: "https://youthvoice.vake.io/files/G059CHCD9D/FE2RT5HDV/2025-09-27_23_14_54.494895.png"
 *         width:
 *           type: number
 *           description: 이미지 너비 (type이 image일 때)
 *           example: 1080
 *         height:
 *           type: number
 *           description: 이미지 높이 (type이 image일 때)
 *           example: 1080
 *         content:
 *           type: string
 *           description: 텍스트 내용 (type이 text일 때)
 *           example: "듀오링고를 아시나요??"
 *
 *     CommentResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: 댓글 ID
 *           example: "comment-001"
 *         author:
 *           type: string
 *           description: 작성자 ID
 *           example: "user123"
 *         content:
 *           type: string
 *           description: 댓글 내용
 *           example: "부엉이 귀엽게 생겼네요 ㅋㅋㅋ"
 *         images:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CommentImage'
 *           description: 댓글 이미지들
 *         likesCount:
 *           type: number
 *           description: 댓글 좋아요 수
 *           example: 2
 *         isLiked:
 *           type: boolean
 *           description: 현재 사용자가 댓글에 좋아요 했는지 여부
 *           example: false
 *         isMine:
 *           type: boolean
 *           description: 내가 작성한 댓글인지 여부
 *           example: false
 *         parentId:
 *           type: string
 *           description: 부모 댓글 ID (답글인 경우)
 *           example: null
 *         depth:
 *           type: number
 *           description: 댓글 깊이 (0은 최상위, 1은 답글)
 *           example: 0
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 작성일시
 *           example: "2025-09-27T20:00:00.000Z"
 *
 *     CommentImage:
 *       type: object
 *       properties:
 *         src:
 *           type: string
 *           description: 이미지 URL
 *           example: "https://youthvoice.vake.io/files/G059CHCD9D/ABC123/comment_image_1.jpg"
 *         width:
 *           type: number
 *           description: 이미지 너비
 *           example: 800
 *         height:
 *           type: number
 *           description: 이미지 높이
 *           example: 600
 *         blurHash:
 *           type: string
 *           description: 블러 해시
 *           example: "L6PZfSi_.AyE_3t7t7R**0o#DgR4"
 *         order:
 *           type: number
 *           description: 이미지 순서
 *           example: 1
 *
 *     CustomField:
 *       type: object
 *       properties:
 *         isRequired:
 *           type: boolean
 *           description: 필수 여부
 *           example: true
 *         isSecret:
 *           type: boolean
 *           description: 비밀 여부
 *           example: false
 *         isMasking:
 *           type: boolean
 *           description: 마스킹 여부
 *           example: false
 *         type:
 *           type: string
 *           description: 필드 타입
 *           example: "input"
 *         key:
 *           type: string
 *           description: 필드 키
 *           example: "custom_1"
 *         label:
 *           type: object
 *           properties:
 *             ko:
 *               type: string
 *               description: 한국어 라벨
 *               example: "이름을 적어주세요."
 *         description:
 *           type: object
 *           properties:
 *             ko:
 *               type: string
 *               description: 한국어 설명
 *               example: "실명을 적어주세요. (닉네임X)"
 *
 *     ProductOption:
 *       type: object
 *       properties:
 *         key:
 *           type: string
 *           description: 옵션 키
 *           example: "key_b397a11b-1b96-48e3-85d5-aaab2667cf4f"
 *         label:
 *           type: object
 *           properties:
 *             ko:
 *               type: string
 *               description: 한국어 라벨
 *               example: "10월 한끗루틴 신청하기"
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               title:
 *                 type: object
 *                 properties:
 *                   ko:
 *                     type: string
 *                     example: "10월) 66일 한끗루틴"
 *               value:
 *                   type: string
 *                   example: "value_abb24d8d-26dd-4b16-b116-3c5b95c8042c"
 *
 *     PrimaryDetail:
 *       type: object
 *       properties:
 *         key:
 *           type: string
 *           description: 상세 정보 키
 *           example: "모집인원"
 *         value:
 *           type: string
 *           description: 상세 정보 값
 *           example: "10명 *선착순입니다."
 *
 *     ProductImages:
 *       type: object
 *       properties:
 *         mobile:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Image'
 *         web:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Image'
 *
 *     ProductVariant:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: 변형 ID
 *           example: "HBDI31D52H"
 *         productId:
 *           type: string
 *           description: 상품 ID
 *           example: "CP:4BITHC4NB5HA7"
 *         values:
 *           type: object
 *           description: 변형 값들
 *           example: {"key_b397a11b-1b96-48e3-85d5-aaab2667cf4f": "value_abb24d8d-26dd-4b16-b116-3c5b95c8042c"}
 *         soldCount:
 *           type: number
 *           description: 판매 수량
 *           example: 10
 *         stockCount:
 *           type: number
 *           description: 재고 수량
 *           example: 0
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
 *         shippingFee:
 *           type: number
 *           description: 배송비
 *           example: 0
 *         estimatedDeliveryAt:
 *           type: number
 *           description: 예상 배송일
 *           example: 0
 *         status:
 *           type: string
 *           description: 상태
 *           example: "soldOut"
 *         currency:
 *           type: string
 *           description: 통화
 *           example: "KRW"
 *         buyable:
 *           type: boolean
 *           description: 구매 가능 여부
 *           example: false
 *         createdAt:
 *           type: number
 *           description: 생성일시
 *           example: 1758609572251
 *         updatedAt:
 *           type: number
 *           description: 수정일시
 *           example: 1758609572251
 *         pricePrice:
 *           $ref: '#/components/schemas/PriceInfo'
 *         originalPricePrice:
 *           $ref: '#/components/schemas/PriceInfo'
 *         normalPricePrice:
 *           $ref: '#/components/schemas/PriceInfo'
 *         shippingFeePrice:
 *           $ref: '#/components/schemas/PriceInfo'
 *
 *     PriceInfo:
 *       type: object
 *       properties:
 *         currency:
 *           type: string
 *           description: 통화
 *           example: "KRW"
 *         value:
 *           type: string
 *           description: 가격 값 (문자열)
 *           example: "0"
 *         numValue:
 *           type: number
 *           description: 가격 값 (숫자)
 *           example: 0
 *         formattedValue:
 *           type: string
 *           description: 포맷된 가격
 *           example: "0원"
 *
 *     CreateRoutineRequest:
 *       type: object
 *       required:
 *         - name
 *         - description
 *       properties:
 *         name:
 *           type: string
 *           description: 루틴 제목
 *           example: "66일 한끗루틴"
 *         description:
 *           type: string
 *           description: 루틴 설명
 *           example: "66일 동안 나만의 루틴을 지속하면 정말 나의 습관이 된다고 해요!"
 *         status:
 *           type: string
 *           enum: [OPEN, CLOSED, SOLD_OUT]
 *           description: 루틴 상태
 *           default: "OPEN"
 *           example: "OPEN"
 *         price:
 *           type: number
 *           description: 가격
 *           default: 0
 *           example: 0
 *         currency:
 *           type: string
 *           description: 통화
 *           default: "KRW"
 *           example: "KRW"
 *         stockCount:
 *           type: number
 *           description: 재고 수량
 *           default: 0
 *           example: 0
 *         deadline:
 *           type: string
 *           format: date-time
 *           description: 루틴 마감일
 *           example: "2025-09-30T09:00:00Z"
 *         sellerId:
 *           type: string
 *           description: 판매자 ID
 *           example: "CS:NOZU0HZP"
 *         sellerName:
 *           type: string
 *           description: 판매자명
 *           example: "유스보이스"
 *         images:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SimpleImage'
 *           description: 이미지 목록
 *         content:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ContentItem'
 *           description: 루틴 상세 내용 (인증글 content와 동일한 구조)
 *         options:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SimpleOption'
 *           description: 상품 옵션 목록
 *         primaryDetails:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SimpleDetail'
 *           description: 상세 정보 목록
 *         variants:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SimpleVariant'
 *           description: 상품 변형 목록
 *
 *     ApplicationResponse:
 *       type: object
 *       properties:
 *         applicationId:
 *           type: string
 *           description: 신청 ID
 *         routineId:
 *           type: string
 *           description: 루틴 ID
 *         userId:
 *           type: string
 *           description: 사용자 ID
 *         status:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED]
 *           description: 신청 상태
 *         selectedVariant:
 *           type: string
 *           description: 선택된 변형 ID
 *         quantity:
 *           type: number
 *           description: 신청 수량
 *         routineName:
 *           type: string
 *           description: 루틴명
 *         routinePrice:
 *           type: number
 *           description: 루틴 가격
 *         customFieldsResponse:
 *           type: object
 *           description: 커스텀 필드 응답 값들
 *           example:
 *             custom_1: "홍길동"
 *             custom_2: "한끗러버"
 *             custom_3: "20070712"
 *             custom_4: "서울시 성동구"
 *             custom_5: "5"
 *             custom_6: "인스타그램"
 *             custom_7: "네, 확인했습니다"
 *         appliedAt:
 *           type: string
 *           format: date-time
 *           description: 신청일시
 *
 *     QnAResponse:
 *       type: object
 *       properties:
 *         qnaId:
 *           type: string
 *           description: QnA ID
 *         routineId:
 *           type: string
 *           description: 루틴 ID
 *         userId:
 *           type: string
 *           description: 사용자 ID
 *           example: "user123"
 *         content:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ContentItem'
 *           description: 질문 내용 (텍스트, 이미지, 동영상 포함)
 *         media:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/MediaItem'
 *           description: 첨부 미디어 (이미지, 동영상)
 *         answerContent:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ContentItem'
 *           description: 답변 내용 (텍스트, 이미지, 동영상 포함)
 *         answerMedia:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/MediaItem'
 *           description: 답변 첨부 미디어 (이미지, 동영상)
 *         likesCount:
 *           type: number
 *           description: 좋아요 수
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 생성일시
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 수정일시
 *
 *     CertificationResponse:
 *       type: object
 *       properties:
 *         certificationId:
 *           type: string
 *           description: 인증 ID
 *         routineId:
 *           type: string
 *           description: 루틴 ID
 *         userId:
 *           type: string
 *           description: 사용자 ID
 *         title:
 *           type: string
 *           description: 인증 제목
 *         content:
 *           type: string
 *           description: 인증 내용
 *         images:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Image'
 *         likesCount:
 *           type: number
 *           description: 좋아요 수
 *         commentsCount:
 *           type: number
 *           description: 댓글 수
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 생성일시
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 수정일시
 */

/**
 * @swagger
 * tags:
 *   - name: Routines
 *     description: 루틴 관련 API
 */

class RoutineControllerDocs {
  /**
   * @swagger
   * /routines:
   *   get:
   *     summary: 전체 루틴 목록 조회
   *     description: 등록된 모든 루틴 목록을 조회합니다.
   *     tags: [Routines]
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 0
   *         description: 페이지 번호 (0부터 시작)
   *         example: 0
   *       - in: query
   *         name: size
   *         schema:
   *           type: integer
   *           default: 10
   *         description: 페이지당 항목 수
   *         example: 10
   *     responses:
   *       200:
   *         description: 루틴 목록 조회 성공 (페이지네이션)
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
   *                       description: 현재 페이지 번호 (0부터 시작)
   *                     pageSize:
   *                       type: integer
   *                       description: 페이지당 항목 수
   *                     totalElements:
   *                       type: integer
   *                       description: 전체 항목 수
   *                     totalPages:
   *                       type: integer
   *                       description: 전체 페이지 수
   *                     hasNext:
   *                       type: boolean
   *                       description: 다음 페이지 존재 여부
   *                     hasPrevious:
   *                       type: boolean
   *                       description: 이전 페이지 존재 여부
   *                     isFirst:
   *                       type: boolean
   *                       description: 첫 페이지 여부
   *                     isLast:
   *                       type: boolean
   *                       description: 마지막 페이지 여부
   *       401:
   *         description: 인증 실패
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/CommonErrorResponse'
   *             examples:
   *               인증_실패:
   *                 summary: 유효하지 않은 토큰 또는 로그인 필요
   *                 value:
   *                   success: false
   *                   code: "COMMON_401"
   *                   message: "인증이 필요합니다."
   *       500:
   *         description: 서버 에러
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/CommonErrorResponse'
   *             examples:
   *               서버_에러:
   *                 summary: 예상치 못한 서버 에러
   *                 value:
   *                   success: false
   *                   code: "COMMON_500"
   *                   message: "서버 에러, 관리자에게 문의 바랍니다."
   */
  static getAllRoutines() {}

  /**
   * @swagger
   * /routines:
   *   post:
   *     summary: 새 루틴 생성
   *     description: 새로운 루틴을 생성합니다.
   *     tags: [Routines]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateRoutineRequest'
   *           examples:
   *             한끗루틴:
   *               summary: 66일 한끗루틴 생성 예시
   *               value:
   *                 name: "66일 한끗루틴"
   *                 description: "66일 동안 나만의 루틴을 지속하면 정말 나의 습관이 된다고 해요!\n스스로 설정한 목표를 꾸준히 실천하여 장기적으로 자신만의 루틴을 만들어보아요!"
   *                 type: "normal"
   *                 status: "OPEN"
   *                 price: 0
   *                 originalPrice: 0
   *                 normalPrice: 0
   *                 currency: "KRW"
   *                 stockCount: 10
   *                 deadline: "2025-09-30T09:00:00Z"
   *                 shippingFee: 0
   *                 shippingRequired: false
   *                 phoneNumberRequired: false
   *                 pidRequired: false
   *                 hidePriceForGuest: false
   *                 isDisplayed: true
   *                 deliveryType: "online"
   *                 categoryIds: ["CPC:43JEMNZKPY9H1"]
   *                 tagSetIds: []
   *                 accountIds: ["CA:3IK47NKA82NOC"]
   *                 userId: "CS:NOZU0HZP"
   *                 sellerId: "CS:NOZU0HZP"
   *                 parentSellerId: "CS:2QA9150Y"
   *                 customFields: [
   *                   {
   *                     isRequired: true,
   *                     isSecret: false,
   *                     isMasking: false,
   *                     type: "input",
   *                     key: "custom_1",
   *                     label: { ko: "이름을 적어주세요." },
   *                     description: { ko: "실명을 적어주세요. (닉네임X)" }
   *                   },
   *                   {
   *                     isRequired: true,
   *                     isSecret: false,
   *                     isMasking: false,
   *                     type: "input",
   *                     key: "custom_2",
   *                     label: { ko: "한끗루틴에서 사용할 닉네임을 알려주세요!" },
   *                     description: { ko: "15일동안 한끗루틴에서 사용할 닉네임을 써주세요. (변동X)" }
   *                   }
   *                 ]
   *                 options: [
   *                   {
   *                     key: "key_b397a11b-1b96-48e3-85d5-aaab2667cf4f",
   *                     label: { ko: "10월 한끗루틴 신청하기" },
   *                     items: [
   *                       {
   *                         title: { ko: "10월) 66일 한끗루틴" },
   *                         value: "value_abb24d8d-26dd-4b16-b116-3c5b95c8042c"
   *                       }
   *                     ]
   *                   }
   *                 ]
   *                 primaryDetails: [
   *                   { key: "모집인원", value: "10명 *선착순입니다." },
   *                   { key: "활동기간", value: "10.14일(화) ~ 12.18일(화)" },
   *                   { key: "신청기간", value: "9.26(금) ~ 10.10(금)" },
   *                   { key: "중복 참여 O", value: "다른 루틴과 중복 참여 가능" }
   *                 ]
   *                 images: {
   *                   mobile: [],
   *                   web: []
   *                 }
   *                 productVariants: []
   *                 additionalFeeInfos: []
   *                 productSets: []
   *                 variantSkus: []
   *                 creditAmount: 0
   *     responses:
   *       201:
   *         description: 루틴이 성공적으로 생성됨
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/RoutineResponse'
   *       400:
   *         description: 잘못된 요청
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/CommonErrorResponse'
   *             examples:
   *               필수_필드_누락:
   *                 summary: 필수 필드가 누락된 경우
   *                 value:
   *                   success: false
   *                   code: "COMMON_400"
   *                   message: "title, description, category, difficulty, duration, frequency are required"
   *       401:
   *         description: 인증 실패
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/CommonErrorResponse'
   *       500:
   *         description: 서버 에러
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/CommonErrorResponse'
   */
  static createRoutine() {}

  /**
   * @swagger
   * /routines/{routineId}:
   *   get:
   *     summary: 루틴 상세 조회
   *     description: 특정 루틴의 상세 정보를 조회합니다.
   *     tags: [Routines]
   *     parameters:
   *       - in: path
   *         name: routineId
   *         required: true
   *         schema:
   *           type: string
   *         description: 루틴 ID
   *         example: "IEsrfdrz5RLu6OS68oaZ"
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
   *                   $ref: '#/components/schemas/RoutineResponse'
   *       404:
   *         description: 루틴을 찾을 수 없음
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/CommonErrorResponse'
   *             examples:
   *               루틴_없음:
   *                 summary: 존재하지 않는 루틴 ID
   *                 value:
   *                   success: false
   *                   code: "COMMON_404"
   *                   message: "Routine not found"
   *       401:
   *         description: 인증 실패
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/CommonErrorResponse'
   *       500:
   *         description: 서버 에러
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/CommonErrorResponse'
   */
  static getRoutineById() {}

  /**
   * @swagger
   * /routines/{routineId}/apply:
   *   post:
   *     summary: 루틴 신청하기
   *     description: 특정 루틴에 신청합니다.
   *     tags: [Routines]
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
   *               - userId
   *             properties:
   *               userId:
   *                 type: string
   *                 description: 사용자 ID
   *                 example: "user123"
   *               customFieldsResponse:
   *                 type: object
   *                 description: 커스텀 필드 응답 값들
   *                 example:
   *                   custom_1: "홍길동"
   *                   custom_2: "한끗러버"
   *                   custom_3: "20070712"
   *                   custom_4: "서울시 성동구"
   *                   custom_5: "5"
   *                   custom_6: "인스타그램"
   *                   custom_7: "네, 확인했습니다"
   *               selectedVariant:
   *                 type: string
   *                 nullable: true
   *                 description: 선택된 상품 변형 ID
   *                 example: "HBDI31D52H"
   *               quantity:
   *                 type: number
   *                 description: 신청 수량
   *                 default: 1
   *                 example: 1
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
   *         description: 잘못된 요청
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/CommonErrorResponse'
   *       401:
   *         description: 인증 실패
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/CommonErrorResponse'
   *       500:
   *         description: 서버 에러
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/CommonErrorResponse'
   */
  static applyForRoutine() {}

  /**
   * 루틴 좋아요 토글 API 문서
   */
  static toggleRoutineLike() {
    /**
     * @swagger
     * /routines/{routineId}/like:
     *   post:
     *     summary: 루틴 좋아요 토글
     *     description: 루틴에 좋아요를 추가하거나 취소합니다.
     *     tags: [Routines]
     *     parameters:
     *       - in: path
     *         name: routineId
     *         required: true
     *         schema:
     *           type: string
     *         description: 루틴 ID
     *         example: "CP:4BITHC4NB5HA7"
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
     *                     routineId:
     *                       type: string
     *                       description: 루틴 ID
     *                       example: "CP:4BITHC4NB5HA7"
     *                     userId:
     *                       type: string
     *                       description: 사용자 ID
     *                       example: "USER_001"
     *                     isLiked:
     *                       type: boolean
     *                       description: 좋아요 상태
     *                       example: true
     *                     likeCount:
     *                       type: number
     *                       description: 총 좋아요 수
     *                       example: 15
     *                 message:
     *                   type: string
     *                   description: 결과 메시지
     *                   example: "좋아요를 추가했습니다."
     *       400:
     *         description: 잘못된 요청
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 error:
     *                   type: string
     *                   example: "User ID is required"
     *       404:
     *         description: 루틴을 찾을 수 없음
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 error:
     *                   type: string
     *                   example: "Routine not found"
     *       500:
     *         description: 서버 오류
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 error:
     *                   type: string
     *                   example: "Internal server error"
     */
  }

  /**
   * @swagger
   * /routines/{routineId}/qna:
   *   post:
   *     summary: 루틴 QnA 작성
   *     description: 특정 루틴에 대한 질문을 작성합니다.
   *     tags: [Routines]
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
   *                 items:
   *                   $ref: '#/components/schemas/ContentItem'
   *                 description: 질문 내용 (텍스트, 이미지, 동영상 포함)
   *                 example:
   *                   - type: "text"
   *                     order: 1
   *                     content: "루틴 시작일은 언제인가요?"
   *                   - type: "text"
   *                     order: 2
   *                     content: "혹시 중간에 참여할 수 있나요?"
   *                   - type: "image"
   *                     order: 3
   *                     src: "https://example.com/question-image.jpg"
   *                     width: 800
   *                     height: 600
   *                     blurHash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4"
   *                   - type: "video"
   *                     order: 4
   *                     src: "https://example.com/question-video.mp4"
   *                     width: 1920
   *                     height: 1080
   *                     thumbUrl: "https://example.com/question-video-thumb.jpg"
   *                     videoSource: "uploaded"
   *                     provider: "self"
   *                     duration: 30
   *                     sizeBytes: 5242880
   *                     mimeType: "video/mp4"
   *                     processingStatus: "ready"
   *     responses:
   *       201:
   *         description: QnA 작성 성공
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/QnAResponse'
   *       400:
   *         description: 잘못된 요청
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/CommonErrorResponse'
   *       401:
   *         description: 인증 실패
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/CommonErrorResponse'
   *       500:
   *         description: 서버 에러
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/CommonErrorResponse'
   */
  static createQnA() {}

  /**
   * @swagger
   * /routines/{routineId}/qna/{qnaId}:
   *   put:
   *     summary: 루틴 QnA 수정
   *     description: 특정 루틴의 QnA를 수정합니다.
   *     tags: [Routines]
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
   *                 items:
   *                   $ref: '#/components/schemas/ContentItem'
   *                 description: 질문 내용 (텍스트, 이미지, 동영상 포함)
   *                 example:
   *                   - type: "text"
   *                     order: 1
   *                     content: "루틴 시작일은 언제인가요?"
   *                   - type: "text"
   *                     order: 2
   *                     content: "혹시 중간에 참여할 수 있나요?"
   *                   - type: "image"
   *                     order: 3
   *                     src: "https://example.com/question-image.jpg"
   *                     width: 800
   *                     height: 600
   *                     blurHash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4"
   *                   - type: "video"
   *                     order: 4
   *                     src: "https://example.com/question-video.mp4"
   *                     width: 1920
   *                     height: 1080
   *                     thumbUrl: "https://example.com/question-video-thumb.jpg"
   *                     videoSource: "uploaded"
   *                     provider: "self"
   *                     duration: 30
   *                     sizeBytes: 5242880
   *                     mimeType: "video/mp4"
   *                     processingStatus: "ready"
   *     responses:
   *       200:
   *         description: QnA 수정 성공
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/QnAResponse'
   *       400:
   *         description: 잘못된 요청
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/CommonErrorResponse'
   *       404:
   *         description: QnA를 찾을 수 없음
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/CommonErrorResponse'
   *       500:
   *         description: 서버 에러
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/CommonErrorResponse'
   */
  static updateQnA() {}

  /**
   * @swagger
   * /routines/qna/{qnaId}:
   *   delete:
   *     summary: 루틴 QnA 삭제
   *     description: 특정 루틴의 QnA를 삭제합니다.
   *     tags: [Routines]
   *     parameters:
   *       - in: path
   *         name: qnaId
   *         required: true
   *         schema:
   *           type: string
   *         description: QnA ID
   *     responses:
   *       200:
   *         description: QnA 삭제 성공
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "QnA가 성공적으로 삭제되었습니다"
   *       404:
   *         description: QnA를 찾을 수 없음
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/CommonErrorResponse'
   *       500:
   *         description: 서버 에러
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/CommonErrorResponse'
   */
  static deleteQnA() {}

  /**
   * @swagger
   * /routines/qna/{qnaId}/answer:
   *   post:
   *     summary: 루틴 Q&A 답변 작성
   *     tags: [Routines]
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
   *                 items:
   *                   $ref: '#/components/schemas/ContentItem'
   *                 description: 답변 내용
   *               media:
   *                 type: array
   *                 items:
   *                   $ref: '#/components/schemas/MediaItem'
   *                 description: 답변 미디어
   *               userId:
   *                 type: string
   *                 description: 답변자 ID
   *     responses:
   *       200:
   *         description: 답변 작성 성공
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 qnaId:
   *                   type: string
   *                 content:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/ContentItem'
   *                 media:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/MediaItem'
   *                 answerContent:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/ContentItem'
   *                 answerMedia:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/MediaItem'
   *                 answerUserId:
   *                   type: string
   *                 likesCount:
   *                   type: number
   *                 createdAt:
   *                   type: string
   *                   format: date-time
   *                 answerCreatedAt:
   *                   type: string
   *                   format: date-time
   *       400:
   *         description: 잘못된 요청
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/CommonErrorResponse'
   *       404:
   *         description: Q&A를 찾을 수 없음
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
  static createQnAAnswer() {}

  /**
   * @swagger
   * /routines/qna/{qnaId}/like:
   *   post:
   *     summary: 루틴 Q&A 좋아요 토글
   *     tags: [Routines]
   *     parameters:
   *       - in: path
   *         name: qnaId
   *         required: true
   *         schema:
   *           type: string
   *         description: Q&A ID
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
   *                 data:
   *                   type: object
   *                   properties:
   *                     qnaId:
   *                       type: string
   *                     isLiked:
   *                       type: boolean
   *                     likeCount:
   *                       type: number
   *                 message:
   *                   type: string
   *       400:
   *         description: 잘못된 요청
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/CommonErrorResponse'
   *       404:
   *         description: Q&A를 찾을 수 없음
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
  static toggleQnALike() {}
}

/**
 * @swagger
 * components:
 *   schemas:
 *     SimpleImage:
 *       type: object
 *       properties:
 *         url:
 *           type: string
 *           description: 이미지 URL
 *           example: "https://youthvoice.vake.io/files/G0IZUDWCL/FKGRWXUG8/file"
 *         order:
 *           type: number
 *           description: 이미지 순서
 *           example: 1
 *
 *     SimpleOption:
 *       type: object
 *       properties:
 *         key:
 *           type: string
 *           description: 옵션 키
 *           example: "month_selection"
 *         label:
 *           type: string
 *           description: 옵션 라벨
 *           example: "신청 월 선택"
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: 옵션 제목
 *                 example: "10월) 66일 한끗루틴"
 *               value:
 *                 type: string
 *                 description: 옵션 값
 *                 example: "october_2024"
 *
 *     SimpleDetail:
 *       type: object
 *       properties:
 *         key:
 *           type: string
 *           description: 상세 정보 키
 *           example: "recruitment"
 *         label:
 *           type: string
 *           description: 상세 정보 라벨
 *           example: "모집인원"
 *         value:
 *           type: string
 *           description: 상세 정보 값
 *           example: "10명 *선착순입니다."
 *
 *     SimpleVariant:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: 변형 ID
 *           example: "HBDI31D52H"
 *         optionValues:
 *           type: object
 *           description: 선택된 옵션 값들
 *           example: {"month_selection": "october_2024"}
 *         stockCount:
 *           type: number
 *           description: 재고 수량
 *           example: 0
 *         soldCount:
 *           type: number
 *           description: 판매 수량
 *           example: 10
 *         price:
 *           type: number
 *           description: 가격
 *           example: 0
 *         status:
 *           type: string
 *           description: 변형 상태
 *           example: "soldOut"
 *
 *     CustomField:
 *       type: object
 *       properties:
 *         isRequired:
 *           type: boolean
 *           description: 필수 입력 여부
 *           example: true
 *         isSecret:
 *           type: boolean
 *           description: 비밀 정보 여부
 *           example: false
 *         isMasking:
 *           type: boolean
 *           description: 마스킹 처리 여부
 *           example: false
 *         type:
 *           type: string
 *           description: 필드 타입
 *           example: "input"
 *         key:
 *           type: string
 *           description: 필드 키
 *           example: "custom_1"
 *         label:
 *           type: object
 *           properties:
 *             ko:
 *               type: string
 *               description: 한국어 라벨
 *               example: "이름을 적어주세요."
 *         description:
 *           type: object
 *           properties:
 *             ko:
 *               type: string
 *               description: 한국어 설명
 *               example: "실명을 적어주세요. (닉네임X)"
 *
 *     MediaItem:
 *       type: object
 *       properties:
 *         url:
 *           type: string
 *           description: 미디어 URL
 *           example: "https://example.com/media.jpg"
 *         type:
 *           type: string
 *           enum: [image, video]
 *           description: 미디어 타입
 *           example: "image"
 *         order:
 *           type: number
 *           description: 미디어 순서
 *           example: 1
 *         width:
 *           type: number
 *           description: 미디어 너비
 *           example: 800
 *         height:
 *           type: number
 *           description: 미디어 높이
 *           example: 600
 *         blurHash:
 *           type: string
 *           description: 이미지 블러 해시 (type이 image일 때)
 *           example: "L6PZfSi_.AyE_3t7t7R**0o#DgR4"
 *         thumbUrl:
 *           type: string
 *           description: 비디오 썸네일 URL (type이 video일 때)
 *           example: "https://example.com/video-thumb.jpg"
 *         videoSource:
 *           type: string
 *           description: 비디오 소스 (type이 video일 때)
 *           example: "uploaded"
 *         provider:
 *           type: string
 *           description: 비디오 제공자 (type이 video일 때)
 *           example: "self"
 *         duration:
 *           type: number
 *           description: 비디오 길이 (초, type이 video일 때)
 *           example: 30
 *         sizeBytes:
 *           type: number
 *           description: 파일 크기 (바이트, type이 video일 때)
 *           example: 5242880
 *         mimeType:
 *           type: string
 *           description: MIME 타입 (type이 video일 때)
 *           example: "video/mp4"
 *         processingStatus:
 *           type: string
 *           description: 처리 상태 (type이 video일 때)
 *           example: "ready"
 */

module.exports = RoutineControllerDocs;
