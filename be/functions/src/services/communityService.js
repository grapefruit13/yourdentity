const {FieldValue} = require("firebase-admin/firestore");
const FirestoreService = require("./firestoreService");
const {db} = require("../config/database");

/**
 * Community Service (비즈니스 로직 계층)
 * 커뮤니티 관련 모든 비즈니스 로직 처리
 */
class CommunityService {
  constructor() {
    this.firestoreService = new FirestoreService("communities");
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
      throw new Error("Failed to get community mapping");
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
      throw new Error("Failed to get communities");
    }
  }

  /**
   * 커뮤니티 상세 조회
   * @param {string} communityId - 커뮤니티 ID
   * @return {Promise<Object>} 커뮤니티 상세 정보
   */
  async getCommunityById(communityId) {
    try {
      const community = await this.firestoreService.getDocument("communities", communityId);

      if (!community) {
        const error = new Error("Community not found");
        error.code = "NOT_FOUND";
        throw error;
      }

      // 멤버 수 조회
      const membersSnapshot = await db
        .collection("communities")
        .doc(communityId)
        .collection("members")
        .get();
      community.membersCount = membersSnapshot.size;

      // 게시글 수 조회
      const postsSnapshot = await db
        .collection("communities")
        .doc(communityId)
        .collection("posts")
        .get();
      community.postsCount = postsSnapshot.size;

      return community;
    } catch (error) {
      console.error("Get community by ID error:", error.message);
      if (error.code === "NOT_FOUND") {
        throw error;
      }
      throw new Error("Failed to get community");
    }
  }

  /**
   * 커뮤니티 멤버 목록 조회
   * @param {string} communityId - 커뮤니티 ID
   * @param {Object} options - 페이지네이션 옵션
   * @return {Promise<Object>} 멤버 목록
   */
  async getCommunityMembers(communityId, options = {}) {
    try {
      const {page = 0, size = 20} = options;

      // 커뮤니티 존재 확인
      const community = await this.firestoreService.getDocument("communities", communityId);
      if (!community) {
        const error = new Error("Community not found");
        error.code = "NOT_FOUND";
        throw error;
      }

      const membersService = new FirestoreService(`communities/${communityId}/members`);
      const result = await membersService.getWithPagination({
        page: parseInt(page),
        size: parseInt(size),
        orderBy: "joinedAt",
        orderDirection: "desc",
      });

      return {
        content: result.content || [],
        pagination: result.pageable || {},
      };
    } catch (error) {
      console.error("Get community members error:", error.message);
      if (error.code === "NOT_FOUND") {
        throw error;
      }
      throw new Error("Failed to get community members");
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
    // 텍스트 content에서 첫 2줄 추출
    const textContents = contentArr.filter(
      (item) => item.type === "text" && item.text && item.text.trim(),
    );
    const description = textContents.length > 0 ?
      textContents[0].text.substring(0, 100) +
        (textContents[0].text.length > 100 ? "..." : "") :
      "";

    // 첫 번째 이미지 미디어 찾기
    const firstImage = mediaArr.find((item) => item.type === "image") ||
      contentArr.find((item) => item.type === "image");

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
      hasMedia: mediaArr.length > 0,
      mediaCount: mediaArr.length,
    };
  }

  /**
   * 전체 커뮤니티 게시글 조회 (Collection Group + 복합 인덱스 - 최적화)
   * @param {Object} options - 조회 옵션
   * @return {Promise<Object>} 게시글 목록
   */
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

      // filter에 따른 게시글 타입 매핑
      const postTypeMapping = {
        routine: "ROUTINE_CERT",
        gathering: "GATHERING_REVIEW",
        tmi: "TMI",
      };

      // 1. Collection Group으로 모든 커뮤니티의 posts 조회 (단일 쿼리)
      const whereConditions = [];
      if (type && postTypeMapping[type]) {
        whereConditions.push({
          field: "type",
          operator: "==",
          value: postTypeMapping[type],
        });
      }


      const result = await this.firestoreService.getCollectionGroup("posts", {
        page: parseInt(page),
        size: parseInt(size),
        orderBy: orderBy || "createdAt",
        orderDirection: orderDirection || "desc",
        where: whereConditions.length > 0 ? whereConditions : [],
      });

      // 2. 커뮤니티 정보 조회 (필요한 커뮤니티만)
      const communityIds = [...new Set(result.content.map(post => post.communityId))].filter(id => id && id !== undefined);
      
      let communities = [];
      if (communityIds.length > 0) {
        communities = await this.firestoreService.getCollectionWhereIn(
          "communities",
          "id",
          communityIds
        );
      }

      // 3. 커뮤니티 정보 매핑
      const communityMap = {};
      communities.forEach(community => {
        communityMap[community.id] = community;
      });

      // 4. 게시글 데이터 가공
      const processedPosts = result.content.map((post) => {
        const community = communityMap[post.communityId] || {
          id: post.communityId,
          name: "알 수 없는 커뮤니티",
          type: "UNKNOWN",
        };

        const processedPost = {
          ...post,
          timeAgo: post.createdAt ? this.getTimeAgo(new Date(post.createdAt)) : "",
          community: {
            id: community.id,
            name: community.name,
            type: community.type,
          },
        };

        // 내용 포함 여부에 따른 처리
        if (includeContent) {
          processedPost.content = post.content || [];
          processedPost.media = post.media || [];
        } else {
          processedPost.preview = this.createPreview(post);
          delete processedPost.content;
          delete processedPost.media;
        }

        // Collection Group에서 추가된 필드 제거
        delete processedPost.path;
        delete processedPost.communityId;

        return processedPost;
      });

      return {
        content: processedPosts,
        pagination: result.pageable || {},
      };
    } catch (error) {
      console.error("Get all community posts error:", error.message);
      throw new Error("Failed to get community posts");
    }
  }

  /**
   * 특정 커뮤니티의 게시글 목록 조회
   * @param {string} communityId - 커뮤니티 ID
   * @param {Object} options - 조회 옵션
   * @return {Promise<Object>} 게시글 목록
   */
  async getCommunityPosts(communityId, options = {}) {
    try {
      const {
        type,
        channel,
        page = 0,
        size = 10,
        includeContent = false,
      } = options;

      // 커뮤니티 존재 확인
      const community = await this.firestoreService.getDocument("communities", communityId);
      if (!community) {
        const error = new Error("Community not found");
        error.code = "NOT_FOUND";
        throw error;
      }

      const postsService = new FirestoreService(`communities/${communityId}/posts`);
      const whereConditions = [];

      if (type) {
        whereConditions.push({field: "type", operator: "==", value: type});
      }
      if (channel) {
        whereConditions.push({field: "channel", operator: "==", value: channel});
      }

      const result = await postsService.getWithPagination({
        page: parseInt(page),
        size: parseInt(size),
        orderBy: "createdAt",
        orderDirection: "desc",
        where: whereConditions,
      });

      // 게시글 데이터 가공
      const posts = (result.content || []).map((post) => {
        const processedPost = {
          ...post,
          timeAgo: post.createdAt ? this.getTimeAgo(new Date(post.createdAt)) : "",
          community: {
            id: communityId,
            name: community.name,
          },
        };

        if (includeContent) {
          processedPost.content = post.content || [];
          processedPost.media = post.media || [];
        } else {
          processedPost.preview = this.createPreview(post);
          delete processedPost.content;
          delete processedPost.media;
        }

        return processedPost;
      });

      return {
        content: posts,
        pagination: result.pageable || {},
      };
    } catch (error) {
      console.error("Get community posts error:", error.message);
      if (error.code === "NOT_FOUND") {
        throw error;
      }
      throw new Error("Failed to get community posts");
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
      const {title, content = [], media = [], type, channel, visibility = "PUBLIC"} = postData;

      // 커뮤니티 존재 확인
      const community = await this.firestoreService.getDocument("communities", communityId);
      if (!community) {
        const error = new Error("Community not found");
        error.code = "NOT_FOUND";
        throw error;
      }

      const postsService = new FirestoreService(`communities/${communityId}/posts`);
      
      const newPost = {
        communityId,
        authorId: userId,
        title,
        content,
        media,
        type: type || "GENERAL",
        channel: channel || "general",
        visibility,
        isLocked: false,
        likesCount: 0,
        commentsCount: 0,
        viewCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await postsService.create(newPost);
      const postId = result.id;

      return {
        id: postId,
        ...newPost,
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
      throw new Error("Failed to create post");
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
        updatedAt: new Date(),
      }).catch(error => {
        console.error("조회수 증가 실패:", error);
      });

      // 커뮤니티 정보 추가
      const community = await this.firestoreService.getDocument("communities", communityId);

      return {
        ...post,
        viewCount: newViewCount,
        timeAgo: post.createdAt ? this.getTimeAgo(new Date(post.createdAt)) : "",
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
      throw new Error("Failed to get post");
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
        updatedAt: new Date(),
      };

      await postsService.update(postId, updatedData);

      return {
        id: postId,
        ...post,
        ...updatedData,
      };
    } catch (error) {
      console.error("Update post error:", error.message);
      if (error.code === "NOT_FOUND" || error.code === "FORBIDDEN") {
        throw error;
      }
      throw new Error("Failed to update post");
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
      throw new Error("Failed to delete post");
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
        const postRef = this.firestoreService.db.collection("communities").doc(communityId).collection("posts").doc(postId);
        const postDoc = await transaction.get(postRef);
        
        if (!postDoc.exists) {
          const error = new Error("Post not found");
          error.code = "NOT_FOUND";
          throw error;
        }

        const existingLikesQuery = await this.firestoreService.db
          .collection("likes")
          .where("targetId", "==", postId)
          .where("userId", "==", userId)
          .where("type", "==", "POST")
          .limit(1)
          .get();

        const userLike = existingLikesQuery.empty ? null : existingLikesQuery.docs[0];
        let isLiked = false;

        if (userLike) {
          transaction.delete(userLike.ref);
          isLiked = false;

          transaction.update(postRef, {
            likesCount: FieldValue.increment(-1),
            updatedAt: new Date(),
          });
        } else {
          const likeRef = this.firestoreService.db.collection("likes").doc();
          transaction.set(likeRef, {
            type: "POST",
            targetId: postId,
            userId,
            createdAt: new Date(),
          });
          isLiked = true;

          transaction.update(postRef, {
            likesCount: FieldValue.increment(1),
            updatedAt: new Date(),
          });
        }

        const post = postDoc.data();
        const currentLikesCount = post.likesCount || 0;

        return {
          postId,
          userId,
          isLiked,
          likesCount: isLiked ? currentLikesCount + 1 : currentLikesCount - 1,
        };
      });

      return result;
    } catch (error) {
      console.error("Toggle post like error:", error.message);
      if (error.code === "NOT_FOUND") {
        throw error;
      }
      throw new Error("Failed to toggle post like");
    }
  }
}

module.exports = CommunityService;
