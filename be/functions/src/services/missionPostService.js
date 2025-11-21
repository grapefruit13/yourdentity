const { db, Timestamp } = require("../config/database");
const fileService = require("./fileService");
const { sanitizeContent } = require("../utils/sanitizeHelper");
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
            updatedAt: now,
          };

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

      transaction.set(
        statsDocRef,
        {
          userId,
          activeCount: Math.max((statsData.activeCount || 0) - 1, 0),
          dailyAppliedCount: statsData.dailyAppliedCount || 0,
          dailyCompletedCount: (statsData.dailyCompletedCount || 0) + 1,
          lastCompletedAt: now,
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
}

module.exports = new MissionPostService();

