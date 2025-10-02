/**
 * @fileoverview 커뮤니티 컨트롤러 Swagger 문서
 */

class CommunityControllerDocs {
  /**
   * 커뮤니티 목록 조회 API 문서
   */
  static getCommunities() {
    /**
     * @swagger
     * /communities:
     *   get:
     *     tags: [Communities]
     *     summary: 커뮤니티 목록 조회
     *     description: 한끗루틴(66일 한끗루틴, 플래너 인증 루틴,...), 월간 소모임(9월,10월 소모임...),TMI(25년 상반기, 25년 하반기..) 등 모든 프로그램 활동 조회
     *     parameters:
     *       - in: query
     *         name: type
     *         schema:
     *           type: string
     *           enum: [interest, anonymous]
     *         description: 커뮤니티 타입 필터
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
     *         description: 커뮤니티 목록 조회 성공
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
     *                     $ref: '#/components/schemas/Community'
     *                 pagination:
     *                   $ref: '#/components/schemas/PaginationResponse'
     */
  }

  /**
   * 전체 커뮤니티 포스트 조회 API 문서
   */
  static getAllCommunityPosts() {
    /**
     * @swagger
     * /communities/posts:
     *   get:
     *     tags: [Communities]
     *     summary: 전체 커뮤니티(66일투틴 ,월간소모임, TMI 등) 게시글 조회
     *     description: 모든 커뮤니티의 포스트를 한번에 조회합니다 (필터링 및 페이지네이션 지원)
     *     parameters:
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *           default: 0
     *         description: 페이지 번호 (0부터 시작)
     *       - in: query
     *         name: size
     *         schema:
     *           type: integer
     *           default: 10
     *         description: 페이지 크기
     *       - in: query
     *         name: filter
     *         schema:
     *           type: string
     *           enum: [routine, gathering, tmi]
     *         description: 게시글 타입 필터 (routine=루틴인증, gathering=소모임후기, tmi=TMI)
     *     responses:
     *       200:
     *         description: 전체 커뮤니티 포스트 조회 성공
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
     *                     type: object
     *                     properties:
     *                       id:
     *                         type: string
     *                         example: "CERT_1234567890"
     *                       type:
     *                         type: string
     *                         example: "ROUTINE_CERT"
     *                       category:
     *                         type: string
     *                         example: "한끗 루틴"
     *                       categoryColor:
     *                         type: string
     *                         example: "pink"
     *                       title:
     *                         type: string
     *                         example: "오늘 하늘이 이뻤어요!"
     *                       description:
     *                         type: string
     *                         example: "두줄까지 미리보기로 보이게!!! 구름이 뭉게뭉게 있어서 하늘이 이뻐요! 일상 인증 사진 공유합니다 일..."
     *                       thumbnail:
     *                         type: object
     *                         properties:
     *                           url:
     *                             type: string
     *                             example: "https://example.com/thumbnail.jpg"
     *                           width:
     *                             type: integer
     *                             example: 100
     *                           height:
     *                             type: integer
     *                             example: 100
     *                       author:
     *                         type: string
     *                         example: "유어123"
     *                       timeAgo:
     *                         type: string
     *                         example: "1시간 전"
     *                       likesCount:
     *                         type: integer
     *                         example: 5
     *                       commentsCount:
     *                         type: integer
     *                         example: 2
     *                       communityId:
     *                         type: string
     *                         example: "routine-planner"
     *                       communityName:
     *                         type: string
     *                         example: "플래너 작성하기"
     *                       createdAt:
     *                         type: string
     *                         format: date-time
     *                         example: "2024-01-15T10:30:00Z"
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
     *                       example: 150
     *                     totalPages:
     *                       type: integer
     *                       example: 15
     *                     first:
     *                       type: boolean
     *                       example: true
     *                     last:
     *                       type: boolean
     *                       example: false
     *                     numberOfElements:
     *                       type: integer
     *                       example: 10
     */
  }

  /**
   * 커뮤니티 상세 조회 API 문서
   */
  static getCommunityById() {
    /**
     * @swagger
     * /communities/{communityId}:
     *   get:
     *     tags: [Communities]
     *     summary: 커뮤니티 상세 조회
     *     description: 특정 커뮤니티의 상세 정보를 조회합니다
     *     parameters:
     *       - in: path
     *         name: communityId
     *         required: true
     *         schema:
     *           type: string
     *         description: 커뮤니티 ID
     *         example: "routine-planner"
     *     responses:
     *       200:
     *         description: 커뮤니티 상세 조회 성공
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   $ref: '#/components/schemas/Community'
     *       404:
     *         description: 커뮤니티를 찾을 수 없음
     */
  }

  /**
   * 커뮤니티 멤버 목록 조회 API 문서
   */
  static getCommunityMembers() {
    /**
     * @swagger
     * /communities/{communityId}/members:
     *   get:
     *     tags: [Communities]
     *     summary: 커뮤니티 멤버 목록 조회
     *     description: 특정 커뮤니티의 멤버 목록을 조회합니다
     *     parameters:
     *       - in: path
     *         name: communityId
     *         required: true
     *         schema:
     *           type: string
     *         description: 커뮤니티 ID
     *         example: "routine-planner"
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
     *           default: 20
     *         description: 페이지 크기
     *     responses:
     *       200:
     *         description: 멤버 목록 조회 성공
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
     *                     $ref: '#/components/schemas/CommunityMember'
     *                 pagination:
     *                   $ref: '#/components/schemas/PaginationResponse'
     */
  }

  /**
   * 커뮤니티 게시글 목록 조회 API 문서
   */
  static getCommunityPosts() {
    /**
     * @swagger
     * /communities/{communityId}/posts:
     *   get:
     *     tags: [Communities]
     *     summary: 커뮤니티 게시글 목록 조회
     *     description: 특정 커뮤니티의 게시글 목록을 조회합니다
     *     parameters:
     *       - in: path
     *         name: communityId
     *         required: true
     *         schema:
     *           type: string
     *         description: 커뮤니티 ID
     *         example: "routine-planner"
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
     *         description: 게시글 목록 조회 성공
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
     *                     $ref: '#/components/schemas/PostListItem'
     *                 pagination:
     *                   $ref: '#/components/schemas/PaginationResponse'
     */
  }

  /**
   * 커뮤니티 게시글 작성 API 문서
   */
  static createPost() {
    /**
     * @swagger
     * /communities/{communityId}/posts:
     *   post:
     *     tags: [Communities]
     *     summary: 커뮤니티 게시글 작성
     *     description: 특정 커뮤니티에 게시글을 작성합니다
     *     parameters:
     *       - in: path
     *         name: communityId
     *         required: true
     *         schema:
     *           type: string
     *         description: 커뮤니티 ID
     *         example: "routine-planner"
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - title
     *             properties:
     *               title:
     *                 type: string
     *                 description: 게시글 제목
     *                 example: "오늘의 루틴 인증!"
     *               category:
     *                 type: string
     *                 description: 게시글 카테고리
     *                 example: "한끗루틴"
     *               tags:
     *                 type: array
     *                 description: 태그 목록
     *                 items:
     *                   type: string
     *                 example: ["아침 한끗", "66일 루틴"]
     *               scheduledDate:
     *                 type: string
     *                 format: date-time
     *                 description: 예약 날짜 (선택사항)
     *                 example: "2025-09-23T09:00:00Z"
     *               content:
     *                 type: array
     *                 description: 게시글 본문 (순서대로 렌더링, 미디어는 백엔드에서 자동 추출)
     *                 example: [
     *                   {
     *                     "type": "text",
     *                     "order": 1,
     *                     "content": "플래너 작성하기 커뮤니티에 오신 것을 환영합니다!"
     *                   },
     *                   {
     *                     "type": "image",
     *                     "order": 2,
     *                     "content": "오늘의 인증 사진입니다!",
     *                     "url": "https://example.com/image.jpg",
     *                     "width": 1080,
     *                     "height": 1080,
     *                     "blurHash": "L6PZfSi_.AyE_3t7t7R**0o#DgR4"
     *                   },
     *                   {
     *                     "type": "video",
     *                     "order": 3,
     *                     "content": "루틴 인증 영상입니다!",
     *                     "url": "https://example.com/video.mp4",
     *                     "width": 1920,
     *                     "height": 1080,
     *                     "thumbUrl": "https://example.com/video-thumb.jpg",
     *                     "videoSource": "uploaded",
     *                     "provider": "self",
     *                     "duration": 120,
     *                     "sizeBytes": 10485760,
     *                     "mimeType": "video/mp4",
     *                     "processingStatus": "ready"
     *                   },
     *                   {
     *                     "type": "file",
     *                     "order": 4,
     *                     "content": "루틴 계획서 파일입니다.",
     *                     "url": "https://example.com/routine-plan.pdf",
     *                     "fileName": "routine-plan.pdf",
     *                     "sizeBytes": 2048000,
     *                     "mimeType": "application/pdf"
     *                   }
     *                 ]
     *     responses:
     *       201:
     *         description: 게시글 작성 성공
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   $ref: '#/components/schemas/Post'
     *                 message:
     *                   type: string
     *                   example: "게시글이 성공적으로 작성되었습니다."
     *       400:
     *         description: 잘못된 요청
     *       404:
     *         description: 커뮤니티를 찾을 수 없음
     */
  }

  /**
   * 커뮤니티 게시글 상세 조회 API 문서
   */
  static getPostById() {
    /**
     * @swagger
     * /communities/{communityId}/posts/{postId}:
     *   get:
     *     tags: [Communities]
     *     summary: 커뮤니티 게시글 상세 조회
     *     description: 특정 커뮤니티의 게시글 상세 정보와 댓글을 조회합니다
     *     parameters:
     *       - in: path
     *         name: communityId
     *         required: true
     *         schema:
     *           type: string
     *         description: 커뮤니티 ID
     *         example: "routine-planner"
     *       - in: path
     *         name: postId
     *         required: true
     *         schema:
     *           type: string
     *         description: 게시글 ID
     *         example: "CERT_1234567890"
     *     responses:
     *       200:
     *         description: 게시글 상세 조회 성공
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   allOf:
     *                     - $ref: '#/components/schemas/Post'
     *                     - type: object
     *                       properties:
     *                         replies:
     *                           type: array
     *                           description: 댓글 목록 (부모 댓글과 대댓글이 평면적으로 배열됨)
     *                           items:
     *                             type: object
     *                             properties:
     *                               id:
     *                                 type: string
     *                                 description: 댓글 ID
     *                                 example: "routine-comment-1"
     *                               author:
     *                                 type: string
     *                                 description: 작성자 ID
     *                                 example: "user123"
     *                               content:
     *                                 type: array
     *                                 description: 댓글 내용 (텍스트, 이미지, 비디오, 파일 등)
     *                                 items:
     *                                   type: object
     *                                   properties:
     *                                     type:
     *                                       type: string
     *                                       enum: [text, image, video, file]
     *                                       example: "text"
     *                                     order:
     *                                       type: number
     *                                       example: 1
     *                                     content:
     *                                       type: string
     *                                       example: "루틴 인증 정말 잘하셨네요! 💪"
     *                               mediaBlocks:
     *                                 type: array
     *                                 description: 미디어 블록 (이미지, 비디오, 파일 등)
     *                                 items:
     *                                   type: object
     *                                   properties:
     *                                     type:
     *                                       type: string
     *                                       enum: [image, video, file]
     *                                     url:
     *                                       type: string
     *                                     width:
     *                                       type: number
     *                                     height:
     *                                       type: number
     *                               parent_id:
     *                                 type: string
     *                                 nullable: true
     *                                 description: 부모 댓글 ID (null이면 부모 댓글, 값이 있으면 대댓글)
     *                                 example: null
     *                               vote_score:
     *                                 type: number
     *                                 description: 투표 점수
     *                                 example: 3
     *                               up_vote_score:
     *                                 type: number
     *                                 description: 좋아요 수
     *                                 example: 3
     *                               deleted:
     *                                 type: boolean
     *                                 description: 삭제 여부
     *                                 example: false
     *                               replies_count:
     *                                 type: number
     *                                 description: 대댓글 수 (부모 댓글만 해당)
     *                                 example: 1
     *                               created_at:
     *                                 type: number
     *                                 description: 생성 시간 (timestamp)
     *                                 example: 1759224267669
     *                               updated_at:
     *                                 type: number
     *                                 description: 수정 시간 (timestamp)
     *                                 example: 1759229044079
     *                               isMine:
     *                                 type: boolean
     *                                 description: 내 댓글 여부
     *                                 example: false
     *                               hasVideo:
     *                                 type: boolean
     *                                 description: 비디오 포함 여부
     *                                 example: false
     *                               hasImage:
     *                                 type: boolean
     *                                 description: 이미지 포함 여부
     *                                 example: false
     *                               hasAuthorReply:
     *                                 type: boolean
     *                                 description: 작성자 답글 여부
     *                                 example: true
     *                               hasAuthorVote:
     *                                 type: boolean
     *                                 description: 작성자 투표 여부
     *                                 example: true
     *                               isOriginalAuthor:
     *                                 type: boolean
     *                                 description: 원글 작성자 여부
     *                                 example: false
     *       404:
     *         description: 게시글을 찾을 수 없음
     */
  }

  /**
   * 커뮤니티 게시글 수정 API 문서
   */
  static updatePost() {
    /**
     * @swagger
     * /communities/{communityId}/posts/{postId}:
     *   put:
     *     tags: [Communities]
     *     summary: 커뮤니티 게시글 수정
     *     description: 특정 커뮤니티의 게시글을 수정합니다
     *     parameters:
     *       - in: path
     *         name: communityId
     *         required: true
     *         schema:
     *           type: string
     *         description: 커뮤니티 ID
     *         example: "routine-planner"
     *       - in: path
     *         name: postId
     *         required: true
     *         schema:
     *           type: string
     *         description: 게시글 ID
     *         example: "CERT_1234567890"
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               title:
     *                 type: string
     *                 description: 게시글 제목
     *                 example: "수정된 루틴 인증!"
     *               content:
     *                 type: array
     *                 description: 게시글 본문
     *                 example: [
     *                   {
     *                     "type": "text",
     *                     "order": 1,
     *                     "content": "수정된 내용입니다!"
     *                   },
     *                   {
     *                     "type": "image",
     *                     "order": 2,
     *                     "content": "수정된 인증 사진입니다!",
     *                     "url": "https://example.com/updated-image.jpg",
     *                     "width": 1080,
     *                     "height": 1080,
     *                     "blurHash": "L6PZfSi_.AyE_3t7t7R**0o#DgR4"
     *                   }
     *                 ]
     *     responses:
     *       200:
     *         description: 게시글 수정 성공
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   $ref: '#/components/schemas/Post'
     *                 message:
     *                   type: string
     *                   example: "게시글이 성공적으로 수정되었습니다."
     *       403:
     *         description: 권한 없음
     *       404:
     *         description: 게시글을 찾을 수 없음
     */
  }

  /**
   * 커뮤니티 게시글 삭제 API 문서
   */
  static deletePost() {
    /**
     * @swagger
     * /communities/{communityId}/posts/{postId}:
     *   delete:
     *     tags: [Communities]
     *     summary: 커뮤니티 게시글 삭제
     *     description: 특정 커뮤니티의 게시글을 삭제합니다
     *     parameters:
     *       - in: path
     *         name: communityId
     *         required: true
     *         schema:
     *           type: string
     *         description: 커뮤니티 ID
     *         example: "routine-planner"
     *       - in: path
     *         name: postId
     *         required: true
     *         schema:
     *           type: string
     *         description: 게시글 ID
     *         example: "CERT_1234567890"
     *     requestBody:
     *       required: false
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties: {}
     *     responses:
     *       200:
     *         description: 게시글 삭제 성공
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
     *                   example: "게시글이 성공적으로 삭제되었습니다."
     *       403:
     *         description: 권한 없음
     *       404:
     *         description: 게시글을 찾을 수 없음
     */
  }

  /**
   * 커뮤니티 게시글 좋아요 토글 API 문서
   */
  static togglePostLike() {
    /**
     * @swagger
     * /communities/{communityId}/posts/{postId}/like:
     *   post:
     *     tags: [Communities]
     *     summary: 커뮤니티 게시글 좋아요 토글
     *     description: 특정 커뮤니티의 게시글에 좋아요를 토글합니다 (현재 userId는 "user123"으로 하드코딩됨)
     *     parameters:
     *       - in: path
     *         name: communityId
     *         required: true
     *         schema:
     *           type: string
     *         description: 커뮤니티 ID
     *         example: "routine-planner"
     *       - in: path
     *         name: postId
     *         required: true
     *         schema:
     *           type: string
     *         description: 게시글 ID
     *         example: "CERT_1234567890"
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
     */
  }
}

module.exports = CommunityControllerDocs;
