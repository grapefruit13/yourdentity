/**
 * @fileoverview TMI API Swagger 문서 정의
 * Spring Boot의 @Tag, @Operation과 유사한 패턴
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     TmiProjectResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: TMI 프로젝트 고유 ID
 *           example: "TMI_001"
 *         name:
 *           type: string
 *           description: TMI 프로젝트 제목
 *           example: "나다운게"
 *         description:
 *           type: string
 *           description: TMI 프로젝트 설명
 *           example: "학교 밖 청소년의 나다움을 찾는 12주 자아탐색 창작 프로젝트"
 *         status:
 *           type: string
 *           enum: [OPEN, CLOSED, SOLD_OUT]
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
 *           type: number
 *           description: 재고 수량
 *           example: 10
 *         deadline:
 *           type: string
 *           format: date-time
 *           description: TMI 프로젝트 마감일
 *           example: "2025-09-30T09:00:00Z"
 *         soldCount:
 *           type: number
 *           description: 판매 수량
 *           example: 5
 *         viewCount:
 *           type: number
 *           description: 조회수
 *           example: 130
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
 *         content:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ContentItem'
 *           description: TMI 프로젝트 상세 내용
 *         options:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SimpleOption'
 *           description: 상품 옵션 목록
 *         details:
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
 *     CreateTmiProjectRequest:
 *       type: object
 *       required:
 *         - name
 *         - description
 *       properties:
 *         name:
 *           type: string
 *           description: TMI 프로젝트 제목
 *           example: "나다운게"
 *         description:
 *           type: string
 *           description: TMI 프로젝트 설명
 *           example: "학교 밖 청소년의 나다움을 찾는 12주 자아탐색 창작 프로젝트"
 *         status:
 *           type: string
 *           enum: [OPEN, CLOSED, SOLD_OUT]
 *           description: TMI 프로젝트 상태
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
 *           example: 10
 *         deadline:
 *           type: string
 *           format: date-time
 *           description: TMI 프로젝트 마감일
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
 *           description: TMI 프로젝트 상세 내용
 *         options:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SimpleOption'
 *           description: 상품 옵션 목록
 *         details:
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
 *         projectId:
 *           type: string
 *           description: TMI 프로젝트 ID
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
 *         projectName:
 *           type: string
 *           description: TMI 프로젝트명
 *         projectPrice:
 *           type: number
 *           description: TMI 프로젝트 가격
 *         customFieldsResponse:
 *           type: object
 *           description: 커스텀 필드 응답 값들
 *           example:
 *             custom_1: "홍길동"
 *             custom_2: "TMI러버"
 *             custom_3: "20070712"
 *             custom_4: "서울시 성동구"
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
 *         projectId:
 *           type: string
 *           description: TMI 프로젝트 ID
 *         userId:
 *           type: string
 *           description: 사용자 ID
 *         question:
 *           type: string
 *           description: 질문
 *         answer:
 *           type: string
 *           description: 답변
 *         isAnswered:
 *           type: boolean
 *           description: 답변 여부
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
 *   - name: TMI
 *     description: TMI 프로젝트 관련 API
 */

class TmiControllerDocs {
  /**
   * @swagger
   * /tmi:
   *   get:
   *     summary: 전체 TMI 프로젝트 목록 조회
   *     description: 등록된 모든 TMI 프로젝트 목록을 조회합니다.
   *     tags: [TMI]
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
   *         description: TMI 프로젝트 목록 조회 성공 (페이지네이션)
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
   *       500:
   *         description: 서버 에러
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/CommonErrorResponse'
   */
  static getAllTmiProjects() {}


  /**
   * @swagger
   * /tmi/{projectId}:
   *   get:
   *     summary: TMI 프로젝트 상세 조회
   *     description: 특정 TMI 프로젝트의 상세 정보를 조회합니다.
   *     tags: [TMI]
   *     parameters:
   *       - in: path
   *         name: projectId
   *         required: true
   *         schema:
   *           type: string
   *         description: TMI 프로젝트 ID
   *         example: "TMI_001"
   *     responses:
   *       200:
   *         description: TMI 프로젝트 상세 조회 성공
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/TmiProjectResponse'
   *       404:
   *         description: TMI 프로젝트를 찾을 수 없음
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
  static getTmiProjectById() {}

  /**
   * @swagger
   * /tmi/{projectId}/apply:
   *   post:
   *     summary: TMI 프로젝트 신청하기
   *     description: 특정 TMI 프로젝트에 신청합니다.
   *     tags: [TMI]
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
   *                   custom_2: "TMI러버"
   *                   custom_3: "20070712"
   *                   custom_4: "서울시 성동구"
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
   *         description: TMI 프로젝트 신청 성공
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
   *                   example: "TMI 프로젝트 신청이 완료되었습니다."
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
  static applyToTmiProject() {}

  /**
   * TMI 프로젝트 좋아요 토글 API 문서
   */
  static toggleTmiProjectLike() {
    /**
     * @swagger
     * /tmi/{projectId}/like:
     *   post:
     *     summary: TMI 프로젝트 좋아요 토글
     *     description: TMI 프로젝트에 좋아요를 추가하거나 취소합니다.
     *     tags: [TMI]
     *     parameters:
     *       - in: path
     *         name: projectId
     *         required: true
     *         schema:
     *           type: string
     *         description: TMI 프로젝트 ID
     *         example: "TMI_001"
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
     *                     projectId:
     *                       type: string
     *                       description: TMI 프로젝트 ID
     *                       example: "TMI_001"
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
     *         description: TMI 프로젝트를 찾을 수 없음
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 error:
     *                   type: string
     *                   example: "TMI project not found"
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
   * /tmi/{projectId}/qna:
   *   post:
   *     summary: TMI 프로젝트 QnA 작성
   *     description: 특정 TMI 프로젝트에 대한 질문을 작성합니다.
   *     tags: [TMI]
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
   *                 items:
   *                   $ref: '#/components/schemas/ContentItem'
   *                 description: 질문 내용 (텍스트, 이미지, 동영상 포함)
   *                 example:
   *                   - type: "text"
   *                     order: 1
   *                     content: "TMI 프로젝트는 어떤 활동을 하나요?"
   *                   - type: "text"
   *                     order: 2
   *                     content: "창작 경험이 없어도 참여할 수 있나요?"
   *                   - type: "image"
   *                     order: 3
   *                     src: "https://example.com/tmi-question-image.jpg"
   *                     width: 800
   *                     height: 600
   *                     blurHash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4"
   *                   - type: "video"
   *                     order: 4
   *                     src: "https://example.com/tmi-question-video.mp4"
   *                     width: 1920
   *                     height: 1080
   *                     thumbUrl: "https://example.com/tmi-question-video-thumb.jpg"
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
   * /tmi/{projectId}/qna/{qnaId}:
   *   put:
   *     summary: TMI 프로젝트 QnA 수정
   *     description: 특정 TMI 프로젝트의 질문을 수정합니다.
   *     tags: [TMI]
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
   *                     content: "프로젝트 기간은 얼마나 되나요?"
   *                   - type: "text"
   *                     order: 2
   *                     content: "참여 조건이 있나요?"
   *                   - type: "image"
   *                     order: 3
   *                     src: "https://example.com/tmi-question-image.jpg"
   *                     width: 800
   *                     height: 600
   *                     blurHash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4"
   *                   - type: "video"
   *                     order: 4
   *                     src: "https://example.com/tmi-question-video.mp4"
   *                     width: 1920
   *                     height: 1080
   *                     thumbUrl: "https://example.com/tmi-question-video-thumb.jpg"
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
   * /tmi/qna/{qnaId}:
   *   delete:
   *     summary: TMI 프로젝트 QnA 삭제
   *     description: 특정 TMI 프로젝트의 질문을 삭제합니다.
   *     tags: [TMI]
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

  static createQnAAnswer() {}

  static toggleQnALike() {
    /**
     * @swagger
     * /tmi/qna/{qnaId}/like:
     *   post:
     *     summary: TMI Q&A 좋아요 토글
     *     tags: [TMI]
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
     *       400:
     *         description: 잘못된 요청
     *       404:
     *         description: Q&A를 찾을 수 없음
     *       500:
     *         description: 서버 오류
     */
  }
}

module.exports = TmiControllerDocs;
