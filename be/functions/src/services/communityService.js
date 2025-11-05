const {FieldValue} = require("firebase-admin/firestore");
const FirestoreService = require("./firestoreService");
const fcmHelper = require("../utils/fcmHelper");
const {sanitizeContent} = require("../utils/sanitizeHelper");
const fileService = require("./fileService");

/**
 * Community Service (비즈니스 로직 계층)
 * 커뮤니티 관련 모든 비즈니스 로직 처리
 */
class CommunityService {
  static MAX_PREVIEW_TEXT_LENGTH = 30;

  constructor() {
    this.firestoreService = new FirestoreService("communities");
  }

  getUserService() {
    if (!this._userService) {
      const UserService = require("./userService");
      this._userService = new UserService();
    }
    return this._userService;
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
    let description = "";
    let thumbnail = null;

    if (typeof post.content === 'string') {
      const textOnly = post.content.replace(/<[^>]*>/g, '').trim();
      description = textOnly.substring(0, CommunityService.MAX_PREVIEW_TEXT_LENGTH) + (textOnly.length > CommunityService.MAX_PREVIEW_TEXT_LENGTH ? "..." : "");

      const imgMatch = post.content.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
      if (imgMatch) {
        const imgTag = post.content.match(/<img[^>]*>/i)?.[0] || "";
        const srcMatch = imgTag.match(/src=["']([^"']+)["']/i);
        const widthMatch = imgTag.match(/width=["']?(\d+)["']?/i);
        const heightMatch = imgTag.match(/height=["']?(\d+)["']?/i);
        const blurHashMatch = imgTag.match(/data-blurhash=["']([^"']+)["']/i);

        thumbnail = {
          url: srcMatch ? srcMatch[1] : imgMatch[1],
          width: widthMatch ? parseInt(widthMatch[1]) : undefined,
          height: heightMatch ? parseInt(heightMatch[1]) : undefined,
          blurHash: blurHashMatch ? blurHashMatch[1] : undefined,
        };
      }
    } else {
      const contentArr = Array.isArray(post.content) ? post.content : [];
      const mediaArr = Array.isArray(post.media) ? post.media : [];

      const textItem = contentArr.find(
        (item) =>
          item.type === "text" &&
          (item.content || item.text) &&
          (item.content || item.text).trim(),
      );
      const text = textItem ? (textItem.content || textItem.text) : "";
      description = text
        ? text.substring(0, CommunityService.MAX_PREVIEW_TEXT_LENGTH) +
          (text.length > CommunityService.MAX_PREVIEW_TEXT_LENGTH ? "..." : "")
        : "";

      const firstImage = mediaArr.find((item) => item.type === "image") ||
        contentArr.find((item) => item.type === "image");

      thumbnail = firstImage ? {
        url: firstImage.url || firstImage.src,
        blurHash: firstImage.blurHash,
        width: firstImage.width,
        height: firstImage.height,
      } : null;
    }

    return {
      description,
      thumbnail,
    };
  }

  async getAllCommunityPosts(options = {}) {
    try {
      const {
        type,
        page = 0,
        size = 10,
        orderBy = "createdAt",
        orderDirection = "desc",
      } = options;

      const postTypeMapping = {
        routine: "ROUTINE_CERT",
        gathering: "GATHERING_REVIEW",
        tmi: "TMI",
      };

      let allPosts = [];
      const communityMap = {};

      // whereConditions 생성 헬퍼 함수
      const buildWhereConditions = () => {
        const conditions = [];
        if (type && postTypeMapping[type]) {
          conditions.push({ field: "type", operator: "==", value: postTypeMapping[type] });
        }
        return conditions;
      };

      // Collection Group 사용
      try {
        const postsService = new FirestoreService();
        const postsResult = await postsService.getCollectionGroup("posts", {
          page,
          size,
          orderBy,
          orderDirection,
          where: buildWhereConditions(),
        });

        const communities = await this.firestoreService.getCollection("communities");
        communities.forEach(community => {
          communityMap[community.id] = community;
        });

        allPosts = (postsResult.content || []).map(post => ({
          ...post,
          community: communityMap[post.communityId] ? {
            id: post.communityId,
            name: communityMap[post.communityId].name,
          } : null,
        }));

        const processPost = (post) => {
          const { authorId: _, ...postWithoutAuthorId } = post;
          const createdAtDate = post.createdAt?.toDate?.() || post.createdAt;
          const processedPost = {
            ...postWithoutAuthorId,
            createdAt: createdAtDate?.toISOString?.() || post.createdAt,
            updatedAt: post.updatedAt?.toDate?.()?.toISOString?.() || post.updatedAt,
            scheduledDate: post.scheduledDate?.toDate?.()?.toISOString?.() || post.scheduledDate,
            timeAgo: createdAtDate ? this.getTimeAgo(new Date(createdAtDate)) : "",
            communityPath: `communities/${post.communityId}`,
            rewardGiven: post.rewardGiven || false,
            reportsCount: post.reportsCount || 0,
            viewCount: post.viewCount || 0,
          };

          // 저장된 preview 사용 (하위 호환: 없으면 동적 생성)
          processedPost.preview = post.preview || this.createPreview(post);
          delete processedPost.content;
          delete processedPost.media;

          delete processedPost.communityId;
          return processedPost;
        };

        return {
          content: allPosts.map(processPost),
          pagination: postsResult.pageable || {},
        };
      } catch (collectionGroupError) {
        if (collectionGroupError.code === 9) {
        } else {
          throw collectionGroupError;
        }
      }

      if (Object.keys(communityMap).length === 0) {
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
        communities.forEach(community => {
          communityMap[community.id] = community;
        });
      }

      const postPromises = Object.values(communityMap).map(async (community) => {
        try {
          const postsService = new FirestoreService(`communities/${community.id}/posts`);
          const whereConditions = buildWhereConditions();
          
          const postsResult = await postsService.getWithPagination({
            page,
            size,
            orderBy: "createdAt",
            orderDirection: "desc",
            where: whereConditions,
          });
          
          const postsArray = postsResult.content || [];
          
          return postsArray.map(post => ({
            ...post,
            communityId: community.id,
            community: { id: community.id, name: community.name },
          }));
        } catch (error) {
          return [];
        }
      });

      const postsArrays = await Promise.all(postPromises);
      allPosts = postsArrays.flat();

      // post 처리 헬퍼 함수
      const processPost = (post) => {
        const { authorId: _, ...postWithoutAuthorId } = post;
        const createdAtDate = post.createdAt?.toDate?.() || post.createdAt;
        const processedPost = {
          ...postWithoutAuthorId,
          createdAt: createdAtDate?.toISOString?.() || post.createdAt,
          updatedAt: post.updatedAt?.toDate?.()?.toISOString?.() || post.updatedAt,
          scheduledDate: post.scheduledDate?.toDate?.()?.toISOString?.() || post.scheduledDate,
          timeAgo: createdAtDate ? this.getTimeAgo(new Date(createdAtDate)) : "",
          communityPath: `communities/${post.communityId}`,
          rewardGiven: post.rewardGiven || false,
          reportsCount: post.reportsCount || 0,
          viewCount: post.viewCount || 0,
        };

        // 저장된 preview 사용 (하위 호환: 없으면 동적 생성)
        processedPost.preview = post.preview || this.createPreview(post);
        delete processedPost.content;
        delete processedPost.media;

        delete processedPost.communityId;
        return processedPost;
      };

      const processedPosts = allPosts.map(processPost);
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
          isLast: page >= totalPages - 1,
        },
      };
    } catch (error) {
      console.error("Get all community posts error:", error.message);
      throw new Error("커뮤니티 게시글 조회에 실패했습니다");
    }
  }

  /**
   * @param {Array<string>} postIds - 게시글 ID 목록
   * @param {Object} communityIdMap - postId를 communityId로 매핑
   * @return {Promise<Array>} 처리된 게시글 목록
   */
  async getPostsByIds(postIds, communityIdMap) {
    if (!postIds || postIds.length === 0) {
      return [];
    }

    // CommunityService 인스턴스 생성 (lazy loading으로 순환 참조 방지)
    const CommunityService = require("./communityService");
    const communityService = new CommunityService();

    // 커뮤니티 정보 조회
    const communities = await communityService.firestoreService.getCollection("communities");
    const communityMap = {};
    communities.forEach(community => {
      communityMap[community.id] = community;
    });

    // 각 postId별로 게시글 조회
    const postPromises = postIds.map(async (postId) => {
      try {
        const communityId = communityIdMap[postId];
        if (!communityId) return null;
        
        const postsService = new FirestoreService(`communities/${communityId}/posts`);
        const post = await postsService.getById(postId);
        
        if (!post) return null;
        
        return {
          ...post,
          communityId,
          community: communityMap[communityId] ? {
            id: communityId,
            name: communityMap[communityId].name,
          } : null,
        };
      } catch (error) {
        console.error(`Error fetching post ${postId}:`, error.message);
        return null;
      }
    });

    const posts = await Promise.all(postPromises);
    const allPosts = posts.filter(post => post !== null);

    // processPost 헬퍼 함수 적용 (저장된 preview 사용)
    const processPost = (post) => {
      const { authorId: _, ...postWithoutAuthorId } = post;
      const createdAtDate = post.createdAt?.toDate?.() || post.createdAt;
      const processedPost = {
        ...postWithoutAuthorId,
        createdAt: createdAtDate?.toISOString?.() || post.createdAt,
        updatedAt: post.updatedAt?.toDate?.()?.toISOString?.() || post.updatedAt,
        scheduledDate: post.scheduledDate?.toDate?.()?.toISOString?.() || post.scheduledDate,
        timeAgo: createdAtDate ? communityService.getTimeAgo(new Date(createdAtDate)) : "",
        communityPath: `communities/${post.communityId}`,
        rewardGiven: post.rewardGiven || false,
        reportsCount: post.reportsCount || 0,
        viewCount: post.viewCount || 0,
      };

      // 저장된 preview 사용 (하위 호환: 없으면 동적 생성)
      processedPost.preview = post.preview || communityService.createPreview(post);
      delete processedPost.content;
      delete processedPost.media;
      delete processedPost.communityId;

      return processedPost;
    };

    return allPosts.map(processPost);
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
        content, 
        media: postMedia = [], 
        type, 
        channel, 
        category,
        scheduledDate
      } = postData;
      
      const visibility = "PUBLIC";

      if (!title || typeof title !== "string" || title.trim().length === 0) {
        const error = new Error("제목은 필수입니다.");
        error.code = "BAD_REQUEST";
        throw error;
      }

      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        const error = new Error("게시글 내용은 필수입니다.");
        error.code = "BAD_REQUEST";
        throw error;
      }

      const textWithoutTags = content.replace(/<[^>]*>/g, '').trim();
      if (textWithoutTags.length === 0) {
        const error = new Error("게시글에 텍스트 내용이 필요합니다.");
        error.code = "BAD_REQUEST";
        throw error;
      }

      const sanitizedContent = sanitizeContent(content);

      const sanitizedText = sanitizedContent.replace(/<[^>]*>/g, '').trim();
      if (sanitizedText.length === 0) {
        const error = new Error("sanitize 후 유효한 텍스트 내용이 없습니다.");
        error.code = "BAD_REQUEST";
        throw error;
      }

      // 파일 검증 (게시글 생성 전)
      let validatedFiles = [];
      if (postMedia && Array.isArray(postMedia) && postMedia.length > 0) {
        try {
          validatedFiles = await fileService.validateFilesForPost(postMedia, userId);
        } catch (fileError) {
          console.error("파일 검증 실패:", fileError);
          // 파일 검증 실패 시 게시글 생성 안 함
          throw fileError;
        }
      }

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
      
      // preview 필드 생성
      const preview = this.createPreview({
        content: sanitizedContent,
        media: postMedia,
      });
      
      const newPost = {
        communityId,
        authorId: userId,
        author: author,
        title,
        content: sanitizedContent,
        media: postMedia,
        preview,
        type: type || community.postType || "GENERAL",
        channel: channel || community.channel || "general",
        category: category || null,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        visibility,
        isLocked: false,
        rewardGiven: false,
        likesCount: 0,
        commentsCount: 0,
        reportsCount: 0,
        viewCount: 0,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      const result = await this.firestoreService.runTransaction(async (transaction) => {

        const postRef = this.firestoreService.db.collection(`communities/${communityId}/posts`).doc();
        transaction.set(postRef, newPost);
        
        if (validatedFiles.length > 0) {
          fileService.attachFilesToPostInTransaction(validatedFiles, postRef.id, transaction);
        }
        
        const authoredPostRef = this.firestoreService.db
          .collection(`users/${userId}/authoredPosts`)
          .doc(postRef.id);
        transaction.set(authoredPostRef, {
          postId: postRef.id,
          communityId,
          createdAt: FieldValue.serverTimestamp(),
          lastAuthoredAt: FieldValue.serverTimestamp(),
        });

        // certificationPosts 카운트 증가 (해당 타입인 경우만)
        if (newPost.type === "ROUTINE_CERT" || newPost.type === "GATHERING_REVIEW" || newPost.type === "TMI") {
          const userRef = this.firestoreService.db.collection("users").doc(userId);
          transaction.update(userRef, {
            certificationPosts: FieldValue.increment(1),
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
        
        return { postId: postRef.id };
      });
      const postId = result.postId;

      const {authorId, createdAt: _createdAt, updatedAt: _updatedAt, preview: _preview, ...restNewPost} = newPost;
      
      return {
        id: postId,
        ...restNewPost,
        scheduledDate: newPost.scheduledDate?.toISOString?.() || newPost.scheduledDate,
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

      const {authorId, ...postWithoutAuthorId} = post;
      
      return {
        ...postWithoutAuthorId,
        viewCount: newViewCount,
        // 시간 필드들을 ISO 문자열로 변환 (FirestoreService와 동일)
        createdAt: post.createdAt?.toDate?.()?.toISOString?.() || post.createdAt,
        updatedAt: post.updatedAt?.toDate?.()?.toISOString?.() || post.updatedAt,
        scheduledDate: post.scheduledDate?.toDate?.()?.toISOString?.() || post.scheduledDate,
        timeAgo: post.createdAt ? this.getTimeAgo(new Date(post.createdAt?.toDate?.() || post.createdAt)) : "",
        communityPath: `communities/${communityId}`,
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

      if (post.authorId !== userId) {
        const error = new Error("게시글 수정 권한이 없습니다");
        error.code = "FORBIDDEN";
        throw error;
      }

      if (Object.prototype.hasOwnProperty.call(updateData, "content")) {
        if (!updateData.content || typeof updateData.content !== 'string' || updateData.content.trim().length === 0) {
          const error = new Error("게시글 내용은 필수입니다.");
          error.code = "BAD_REQUEST";
          throw error;
        }

        const textWithoutTags = updateData.content.replace(/<[^>]*>/g, '').trim();
        if (textWithoutTags.length === 0) {
          const error = new Error("게시글에 텍스트 내용이 필요합니다.");
          error.code = "BAD_REQUEST";
          throw error;
        }

        const sanitizedContent = sanitizeContent(updateData.content);

        const sanitizedText = sanitizedContent.replace(/<[^>]*>/g, '').trim();
        if (sanitizedText.length === 0) {
          const error = new Error("sanitize 후 유효한 텍스트 내용이 없습니다.");
          error.code = "BAD_REQUEST";
          throw error;
        }

        updateData.content = sanitizedContent;
      }

      if (Object.prototype.hasOwnProperty.call(updateData, "media")) {
        const currentMedia = post.media || [];
        const requestedMedia = updateData.media || [];
        
        // 새로 추가된 파일 식별
        const newFiles = requestedMedia.filter(file => !currentMedia.includes(file));
        
        // 새로 추가된 파일 검증 및 연결
        let validatedNewFiles = [];
        if (newFiles.length > 0) {
          try {
            validatedNewFiles = await fileService.validateFilesForPost(newFiles, userId);
          } catch (fileError) {
            console.error("새 파일 검증 실패:", fileError);
            throw fileError;
          }
        }
        
        const existingFiles = requestedMedia.filter(file => currentMedia.includes(file));
        if (existingFiles.length > 0) {
          const check = await fileService.filesExist(existingFiles, userId);
          if (!check.allExist) {
            const missing = Object.entries(check.results)
              .filter(([, exists]) => !exists)
              .map(([filePath]) => filePath);
            const error = new Error(`파일을 찾을 수 없습니다: ${missing.join(", ")}`);
            error.code = "NOT_FOUND";
            throw error;
          }
        }
        
        // 제거된 파일 삭제
        const filesToDelete = currentMedia.filter(file => !requestedMedia.includes(file));
        if (filesToDelete.length > 0) {
          const deletePromises = filesToDelete.map(filePath => 
            fileService.deleteFile(filePath, userId)
          );
          await Promise.all(deletePromises);
        }
        
        updateData._newFilesToAttach = validatedNewFiles;
      }

      const needsPreviewUpdate = 
        Object.prototype.hasOwnProperty.call(updateData, "content") || 
        Object.prototype.hasOwnProperty.call(updateData, "media");
      
      if (needsPreviewUpdate) {
        const finalContent = updateData.content !== undefined ? updateData.content : post.content;
        const finalMedia = updateData.media !== undefined ? updateData.media : post.media;
        updateData.preview = this.createPreview({
          content: finalContent,
          media: finalMedia,
        });
      }

      // 새로 추가된 파일 추출 (트랜잭션에서 사용)
      const newFilesToAttach = updateData._newFilesToAttach || [];
      delete updateData._newFilesToAttach; // Firestore에 저장하지 않도록 제거

      const updatedData = {
        ...updateData,
        updatedAt: FieldValue.serverTimestamp(),
      };

      // 트랜잭션으로 게시글 업데이트 + 새 파일 연결
      await this.firestoreService.runTransaction(async (transaction) => {
        const postRef = this.firestoreService.db
          .collection(`communities/${communityId}/posts`)
          .doc(postId);
        transaction.update(postRef, updatedData);
        
        // 새로 추가된 파일 연결
        if (newFilesToAttach.length > 0) {
          fileService.attachFilesToPostInTransaction(newFilesToAttach, postId, transaction);
        }
      });
      
      const fresh = await postsService.getById(postId);
      const community = await this.firestoreService.getDocument("communities", communityId);

      const {authorId, preview: _preview, ...freshWithoutAuthorId} = fresh;
      
      return {
        id: postId,
        ...freshWithoutAuthorId,
        createdAt: fresh.createdAt?.toDate?.()?.toISOString?.() || fresh.createdAt,
        updatedAt: fresh.updatedAt?.toDate?.()?.toISOString?.() || fresh.updatedAt,
        scheduledDate: fresh.scheduledDate?.toDate?.()?.toISOString?.() || fresh.scheduledDate,
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

      if (post.media && post.media.length > 0) {
        const deletePromises = post.media.map(async (filePath) => {
          try {
            await fileService.deleteFile(filePath, userId);
          } catch (error) {
            console.warn(`파일 삭제 실패 (${filePath}):`, error.message);
          }
        });
        await Promise.all(deletePromises);
      }

      await postsService.delete(postId);

      try {
        const authoredPostRef = this.firestoreService.db
          .collection(`users/${userId}/authoredPosts`)
          .doc(postId);
        await authoredPostRef.delete();
      } catch (error) {
        console.error("authoredPosts 삭제 실패:", error);
      }

      if (post.type === "ROUTINE_CERT" || post.type === "GATHERING_REVIEW" || post.type === "TMI") {
        try {
          const userRef = this.firestoreService.db.collection("users").doc(userId);
          await userRef.update({
            certificationPosts: FieldValue.increment(-1),
            updatedAt: FieldValue.serverTimestamp(),
          });
        } catch (error) {
          console.error("certificationPosts 카운트 감소 실패:", error);
        }
      }
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
          
          // 집계 컬렉션에서 제거
          const likedPostRef = this.firestoreService.db
            .collection(`users/${userId}/likedPosts`)
            .doc(postId);
          transaction.delete(likedPostRef);
        } else {
          transaction.set(likeRef, {
            type: "POST",
            targetId: postId,
            userId,
            communityId, // communityId 저장 추가
            createdAt: FieldValue.serverTimestamp(),
          });
          isLiked = true;

          transaction.update(postRef, {
            likesCount: FieldValue.increment(1),
            updatedAt: FieldValue.serverTimestamp(),
          });
          
          // 집계 컬렉션 추가
          const likedPostRef = this.firestoreService.db
            .collection(`users/${userId}/likedPosts`)
            .doc(postId);
          transaction.set(likedPostRef, {
            postId,
            communityId,
            lastLikedAt: FieldValue.serverTimestamp(),
          }, { merge: true });
        }

        const post = postDoc.data();
        const currentLikesCount = post.likesCount || 0;

    
        if (isLiked && post.authorId !== userId) {
          try {
            const liker = await this.getUserService().getUserById(userId);
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

  /**
   * 커뮤니티 멤버 닉네임 중복 체크
   * @param {string} communityId - 커뮤니티 ID
   * @param {string} nickname - 체크할 닉네임
   * @return {Promise<boolean>} 닉네임 사용 가능 여부 (true: 사용 가능, false: 중복)
   */
  async checkNicknameAvailability(communityId, nickname) {
    try {
      if (!communityId) {
        const error = new Error("커뮤니티 ID가 필요합니다");
        error.code = "BAD_REQUEST";
        throw error;
      }

      if (!nickname || nickname.trim().length === 0) {
        const error = new Error("닉네임이 필요합니다");
        error.code = "BAD_REQUEST";
        throw error;
      }

      const membersService = new FirestoreService(`communities/${communityId}/members`);
    
      const members = await membersService.getWhere("nickname", "==", nickname.trim());

      return members.length === 0;
    } catch (error) {
      console.error("닉네임 중복 체크 오류:", error.message);
      if (error.code === "BAD_REQUEST") {
        throw error;
      }
      throw new Error("닉네임 중복 체크에 실패했습니다");
    }
  }

  /**
   * 커뮤니티에 멤버 추가
   * @param {string} communityId - 커뮤니티 ID
   * @param {string} userId - 사용자 ID
   * @param {string} nickname - 닉네임
   * @return {Promise<Object>} 추가된 멤버 정보
   */
  async addMemberToCommunity(communityId, userId, nickname) {
    try {
      if (!communityId) {
        const error = new Error("커뮤니티 ID가 필요합니다");
        error.code = "BAD_REQUEST";
        throw error;
      }

      if (!userId) {
        const error = new Error("사용자 ID가 필요합니다");
        error.code = "BAD_REQUEST";
        throw error;
      }

      if (!nickname || nickname.trim().length === 0) {
        const error = new Error("닉네임이 필요합니다");
        error.code = "BAD_REQUEST";
        throw error;
      }

      const community = await this.firestoreService.getDocument("communities", communityId);
      if (!community) {
        const error = new Error("커뮤니티를 찾을 수 없습니다");
        error.code = "NOT_FOUND";
        throw error;
      }

      const membersService = new FirestoreService(`communities/${communityId}/members`);
      const existingMember = await membersService.getById(userId);
      if (existingMember) {
        const error = new Error("이미 해당 커뮤니티의 멤버입니다");
        error.code = "CONFLICT";
        throw error;
      }

      const duplicateNickname = await membersService.getWhere("nickname", "==", nickname.trim());
      if (duplicateNickname.length > 0) {
        const error = new Error("이미 사용 중인 닉네임입니다");
        error.code = "NICKNAME_DUPLICATE";
        throw error;
      }
      
      const memberData = {
        userId,
        nickname: nickname.trim(),
        role: "member",
        joinedAt: FieldValue.serverTimestamp(),
      };

      const memberId = userId;
      const result = await membersService.create(memberData, memberId);

      return {
        id: memberId,
        userId,
        nickname: nickname.trim(),
        role: "member",
        joinedAt: memberData.joinedAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
      };
    } catch (error) {
      console.error("커뮤니티 멤버 추가 오류:", error.message);
      if (error.code === "BAD_REQUEST" || error.code === "NOT_FOUND" || error.code === "CONFLICT") {
        throw error;
      }
      throw new Error("커뮤니티 멤버 추가에 실패했습니다");
    }
  }
}

module.exports = CommunityService;
