const { db, Timestamp, FieldValue } = require("../config/database");
const fileService = require("./fileService");
const { sanitizeContent } = require("../utils/sanitizeHelper");
const { getDateKeyByUTC, getTodayByUTC } = require("../utils/helpers");
const FirestoreService = require("./firestoreService");
const userService = require("./userService");
const {
  USER_MISSIONS_COLLECTION,
  USER_MISSION_STATS_COLLECTION,
  MISSION_POSTS_COLLECTION,
  MISSION_STATUS,
} = require("../constants/missionConstants");

function buildError(message, code, statusCode) {
  const error = new Error(message);
  error.code = code;
  error.statusCode = statusCode;
  return error;
}

class MissionPostService {
  static MAX_PREVIEW_TEXT_LENGTH = 60; // 2줄 기준

  /**
   * 시간 경과 표시 (예: "1시간 전")
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
   */
  createPreview(post) {
    let description = "";
    let thumbnail = null;

    if (typeof post.content === "string") {
      const textOnly = post.content.replace(/<[^>]*>/g, "").trim();
      description =
        textOnly.substring(0, MissionPostService.MAX_PREVIEW_TEXT_LENGTH) +
        (textOnly.length > MissionPostService.MAX_PREVIEW_TEXT_LENGTH ? "..." : "");

      const imgMatch = post.content.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
      if (imgMatch) {
        const imgTag = post.content.match(/<img[^>]*>/i)?.[0] || "";
        const srcMatch = imgTag.match(/src=["']([^"']+)["']/i);
        const widthMatch = imgTag.match(/width=["']?(\d+)["']?/i);
        const heightMatch = imgTag.match(/height=["']?(\d+)["']?/i);
        const blurHashMatch = imgTag.match(/data-blurhash=["']([^"']+)["']/i);

        const width = widthMatch ? parseInt(widthMatch[1], 10) : null;
        const height = heightMatch ? parseInt(heightMatch[1], 10) : null;
        const blurHash = blurHashMatch ? blurHashMatch[1] : null;

        thumbnail = {
          url: srcMatch ? srcMatch[1] : imgMatch[1],
          width,
          height,
          blurHash,
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
      description =
        text
          ? text.substring(0, MissionPostService.MAX_PREVIEW_TEXT_LENGTH) +
            (text.length > MissionPostService.MAX_PREVIEW_TEXT_LENGTH ? "..." : "")
          : "";

      const firstImage =
        mediaArr.find((item) => item.type === "image") ||
        contentArr.find((item) => item.type === "image");

      thumbnail = firstImage
        ? {
            url: firstImage.url || firstImage.src,
            blurHash: firstImage.blurHash || null,
            width:
              typeof firstImage.width === "number"
                ? firstImage.width
                : firstImage.width
                  ? Number(firstImage.width)
                  : null,
            height:
              typeof firstImage.height === "number"
                ? firstImage.height
                : firstImage.height
                  ? Number(firstImage.height)
                  : null,
          }
        : null;
    }

    return {
      description,
      thumbnail,
    };
  }

  /**
   * 사용자 프로필 정보 배치 조회
   */
  async loadUserProfiles(userIds = []) {
    if (!userIds || userIds.length === 0) {
      return {};
    }

    const uniqueUserIds = Array.from(new Set(userIds.filter((id) => id)));
    if (uniqueUserIds.length === 0) {
      return {};
    }

    const profileMap = {};
    const firestoreService = new FirestoreService("users");

    // Firestore 'in' 쿼리는 최대 10개만 지원하므로 청크로 나누어 처리
    const chunks = [];
    for (let i = 0; i < uniqueUserIds.length; i += 10) {
      chunks.push(uniqueUserIds.slice(i, i + 10));
    }

    try {
      const userResults = await Promise.all(
        chunks.map((chunk) =>
          firestoreService.getCollectionWhereIn("users", "__name__", chunk),
        ),
      );

      userResults
        .flat()
        .filter((user) => user?.id)
        .forEach((user) => {
          profileMap[user.id] = {
            nickname: user.nickname || "",
            profileImageUrl: user.profileImageUrl || null,
          };
        });
    } catch (error) {
      console.warn("[MISSION_POST] 사용자 프로필 배치 조회 실패:", error.message);
    }

    return profileMap;
  }

  async createPost({ userId, missionId, postData }) {
    if (!userId) {
      throw buildError("사용자 정보가 필요합니다.", "UNAUTHORIZED", 401);
    }

    if (!missionId) {
      throw buildError("미션 ID가 필요합니다.", "BAD_REQUEST", 400);
    }

    if (!postData || typeof postData !== "object") {
      throw buildError("요청 데이터가 필요합니다.", "BAD_REQUEST", 400);
    }

    const {
      title,
      content,
      media = [],
      postType = "CERT",
    } = postData;

    const normalizedTitle = typeof title === "string" ? title.trim() : "";
    const sanitizedContent = sanitizeContent(content || "");
    const hasMedia = Array.isArray(media) && media.length > 0;

    if (!normalizedTitle && !sanitizedContent && !hasMedia) {
      throw buildError(
        "제목, 내용 또는 미디어 중 최소 한 가지는 필요합니다.",
        "BAD_REQUEST",
        400,
      );
    }

    let validatedFiles = [];
    if (hasMedia) {
      validatedFiles = await fileService.validateFilesForPost(media, userId);
    }

    const missionDocId = `${userId}_${missionId}`;
    const missionDocRef = db.collection(USER_MISSIONS_COLLECTION).doc(missionDocId);
    const statsDocRef = db.collection(USER_MISSION_STATS_COLLECTION).doc(userId);
    const postRef = db.collection(MISSION_POSTS_COLLECTION).doc();
    const userMissionPostRef = db
      .collection(`users/${userId}/missionPosts`)
      .doc(postRef.id);

    const now = Timestamp.now();

    await db.runTransaction(async (transaction) => {
      const missionDocSnap = await transaction.get(missionDocRef);
      if (!missionDocSnap.exists) {
        throw buildError(
          "미션 신청 기록을 찾을 수 없습니다.",
          "MISSION_NOT_FOUND",
          404,
        );
      }

      const missionDoc = missionDocSnap.data();
      if (missionDoc.status !== MISSION_STATUS.IN_PROGRESS) {
        throw buildError(
          "이미 완료되었거나 종료된 미션입니다.",
          "MISSION_ALREADY_COMPLETED",
          409,
        );
      }

      const statsDocSnap = await transaction.get(statsDocRef);
      const statsData = statsDocSnap.exists
        ? statsDocSnap.data()
        : {
            userId,
            activeCount: 0,
            dailyAppliedCount: 0,
            dailyCompletedCount: 0,
            lastAppliedAt: null,
            lastCompletedAt: null,
            consecutiveDays: 0,
            updatedAt: now,
          };

      // 연속일자 계산을 위한 날짜 처리
      // 모든 날짜 키는 getDateKeyByUTC를 사용하여 일관성 유지 (UTC 20:00 기준)
      const todayKey = getDateKeyByUTC(getTodayByUTC()); // YYYY-MM-DD

      // 어제 날짜 계산: UTC 기반 오늘에서 하루를 뺀 후 날짜 키로 변환
      const todayDate = getTodayByUTC();
      const yesterdayDate = new Date(todayDate);
      yesterdayDate.setUTCDate(yesterdayDate.getUTCDate() - 1);
      const yesterdayKey = getDateKeyByUTC(yesterdayDate);

      // 마지막 인증일을 날짜 키로 변환 (UTC 20:00 기준)
      const lastPostDateKey = getDateKeyByUTC(statsData.lastCompletedAt);

      // 연속일자 업데이트 로직
      // - 오늘 이미 인증했으면: 연속일자 유지 (변경 없음)
      // - 어제 인증했고 오늘 첫 인증이면: 연속일자 +1
      // - 어제 인증 안 했거나 첫 인증이면: 연속일자 1로 리셋
      let newConsecutiveDays = statsData.consecutiveDays || 0;

      if (lastPostDateKey === todayKey) {
        // 오늘 이미 인증했으면 연속일자 유지
        // 변경 없음
      } else if (lastPostDateKey === yesterdayKey) {
        // 어제 인증했고 오늘 첫 인증이면 +1
        newConsecutiveDays = (statsData.consecutiveDays || 0) + 1;
      } else {
        // 어제 인증 안 했거나 첫 인증이면 1로 리셋
        newConsecutiveDays = 1;
      }

      const missionTitle = missionDoc.missionTitle || "";

      const missionPostPayload = {
        missionNotionPageId: missionId,
        missionTitle,
        userId,
        title: normalizedTitle,
        content: sanitizedContent,
        media: media || [],
        postType,
        likesCount: 0,
        commentsCount: 0,
        reportsCount: 0,
        viewCount: 0,
        createdAt: now,
        updatedAt: now,
      };

      transaction.set(postRef, missionPostPayload);

      if (validatedFiles.length > 0) {
        fileService.attachFilesToPostInTransaction(
          validatedFiles,
          postRef.id,
          transaction,
        );
      }

      transaction.update(missionDocRef, {
        status: MISSION_STATUS.COMPLETED,
        completedAt: now,
        lastActivityAt: now,
        updatedAt: now,
      });

      // userMissionStats 업데이트: 완료 카운트 증가, 연속일자 업데이트
      transaction.set(
        statsDocRef,
        {
          userId,
          activeCount: Math.max((statsData.activeCount || 0) - 1, 0),
          dailyAppliedCount: statsData.dailyAppliedCount || 0,
          dailyCompletedCount: (statsData.dailyCompletedCount || 0) + 1,
          lastCompletedAt: now, // 마지막 인증 시간 업데이트 (연속일자 계산에 사용)
          consecutiveDays: newConsecutiveDays, // 연속일자 업데이트 (어제 인증 여부에 따라 +1 또는 1로 리셋)
          updatedAt: now,
        },
        { merge: true },
      );

      transaction.set(
        userMissionPostRef,
        {
          postId: postRef.id,
          missionNotionPageId: missionId,
          missionTitle,
          postType,
          createdAt: now,
          lastAuthoredAt: now,
        },
        { merge: true },
      );
    });

    return {
      missionId,
      postId: postRef.id,
      status: MISSION_STATUS.COMPLETED,
    };
  }

  /**
   * 미션 인증글 목록 조회
   * @param {Object} options - 조회 옵션
   * @param {string} options.sort - 정렬 기준 ('latest' | 'popular')
   * @param {string} options.category - 카테고리 필터
   * @param {string} options.userId - 내가 인증한 미션만 보기 (userId 필터)
   * @param {string} viewerId - 조회자 ID (선택)
   * @returns {Promise<Object>} 미션 인증글 목록
   */
  async getAllMissionPosts(options = {}, viewerId = null) {
    try {
      const { sort = "latest", category, userId: filterUserId } = options;

      let query = db.collection(MISSION_POSTS_COLLECTION);

      // 필터: 내가 인증한 미션만 보기
      if (filterUserId) {
        query = query.where("userId", "==", filterUserId);
      }

      // 정렬
      const orderBy = sort === "popular" ? "viewCount" : "createdAt";
      const orderDirection = "desc";
      query = query.orderBy(orderBy, orderDirection);

      // 전체 조회 (페이지네이션은 나중에)
      const snapshot = await query.get();

      if (snapshot.empty) {
        return { posts: [] };
      }

      const posts = [];
      const userIds = [];

      for (const doc of snapshot.docs) {
        const postData = doc.data();
        if (postData.userId) {
          userIds.push(postData.userId);
        }
        posts.push({
          id: doc.id,
          ...postData,
        });
      }

      // 사용자 프로필 정보 배치 조회
      const profileMap = userIds.length > 0 ? await this.loadUserProfiles(userIds) : {};

      // 카테고리 필터링 (미션 카테고리는 Notion에서 가져와야 하므로 일단 스킵)
      // TODO: 카테고리 필터링은 미션 정보를 Notion에서 조회해야 함

      // 응답 데이터 구성
      const processedPosts = posts.map((post) => {
        const createdAtDate = post.createdAt?.toDate?.() || new Date(post.createdAt);
        const userProfile = profileMap[post.userId] || {};

        return {
          id: post.id,
          title: post.title || "",
          missionTitle: post.missionTitle || "",
          missionNotionPageId: post.missionNotionPageId || "",
          author: userProfile.nickname || "",
          profileImageUrl: userProfile.profileImageUrl || null,
          preview: this.createPreview(post),
          mediaCount: Array.isArray(post.media) ? post.media.length : 0,
          commentsCount: post.commentsCount || 0,
          viewCount: post.viewCount || 0,
          createdAt: createdAtDate.toISOString(),
          timeAgo: this.getTimeAgo(createdAtDate),
        };
      });

      return { posts: processedPosts };
    } catch (error) {
      console.error("[MISSION_POST] 인증글 목록 조회 실패:", error.message);
      throw buildError("인증글 목록을 조회할 수 없습니다.", "INTERNAL_ERROR", 500);
    }
  }

  /**
   * 미션 인증글 상세 조회
   * @param {string} postId - 인증글 ID
   * @param {string} viewerId - 조회자 ID (선택)
   * @returns {Promise<Object>} 미션 인증글 상세 정보
   */
  async getMissionPostById(postId, viewerId = null) {
    try {
      if (!postId) {
        throw buildError("인증글 ID가 필요합니다.", "BAD_REQUEST", 400);
      }

      const postRef = db.collection(MISSION_POSTS_COLLECTION).doc(postId);
      const postDoc = await postRef.get();

      if (!postDoc.exists) {
        throw buildError("인증글을 찾을 수 없습니다.", "NOT_FOUND", 404);
      }

      const post = { id: postDoc.id, ...postDoc.data() };

      // 조회수 증가 (비동기로 처리)
      const newViewCount = (post.viewCount || 0) + 1;
      postRef
        .update({
          viewCount: newViewCount,
          updatedAt: FieldValue.serverTimestamp(),
        })
        .catch((error) => {
          console.error("[MISSION_POST] 조회수 증가 실패:", error);
        });

      // 사용자 프로필 정보 조회
      const profileMap = await this.loadUserProfiles([post.userId]);
      const userProfile = profileMap[post.userId] || {};

      const createdAtDate = post.createdAt?.toDate?.() || new Date(post.createdAt);
      const updatedAtDate = post.updatedAt?.toDate?.() || new Date(post.updatedAt);

      const isAuthor = Boolean(viewerId && viewerId === post.userId);

      const response = {
        id: post.id,
        title: post.title || "",
        content: post.content || "",
        media: post.media || [],
        missionTitle: post.missionTitle || "",
        missionNotionPageId: post.missionNotionPageId || "",
        author: userProfile.nickname || "",
        profileImageUrl: userProfile.profileImageUrl || null,
        commentsCount: post.commentsCount || 0,
        viewCount: newViewCount,
        createdAt: createdAtDate.toISOString(),
        updatedAt: updatedAtDate.toISOString(),
        timeAgo: this.getTimeAgo(createdAtDate),
        isAuthor,
      };

      return response;
    } catch (error) {
      console.error("[MISSION_POST] 인증글 상세 조회 실패:", error.message);
      if (error.code === "NOT_FOUND" || error.code === "BAD_REQUEST") {
        throw error;
      }
      throw buildError("인증글을 조회할 수 없습니다.", "INTERNAL_ERROR", 500);
    }
  }
}

module.exports = new MissionPostService();

