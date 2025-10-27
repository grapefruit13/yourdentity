const {FieldValue} = require("firebase-admin/firestore");
const FirestoreService = require("./firestoreService");
const fcmHelper = require("../utils/fcmHelper");
const UserService = require("./userService");
const {sanitizeContent} = require("../utils/sanitizeHelper");

/**
 * Comment Service (비즈니스 로직 계층)
 * 댓글 관련 모든 비즈니스 로직 처리
 */
class CommentService {
  
  static MAX_PARENT_COMMENTS_FOR_REPLIES = 10; 
  static MAX_NOTIFICATION_PREVIEW_LENGTH = 30; 
  static MAX_NOTIFICATION_TEXT_LENGTH = 10;   constructor() {
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
      const {content, parentId = null} = commentData;

      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        const error = new Error("댓글 내용은 필수입니다.");
        error.code = "BAD_REQUEST";
        throw error;
      }

      const textWithoutTags = content.replace(/<[^>]*>/g, '').trim();
      if (textWithoutTags.length === 0) {
        const error = new Error("댓글에 텍스트 내용이 필요합니다.");
        error.code = "BAD_REQUEST";
        throw error;
      }

      const sanitizedContent = sanitizeContent(content);

      const community = await this.firestoreService.getDocument(
        "communities",
        communityId,
      );
      if (!community) {
        const error = new Error("커뮤니티를 찾을 수 없습니다.");
        error.code = "NOT_FOUND";
        throw error;
      }

      const post = await this.firestoreService.getDocument(`communities/${communityId}/posts`, postId);
      if (!post) {
        const error = new Error("게시글을 찾을 수 없습니다.");
        error.code = "NOT_FOUND";
        throw error;
      }

      let parentComment = null;
      if (parentId) {
        parentComment = await this.firestoreService.getDocument("comments", parentId);
        if (!parentComment) {
          const error = new Error("부모 댓글을 찾을 수 없습니다.");
          error.code = "NOT_FOUND";
          throw error;
        }

        if (parentComment.parentId) {
          const error = new Error("대댓글은 2레벨까지만 허용됩니다.");
          error.code = "BAD_REQUEST";
          throw error;
        }
      }

      let author = "익명";
      try {
        const members = await this.firestoreService.getCollectionWhere(
          `communities/${communityId}/members`,
          "userId",
          "==",
          userId
        );
        const memberData = members && members[0];
        if (memberData) {
          if (community && community.postType === "TMI") {
            author = memberData.name || "익명";
          } else {
            author = memberData.nickname || "익명";
          }
        }
      } catch (memberError) {
        console.warn("Failed to get member info for comment creation:", memberError.message);
      }

      const newComment = {
        communityId,
        postId,
        userId,
        author,
        content: sanitizedContent,
        parentId,
        likesCount: 0,
        isDeleted: false,
        isLocked: false,
        depth: parentId ? 1 : 0,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      const result = await this.firestoreService.runTransaction(async (transaction) => {
        const commentRef = this.firestoreService.db.collection("comments").doc();
        const postRef = this.firestoreService.db.collection(`communities/${communityId}/posts`).doc(postId);
        
        transaction.set(commentRef, newComment);
        transaction.update(postRef, {
          commentsCount: FieldValue.increment(1),
          updatedAt: FieldValue.serverTimestamp(),
        });
        
        return { commentId: commentRef.id };
      });

      const commentId = result.commentId;

      const created = await this.firestoreService.getDocument("comments", commentId);

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
        const textOnly = typeof parentComment.content === 'string' 
          ? parentComment.content.replace(/<[^>]*>/g, '') 
          : parentComment.content;
        const commentPreview = textOnly || "댓글";
        const preview = commentPreview.length > CommentService.MAX_NOTIFICATION_PREVIEW_LENGTH ? 
          commentPreview.substring(0, CommentService.MAX_NOTIFICATION_TEXT_LENGTH) + "..." : 
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

      // 응답에서 제외할 필드
      const { isDeleted, media, userId: _userId, ...commentWithoutDeleted } = created;
      
      return {
        id: commentId,
        ...commentWithoutDeleted,
        isLocked: commentWithoutDeleted.isLocked || false,
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

      const post = await this.firestoreService.getDocument(
        `communities/${communityId}/posts`,
        postId,
      );
      if (!post) {
        const error = new Error("게시글을 찾을 수 없습니다.");
        error.code = "NOT_FOUND";
        throw error;
      }

      const pageNumber = parseInt(page);
      const pageSize = parseInt(size);

      const parentCommentsResult = await this.firestoreService.getWithPagination({
        page: pageNumber,
        size: pageSize,
        orderBy: "createdAt",
        orderDirection: "desc",
        where: [
          { field: "postId", operator: "==", value: postId },
          { field: "parentId", operator: "==", value: null },
          { field: "isDeleted", operator: "==", value: false }
        ]
      });

      const paginatedParentComments = parentCommentsResult.content || [];

      const commentsWithReplies = [];

      if (paginatedParentComments.length > 0) {
        const parentIds = paginatedParentComments.map(comment => comment.id);
        
        if (parentIds.length > CommentService.MAX_PARENT_COMMENTS_FOR_REPLIES) {
          console.warn(`부모댓글: (${parentIds.length}) ${CommentService.MAX_PARENT_COMMENTS_FOR_REPLIES}개 초과`);
          parentIds.splice(CommentService.MAX_PARENT_COMMENTS_FOR_REPLIES);
        }

        const allReplies = await this.firestoreService.getCollectionWhereMultiple(
          "comments",
          [
            { field: "parentId", operator: "in", value: parentIds },
            { field: "isDeleted", operator: "==", value: false }
          ]
        );

        const repliesByParentId = {};
        allReplies.forEach(reply => {
          if (!repliesByParentId[reply.parentId]) {
            repliesByParentId[reply.parentId] = [];
          }
          repliesByParentId[reply.parentId].push(reply);
        });

        for (const comment of paginatedParentComments) {
          const replies = repliesByParentId[comment.id] || [];
         
          const ts = (t) => {
            if (t && typeof t.toMillis === "function") return t.toMillis();
            const ms = new Date(t).getTime();
            return Number.isFinite(ms) ? ms : 0;
          };
          const sortedReplies = replies
            .sort((a, b) => ts(a.createdAt) - ts(b.createdAt))
            .slice(0, 50)
            .map(reply => {
              const { isDeleted, media, userId: _userId, ...replyWithoutDeleted } = reply;
              return replyWithoutDeleted;
            });

          const { isDeleted, media, userId: _userId, ...commentWithoutDeleted } = comment;

          const processedComment = {
            ...commentWithoutDeleted,
            replies: sortedReplies,
            repliesCount: replies.length, 
          };

          commentsWithReplies.push(processedComment);
        }
      }

      return {
        content: commentsWithReplies,
        pagination: parentCommentsResult.pageable || {
          pageNumber,
          pageSize,
          totalElements: 0,
          totalPages: 0,
          hasNext: false,
          hasPrevious: false,
          isFirst: true,
          isLast: true,
        },
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

      if (comment.userId !== userId) {
        const error = new Error("댓글 수정 권한이 없습니다");
        error.code = "FORBIDDEN";
        throw error;
      }

      if (comment.isDeleted) {
        const error = new Error("삭제된 댓글은 수정할 수 없습니다.");
        error.code = "BAD_REQUEST";
        throw error;
      }

      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        const error = new Error("댓글 내용은 필수입니다.");
        error.code = "BAD_REQUEST";
        throw error;
      }

      const textWithoutTags = content.replace(/<[^>]*>/g, '').trim();
      if (textWithoutTags.length === 0) {
        const error = new Error("댓글에 텍스트 내용이 필요합니다.");
        error.code = "BAD_REQUEST";
        throw error;
      }

      const sanitizedContent = sanitizeContent(content);

      const updatedData = {
        content: sanitizedContent,
        updatedAt: FieldValue.serverTimestamp(),
      };

      await this.firestoreService.updateDocument("comments", commentId, updatedData);

      const { isDeleted, media, userId: _userId, ...commentWithoutDeleted } = comment;
      
      return {
        id: commentId,
        ...commentWithoutDeleted,
        ...updatedData,
        isLocked: commentWithoutDeleted.isLocked || false,
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

      if (comment.userId !== userId) {
        const error = new Error("댓글 삭제 권한이 없습니다");
        error.code = "FORBIDDEN";
        throw error;
      }

      if (comment.isDeleted) {
        const error = new Error("이미 삭제된 댓글입니다.");
        error.code = "BAD_REQUEST";
        throw error;
      }

      await this.firestoreService.updateDocument("comments", commentId, {
        isDeleted: true,
        content: "<p>삭제된 댓글입니다.</p>",
        updatedAt: FieldValue.serverTimestamp(),
      });

      await this.firestoreService.updateDocument(
        `communities/${comment.communityId}/posts`,
        comment.postId,
        {
          commentsCount: FieldValue.increment(-1),
          updatedAt: FieldValue.serverTimestamp(),
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
      const result = await this.firestoreService.runTransaction(async (transaction) => {
        const commentRef = this.firestoreService.db.collection("comments").doc(commentId);
        const commentDoc = await transaction.get(commentRef);

        if (!commentDoc.exists) {
          const error = new Error("댓글을 찾을 수 없습니다.");
          error.code = "NOT_FOUND";
          throw error;
        }

        const comment = commentDoc.data();
        if (comment.isDeleted) {
          const error = new Error("삭제된 댓글에는 좋아요를 할 수 없습니다.");
          error.code = "BAD_REQUEST";
          throw error;
        }

        const likeRef = this.firestoreService.db
          .collection("likes")
          .doc(`COMMENT:${commentId}:${userId}`);
        const likeDoc = await transaction.get(likeRef);
        let isLiked = false;

        if (likeDoc.exists) {
          transaction.delete(likeRef);
          isLiked = false;

          transaction.update(commentRef, {
            likesCount: FieldValue.increment(-1),
            updatedAt: FieldValue.serverTimestamp(),
          });
        } else {
          transaction.set(likeRef, {
            type: "COMMENT",
            targetId: commentId,
            userId,
            createdAt: FieldValue.serverTimestamp(),
          });
          isLiked = true;

          transaction.update(commentRef, {
            likesCount: FieldValue.increment(1),
            updatedAt: FieldValue.serverTimestamp(),
          });
        }

        const currentLikesCount = comment.likesCount || 0;
        return {
          commentId,
          userId,
          isLiked,
          likesCount: isLiked
            ? currentLikesCount + 1
            : Math.max(0, currentLikesCount - 1),
        };
      });

      if (result.isLiked) {
        const comment = await this.firestoreService.getDocument("comments", result.commentId);

        if (comment.userId !== userId) {
          try {
            const liker = await this.userService.getUserById(userId);
            const likerName = liker?.name || "사용자";

            const textOnly = typeof comment.content === 'string' 
              ? comment.content.replace(/<[^>]*>/g, '') 
              : comment.content;
            const commentPreview = textOnly || "댓글";
            const preview =
              commentPreview.length > CommentService.MAX_NOTIFICATION_PREVIEW_LENGTH
                ? commentPreview.substring(0, CommentService.MAX_NOTIFICATION_TEXT_LENGTH) + "..."
                : commentPreview;

            fcmHelper
              .sendNotification(
                comment.userId,
                "댓글에 좋아요가 달렸습니다",
                `${likerName}님이 "${preview}" 댓글에 좋아요를 눌렀습니다`,
                "community",
                comment.id,
                `/community/${comment.communityId}/posts/${comment.postId}`
              )
              .catch((error) => {
                console.error("댓글 좋아요 알림 전송 실패:", error);
              });
          } catch (error) {
            console.error("댓글 좋아요 알림 처리 실패:", error);
          }
        }
      }

      return result;
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
