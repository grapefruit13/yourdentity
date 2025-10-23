const {FieldValue} = require("firebase-admin/firestore");
const FirestoreService = require("./firestoreService");
const fcmHelper = require("../utils/fcmHelper");
const UserService = require("./userService");
const {db} = require("../config/database");

/**
 * Community Service (비즈니스 로직 계층)
 * 커뮤니티 관련 모든 비즈니스 로직 처리
 */
class CommunityService {
  constructor() {
    this.firestoreService = new FirestoreService("communities");
    this.userService = new UserService();
  }

  /**
   * 커뮤니티 매핑 정보 조회
   * @param {string} communityId - 커뮤니티 ID
   * @return {Promise<Object|null>} 커뮤니티 매핑 정보
   */
  async getCommunityMapping(communityId) {
    try {
      const community = await this.firestoreService.getDocument("communities", communityId);
      if (!community) {
        return null;
      }

      return {
        name: community.name,
        type: community.type,
        channel: community.channel,
        postType: community.postType,
      };
    } catch (error) {
      console.error("Get community mapping error:", error.message);
      throw new Error("커뮤니티 매핑 정보 조회에 실패했습니다");
    }
  }

  /**
   * 커뮤니티 목록 조회
   * @param {Object} options - 조회 옵션
   * @return {Promise<Object>} 커뮤니티 목록
   */
  async getCommunities(options = {}) {
    try {
      const {type, page = 0, size = 10} = options;
      const whereConditions = [];

      // 타입 필터링 (interest | anonymous)
      if (type && ["interest", "anonymous"].includes(type)) {
        whereConditions.push({
          field: "type",
          operator: "==",
          value: type,
        });
      }

      const result = await this.firestoreService.getWithPagination({
        page: parseInt(page),
        size: parseInt(size),
        orderBy: "createdAt",
        orderDirection: "desc",
        where: whereConditions,
      });

      return {
        content: result.content || [],
        pagination: result.pageable || {},
      };
    } catch (error) {
      console.error("Get communities error:", error.message);
      throw new Error("커뮤니티 목록 조회에 실패했습니다");
    }
  }



  /**
   * 시간 차이 계산
   * @param {Date} date - 날짜
   * @return {string} 시간 차이 문자열
   */
  getTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return "방금 전";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}분 전`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}시간 전`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}일 전`;
    } else {
      const months = Math.floor(diffInSeconds / 2592000);
      return `${months}개월 전`;
    }
  }

  /**
   * 게시글 프리뷰 생성
   * @param {Object} post - 게시글 데이터
   * @return {Object} 프리뷰 객체
   */
  createPreview(post) {
    const contentArr = Array.isArray(post.content) ? post.content : [];
    const mediaArr = Array.isArray(post.media) ? post.media : [];
    
    const textContents = contentArr.filter(
      (item) => item.type === "text" && item.text && item.text.trim(),
    );
    const description = textContents.length > 0 ?
      textContents[0].text.substring(0, 100) +
        (textContents[0].text.length > 100 ? "..." : "") :
      "";

      const firstImage = mediaArr.find((item) => item.type === "image") ||
      contentArr.find((item) => item.type === "image");
    
    const firstVideo = mediaArr.find((item) => item.type === "video") ||
      contentArr.find((item) => item.type === "video");

    const thumbnail = firstImage ? {
      url: firstImage.url || firstImage.src,
      blurHash: firstImage.blurHash,
      width: firstImage.width,
      height: firstImage.height,
      ratio: firstImage.width && firstImage.height ?
        `${firstImage.width}:${firstImage.height}` : "1:1",
    } : null;

    return {
      description,
      thumbnail,
      isVideo: !!firstVideo,
      hasImage: !!firstImage,
      hasVideo: !!firstVideo,
    };
  }

  async getAllCommunityPosts(options = {}) {
    try {
      const {
        type,
        page = 0,
        size = 10,
        includeContent = false,
        orderBy = "createdAt",
        orderDirection = "desc",
      } = options;

      const postTypeMapping = {
        routine: "ROUTINE_CERT",
        gathering: "GATHERING_REVIEW",
        tmi: "TMI",
      };

      const communities = await this.firestoreService.getCollection("communities");

      if (communities.length === 0) {
        return {
          content: [],
          pagination: {
            pageNumber: 0,
            pageSize: size,
            totalElements: 0,
            totalPages: 0,
            hasNext: false,
            hasPrevious: false,
            isFirst: true,
            isLast: true,
          },
        };
      }

      const allPosts = [];
      const communityMap = {};
      
      communities.forEach(community => {
        communityMap[community.id] = community;
      });

      const postPromises = communities.map(async (community) => {
        try {
          const whereConditions = [];
          if (type && postTypeMapping[type]) {
            whereConditions.push({
              field: "type",
              operator: "==",
              value: postTypeMapping[type],
            });
          }

          const postsService = new FirestoreService(`communities/${community.id}/posts`);
          const postsResult = await postsService.getWithPagination({
            page: page,
            size: size,
            orderBy: "createdAt",
            orderDirection: "desc",
            where: whereConditions,
          });

          const communityPosts = (postsResult.content || []).map(post => ({
            ...post,
            communityId: community.id,
            community: {
              id: community.id,
              name: community.name,
            },
          }));

          return communityPosts;
        } catch (error) {
          return [];
        }
      });

      const postsArrays = await Promise.all(postPromises);
      allPosts.push(...postsArrays.flat());

      allPosts.sort((a, b) => {
        const aTime = new Date(a.createdAt).getTime();
        const bTime = new Date(b.createdAt).getTime();
        return bTime - aTime;
      });

      const startIndex = page * size;
      const endIndex = startIndex + size;
      const paginatedPosts = allPosts.slice(startIndex, endIndex);

      const processedPosts = paginatedPosts.map((post) => {
        const processedPost = {
          ...post,
          createdAt: post.createdAt?.toDate?.()?.toISOString?.() || post.createdAt,
          updatedAt: post.updatedAt?.toDate?.()?.toISOString?.() || post.updatedAt,
          scheduledDate: post.scheduledDate?.toDate?.()?.toISOString?.() || post.scheduledDate,
          timeAgo: post.createdAt ? this.getTimeAgo(new Date(post.createdAt?.toDate?.() || post.createdAt)) : "",
          communityPath: `communities/${post.communityId}`,
          rewardGiven: post.rewardGiven || false,
          reactionsCount: post.reactionsCount || 0,
          reportsCount: post.reportsCount || 0,
          viewCount: post.viewCount || 0,
        };

        if (includeContent) {
          processedPost.content = post.content || [];
          processedPost.media = post.media || [];
        } else {
          processedPost.preview = this.createPreview(post);
          delete processedPost.content;
          delete processedPost.media;
        }

        delete processedPost.communityId;

        return processedPost;
      });

      const totalElements = allPosts.length;
      const totalPages = Math.ceil(totalElements / size);

      return {
        content: processedPosts,
        pagination: {
          pageNumber: page,
          pageSize: size,
          totalElements: totalElements,
          totalPages: totalPages,
          hasNext: page < totalPages - 1,
          hasPrevious: page > 0,
          isFirst: page === 0,
          isLast: page === totalPages - 1,
        },
      };
    } catch (error) {
      console.error("Get all community posts error:", error.message);
      throw new Error("커뮤니티 게시글 조회에 실패했습니다");
    }
  }


  /**
   * 게시글 생성
   * @param {string} communityId - 커뮤니티 ID
   * @param {string} userId - 사용자 ID
   * @param {Object} postData - 게시글 데이터
   * @return {Promise<Object>} 생성된 게시글
   */
  async createPost(communityId, userId, postData) {
    try {
      const {
        title, 
        content = [], 
        media = [], 
        type, 
        channel, 
        visibility = "PUBLIC",
        category,
        tags = [],
        scheduledDate
      } = postData;

      // 커뮤니티 존재 확인
      const community = await this.firestoreService.getDocument("communities", communityId);
      if (!community) {
        const error = new Error("Community not found");
        error.code = "NOT_FOUND";
        throw error;
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
          if (community.postType === "TMI") {
            author = memberData.name || "익명";
          } else {
            author = memberData.nickname || "익명";
          }
        }
      } catch (memberError) {
        console.warn("Failed to get member info:", memberError.message);
      }

      const postsService = new FirestoreService(`communities/${communityId}/posts`);
      
      const newPost = {
        communityId,
        authorId: userId,
        author: author,
        title,
        content,
        media,
        type: type || "GENERAL",
        channel: channel || community.channel || "general",
        category: category || null,
        tags: tags || [],
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        visibility,
        isLocked: false,
        rewardGiven: false,
        reactionsCount: 0,
        likesCount: 0,
        commentsCount: 0,
        reportsCount: 0,
        viewCount: 0,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      const result = await postsService.create(newPost);
      const postId = result.id;

      return {
        id: postId,
        ...newPost,
        // 시간 필드들을 ISO 문자열로 변환 (FirestoreService와 동일)
        createdAt: newPost.createdAt?.toDate?.()?.toISOString?.() || newPost.createdAt,
        updatedAt: newPost.updatedAt?.toDate?.()?.toISOString?.() || newPost.updatedAt,
        scheduledDate: newPost.scheduledDate?.toDate?.()?.toISOString?.() || newPost.scheduledDate,
        communityPath: `communities/${communityId}`,
        community: {
          id: communityId,
          name: community.name,
        },
      };
    } catch (error) {
      console.error("Create post error:", error.message);
      if (error.code === "NOT_FOUND") {
        throw error;
      }
      throw new Error("게시글 생성에 실패했습니다");
    }
  }

  /**
   * 게시글 상세 조회
   * @param {string} communityId - 커뮤니티 ID
   * @param {string} postId - 게시글 ID
   * @return {Promise<Object>} 게시글 상세 정보
   */
  async getPostById(communityId, postId) {
    try {
      const postsService = new FirestoreService(`communities/${communityId}/posts`);
      const post = await postsService.getById(postId);

      if (!post) {
        const error = new Error("Post not found");
        error.code = "NOT_FOUND";
        throw error;
      }

      // 조회수 증가
      const newViewCount = (post.viewCount || 0) + 1;
      postsService.update(postId, {
        viewCount: newViewCount,
        updatedAt: FieldValue.serverTimestamp(),
      }).catch(error => {
        console.error("조회수 증가 실패:", error);
      });

      // 커뮤니티 정보 추가
      const community = await this.firestoreService.getDocument("communities", communityId);

      return {
        ...post,
        viewCount: newViewCount,
        // 시간 필드들을 ISO 문자열로 변환 (FirestoreService와 동일)
        createdAt: post.createdAt?.toDate?.()?.toISOString?.() || post.createdAt,
        updatedAt: post.updatedAt?.toDate?.()?.toISOString?.() || post.updatedAt,
        scheduledDate: post.scheduledDate?.toDate?.()?.toISOString?.() || post.scheduledDate,
        timeAgo: post.createdAt ? this.getTimeAgo(new Date(post.createdAt?.toDate?.() || post.createdAt)) : "",
        community: community ? {
          id: communityId,
          name: community.name,
        } : null,
      };
    } catch (error) {
      console.error("Get post by ID error:", error.message);
      if (error.code === "NOT_FOUND") {
        throw error;
      }
      throw new Error("게시글 조회에 실패했습니다");
    }
  }

  /**
   * 게시글 수정
   * @param {string} communityId - 커뮤니티 ID
   * @param {string} postId - 게시글 ID
   * @param {Object} updateData - 수정할 데이터
   * @param {string} userId - 사용자 ID (소유권 검증용)
   * @return {Promise<Object>} 수정된 게시글
   */
  async updatePost(communityId, postId, updateData, userId) {
    try {
      const postsService = new FirestoreService(`communities/${communityId}/posts`);
      const post = await postsService.getById(postId);

      if (!post) {
        const error = new Error("Post not found");
        error.code = "NOT_FOUND";
        throw error;
      }

      // 소유권 검증
      if (post.authorId !== userId) {
        const error = new Error("게시글 수정 권한이 없습니다");
        error.code = "FORBIDDEN";
        throw error;
      }

      const updatedData = {
        ...updateData,
        updatedAt: FieldValue.serverTimestamp(),
      };

      await postsService.update(postId, updatedData);

      // 커뮤니티 정보 조회
      const community = await this.firestoreService.getDocument("communities", communityId);

      return {
        id: postId,
        ...post,
        ...updatedData,
        // 시간 필드들을 ISO 문자열로 변환 (FirestoreService와 동일)
        createdAt: post.createdAt?.toDate?.()?.toISOString?.() || post.createdAt,
        updatedAt: updatedData.updatedAt?.toDate?.()?.toISOString?.() || updatedData.updatedAt,
        scheduledDate: post.scheduledDate?.toDate?.()?.toISOString?.() || post.scheduledDate,
        communityPath: `communities/${communityId}`,
        community: community ? {
          id: communityId,
          name: community.name,
        } : null,
      };
    } catch (error) {
      console.error("Update post error:", error.message);
      if (error.code === "NOT_FOUND" || error.code === "FORBIDDEN") {
        throw error;
      }
      throw new Error("게시글 수정에 실패했습니다");
    }
  }

  /**
   * 게시글 삭제
   * @param {string} communityId - 커뮤니티 ID
   * @param {string} postId - 게시글 ID
   * @param {string} userId 
   * @return {Promise<void>}
   */
  async deletePost(communityId, postId, userId) {
    try {
      const postsService = new FirestoreService(`communities/${communityId}/posts`);
      const post = await postsService.getById(postId);

      if (!post) {
        const error = new Error("Post not found");
        error.code = "NOT_FOUND";
        throw error;
      }

      if (post.authorId !== userId) {
        const error = new Error("게시글 삭제 권한이 없습니다");
        error.code = "FORBIDDEN";
        throw error;
      }

      await postsService.delete(postId);
    } catch (error) {
      console.error("Delete post error:", error.message);
      if (error.code === "NOT_FOUND" || error.code === "FORBIDDEN") {
        throw error;
      }
      throw new Error("게시글 삭제에 실패했습니다");
    }
  }

  /**
   * 게시글 좋아요 토글
   * @param {string} communityId - 커뮤니티 ID
   * @param {string} postId - 게시글 ID
   * @param {string} userId - 사용자 ID
   * @return {Promise<Object>} 좋아요 결과
   */
  async togglePostLike(communityId, postId, userId) {
    try {
      const result = await this.firestoreService.runTransaction(async (transaction) => {
        const postRef = this.firestoreService.db
          .collection("communities")
          .doc(communityId)
          .collection("posts")
          .doc(postId);
        const postDoc = await transaction.get(postRef);

        if (!postDoc.exists) {
          const error = new Error("Post not found");
          error.code = "NOT_FOUND";
          throw error;
        }

        // 결정적 문서 ID로 중복 생성 방지
        const likeRef = this.firestoreService.db
          .collection("likes")
          .doc(`POST:${postId}:${userId}`);
        const likeDoc = await transaction.get(likeRef);
        let isLiked = false;

        if (likeDoc.exists) {
          transaction.delete(likeRef);
          isLiked = false;

          transaction.update(postRef, {
            likesCount: FieldValue.increment(-1),
            updatedAt: FieldValue.serverTimestamp(),
          });
        } else {
          transaction.set(likeRef, {
            type: "POST",
            targetId: postId,
            userId,
            createdAt: FieldValue.serverTimestamp(),
          });
          isLiked = true;

          transaction.update(postRef, {
            likesCount: FieldValue.increment(1),
            updatedAt: FieldValue.serverTimestamp(),
          });
        }

        const post = postDoc.data();
        const currentLikesCount = post.likesCount || 0;

    
        if (isLiked && post.authorId !== userId) {
          try {
            const liker = await this.userService.getUserById(userId);
            const likerName = liker?.name || "사용자";

            fcmHelper.sendNotification(
              post.authorId,
              "게시글에 좋아요가 달렸습니다",
              `${likerName}님이 "${post.title}"에 좋아요를 눌렀습니다`,
              "community",
              postId,
              `/community/${communityId}/posts/${postId}`
            ).catch((err) => {
              console.error("게시글 좋아요 알림 전송 실패:", err);
            });
          } catch (error) {
            console.error("게시글 좋아요 알림 처리 실패:", error);
          }
        }

        return {
          postId,
          userId,
          isLiked,
          likesCount: isLiked ? currentLikesCount + 1 : Math.max(0, currentLikesCount - 1),
        };
      });

      return result;
    } catch (error) {
      console.error("Toggle post like error:", error.message);
      if (error.code === "NOT_FOUND") {
        throw error;
      }
      throw new Error("게시글 좋아요 처리에 실패했습니다");
    }
  }
}

module.exports = CommunityService;
