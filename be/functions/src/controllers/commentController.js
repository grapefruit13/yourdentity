const firestoreService = require("../services/firestoreService");

// 댓글 생성 API
const createComment = async (req, res) => {
  try {
    const {communityId, postId} = req.params;
    const {content = [], parentId = null} = req.body;

    // 필수 필드 검증
    if (!content || content.length === 0) {
      return res.status(400).json({
        success: false,
        message: "댓글 내용은 필수입니다.",
      });
    }

    // content 배열 검증
    const hasTextContent = content.some(
        (item) =>
          item.type === "text" && item.content && item.content.trim().length > 0,
    );
    if (!hasTextContent) {
      return res.status(400).json({
        success: false,
        message: "댓글에 텍스트 내용이 필요합니다.",
      });
    }

    // TODO: 실제 구현 시 JWT 토큰에서 유저 정보 추출
    const userId = "user123"; // 고정값
    const userNickname = "사용자닉네임"; // 고정값

    // 커뮤니티 존재 확인
    const community = await firestoreService.getDocument(
        "communities",
        communityId,
    );
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "커뮤니티를 찾을 수 없습니다.",
      });
    }

    // 게시글 존재 확인
    const post = await firestoreService.getDocument(
        `communities/${communityId}/posts`,
        postId,
    );
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "게시글을 찾을 수 없습니다.",
      });
    }

    // 부모 댓글 확인 (대댓글인 경우)
    let depth = 0;
    let isReply = false;
    if (parentId) {
      const parentComment = await firestoreService.getDocument(
          "comments",
          parentId,
      );
      if (!parentComment) {
        return res.status(404).json({
          success: false,
          message: "부모 댓글을 찾을 수 없습니다.",
        });
      }
      depth = parentComment.depth + 1;
      isReply = true;

      // 대댓글은 1단계까지만 허용
      if (depth > 1) {
        return res.status(400).json({
          success: false,
          message: "대댓글은 1단계까지만 작성할 수 있습니다.",
        });
      }
    }

    // content에서 미디어 추출하여 별도 mediaBlocks 배열 생성
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
          fileName: item.fileName || null,
        });
      }
    });

    // 댓글 데이터 구성
    const commentData = {
      type: post.type,
      targetId: postId,
      targetPath: `communities/${communityId}/posts/${postId}`,
      userId,
      userNickname,
      content: content.map((item, index) => ({
        type: item.type || "text",
        order: item.order || index + 1,
        content: item.content || "",
        url: item.url || null,
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
        fileName: item.fileName || null,
      })),
      mediaBlocks: extractedMedia,
      parentId: parentId || null,
      depth,
      isReply,
      isLocked: false,
      reportsCount: 0,
      likesCount: 0,
      deleted: false,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 댓글 저장
    const commentId = await firestoreService.addDocument(
        "comments",
        commentData,
    );

    // 게시글의 댓글 수 증가
    const newCommentsCount = (post.commentsCount || 0) + 1;
    await firestoreService.updateDocument(
        `communities/${communityId}/posts`,
        postId,
        {
          commentsCount: newCommentsCount,
        },
    );

    res.status(201).json({
      success: true,
      data: {
        ...commentData,
        id: commentId,
      },
      message: "댓글이 성공적으로 작성되었습니다.",
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({
      success: false,
      message: "댓글 작성 중 오류가 발생했습니다.",
    });
  }
};

// 댓글 목록 조회 API
const getComments = async (req, res) => {
  try {
    const {communityId, postId} = req.params;
    const {page = 0, size = 20} = req.query;

    // 커뮤니티 존재 확인
    const community = await firestoreService.getDocument(
        "communities",
        communityId,
    );
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "커뮤니티를 찾을 수 없습니다.",
      });
    }

    // 게시글 존재 확인
    const post = await firestoreService.getDocument(
        `communities/${communityId}/posts`,
        postId,
    );
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "게시글을 찾을 수 없습니다.",
      });
    }

    // 댓글 조회 (부모 댓글만 먼저 조회)
    const whereConditions = [
      {field: "targetId", operator: "==", value: postId},
      {field: "parentId", operator: "==", value: null},
      {field: "deleted", operator: "==", value: false},
    ];

    const result = await firestoreService.getCollectionWithPagination(
        "comments",
        {
          page: parseInt(page),
          size: parseInt(size),
          orderBy: "createdAt",
          orderDirection: "asc",
          where: whereConditions,
        },
    );

    // 모든 댓글을 평면적으로 조회 (부모 댓글 + 대댓글)
    const allComments = [];

    // 부모 댓글들 추가
    for (const comment of result.content || []) {
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
        created_at: comment.createdAt?.toDate ?
          comment.createdAt.toDate().getTime() :
          new Date(comment.createdAt).getTime(),
        updated_at: comment.updatedAt?.toDate ?
          comment.updatedAt.toDate().getTime() :
          new Date(comment.updatedAt).getTime(),
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
          comment.id,
      );

      const filteredReplies = replies.filter((reply) => !reply.deleted);

      // 대댓글들 추가
      for (const reply of filteredReplies) {
        // 미디어 타입 확인
        const hasVideoReply =
          reply.mediaBlocks &&
          reply.mediaBlocks.some((media) => media.type === "video");
        const hasImageReply =
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
          created_at: reply.createdAt?.toDate ?
            reply.createdAt.toDate().getTime() :
            new Date(reply.createdAt).getTime(),
          updated_at: reply.updatedAt?.toDate ?
            reply.updatedAt.toDate().getTime() :
            new Date(reply.updatedAt).getTime(),
          isMine: false, // TODO: 실제 사용자 ID와 비교
          hasVideo: hasVideoReply,
          hasImage: hasImageReply,
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
            (c) => c.parent_id === comment.id,
        ).length;
        return {
          ...comment,
          replies_count: repliesCount,
        };
      }
      return comment;
    });

    res.json({
      success: true,
      data: commentsWithReplies,
      pagination: result.pagination || {},
    });
  } catch (error) {
    console.error("Error getting comments:", error);
    res.status(500).json({
      success: false,
      message: "댓글 목록 조회 중 오류가 발생했습니다.",
    });
  }
};

// 댓글 수정 API
const updateComment = async (req, res) => {
  try {
    const {commentId} = req.params;
    const {content = []} = req.body;

    // 필수 필드 검증
    if (!content || content.length === 0) {
      return res.status(400).json({
        success: false,
        message: "댓글 내용은 필수입니다.",
      });
    }

    // content 배열 검증
    const hasTextContent = content.some(
        (item) =>
          item.type === "text" && item.content && item.content.trim().length > 0,
    );
    if (!hasTextContent) {
      return res.status(400).json({
        success: false,
        message: "댓글에 텍스트 내용이 필요합니다.",
      });
    }

    // TODO: 실제 구현 시 JWT 토큰에서 유저 정보 추출
    const userId = "user123"; // req.user.id 또는 JWT에서 추출

    // 기존 댓글 조회
    const existingComment = await firestoreService.getDocument(
        "comments",
        commentId,
    );
    if (!existingComment) {
      return res.status(404).json({
        success: false,
        message: "댓글을 찾을 수 없습니다.",
      });
    }

    // 삭제된 댓글인지 확인
    if (existingComment.deleted) {
      return res.status(404).json({
        success: false,
        message: "삭제된 댓글입니다.",
      });
    }

    // 작성자 권한 확인
    if (existingComment.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "댓글을 수정할 권한이 없습니다.",
      });
    }

    // content에서 미디어 추출하여 별도 mediaBlocks 배열 생성
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
          fileName: item.fileName || null,
        });
      }
    });

    // 업데이트 데이터 구성
    const updateData = {
      content: content.map((item, index) => ({
        type: item.type || "text",
        order: item.order || index + 1,
        content: item.content || "",
        url: item.url || null,
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
        fileName: item.fileName || null,
      })),
      mediaBlocks: extractedMedia,
      updatedAt: new Date(),
    };

    // 댓글 업데이트
    await firestoreService.updateDocument("comments", commentId, updateData);

    // 업데이트된 댓글 조회
    const updatedComment = await firestoreService.getDocument(
        "comments",
        commentId,
    );

    res.json({
      success: true,
      data: updatedComment,
      message: "댓글이 성공적으로 수정되었습니다.",
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({
      success: false,
      message: "댓글 수정 중 오류가 발생했습니다.",
    });
  }
};

// 댓글 삭제 API
const deleteComment = async (req, res) => {
  try {
    const {commentId} = req.params;

    // TODO: 실제 구현 시 JWT 토큰에서 유저 정보 추출
    const userId = "user123"; // 고정값

    // 기존 댓글 조회
    const existingComment = await firestoreService.getDocument(
        "comments",
        commentId,
    );
    if (!existingComment) {
      return res.status(404).json({
        success: false,
        message: "댓글을 찾을 수 없습니다.",
      });
    }

    // 삭제된 댓글인지 확인
    if (existingComment.deleted) {
      return res.status(404).json({
        success: false,
        message: "이미 삭제된 댓글입니다.",
      });
    }

    // 작성자 권한 확인
    if (existingComment.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "댓글을 삭제할 권한이 없습니다.",
      });
    }

    // 댓글 소프트 삭제 (실제로는 삭제하지 않고 deleted 플래그 설정)
    await firestoreService.updateDocument("comments", commentId, {
      deleted: true,
      deletedAt: new Date(),
      content: "삭제된 댓글입니다.",
      mediaBlocks: [],
      updatedAt: new Date(),
    });

    // 게시글의 댓글 수 감소
    const targetPath = existingComment.targetPath;
    const pathParts = targetPath.split("/");
    const communityId = pathParts[1];
    const postId = pathParts[3];

    const post = await firestoreService.getDocument(
        `communities/${communityId}/posts`,
        postId,
    );
    if (post) {
      const newCommentsCount = Math.max(0, (post.commentsCount || 0) - 1);
      await firestoreService.updateDocument(
          `communities/${communityId}/posts`,
          postId,
          {
            commentsCount: newCommentsCount,
          },
      );
    }

    res.json({
      success: true,
      message: "댓글이 성공적으로 삭제되었습니다.",
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({
      success: false,
      message: "댓글 삭제 중 오류가 발생했습니다.",
    });
  }
};

// 댓글 좋아요 토글 API
const toggleCommentLike = async (req, res) => {
  try {
    const {commentId} = req.params;
    const {userId} = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId는 필수입니다.",
      });
    }

    // 댓글 조회
    const comment = await firestoreService.getDocument("comments", commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "댓글을 찾을 수 없습니다.",
      });
    }

    // 삭제된 댓글인지 확인
    if (comment.deleted) {
      return res.status(404).json({
        success: false,
        message: "삭제된 댓글입니다.",
      });
    }

    // 기존 좋아요 확인
    const existingLikes = await firestoreService.getCollectionWhere(
        "likes",
        "targetId",
        "==",
        commentId,
    );
    const userLike = existingLikes.find(
        (like) => like.userId === userId && like.type === "COMMENT",
    );

    if (userLike) {
      // 좋아요 취소
      await firestoreService.deleteDocument("likes", userLike.id);

      // 댓글의 좋아요 수 감소
      const newLikesCount = Math.max(0, (comment.likesCount || 0) - 1);
      await firestoreService.updateDocument("comments", commentId, {
        likesCount: newLikesCount,
        updatedAt: new Date(),
      });

      res.json({
        success: true,
        message: "좋아요가 취소되었습니다.",
        isLiked: false,
        likesCount: newLikesCount,
      });
    } else {
      // 좋아요 등록
      const likeData = {
        type: "COMMENT",
        targetId: commentId,
        userId,
        createdAt: new Date(),
      };

      await firestoreService.addDocument("likes", likeData);

      // 댓글의 좋아요 수 증가
      const newLikesCount = (comment.likesCount || 0) + 1;
      await firestoreService.updateDocument("comments", commentId, {
        likesCount: newLikesCount,
        updatedAt: new Date(),
      });

      res.json({
        success: true,
        message: "좋아요가 등록되었습니다.",
        isLiked: true,
        likesCount: newLikesCount,
      });
    }
  } catch (error) {
    console.error("Error toggling comment like:", error);
    res.status(500).json({
      success: false,
      message: "좋아요 처리 중 오류가 발생했습니다.",
    });
  }
};

module.exports = {
  createComment,
  getComments,
  updateComment,
  deleteComment,
  toggleCommentLike,
};
