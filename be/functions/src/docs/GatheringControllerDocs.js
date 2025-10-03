/**
 * @fileoverview 소모임 컨트롤러 Swagger 문서
 */

class GatheringControllerDocs {
  static getGatherings() {
    /**
     * @swagger
     * /gatherings:
     *   get:
     *     summary: 소모임 목록 조회
     *     tags: [Gatherings]
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
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/GatheringSummary'
     *                 pagination:
     *                   $ref: '#/components/schemas/PaginationResponse'
     *       500:
     *         description: 서버 오류
     */
  }

  static getGatheringById() {
    /**
     * @swagger
     * /gatherings/{gatheringId}:
     *   get:
     *     summary: 소모임 상세 조회
     *     tags: [Gatherings]
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
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   $ref: '#/components/schemas/GatheringDetail'
     *       404:
     *         description: 소모임을 찾을 수 없음
     *       500:
     *         description: 서버 오류
     */
  }

  static applyToGathering() {
    /**
     * @swagger
     * /gatherings/{gatheringId}/apply:
     *   post:
     *     summary: 소모임 신청
     *     tags: [Gatherings]
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
     *               - userId
     *             properties:
     *               userId:
     *                 type: string
     *                 description: 사용자 ID
     *                 example: "user_123"
     *               selectedVariant:
     *                 type: string
     *                 nullable: true
     *                 description: 선택된 변형
     *               quantity:
     *                 type: integer
     *                 default: 1
     *                 description: 신청 수량
     *               customFieldsResponse:
     *                 type: object
     *                 description: 커스텀 필드 응답
     *     responses:
     *       201:
     *         description: 소모임 신청 성공
     *       400:
     *         description: 잘못된 요청
     *       404:
     *         description: 소모임을 찾을 수 없음
     *       500:
     *         description: 서버 오류
     */
  }

  static toggleGatheringLike() {
    /**
     * @swagger
     * /gatherings/{gatheringId}/like:
     *   post:
     *     summary: 소모임 좋아요 토글
     *     tags: [Gatherings]
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
     *       400:
     *         description: 잘못된 요청
     *       404:
     *         description: 소모임을 찾을 수 없음
     *       500:
     *         description: 서버 오류
     */
  }


  static createQnA() {
    /**
     * @swagger
     * /gatherings/{gatheringId}/qna:
     *   post:
     *     summary: 소모임 QnA 질문 작성
     *     description: 특정 소모임에 대한 질문을 작성합니다.
     *     tags: [Gatherings]
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
     *                 items:
     *                   $ref: '#/components/schemas/ContentItem'
     *                 description: 질문 내용 (텍스트, 이미지, 동영상 포함)
     *                 example:
     *                   - type: "text"
     *                     order: 1
     *                     content: "소모임 시작일은 언제인가요?"
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
  }

  static updateQnA() {
    /**
     * @swagger
     * /gatherings/{gatheringId}/qna/{qnaId}:
     *   put:
     *     summary: 소모임 QnA 수정
     *     description: 기존 QnA 질문을 수정합니다.
     *     tags: [Gatherings]
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
     *                 description: 수정된 질문 내용 (텍스트, 이미지, 동영상 포함)
     *                 example:
     *                   - type: "text"
     *                     order: 1
     *                     content: "수정된 질문: 소모임 시작일은 언제인가요?"
     *                   - type: "text"
     *                     order: 2
     *                     content: "추가 질문: 혹시 중간에 참여할 수 있나요?"
     *                   - type: "image"
     *                     order: 3
     *                     src: "https://example.com/updated-question-image.jpg"
     *                     width: 1024
     *                     height: 768
     *                     blurHash: "L8PZfSi_.AyE_3t7t7R**0o#DgR4"
     *                   - type: "video"
     *                     order: 4
     *                     src: "https://example.com/updated-question-video.mp4"
     *                     width: 1280
     *                     height: 720
     *                     thumbUrl: "https://example.com/updated-question-video-thumb.jpg"
     *                     videoSource: "uploaded"
     *                     provider: "self"
     *                     duration: 45
     *                     sizeBytes: 10485760
     *                     mimeType: "video/mp4"
     *                     processingStatus: "ready"
     *     responses:
     *       200:
     *         description: QnA 수정 성공
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/QnAResponse'
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
  }

  static deleteQnA() {
    /**
     * @swagger
     * /gatherings/{gatheringId}/qna:
     *   delete:
     *     summary: 소모임 QnA 삭제
     *     tags: [Gatherings]
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
     *               - userId
     *             properties:
     *               userId:
     *                 type: string
     *                 description: 사용자 ID
     *                 example: "user_123"
     *     responses:
     *       200:
     *         description: QnA 삭제 성공
     *       404:
     *         description: QnA를 찾을 수 없음
     *       500:
     *         description: 서버 오류
     */
  }

  static createQnAAnswer() {
    /**
     * @swagger
     * /gatherings/qna/{qnaId}/answer:
     *   post:
     *     summary: 소모임 Q&A 답변 작성
     *     tags: [Gatherings]
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
     *       400:
     *         description: 잘못된 요청
     *       404:
     *         description: Q&A를 찾을 수 없음
     *       500:
     *         description: 서버 오류
     */
  }

  static toggleQnALike() {
    /**
     * @swagger
     * /gatherings/qna/{qnaId}/like:
     *   post:
     *     summary: 소모임 Q&A 좋아요 토글
     *     tags: [Gatherings]
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

module.exports = GatheringControllerDocs;
