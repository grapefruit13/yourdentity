const firestoreService = require("../services/firestoreService");
const { db } = require("../config/database");

// 커뮤니티 매핑 정보를 DB에서 조회하는 함수
const getCommunityMapping = async (communityId) => {
  const community = await firestoreService.getDocument(
    "communities",
    communityId
  );
  if (!community) {
    return null;
  }

  return {
    name: community.name,
    type: community.type,
    channel: community.channel,
    postType: community.postType,
  };
};

// 커뮤니티 목록 조회 API
const getCommunities = async (req, res) => {
  try {
    const { type, page = 0, size = 10 } = req.query;

    let whereConditions = [];

    // 타입 필터링 (interest | anonymous)
    if (type && ["interest", "anonymous"].includes(type)) {
      whereConditions.push({
        field: "type",
        operator: "==",
        value: type,
      });
    }

    const result = await firestoreService.getCollectionWithPagination(
      "communities",
      {
        page: parseInt(page),
        size: parseInt(size),
        orderBy: "createdAt",
        orderDirection: "desc",
        where: whereConditions,
      }
    );

    res.json({
      success: true,
      data: result.content || [],
      pagination: result.pagination || {},
    });
  } catch (error) {
    console.error("Error getting communities:", error);
    res.status(500).json({
      success: false,
      message: "커뮤니티 목록 조회 중 오류가 발생했습니다.",
    });
  }
};

// 커뮤니티 상세 조회 API
const getCommunityById = async (req, res) => {
  try {
    const { communityId } = req.params;

    const community = await firestoreService.getDocument(
      "communities",
      communityId
    );

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "커뮤니티를 찾을 수 없습니다.",
      });
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

    res.json({
      success: true,
      data: community,
    });
  } catch (error) {
    console.error("Error getting community:", error);
    res.status(500).json({
      success: false,
      message: "커뮤니티 조회 중 오류가 발생했습니다.",
    });
  }
};

// 커뮤니티 멤버 목록 조회 API
const getCommunityMembers = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { page = 0, size = 20 } = req.query;

    // 커뮤니티 존재 확인
    const community = await firestoreService.getDocument(
      "communities",
      communityId
    );
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "커뮤니티를 찾을 수 없습니다.",
      });
    }

    const result = await firestoreService.getCollectionWithPagination(
      `communities/${communityId}/members`,
      {
        page: parseInt(page),
        size: parseInt(size),
        orderBy: "joinedAt",
        orderDirection: "desc",
      }
    );

    res.json({
      success: true,
      data: result.content || [],
      pagination: result.pagination || {},
    });
  } catch (error) {
    console.error("Error getting community members:", error);
    res.status(500).json({
      success: false,
      message: "멤버 목록 조회 중 오류가 발생했습니다.",
    });
  }
};

// 시간 차이 계산 함수
const getTimeAgo = (date) => {
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
};

// preview 객체 생성 함수
const createPreview = (post) => {
  // 텍스트 content에서 첫 2줄 추출
  const textContents = post.content.filter(
    (item) => item.type === "text" && item.text && item.text.trim()
  );
  const description =
    textContents.length > 0
      ? textContents[0].text.substring(0, 100) +
        (textContents[0].text.length > 100 ? "..." : "")
      : "";

  // 첫 번째 이미지 미디어 찾기
  const firstImage =
    post.media.find((item) => item.type === "image") ||
    post.content.find((item) => item.type === "image");

  const thumbnail = firstImage
    ? {
        url: firstImage.url || firstImage.src,
        blurHash: firstImage.blurHash,
        width: firstImage.width,
        height: firstImage.height,
        ratio:
          firstImage.width && firstImage.height
            ? `${firstImage.width}:${firstImage.height}`
            : "1:1",
      }
    : null;

  // 미디어 타입 체크
  const hasImage =
    post.media.some((item) => item.type === "image") ||
    post.content.some((item) => item.type === "image");
  const hasVideo =
    post.media.some((item) => item.type === "video") ||
    post.content.some((item) => item.type === "video");

  return {
    description,
    thumbnail,
    isVideo: hasVideo && !hasImage,
    hasImage,
    hasVideo,
  };
};

// 전체 커뮤니티 포스트 조회 API (모든 커뮤니티의 게시글을 통합 조회)
const getAllCommunityPosts = async (req, res) => {
  try {
    const { page = 0, size = 10, filter } = req.query;

    // filter에 따른 게시글 타입 매핑
    const postTypeMapping = {
      routine: "ROUTINE_CERT",
      gathering: "GATHERING_REVIEW",
      tmi: "TMI",
    };

    // 모든 커뮤니티 조회
    const communities = await firestoreService.getCollectionWithPagination(
      "communities",
      {
        page: 0,
        size: 1000, // 모든 커뮤니티 조회
      }
    );

    let allPosts = [];

    for (const community of communities.content || []) {
      // 인덱스 문제를 피하기 위해 먼저 모든 게시글을 가져온 후 필터링
      const posts = await firestoreService.getCollectionWithPagination(
        `communities/${community.id}/posts`,
        {
          page: 0,
          size: 100, // 각 커뮤니티에서 최대 100개씩 가져오기
          orderBy: "createdAt",
          orderDirection: "desc",
        }
      );

      // 메모리에서 필터링
      let filteredPosts = posts.content || [];
      if (filter && postTypeMapping[filter]) {
        filteredPosts = filteredPosts.filter(
          (post) => post.type === postTypeMapping[filter]
        );
      }

      // 커뮤니티 정보를 각 게시글에 추가
      const postsWithCommunity = filteredPosts.map((post) => ({
        ...post,
        community: {
          id: community.id,
          name: community.name,
          type: community.type,
        },
      }));

      allPosts = allPosts.concat(postsWithCommunity);
    }

    // 전체 게시글을 생성일 기준으로 정렬
    allPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // 페이지네이션 적용
    const startIndex = parseInt(page) * parseInt(size);
    const endIndex = startIndex + parseInt(size);
    const paginatedPosts = allPosts.slice(startIndex, endIndex);

    // 간소화된 응답으로 변환
    const simplifiedPosts = paginatedPosts.map((post) => ({
      id: post.id,
      type: post.type,
      author: post.author,
      title: post.title,
      preview: createPreview(post),
      mediaCount: post.media ? post.media.length : 0,
      channel: post.channel,
      community: post.community,
      isLocked: post.isLocked,
      visibility: post.visibility,
      likesCount: post.likesCount || 0,
      commentsCount: post.commentsCount || 0,
      createdAt: post.createdAt,
      timeAgo: getTimeAgo(new Date(post.createdAt)),
    }));

    res.json({
      success: true,
      data: simplifiedPosts,
      pagination: {
        page: parseInt(page),
        size: parseInt(size),
        totalElements: allPosts.length,
        totalPages: Math.ceil(allPosts.length / parseInt(size)),
        hasNext: endIndex < allPosts.length,
        hasPrevious: parseInt(page) > 0,
      },
    });
  } catch (error) {
    console.error("Error getting all community posts:", error);
    res.status(500).json({
      success: false,
      message: "전체 게시글 조회 중 오류가 발생했습니다.",
    });
  }
};

// 커뮤니티 게시글 목록 조회 API
const getCommunityPosts = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { page = 0, size = 10 } = req.query;

    // 커뮤니티 존재 확인
    const community = await firestoreService.getDocument(
      "communities",
      communityId
    );
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "커뮤니티를 찾을 수 없습니다.",
      });
    }

    const result = await firestoreService.getCollectionWithPagination(
      `communities/${communityId}/posts`,
      {
        page: parseInt(page),
        size: parseInt(size),
        orderBy: "createdAt",
        orderDirection: "desc",
      }
    );

    // 간소화된 응답으로 변환
    const simplifiedPosts = (result.content || []).map((post) => ({
      id: post.id,
      type: post.type,
      author: post.author,
      title: post.title,
      preview: createPreview(post),
      mediaCount: post.media ? post.media.length : 0,
      channel: post.channel,
      category: post.category || null, // 카테고리 추가
      tags: post.tags || [], // 태그 추가
      scheduledDate: post.scheduledDate || null, // 예약 날짜 추가
      isLocked: post.isLocked,
      visibility: post.visibility,
      likesCount: post.likesCount || 0,
      commentsCount: post.commentsCount || 0,
      createdAt: post.createdAt,
      timeAgo: getTimeAgo(new Date(post.createdAt)),
    }));

    res.json({
      success: true,
      data: simplifiedPosts,
      pagination: result.pagination || {},
    });
  } catch (error) {
    console.error("Error getting community posts:", error);
    res.status(500).json({
      success: false,
      message: "게시글 목록 조회 중 오류가 발생했습니다.",
    });
  }
};

// 커뮤니티 게시글 작성 API (새로운 구조)
const createPost = async (req, res) => {
  try {
    const { communityId } = req.params;
    const {
      title,
      content = [],
      refId,
      visibility = "public",
      category,
      tags = [],
      scheduledDate,
    } = req.body;

    // 필수 필드 검증
    if (!title) {
      return res.status(400).json({
        success: false,
        message: "title은 필수입니다.",
      });
    }

    // TODO: 실제 구현 시 JWT 토큰에서 유저 정보 추출
    // 현재는 임시로 하드코딩된 값 사용
    const authorId = "user123"; // req.user.id 또는 JWT에서 추출
    const author = "사용자닉네임"; // req.user.nickname 또는 JWT에서 추출
    const isLocked = false;
    const rewardGiven = false;

    // 커뮤니티 존재 확인
    const community = await firestoreService.getDocument(
      "communities",
      communityId
    );
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "커뮤니티를 찾을 수 없습니다.",
      });
    }

    // 커뮤니티 매핑 정보 조회
    const mapping = await getCommunityMapping(communityId);
    if (!mapping) {
      return res.status(400).json({
        success: false,
        message: "유효하지 않은 커뮤니티입니다.",
      });
    }

    // refId 설정 (루틴 인증글의 경우)
    let finalRefId = null;
    if (mapping.postType === "ROUTINE_CERT" && refId) {
      finalRefId = refId;
    }

    // 게시글 ID 생성
    const postId =
      mapping.postType === "ROUTINE_CERT"
        ? `CERT_${Date.now()}`
        : `POST_${Date.now()}`;

    // content에서 미디어 추출하여 별도 media 배열 생성
    const extractedMedia = [];
    content.forEach((item, index) => {
      if (
        item.type &&
        ["image", "video", "embed", "file"].includes(item.type)
      ) {
        extractedMedia.push({
          type: item.type,
          url: item.url || "",
          order: item.order || index + 1,
          width: item.width || null,
          height: item.height || null,
          blurHash: item.blurHash || null,
          thumbUrl: item.thumbUrl || null,
          videoSource: item.videoSource || null,
          provider: item.provider || null,
          providerVideoId: item.providerVideoId || null,
          duration: item.duration || null,
          sizeBytes: item.sizeBytes || null,
          mimeType: item.mimeType || null,
          processingStatus: item.processingStatus || "ready",
          transcodedVariants: item.transcodedVariants || [],
          fileName: item.fileName || null,
        });
      }
    });

    // 게시글 데이터 구성
    const postData = {
      id: postId,
      type: mapping.postType,
      refId: finalRefId,
      authorId,
      author,
      communityPath: `communities/${communityId}`,
      title,
      content: content.map((item, index) => ({
        type: item.type || "text",
        order: item.order || index + 1,
        text: item.text || item.content || "",
        content: item.content || item.text || "",
        url: item.url || item.src || null,
        src: item.src || item.url || null,
        width: item.width || null,
        height: item.height || null,
        blurHash: item.blurHash || null,
        thumbUrl: item.thumbUrl || null,
        videoSource: item.videoSource || null,
        provider: item.provider || null,
        providerVideoId: item.providerVideoId || null,
        duration: item.duration || null,
        sizeBytes: item.sizeBytes || null,
        mimeType: item.mimeType || null,
        processingStatus: item.processingStatus || "ready",
        transcodedVariants: item.transcodedVariants || [],
        fileName: item.fileName || null,
      })),
      media: extractedMedia,
      channel: mapping.channel,
      category: category || mapping.name, // 카테고리 (기본값: 커뮤니티명)
      tags: tags || [], // 태그 배열
      scheduledDate: scheduledDate || null, // 예약 날짜 (선택사항)
      isLocked,
      visibility,
      rewardGiven,
      reactionsCount: 0,
      likesCount: 0,
      commentsCount: 0,
      reportsCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 커뮤니티 서브컬렉션에 저장
    const savedPost = await firestoreService.addDocument(
      `communities/${communityId}/posts`,
      postData
    );

    res.status(201).json({
      success: true,
      data: {
        ...postData,
        id: savedPost,
      },
      message: "게시글이 성공적으로 작성되었습니다.",
    });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({
      success: false,
      message: "게시글 작성 중 오류가 발생했습니다.",
    });
  }
};

// 커뮤니티 게시글 상세 조회 API
const getPostById = async (req, res) => {
  try {
    const { communityId, postId } = req.params;

    // 커뮤니티 존재 확인
    const community = await firestoreService.getDocument(
      "communities",
      communityId
    );
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "커뮤니티를 찾을 수 없습니다.",
      });
    }

    const post = await firestoreService.getDocument(
      `communities/${communityId}/posts`,
      postId
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "게시글을 찾을 수 없습니다.",
      });
    }

    // 댓글 조회 (부모 댓글만 먼저 조회)
    const whereConditions = [
      { field: "targetId", operator: "==", value: postId },
      { field: "parentId", operator: "==", value: null },
      { field: "deleted", operator: "==", value: false },
    ];

    const commentsResult = await firestoreService.getCollectionWithPagination(
      "comments",
      {
        page: 0,
        size: 50, // 최대 50개 댓글
        orderBy: "createdAt",
        orderDirection: "asc",
        where: whereConditions,
      }
    );

    // 모든 댓글을 평면적으로 조회 (부모 댓글 + 대댓글)
    const allComments = [];

    // 부모 댓글들 추가
    for (const comment of commentsResult.content || []) {
      // 미디어 타입 확인
      const hasVideo =
        comment.mediaBlocks &&
        comment.mediaBlocks.some((media) => media.type === "video");
      const hasImage =
        comment.mediaBlocks &&
        comment.mediaBlocks.some((media) => media.type === "image");

      allComments.push({
        id: comment.id,
        author: comment.userId,
        content: comment.content || [],
        mediaBlocks: comment.mediaBlocks || [],
        parent_id: comment.parentId,
        vote_score: comment.likesCount || 0,
        up_vote_score: comment.likesCount || 0,
        deleted: comment.deleted,
        replies_count: 0, // 나중에 계산
        created_at: comment.createdAt?.toDate
          ? comment.createdAt.toDate().getTime()
          : new Date(comment.createdAt).getTime(),
        updated_at: comment.updatedAt?.toDate
          ? comment.updatedAt.toDate().getTime()
          : new Date(comment.updatedAt).getTime(),
        isMine: false, // TODO: 실제 사용자 ID와 비교
        hasVideo: hasVideo,
        hasImage: hasImage,
        hasAuthorReply: false, // TODO: 작성자 답글 여부 확인
        hasAuthorVote: false, // TODO: 작성자 투표 여부 확인
        isOriginalAuthor: comment.userId === post.authorId,
      });

      // 각 부모 댓글의 대댓글들 조회하여 추가
      const replies = await firestoreService.getCollectionWhere(
        "comments",
        "parentId",
        "==",
        comment.id
      );

      const filteredReplies = replies.filter((reply) => !reply.deleted);

      // 대댓글들 추가
      for (const reply of filteredReplies) {
        // 미디어 타입 확인
        const hasVideo =
          reply.mediaBlocks &&
          reply.mediaBlocks.some((media) => media.type === "video");
        const hasImage =
          reply.mediaBlocks &&
          reply.mediaBlocks.some((media) => media.type === "image");

        allComments.push({
          id: reply.id,
          author: reply.userId,
          content: reply.content || [],
          mediaBlocks: reply.mediaBlocks || [],
          parent_id: reply.parentId,
          vote_score: reply.likesCount || 0,
          up_vote_score: reply.likesCount || 0,
          deleted: reply.deleted,
          replies_count: 0, // 대댓글은 더 이상의 대댓글을 가질 수 없음
          created_at: reply.createdAt?.toDate
            ? reply.createdAt.toDate().getTime()
            : new Date(reply.createdAt).getTime(),
          updated_at: reply.updatedAt?.toDate
            ? reply.updatedAt.toDate().getTime()
            : new Date(reply.updatedAt).getTime(),
          isMine: false, // TODO: 실제 사용자 ID와 비교
          hasVideo: hasVideo,
          hasImage: hasImage,
          hasAuthorReply: false, // TODO: 작성자 답글 여부 확인
          hasAuthorVote: false, // TODO: 작성자 투표 여부 확인
          isOriginalAuthor: reply.userId === post.authorId,
        });
      }
    }

    // 부모 댓글들의 replies_count 계산
    const commentsWithReplies = allComments.map((comment) => {
      if (comment.parent_id === null) {
        // 부모 댓글인 경우, 해당 댓글의 대댓글 수 계산
        const repliesCount = allComments.filter(
          (c) => c.parent_id === comment.id
        ).length;
        return {
          ...comment,
          replies_count: repliesCount,
        };
      }
      return comment;
    });

    // 게시글 데이터에 댓글 정보 추가
    const postWithReplies = {
      ...post,
      replies: commentsWithReplies,
    };

    res.json({
      success: true,
      data: postWithReplies,
    });
  } catch (error) {
    console.error("Error getting post:", error);
    res.status(500).json({
      success: false,
      message: "게시글 조회 중 오류가 발생했습니다.",
    });
  }
};

// 커뮤니티 게시글 수정 API
const updatePost = async (req, res) => {
  try {
    const { communityId, postId } = req.params;
    const { title, content = [], refId } = req.body;

    // TODO: 실제 구현 시 JWT 토큰에서 유저 정보 추출
    const authorId = "user123"; // req.user.id 또는 JWT에서 추출

    // 커뮤니티 존재 확인
    const community = await firestoreService.getDocument(
      "communities",
      communityId
    );
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "커뮤니티를 찾을 수 없습니다.",
      });
    }

    // 기존 게시글 조회
    const existingPost = await firestoreService.getDocument(
      `communities/${communityId}/posts`,
      postId
    );
    if (!existingPost) {
      return res.status(404).json({
        success: false,
        message: "게시글을 찾을 수 없습니다.",
      });
    }

    // 작성자 권한 확인
    if (existingPost.authorId !== authorId) {
      return res.status(403).json({
        success: false,
        message: "게시글을 수정할 권한이 없습니다.",
      });
    }

    // content에서 미디어 추출하여 별도 media 배열 생성
    const extractedMedia = [];
    if (content.length > 0) {
      content.forEach((item, index) => {
        if (
          item.type &&
          ["image", "video", "embed", "file"].includes(item.type)
        ) {
          extractedMedia.push({
            type: item.type,
            url: item.url || "",
            order: item.order || index + 1,
            width: item.width || null,
            height: item.height || null,
            blurHash: item.blurHash || null,
            thumbUrl: item.thumbUrl || null,
            videoSource: item.videoSource || null,
            provider: item.provider || null,
            providerVideoId: item.providerVideoId || null,
            duration: item.duration || null,
            sizeBytes: item.sizeBytes || null,
            mimeType: item.mimeType || null,
            processingStatus: item.processingStatus || "ready",
            transcodedVariants: item.transcodedVariants || [],
            fileName: item.fileName || null,
          });
        }
      });
    }

    // 업데이트 데이터 구성
    const updateData = {
      title: title || existingPost.title,
      content:
        content.length > 0
          ? content.map((item, index) => ({
              type: item.type || "text",
              order: item.order || index + 1,
              text: item.text || item.content || "",
              content: item.content || item.text || "",
              url: item.url || item.src || null,
              src: item.src || item.url || null,
              width: item.width || null,
              height: item.height || null,
              blurHash: item.blurHash || null,
              thumbUrl: item.thumbUrl || null,
              videoSource: item.videoSource || null,
              provider: item.provider || null,
              providerVideoId: item.providerVideoId || null,
              duration: item.duration || null,
              sizeBytes: item.sizeBytes || null,
              mimeType: item.mimeType || null,
              processingStatus: item.processingStatus || "ready",
              transcodedVariants: item.transcodedVariants || [],
              fileName: item.fileName || null,
            }))
          : existingPost.content,
      media: content.length > 0 ? extractedMedia : existingPost.media,
      refId: refId || existingPost.refId,
      updatedAt: new Date(),
    };

    // Firestore 업데이트
    await firestoreService.updateDocument(
      `communities/${communityId}/posts`,
      postId,
      updateData
    );

    // 업데이트된 게시글 조회
    const updatedPost = await firestoreService.getDocument(
      `communities/${communityId}/posts`,
      postId
    );

    res.json({
      success: true,
      data: updatedPost,
      message: "게시글이 성공적으로 수정되었습니다.",
    });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({
      success: false,
      message: "게시글 수정 중 오류가 발생했습니다.",
    });
  }
};

// 커뮤니티 게시글 삭제 API
const deletePost = async (req, res) => {
  try {
    const { communityId, postId } = req.params;

    // TODO: 실제 구현 시 JWT 토큰에서 유저 정보 추출
    const authorId = "user123"; // req.user.id 또는 JWT에서 추출

    // 커뮤니티 존재 확인
    const community = await firestoreService.getDocument(
      "communities",
      communityId
    );
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "커뮤니티를 찾을 수 없습니다.",
      });
    }

    // 기존 게시글 조회
    const existingPost = await firestoreService.getDocument(
      `communities/${communityId}/posts`,
      postId
    );
    if (!existingPost) {
      return res.status(404).json({
        success: false,
        message: "게시글을 찾을 수 없습니다.",
      });
    }

    // 작성자 권한 확인
    if (existingPost.authorId !== authorId) {
      return res.status(403).json({
        success: false,
        message: "게시글을 삭제할 권한이 없습니다.",
      });
    }

    // Firestore에서 삭제
    await firestoreService.deleteDocument(
      `communities/${communityId}/posts`,
      postId
    );

    res.json({
      success: true,
      message: "게시글이 성공적으로 삭제되었습니다.",
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({
      success: false,
      message: "게시글 삭제 중 오류가 발생했습니다.",
    });
  }
};

// 커뮤니티 게시글 좋아요 토글 API
const togglePostLike = async (req, res) => {
  try {
    const { communityId, postId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId는 필수입니다.",
      });
    }

    // 커뮤니티 존재 확인
    const community = await firestoreService.getDocument(
      "communities",
      communityId
    );
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "커뮤니티를 찾을 수 없습니다.",
      });
    }

    // 게시글 조회
    const post = await firestoreService.getDocument(
      `communities/${communityId}/posts`,
      postId
    );
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "게시글을 찾을 수 없습니다.",
      });
    }

    // 기존 좋아요 확인
    const existingLikes = await firestoreService.getCollectionWhere(
      "likes",
      "targetId",
      "==",
      postId
    );
    const userLike = existingLikes.find(
      (like) => like.userId === userId && like.type === post.type
    );

    if (userLike) {
      // 좋아요 취소
      await firestoreService.deleteDocument("likes", userLike.id);

      // 게시글의 좋아요 수 감소
      const newLikesCount = Math.max(0, (post.likesCount || 0) - 1);
      await firestoreService.updateDocument(
        `communities/${communityId}/posts`,
        postId,
        {
          likesCount: newLikesCount,
        }
      );

      res.json({
        success: true,
        message: "좋아요가 취소되었습니다.",
        isLiked: false,
        likesCount: newLikesCount,
      });
    } else {
      // 좋아요 등록
      const likeData = {
        type: post.type,
        targetId: postId,
        userId,
        createdAt: new Date(),
      };

      await firestoreService.addDocument("likes", likeData);

      // 게시글의 좋아요 수 증가
      const newLikesCount = (post.likesCount || 0) + 1;
      await firestoreService.updateDocument(
        `communities/${communityId}/posts`,
        postId,
        {
          likesCount: newLikesCount,
        }
      );

      res.json({
        success: true,
        message: "좋아요가 등록되었습니다.",
        isLiked: true,
        likesCount: newLikesCount,
      });
    }
  } catch (error) {
    console.error("Error toggling post like:", error);
    res.status(500).json({
      success: false,
      message: "좋아요 처리 중 오류가 발생했습니다.",
    });
  }
};

module.exports = {
  getCommunities,
  getAllCommunityPosts,
  getCommunityById,
  getCommunityMembers,
  getCommunityPosts,
  createPost,
  getPostById,
  updatePost,
  deletePost,
  togglePostLike,
};
