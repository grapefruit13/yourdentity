const { db, Timestamp } = require("../config/database");
const notionMissionService = require("./notionMissionService");
const {
  USER_MISSIONS_COLLECTION,
  USER_MISSION_STATS_COLLECTION,
  MISSION_STATUS,
  BLOCKED_STATUSES,
  MAX_ACTIVE_MISSIONS,
} = require("../constants/missionConstants");

function buildError(message, code, statusCode) {
  const error = new Error(message);
  error.code = code;
  error.statusCode = statusCode;
  return error;
}

class MissionService {
  /**
   * 미션 신청
   * @param {Object} params
   * @param {string} params.userId - 신청자 UID
   * @param {string} params.missionId - 노션 미션 페이지 ID
   * @returns {Promise<Object>} 신청 결과
   */
  async applyMission({ userId, missionId }) {
    if (!userId) {
      throw buildError("사용자 정보가 필요합니다.", "UNAUTHORIZED", 401);
    }

    if (!missionId) {
      throw buildError("미션 ID가 필요합니다.", "BAD_REQUEST", 400);
    }

    const mission = await notionMissionService.getMissionById(missionId);
    if (!mission) {
      throw buildError("존재하지 않는 미션입니다.", "MISSION_NOT_FOUND", 404);
    }

    const missionDocId = `${userId}_${missionId}`;
    const missionDocRef = db.collection(USER_MISSIONS_COLLECTION).doc(missionDocId);
    const userMissionsRef = db.collection(USER_MISSIONS_COLLECTION);
    const userMissionStatsRef = db.collection(USER_MISSION_STATS_COLLECTION).doc(userId);
    const now = Timestamp.now();

    await db.runTransaction(async (transaction) => {
      const statsDoc = await transaction.get(userMissionStatsRef);
      const statsData = statsDoc.exists
        ? statsDoc.data()
        : {
            userId,
            activeCount: 0,
            dailyAppliedCount: 0,
            dailyCompletedCount: 0,
            lastAppliedAt: null,
            updatedAt: now,
          };

      const dailyAppliedCount = statsData.dailyAppliedCount || 0;

      const activeQuery = userMissionsRef
        .where("userId", "==", userId)
        .where("status", "==", MISSION_STATUS.IN_PROGRESS);
      const activeSnapshot = await transaction.get(activeQuery);
      const existingDoc = await transaction.get(missionDocRef);

      if (statsData.activeCount >= MAX_ACTIVE_MISSIONS || activeSnapshot.size >= MAX_ACTIVE_MISSIONS) {
        throw buildError(
          "동시에 진행할 수 있는 미션은 최대 3개입니다.",
          "MAX_ACTIVE_MISSIONS_EXCEEDED",
          409,
        );
      }
      const existingData = existingDoc.exists ? existingDoc.data() : null;
      if (existingDoc.exists) {
        const currentStatus = existingData?.status;
        if (BLOCKED_STATUSES.includes(currentStatus)) {
          throw buildError(
            "이미 참여한 미션입니다. 다음 리셋 이후에 다시 신청해주세요.",
            "MISSION_ALREADY_APPLIED",
            409,
          );
        }
      }

      const missionPayload = {
        userId,
        missionNotionPageId: missionId,
        missionTitle: mission.title || null,
        status: MISSION_STATUS.IN_PROGRESS,
        startedAt: now,
        lastActivityAt: now,
        createdAt: existingData?.createdAt || now,
        updatedAt: now,
      };

      transaction.set(missionDocRef, missionPayload);
      transaction.set(
        userMissionStatsRef,
        {
          userId,
          activeCount: (statsData.activeCount || 0) + 1,
          dailyAppliedCount: dailyAppliedCount + 1,
          updatedAt: now,
          lastAppliedAt: now,
        },
        { merge: true },
      );
    });

    return {
      missionId,
      status: MISSION_STATUS.IN_PROGRESS,
    };
  }
}

module.exports = new MissionService();

