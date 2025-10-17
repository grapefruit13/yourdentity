const {FieldValue} = require("firebase-admin/firestore");
const FirestoreService = require("./firestoreService");
const fcmHelper = require("../utils/fcmHelper");
const UserService = require("./userService");

/**
 * Comment Service (비즈니스 로직 계층)
 * 댓글 관련 모든 비즈니스 로직 처리
 */
class CommentService {
  constructor() {
    this.firestoreService = new FirestoreService("comments");
    this.userService = new UserService();
  }

  /**
   * 댓글 생성
   * @param {string} communityId - 커뮤니티 ID
   * @param {string} postId - 게시글 ID
   * @param {string} userId - 사용자 ID
   * @param {Object} commentData - 댓글 데이터
   * @return {Promise<Object>} 생성된 댓글
   */
  async createComment(communityId, postId, userId, commentData) {
    try {
      const {content = [], parentId = null} = commentData;

      // 필수 필드 검증
      if (!content || content.length === 0) {
        const error = new Error("댓글 내용은 필수입니다.");
        error.code = "BAD_REQUEST";
        throw error;
      }

      // content 배열 검증
      const hasTextContent = content.some(
        (item) =>
          item.type === "text" && item.content && item.content.trim().length > 0,
      );
      if (!hasTextContent) {
        const error = new Error("댓글에 텍스트 내용이 필요합니다.");
        error.code = "BAD_REQUEST";
        throw error;
      }

      // 커뮤니티 존재 확인
      const community = await this.firestoreService.getDocument(
        "communities",
        communityId,
      );
      if (!community) {
        const error = new Error("커뮤니티를 찾을 수 없습니다.");
        error.code = "NOT_FOUND";
        throw error;
      }

      // 게시글 존재 확인
      const post = await this.firestoreService.getDocument(`communities/${communityId}/posts`, postId);
      if (!post) {
        const error = new Error("게시글을 찾을 수 없습니다.");
        error.code = "NOT_FOUND";
        throw error;
      }

      // 부모 댓글 존재 확인 (대댓글인 경우)
      let parentComment = null;
      if (parentId) {
        parentComment = await this.firestoreService.getDocument("comments", parentId);
        if (!parentComment) {
          const error = new Error("부모 댓글을 찾을 수 없습니다.");
          error.code = "NOT_FOUND";
          throw error;
        }

        // 대댓글은 2레벨까지만 허용
        if (parentComment.parentId) {
          const error = new Error("대댓글은 2레벨까지만 허용됩니다.");
          error.code = "BAD_REQUEST";
          throw error;
        }
      }

      // content 배열에서 미디어 분리
      const mediaItems = content.filter( (item) => item.type === "image" || item.type === "video");

      // media 배열 형식으로 변환
      const media = mediaItems.map((item, index) => {
        const mediaItem = {
          url: item.src || "",
          type: item.type,
          order: index + 1,
          width: item.width,
          height: item.height,
        };

        // undefined가 아닌 값만 추가
        if (item.blurHash !== undefined) mediaItem.blurHash = item.blurHash;
        if (item.thumbUrl !== undefined) mediaItem.thumbUrl = item.thumbUrl;
        if (item.videoSource !== undefined) mediaItem.videoSource = item.videoSource;
        if (item.provider !== undefined) mediaItem.provider = item.provider;
        if (item.duration !== undefined) mediaItem.duration = item.duration;
        if (item.sizeBytes !== undefined) mediaItem.sizeBytes = item.sizeBytes;
        if (item.mimeType !== undefined) mediaItem.mimeType = item.mimeType;

        return mediaItem;
      });

      const newComment = {
        communityId,
        postId,
        userId,
        content,
        media,
        parentId,
        likesCount: 0,
        isDeleted: false,
        depth: parentId ? 1 : 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const commentId = await this.firestoreService.addDocument("comments", newComment);

      // 게시글의 댓글 수 업데이트
      await this.firestoreService.updateDocument(`communities/${communityId}/posts`, postId, {
        commentsCount: FieldValue.increment(1),
        updatedAt: new Date(),
      });

      if (post.authorId !== userId) {
        fcmHelper.sendNotification(
          post.authorId,
          "새로운 댓글이 달렸습니다",
          `게시글 "${post.title}"에 새로운 댓글이 달렸습니다.`,
          "community",
          postId,
          `/community/${communityId}/posts/${postId}`
        ).catch(error => {
          console.error("댓글 알림 전송 실패:", error);
        });
      }

      
      if (parentId && parentComment && parentComment.userId !== userId) {
        // 부모 댓글 내용 미리보기 생성
        const textContent = parentComment.content.find(item => item.type === "text");
        const commentPreview = textContent ? textContent.content : "댓글";
        const preview = commentPreview.length > 30 ? 
          commentPreview.substring(0, 30) + "..." : 
          commentPreview;

        console.log(`대댓글 알림 전송: ${parentComment.userId}에게 답글 알림`);
        fcmHelper.sendNotification(
          parentComment.userId,
          "새로운 답글이 달렸습니다",
          `"${preview}"에 새로운 답글이 달렸습니다.`,
          "community",
          commentId,
          `/community/${communityId}/posts/${postId}`
        ).catch(error => {
          console.error("대댓글 알림 전송 실패:", error);
        });
      }

      return {
        id: commentId,
        ...newComment,
      };
    } catch (error) {
      console.error("Create comment error:", error.message);
      if (error.code === "BAD_REQUEST" || error.code === "NOT_FOUND") {
        throw error;
      }
      throw new Error("Failed to create comment");
    }
  }

  /**
   * 댓글 목록 조회
   * @param {string} communityId - 커뮤니티 ID
   * @param {string} postId - 게시글 ID
   * @param {Object} options - 조회 옵션
   * @return {Promise<Object>} 댓글 목록
   */
  async getComments(communityId, postId, options = {}) {
    try {
      const {page = 0, size = 10} = options;

      // 게시글 존재 확인
      const post = await this.firestoreService.getDocument(
        `communities/${communityId}/posts`,
        postId,
      );
      if (!post) {
        const error = new Error("게시글을 찾을 수 없습니다.");
        error.code = "NOT_FOUND";
        throw error;
      }

      // 해당 게시글의 댓글만 조회 (단순 쿼리로 변경)
      // 먼저 postId로만 필터링
      const postComments = await this.firestoreService.getCollectionWhere(
        "comments", 
        "postId", 
        "==", 
        postId
      );

      // 메모리에서 필터링 (부모 댓글만, 삭제되지 않은 것)
      const pageNumber = parseInt(page);
      const pageSize = parseInt(size);
      const parentCommentsFiltered = postComments
        .filter((comment) => comment.parentId === null && !comment.isDeleted)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const totalParentCount = parentCommentsFiltered.length;
      const parentComments = parentCommentsFiltered.slice(
        pageNumber * pageSize,
        (pageNumber + 1) * pageSize,
      );

      const result = {
        content: parentComments,
        pageable: {
          pageNumber,
          pageSize,
          totalElements: totalParentCount,
          totalPages: Math.ceil(totalParentCount / pageSize),
        }
      };

      // 각 부모 댓글에 대한 대댓글 조회
      const commentsWithReplies = [];
      
      for (const comment of result.content || []) {
        // 대댓글 조회 (단순 쿼리로 변경)
        const allReplies = await this.firestoreService.getCollectionWhere(
          "comments",
          "parentId", 
          "==", 
          comment.id
        );

        // 메모리에서 필터링 및 정렬
        const replies = {
          content: allReplies
            .filter(reply => !reply.isDeleted)
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
            .slice(0, 50) // 대댓글은 최대 50개
        };

        const processedComment = {
          ...comment,
          replies: replies.content || [],
          repliesCount: (replies.content || []).length,
        };

        commentsWithReplies.push(processedComment);
      }

      return {
        content: commentsWithReplies,
        pagination: result.pageable || {},
      };
    } catch (error) {
      console.error("Get comments error:", error.message);
      if (error.code === "NOT_FOUND") {
        throw error;
      }
      throw new Error("Failed to get comments");
    }
  }

  /**
   * 댓글 수정
   * @param {string} commentId - 댓글 ID
   * @param {Object} updateData - 수정할 데이터
   * @param {string} userId - 사용자 ID (소유권 검증용)
   * @return {Promise<Object>} 수정된 댓글
   */
  async updateComment(commentId, updateData, userId) {
    try {
      const {content} = updateData;

      // 댓글 존재 확인
      const comment = await this.firestoreService.getDocument("comments", commentId);
      if (!comment) {
        const error = new Error("댓글을 찾을 수 없습니다.");
        error.code = "NOT_FOUND";
        throw error;
      }

      // 소유권 검증
      if (comment.userId !== userId) {
        const error = new Error("댓글 수정 권한이 없습니다");
        error.code = "FORBIDDEN";
        throw error;
      }

      // 삭제된 댓글은 수정 불가
      if (comment.isDeleted) {
        const error = new Error("삭제된 댓글은 수정할 수 없습니다.");
        error.code = "BAD_REQUEST";
        throw error;
      }

      // 필수 필드 검증
      if (!content || content.length === 0) {
        const error = new Error("댓글 내용은 필수입니다.");
        error.code = "BAD_REQUEST";
        throw error;
      }

      // content 배열 검증
      const hasTextContent = content.some(
        (item) =>
          item.type === "text" && item.content && item.content.trim().length > 0,
      );
      if (!hasTextContent) {
        const error = new Error("댓글에 텍스트 내용이 필요합니다.");
        error.code = "BAD_REQUEST";
        throw error;
      }

      // content 배열에서 미디어 분리
      const mediaItems = content.filter(
        (item) => item.type === "image" || item.type === "video",
      );

      // media 배열 형식으로 변환
      const media = mediaItems.map((item, index) => {
        const mediaItem = {
          url: item.src || "",
          type: item.type,
          order: index + 1,
          width: item.width,
          height: item.height,
        };

        // undefined가 아닌 값만 추가
        if (item.blurHash !== undefined) mediaItem.blurHash = item.blurHash;
        if (item.thumbUrl !== undefined) mediaItem.thumbUrl = item.thumbUrl;
        if (item.videoSource !== undefined) mediaItem.videoSource = item.videoSource;
        if (item.provider !== undefined) mediaItem.provider = item.provider;
        if (item.duration !== undefined) mediaItem.duration = item.duration;
        if (item.sizeBytes !== undefined) mediaItem.sizeBytes = item.sizeBytes;
        if (item.mimeType !== undefined) mediaItem.mimeType = item.mimeType;

        return mediaItem;
      });

      const updatedData = {
        content,
        media,
        updatedAt: new Date(),
      };

      await this.firestoreService.updateDocument("comments", commentId, updatedData);

      return {
        id: commentId,
        ...comment,
        ...updatedData,
      };
    } catch (error) {
      console.error("Update comment error:", error.message);
      if (error.code === "BAD_REQUEST" || error.code === "NOT_FOUND" || error.code === "FORBIDDEN") {
        throw error;
      }
      throw new Error("Failed to update comment");
    }
  }

  /**
   * 댓글 삭제
   * @param {string} commentId - 댓글 ID
   * @param {string} userId - 사용자 ID (소유권 검증용)
   * @return {Promise<void>}
   */
  async deleteComment(commentId, userId) {
    try {
      const comment = await this.firestoreService.getDocument("comments", commentId);
      if (!comment) {
        const error = new Error("댓글을 찾을 수 없습니다.");
        error.code = "NOT_FOUND";
        throw error;
      }

      // 소유권 검증
      if (comment.userId !== userId) {
        const error = new Error("댓글 삭제 권한이 없습니다");
        error.code = "FORBIDDEN";
        throw error;
      }

      // 이미 삭제된 댓글
      if (comment.isDeleted) {
        const error = new Error("이미 삭제된 댓글입니다.");
        error.code = "BAD_REQUEST";
        throw error;
      }

      // 댓글을 완전 삭제하지 않고 isDeleted 플래그 설정 (대댓글 구조 유지)
      await this.firestoreService.updateDocument("comments", commentId, {
        isDeleted: true,
        content: [{type: "text", content: "삭제된 댓글입니다."}],
        media: [],
        updatedAt: new Date(),
      });

      // 게시글의 댓글 수 감소
      await this.firestoreService.updateDocument(
        `communities/${comment.communityId}/posts`,
        comment.postId,
        {
          commentsCount: FieldValue.increment(-1),
          updatedAt: new Date(),
        },
      );
    } catch (error) {
      console.error("Delete comment error:", error.message);
      if (error.code === "BAD_REQUEST" || error.code === "NOT_FOUND" || error.code === "FORBIDDEN") {
        throw error;
      }
      throw new Error("Failed to delete comment");
    }
  }

  /**
   * 댓글 좋아요 토글
   * @param {string} commentId - 댓글 ID
   * @param {string} userId - 사용자 ID
   * @return {Promise<Object>} 좋아요 결과
   */
  async toggleCommentLike(commentId, userId) {
    try {
      const comment = await this.firestoreService.getDocument("comments", commentId);
      if (!comment) {
        const error = new Error("댓글을 찾을 수 없습니다.");
        error.code = "NOT_FOUND";
        throw error;
      }

      // 삭제된 댓글은 좋아요 불가
      if (comment.isDeleted) {
        const error = new Error("삭제된 댓글에는 좋아요를 할 수 없습니다.");
        error.code = "BAD_REQUEST";
        throw error;
      }

      // 기존 좋아요 확인 (복합 쿼리로 최적화)
      const userLikes = await this.firestoreService.getCollectionWhereMultiple(
        "likes",
        [
          { field: "targetId", operator: "==", value: commentId },
          { field: "userId", operator: "==", value: userId },
          { field: "type", operator: "==", value: "COMMENT" },
        ]
      );
      const userLike = userLikes[0];

      let isLiked = false;

      if (userLike) {
        // 좋아요 취소
        await this.firestoreService.deleteDocument("likes", userLike.id);
        isLiked = false;

        // 댓글 좋아요 수 감소
        await this.firestoreService.updateDocument("comments", commentId, {
          likesCount: FieldValue.increment(-1),
          updatedAt: new Date(),
        });
      } else {
        // 좋아요 등록
        await this.firestoreService.addDocument("likes", {
          type: "COMMENT",
          targetId: commentId,
          userId,
          createdAt: new Date(),
        });
        isLiked = true;

        // 댓글 좋아요 수 증가
        await this.firestoreService.updateDocument("comments", commentId, {
          likesCount: FieldValue.increment(1),
          updatedAt: new Date(),
        });

        if (comment.userId !== userId) {
          try {
            const liker = await this.userService.getUserById(userId);
            const likerName = liker?.name || "사용자";

            const textContent = comment.content.find(item => item.type === "text");
            const commentPreview = textContent ? textContent.content : "댓글";
            const preview = commentPreview.length > 50 ? 
              commentPreview.substring(0, 50) + "..." : 
              commentPreview;

            fcmHelper.sendNotification(
              comment.userId,
              "댓글에 좋아요가 달렸습니다",
              `${likerName}님이 "${preview}" 댓글에 좋아요를 눌렀습니다`,
              "community",
              commentId,
              `/community/${comment.communityId}/posts/${comment.postId}`
            ).catch(error => {
              console.error("댓글 좋아요 알림 전송 실패:", error);
            });
          } catch (error) {
            console.error("댓글 좋아요 알림 처리 실패:", error);
          }
        }
      }

      // 업데이트된 댓글 정보 조회
      const updatedComment = await this.firestoreService.getDocument("comments", commentId);

      return {
        commentId,
        userId,
        isLiked,
        likesCount: updatedComment.likesCount || 0,
      };
    } catch (error) {
      console.error("Toggle comment like error:", error.message);
      if (error.code === "NOT_FOUND" || error.code === "BAD_REQUEST") {
        throw error;
      }
      throw new Error("Failed to toggle comment like");
    }
  }
}

module.exports = CommentService;
