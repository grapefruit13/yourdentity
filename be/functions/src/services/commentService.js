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

      // 댓글 작성자 닉네임 가져오기
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
        content,
        media,
        parentId,
        likesCount: 0,
        isDeleted: false,
        depth: parentId ? 1 : 0,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      const commentId = await this.firestoreService.addDocument("comments", newComment);

      // 게시글의 댓글 수 업데이트
      await this.firestoreService.updateDocument(`communities/${communityId}/posts`, postId, {
        commentsCount: FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp(),
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
        author,
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

      const parentComments = await this.firestoreService.getCollectionWhereMultiple(
        "comments",
        [
          {field: "postId", operator: "==", value: postId},
          {field: "parentId", operator: "==", value: null},
          {field: "isDeleted", operator: "==", value: false}
        ]
      );

      const sortedParentComments = parentComments
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      const totalParentCount = sortedParentComments.length;
      const paginatedParentComments = sortedParentComments.slice(
        pageNumber * pageSize,
        (pageNumber + 1) * pageSize,
      );

      const commentsWithReplies = [];

      if (paginatedParentComments.length > 0) {
        const parentIds = paginatedParentComments.map(comment => comment.id);

        const [allReplies] = await Promise.all([
          this.firestoreService.getCollectionWhereMultiple(
            "comments",
            [
              { field: "parentId", operator: "in", value: parentIds },
              { field: "isDeleted", operator: "==", value: false }
            ]
          )
        ]);

        const repliesByParentId = {};
        allReplies.forEach(reply => {
          if (!repliesByParentId[reply.parentId]) {
            repliesByParentId[reply.parentId] = [];
          }
          repliesByParentId[reply.parentId].push(reply);
        });

        for (const comment of paginatedParentComments) {
          const replies = repliesByParentId[comment.id] || [];
          const sortedReplies = replies
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
            .slice(0, 50);

          const processedComment = {
            ...comment,
            replies: sortedReplies,
            repliesCount: sortedReplies.length,
          };

          commentsWithReplies.push(processedComment);
        }
      }

      return {
        content: commentsWithReplies,
        pagination: {
          pageNumber,
          pageSize,
          totalElements: totalParentCount,
          totalPages: Math.ceil(totalParentCount / pageSize),
          hasNext: pageNumber < Math.ceil(totalParentCount / pageSize) - 1,
          hasPrevious: pageNumber > 0,
          isFirst: pageNumber === 0,
          isLast: pageNumber >= Math.ceil(totalParentCount / pageSize) - 1,
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
        updatedAt: FieldValue.serverTimestamp(),
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
        updatedAt: FieldValue.serverTimestamp(),
      });

      // 게시글의 댓글 수 감소
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

        // 결정적 문서 ID로 중복 생성 방지
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

            const textContent = comment.content.find((item) => item.type === "text");
            const commentPreview = textContent ? textContent.content : "댓글";
            const preview =
              commentPreview.length > 50
                ? commentPreview.substring(0, 50) + "..."
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
