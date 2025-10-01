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

  static createGathering() {
    /**
     * @swagger
     * /gatherings:
     *   post:
     *     summary: 새 소모임 생성
     *     tags: [Gatherings]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - title
     *               - description
     *             properties:
     *               title:
     *                 type: string
     *                 description: 소모임 제목
     *                 example: "매주 독서 모임"
     *               description:
     *                 type: string
     *                 description: 소모임 설명
     *                 example: "매주 책을 읽고 토론하는 모임입니다"
     *               status:
     *                 type: string
     *                 enum: [OPEN, CLOSED, CANCELLED]
     *                 default: "OPEN"
     *                 description: 소모임 상태
     *                 example: "OPEN"
     *               deadline:
     *                 type: string
     *                 format: date-time
     *                 nullable: true
     *                 description: 마감일
     *                 example: "2024-12-31T23:59:59Z"
     *               images:
     *                 type: array
     *                 items:
     *                   type: string
     *                 description: 이미지 URL 목록
     *                 example: ["https://example.com/image1.jpg"]
     *     responses:
     *       201:
     *         description: 소모임 생성 성공
     *       400:
     *         description: 잘못된 요청
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
     *               - question
     *             properties:
     *               question:
     *                 type: string
     *                 description: 질문 내용
     *                 example: "모임은 언제 시작하나요?"
     *               images:
     *                 type: array
     *                 items:
     *                   type: string
     *                 description: 첨부 이미지 URL 목록
     *                 example: []
     *               userId:
     *                 type: string
     *                 description: 사용자 ID
     *                 example: "user_123"
     *     responses:
     *       201:
     *         description: QnA 질문 작성 성공
     *       400:
     *         description: 잘못된 요청
     *       500:
     *         description: 서버 오류
     */
  }

  static updateQnA() {
    /**
     * @swagger
     * /gatherings/{gatheringId}/qna:
     *   put:
     *     summary: 소모임 QnA 수정
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
     *             properties:
     *               question:
     *                 type: string
     *                 description: 수정된 질문 내용
     *                 example: "수정된 질문입니다"
     *               userId:
     *                 type: string
     *                 description: 사용자 ID
     *                 example: "user_123"
     *     responses:
     *       200:
     *         description: QnA 수정 성공
     *       404:
     *         description: QnA를 찾을 수 없음
     *       500:
     *         description: 서버 오류
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
