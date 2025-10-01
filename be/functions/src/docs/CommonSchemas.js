/**
 * @fileoverview 공통 Swagger 스키마 정의
 * Spring Boot의 공통 DTO와 유사한 역할
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     # 공통 응답 스키마
 *     ApiResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: 요청 성공 여부
 *         data:
 *           type: object
 *           description: 응답 데이터
 *         message:
 *           type: string
 *           description: 응답 메시지
 *         code:
 *           type: string
 *           description: 응답 코드
 *
 *     # 에러 응답 스키마
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         code:
 *           type: string
 *           description: 에러 코드
 *         message:
 *           type: string
 *           description: 에러 메시지
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: 에러 발생 시간
 *
 *     # 공통 에러 응답 스키마 (CommonErrorResponse 별칭)
 *     CommonErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         code:
 *           type: string
 *           description: 에러 코드
 *         message:
 *           type: string
 *           description: 에러 메시지
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: 에러 발생 시간
 *
 *     # 성공 응답 스키마
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           description: 응답 데이터
 *         message:
 *           type: string
 *           example: "요청이 성공적으로 처리되었습니다."
 *
 *     # 콘텐츠 아이템 스키마
 *     ContentItem:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           enum: ['text', 'image', 'video', 'embed', 'file']
 *           description: 콘텐츠 타입
 *         order:
 *           type: number
 *           description: 콘텐츠 순서
 *         content:
 *           type: string
 *           description: 텍스트 내용 (type이 text일 때)
 *         url:
 *           type: string
 *           description: 미디어 URL (type이 image/video/file일 때)
 *         width:
 *           type: number
 *           description: 너비
 *         height:
 *           type: number
 *           description: 높이
 *         blurHash:
 *           type: string
 *           description: 블러 해시
 *         thumbUrl:
 *           type: string
 *           description: 비디오 썸네일 URL
 *         videoSource:
 *           type: string
 *           enum: ['uploaded', 'youtube', 'vimeo']
 *           description: 비디오 소스
 *         provider:
 *           type: string
 *           enum: ['youtube', 'vimeo', 'self']
 *           description: 비디오 제공자
 *         providerVideoId:
 *           type: string
 *           description: 유튜브/비메오 비디오 ID
 *         duration:
 *           type: number
 *           description: 비디오 길이 (초)
 *         sizeBytes:
 *           type: number
 *           description: 파일 크기
 *         mimeType:
 *           type: string
 *           description: MIME 타입
 *         processingStatus:
 *           type: string
 *           enum: ['uploaded', 'processing', 'ready', 'failed']
 *           description: 처리 상태
 *         transcodedVariants:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               resolution:
 *                 type: string
 *               bitrate:
 *                 type: number
 *               url:
 *                 type: string
 *           description: 비디오 변환 버전들
 *         fileName:
 *           type: string
 *           description: 파일명 (type이 file일 때)
 *
 *     # 미디어 아이템 스키마
 *     MediaItem:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           enum: ['image', 'video', 'embed', 'file']
 *           description: 미디어 타입
 *         url:
 *           type: string
 *           description: 미디어 URL
 *         order:
 *           type: number
 *           description: 미디어 순서
 *         width:
 *           type: number
 *           description: 너비
 *         height:
 *           type: number
 *           description: 높이
 *         blurHash:
 *           type: string
 *           description: 블러 해시
 *         thumbUrl:
 *           type: string
 *           description: 비디오 썸네일 URL
 *         videoSource:
 *           type: string
 *           enum: ['uploaded', 'youtube', 'vimeo']
 *           description: 비디오 소스
 *         provider:
 *           type: string
 *           enum: ['youtube', 'vimeo', 'self']
 *           description: 비디오 제공자
 *         providerVideoId:
 *           type: string
 *           description: 유튜브/비메오 비디오 ID
 *         duration:
 *           type: number
 *           description: 비디오 길이 (초)
 *         sizeBytes:
 *           type: number
 *           description: 파일 크기
 *         mimeType:
 *           type: string
 *           description: MIME 타입
 *         processingStatus:
 *           type: string
 *           enum: ['uploaded', 'processing', 'ready', 'failed']
 *           description: 처리 상태
 *         transcodedVariants:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               resolution:
 *                 type: string
 *               bitrate:
 *                 type: number
 *               url:
 *                 type: string
 *           description: 비디오 변환 버전들
 *         fileName:
 *           type: string
 *           description: 파일명 (type이 file일 때)
 *
 *     # 루틴/소모임/TMI 기본 스키마
 *     BaseItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: 아이템 ID
 *         name:
 *           type: string
 *           description: 이름
 *         description:
 *           type: string
 *           description: 설명
 *         status:
 *           type: string
 *           enum: ['OPEN', 'SOLD_OUT', 'CLOSED']
 *           description: 상태
 *         price:
 *           type: number
 *           description: 가격
 *         currency:
 *           type: string
 *           description: 통화
 *         stockCount:
 *           type: number
 *           description: 총 재고
 *         soldCount:
 *           type: number
 *           description: 판매된 수량
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
 *           description: 상세 내용
 *         media:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/MediaItem'
 *           description: 별도 관리용 미디어
 *         options:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               key:
 *                 type: string
 *               label:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                     value:
 *                       type: string
 *           description: 상품 옵션
 *         primaryDetails:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               key:
 *                 type: string
 *               label:
 *                 type: string
 *               value:
 *                 type: string
 *           description: 상세 정보
 *         variants:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               optionValues:
 *                 type: object
 *               stockCount:
 *                 type: number
 *               soldCount:
 *                 type: number
 *               price:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: ['active', 'soldOut']
 *           description: 상품 변형
 *         customFields:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               isRequired:
 *                 type: boolean
 *               isSecret:
 *                 type: boolean
 *               isMasking:
 *                 type: boolean
 *               type:
 *                 type: string
 *                 enum: ['input', 'select']
 *               key:
 *                 type: string
 *               label:
 *                 type: object
 *                 properties:
 *                   ko:
 *                     type: string
 *               description:
 *                 type: object
 *                 properties:
 *                   ko:
 *                     type: string
 *           description: 커스텀 필드
 *         deadline:
 *           type: string
 *           format: date-time
 *           description: 마감일
 *         createdAt:
 *           type: number
 *           description: 생성일
 *         updatedAt:
 *           type: number
 *           description: 수정일
 *
 *     # 신청 스키마 (루틴/소모임/TMI 모두 지원)
 *     Application:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: 신청 ID
 *         type:
 *           type: string
 *           enum: ['ROUTINE', 'GATHERING', 'TMI']
 *           description: 신청 타입
 *         targetId:
 *           type: string
 *           description: 대상 ID (루틴/소모임/TMI ID)
 *         userId:
 *           type: string
 *           description: 사용자 ID
 *         status:
 *           type: string
 *           enum: ['PENDING', 'APPROVED', 'REJECTED']
 *           description: 신청 상태
 *         selectedVariant:
 *           type: string
 *           nullable: true
 *           description: 선택된 변형 ID
 *         quantity:
 *           type: number
 *           description: 수량
 *         targetName:
 *           type: string
 *           description: 대상명 (루틴명/소모임명/TMI명)
 *         targetPrice:
 *           type: number
 *           description: 대상 가격
 *         customFieldsResponse:
 *           type: object
 *           description: 커스텀 필드 응답
 *         appliedAt:
 *           type: string
 *           format: date-time
 *           description: 신청일
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 수정일
 *
 *     # 페이지네이션 스키마
 *     PaginationResponse:
 *       type: object
 *       properties:
 *         page:
 *           type: number
 *           description: 현재 페이지
 *           example: 1
 *         limit:
 *           type: number
 *           description: 페이지당 항목 수
 *           example: 10
 *         total:
 *           type: number
 *           description: 전체 항목 수
 *           example: 100
 *         totalPages:
 *           type: number
 *           description: 전체 페이지 수
 *           example: 10
 *         hasNext:
 *           type: boolean
 *           description: 다음 페이지 존재 여부
 *           example: true
 *         hasPrev:
 *           type: boolean
 *           description: 이전 페이지 존재 여부
 *           example: false
 *
 *     # 공통 에러 코드
 *     ErrorCodes:
 *       type: object
 *       properties:
 *         COMMON_400:
 *           type: string
 *           example: "잘못된 요청입니다."
 *         COMMON_401:
 *           type: string
 *           example: "인증이 필요합니다."
 *         COMMON_403:
 *           type: string
 *           example: "접근 권한이 없습니다."
 *         COMMON_404:
 *           type: string
 *           example: "요청한 리소스를 찾을 수 없습니다."
 *         COMMON_500:
 *           type: string
 *           example: "서버 에러, 관리자에게 문의 바랍니다."
 *
 *     # 게시글 스키마
 *     Post:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: 게시글 고유 ID
 *           example: "CERT_1758883064394"
 *         type:
 *           type: string
 *           enum: [ROUTINE_CERT, TMI_INTRO, GATHERING_REVIEW]
 *           description: 게시글 타입
 *           example: "ROUTINE_CERT"
 *         refId:
 *           type: string
 *           description: 외부 참조 ID (루틴 ID 등)
 *           example: "routine_123"
 *         authorId:
 *           type: string
 *           description: 작성자 ID
 *           example: "user123"
 *         author:
 *           type: string
 *           description: 작성자 닉네임
 *           example: "사용자닉네임"
 *         communityPath:
 *           type: string
 *           description: 커뮤니티 경로
 *           example: "communities/routine-cert"
 *         title:
 *           type: string
 *           description: 게시글 제목
 *           example: "오늘의 루틴 인증!"
 *         content:
 *           type: array
 *           description: 게시글 본문 내용
 *           items:
 *             $ref: '#/components/schemas/ContentItem'
 *         media:
 *           type: array
 *           description: 미디어 목록
 *           items:
 *             $ref: '#/components/schemas/MediaItem'
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
 *           enum: [public, private, hidden]
 *           description: 공개 범위
 *           example: "public"
 *         rewardGiven:
 *           type: boolean
 *           description: 리워드 지급 여부
 *           example: false
 *         reactionsCount:
 *           type: number
 *           description: 반응 수
 *           example: 0
 *         likesCount:
 *           type: number
 *           description: 좋아요 수
 *           example: 0
 *         commentsCount:
 *           type: number
 *           description: 댓글 수
 *           example: 0
 *         reportsCount:
 *           type: number
 *           description: 신고 수
 *           example: 0
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 생성일시
 *           example: "2025-09-28T14:39:41.690Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 수정일시
 *           example: "2025-09-28T14:39:41.690Z"
 *
 */

class CommonSchemas {
  /**
   * 공통 성공 응답 생성
   * @param {Object} data - 응답 데이터
   * @param {string} message - 응답 메시지
   * @returns {Object} 성공 응답 객체
   */
  static createSuccessResponse(
    data = null,
    message = "요청이 성공적으로 처리되었습니다."
  ) {
    return {
      success: true,
      data,
      message,
    };
  }

  /**
   * 공통 에러 응답 생성
   * @param {string} code - 에러 코드
   * @param {string} message - 에러 메시지
   * @returns {Object} 에러 응답 객체
   */
  static createErrorResponse(code, message) {
    return {
      success: false,
      code,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 페이지네이션 응답 생성
   * @param {Array} data - 데이터 배열
   * @param {number} page - 현재 페이지
   * @param {number} limit - 페이지당 항목 수
   * @param {number} total - 전체 항목 수
   * @returns {Object} 페이지네이션 응답 객체
   */
  static createPaginationResponse(data, page, limit, total) {
    const totalPages = Math.ceil(total / limit);
    return {
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }
}

/**
 * @swagger
 * components:
 *   schemas:
 *     # 커뮤니티 스키마
 *     Community:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: 커뮤니티 ID
 *           example: "routine-planner"
 *         name:
 *           type: string
 *           description: 커뮤니티 이름
 *           example: "플래너 작성하기"
 *         interestTag:
 *           type: string
 *           description: 관심사 태그
 *           example: "productivity"
 *         type:
 *           type: string
 *           enum: [interest, anonymous]
 *           description: 커뮤니티 타입
 *           example: "interest"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 생성일시
 *         createdBy:
 *           type: string
 *           description: 생성자 ID
 *           example: "user123"
 *         linkedChat:
 *           type: string
 *           format: uri
 *           description: 연결된 채팅방 URL
 *           example: "https://open.kakao.com/o/planner-chat"
 *         membersCount:
 *           type: integer
 *           description: 멤버 수
 *           example: 25
 *         postsCount:
 *           type: integer
 *           description: 게시글 수
 *           example: 150
 *
 *     # 커뮤니티 멤버 스키마
 *     CommunityMember:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           description: 사용자 ID
 *           example: "user123"
 *         role:
 *           type: string
 *           enum: [member, admin]
 *           description: 멤버 역할
 *           example: "member"
 *         joinedAt:
 *           type: string
 *           format: date-time
 *           description: 가입일시
 *
 *     # 게시글 스키마
 *     Post:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: 게시글 ID
 *           example: "CERT_1234567890"
 *         type:
 *           type: string
 *           enum: [POST, ROUTINE_CERT, GATHERING_REVIEW, TMI_INTRO, TMI_PROJECT]
 *           description: 게시글 타입
 *           example: "ROUTINE_CERT"
 *         refId:
 *           type: string
 *           nullable: true
 *           description: 외부 참조 ID
 *           example: "routine_123"
 *         authorId:
 *           type: string
 *           description: 작성자 ID
 *           example: "user123"
 *         author:
 *           type: string
 *           description: 작성자 닉네임
 *           example: "플래너러버"
 *         communityPath:
 *           type: string
 *           description: 커뮤니티 경로
 *           example: "communities/routine-planner"
 *         title:
 *           type: string
 *           description: 게시글 제목
 *           example: "오늘의 루틴 인증!"
 *         content:
 *           type: array
 *           description: 게시글 본문
 *           items:
 *             $ref: '#/components/schemas/ContentItem'
 *         media:
 *           type: array
 *           description: 별도 관리용 미디어
 *           items:
 *             $ref: '#/components/schemas/MediaItem'
 *         channel:
 *           type: string
 *           description: 채널명
 *           example: "플래너 인증 루틴"
 *         category:
 *           type: string
 *           description: 게시글 카테고리
 *           example: "한끗루틴"
 *         tags:
 *           type: array
 *           description: 태그 목록
 *           items:
 *             type: string
 *           example: ["아침 한끗", "66일 루틴"]
 *         scheduledDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: 예약 날짜 (선택사항)
 *           example: "2025-09-23T09:00:00Z"
 *         isLocked:
 *           type: boolean
 *           description: 잠금 여부
 *           example: false
 *         visibility:
 *           type: string
 *           enum: [public, private, hidden]
 *           description: 공개 범위
 *           example: "public"
 *         rewardGiven:
 *           type: boolean
 *           description: 리워드 지급 여부
 *           example: false
 *         reactionsCount:
 *           type: integer
 *           description: 반응 수
 *           example: 5
 *         likesCount:
 *           type: integer
 *           description: 좋아요 수
 *           example: 12
 *         commentsCount:
 *           type: integer
 *           description: 댓글 수
 *           example: 3
 *         reportsCount:
 *           type: integer
 *           description: 신고 수
 *           example: 0
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 생성일시
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 수정일시
 *
 *
 *     # 게시글 목록용 간소화된 스키마
 *     PostListItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: 게시글 ID
 *           example: "CERT_1234567890"
 *         type:
 *           type: string
 *           enum: [POST, ROUTINE_CERT, GATHERING_REVIEW, TMI_INTRO, TMI_PROJECT]
 *           description: 게시글 타입
 *           example: "ROUTINE_CERT"
 *         author:
 *           type: string
 *           description: 작성자 닉네임
 *           example: "플래너러버"
 *         title:
 *           type: string
 *           description: 게시글 제목
 *           example: "오늘의 루틴 인증!"
 *         preview:
 *           $ref: '#/components/schemas/PostPreview'
 *         mediaCount:
 *           type: integer
 *           description: 미디어 개수
 *           example: 2
 *         channel:
 *           type: string
 *           description: 채널명
 *           example: "플래너 인증 루틴"
 *         category:
 *           type: string
 *           nullable: true
 *           description: 게시글 카테고리
 *           example: "한끗루틴"
 *         tags:
 *           type: array
 *           description: 태그 목록
 *           items:
 *             type: string
 *           example: ["아침 한끗", "66일 루틴"]
 *         scheduledDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: 예약 날짜 (선택사항)
 *           example: "2025-09-23T09:00:00Z"
 *         isLocked:
 *           type: boolean
 *           description: 잠금 여부
 *           example: false
 *         visibility:
 *           type: string
 *           enum: [public, private, hidden]
 *           description: 공개 범위
 *           example: "public"
 *         likesCount:
 *           type: integer
 *           description: 좋아요 수
 *           example: 5
 *         commentsCount:
 *           type: integer
 *           description: 댓글 수
 *           example: 3
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 생성일시
 *           example: "2025-09-28T15:30:00Z"
 *         timeAgo:
 *           type: string
 *           description: 상대적 시간
 *           example: "1시간 전"
 *
 *     # 게시글 미리보기 스키마
 *     PostPreview:
 *       type: object
 *       properties:
 *         description:
 *           type: string
 *           description: 미리보기 텍스트 (100자 제한)
 *           example: "오늘도 루틴을 완료했습니다! 정말 뿌듯해요. 내일도 파이팅!"
 *         thumbnail:
 *           $ref: '#/components/schemas/ThumbnailImage'
 *         isVideo:
 *           type: boolean
 *           description: 비디오 여부 (이미지가 없고 비디오만 있는 경우)
 *           example: false
 *         hasImage:
 *           type: boolean
 *           description: 이미지 포함 여부
 *           example: true
 *         hasVideo:
 *           type: boolean
 *           description: 비디오 포함 여부
 *           example: false
 *
 *     # 썸네일 이미지 스키마
 *     ThumbnailImage:
 *       type: object
 *       properties:
 *         url:
 *           type: string
 *           format: uri
 *           description: 이미지 URL
 *           example: "https://example.com/thumbnail.jpg"
 *         blurHash:
 *           type: string
 *           description: 블러 해시
 *           example: "e8HLPL%$?G9Zt84:IUR-%1t700R49ZS2Iotm$ya{DiRP$xx^t5~qxv"
 *         width:
 *           type: integer
 *           description: 너비
 *           example: 1080
 *         height:
 *           type: integer
 *           description: 높이
 *           example: 1080
 *         ratio:
 *           type: string
 *           description: 비율
 *           example: "1:1"
 *
 *     # 댓글 스키마
 *     Comment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: 댓글 ID
 *           example: "comment_123"
 *         type:
 *           type: string
 *           enum: ['ROUTINE_CERT', 'GATHERING_REVIEW', 'TMI']
 *           description: 댓글 타입
 *           example: "ROUTINE_CERT"
 *         targetId:
 *           type: string
 *           description: 대상 게시글 ID
 *           example: "CERT_1234567890"
 *         targetPath:
 *           type: string
 *           description: 대상 게시글 경로
 *           example: "communities/routine-planner/posts/CERT_1234567890"
 *         userId:
 *           type: string
 *           description: 작성자 ID
 *           example: "user123"
 *         userNickname:
 *           type: string
 *           description: 작성자 닉네임
 *           example: "사용자닉네임"
 *         content:
 *           type: array
 *           description: 댓글 내용 (텍스트, 이미지, 비디오, 파일 등)
 *           items:
 *             $ref: '#/components/schemas/ContentItem'
 *         mediaBlocks:
 *           type: array
 *           description: 미디어 블록들
 *           items:
 *             $ref: '#/components/schemas/MediaItem'
 *         parentId:
 *           type: string
 *           nullable: true
 *           description: 부모 댓글 ID (대댓글인 경우)
 *           example: "comment_456"
 *         depth:
 *           type: integer
 *           description: "댓글 깊이 (0: 댓글, 1: 대댓글)"
 *           example: 0
 *         isReply:
 *           type: boolean
 *           description: 대댓글 여부
 *           example: false
 *         isLocked:
 *           type: boolean
 *           description: 잠금 여부
 *           example: false
 *         reportsCount:
 *           type: integer
 *           description: 신고 수
 *           example: 0
 *         likesCount:
 *           type: integer
 *           description: 좋아요 수
 *           example: 3
 *         deleted:
 *           type: boolean
 *           description: 삭제 여부
 *           example: false
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: 삭제 일시
 *           example: null
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 생성일시
 *           example: "2025-09-28T15:30:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 수정일시
 *           example: "2025-09-28T15:30:00Z"
 *
 *     # 댓글 이미지 스키마
 *     CommentImage:
 *       type: object
 *       properties:
 *         url:
 *           type: string
 *           format: uri
 *           description: 이미지 URL
 *           example: "https://example.com/image.jpg"
 *         order:
 *           type: integer
 *           description: 순서
 *           example: 1
 *         width:
 *           type: integer
 *           nullable: true
 *           description: 너비
 *           example: 800
 *         height:
 *           type: integer
 *           nullable: true
 *           description: 높이
 *           example: 600
 *         blurHash:
 *           type: string
 *           nullable: true
 *           description: 블러 해시
 *           example: "L6PZfSi_.AyE_3t7t7R**0o#DgR4"
 *         thumbUrl:
 *           type: string
 *           nullable: true
 *           description: 썸네일 URL
 *           example: "https://example.com/thumb.jpg"
 *         fileName:
 *           type: string
 *           nullable: true
 *           description: 파일명
 *           example: "image.jpg"
 *         sizeBytes:
 *           type: integer
 *           nullable: true
 *           description: 파일 크기 (바이트)
 *           example: 1024000
 *         mimeType:
 *           type: string
 *           nullable: true
 *           description: MIME 타입
 *           example: "image/jpeg"
 *
 *     # 댓글과 대댓글 스키마
 *     CommentWithReplies:
 *       allOf:
 *         - $ref: '#/components/schemas/Comment'
 *         - type: object
 *           properties:
 *             replies:
 *               type: array
 *               description: 대댓글 목록
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *
 *     # 상품 목록용 간소화된 스키마 (루틴/소모임 공통)
 *     ProductListItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: 상품 고유 ID
 *           example: "routine-planner"
 *         name:
 *           type: string
 *           description: 상품 제목
 *           example: "66일 한끗루틴"
 *         description:
 *           type: string
 *           description: 상품 설명
 *           example: "66일 동안 나만의 루틴을 지속하면 정말 나의 습관이 된다고 해요!"
 *         status:
 *           type: string
 *           enum: [OPEN, CLOSED, SOLD_OUT]
 *           description: 상품 상태
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
 *           type: number
 *           description: 재고 수량
 *           example: 19
 *         soldCount:
 *           type: number
 *           description: 판매 수량
 *           example: 11
 *         viewCount:
 *           type: number
 *           description: 조회수
 *           example: 133
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
 *           description: 판매자명
 *           example: "유스보이스"
 *         images:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SimpleImage'
 *           description: 이미지 목록
 *         deadline:
 *           type: string
 *           format: date-time
 *           description: 마감일
 *           example: "2025-09-30T09:00:00Z"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 생성일시
 *           example: "2025-09-28T16:07:49.809Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 수정일시
 *           example: "2025-09-29T02:04:38.610Z"
 */

module.exports = CommonSchemas;
