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

  /**
   * 미션 그만두기
   * @param {Object} params
   * @param {string} params.userId - 사용자 UID
   * @param {string} params.missionId - 노션 미션 페이지 ID
   * @returns {Promise<Object>} 그만두기 결과
   */
  async quitMission({ userId, missionId }) {
    if (!userId) {
      throw buildError("사용자 정보가 필요합니다.", "UNAUTHORIZED", 401);
    }

    if (!missionId) {
      throw buildError("미션 ID가 필요합니다.", "BAD_REQUEST", 400);
    }

    const missionDocId = `${userId}_${missionId}`;
    const missionDocRef = db.collection(USER_MISSIONS_COLLECTION).doc(missionDocId);
    const userMissionStatsRef = db.collection(USER_MISSION_STATS_COLLECTION).doc(userId);
    const now = Timestamp.now();

    await db.runTransaction(async (transaction) => {
      const missionDoc = await transaction.get(missionDocRef);

      if (!missionDoc.exists) {
        throw buildError("신청한 미션이 없습니다.", "MISSION_NOT_FOUND", 404);
      }

      const missionData = missionDoc.data();

      // 본인의 미션인지 확인
      if (missionData.userId !== userId) {
        throw buildError("본인의 미션만 그만둘 수 있습니다.", "FORBIDDEN", 403);
      }

      // 진행 중인 미션인지 확인
      if (missionData.status !== MISSION_STATUS.IN_PROGRESS) {
        throw buildError(
          "진행 중인 미션만 그만둘 수 있습니다.",
          "MISSION_NOT_IN_PROGRESS",
          409,
        );
      }

      // 통계 업데이트
      const statsDoc = await transaction.get(userMissionStatsRef);
      const statsData = statsDoc.exists ? statsDoc.data() : { activeCount: 0 };

      const currentActiveCount = statsData.activeCount || 0;
      const newActiveCount = Math.max(0, currentActiveCount - 1);

      // 미션 상태를 QUIT로 변경
      transaction.update(missionDocRef, {
        status: MISSION_STATUS.QUIT,
        quitAt: now,
        lastActivityAt: now,
        updatedAt: now,
      });

      // 통계 업데이트 (activeCount 감소)
      transaction.set(
        userMissionStatsRef,
        {
          userId,
          activeCount: newActiveCount,
          updatedAt: now,
        },
        { merge: true },
      );
    });

    return {
      missionId,
      status: MISSION_STATUS.QUIT,
    };
  }

  /**
   * 사용자 미션 목록 조회
   * @param {Object} params
   * @param {string} params.userId
   * @param {string} [params.status=MISSION_STATUS.IN_PROGRESS]
   * @param {number} [params.limit=20]
   * @returns {Promise<Array>}
   */
  async getUserMissions({ userId, status = MISSION_STATUS.IN_PROGRESS, limit = 20 }) {
    if (!userId) {
      throw buildError("사용자 정보가 필요합니다.", "UNAUTHORIZED", 401);
    }

    const normalizedStatus = status && status !== "ALL" ? status : null;

    let query = db.collection(USER_MISSIONS_COLLECTION).where("userId", "==", userId);

    if (normalizedStatus) {
      query = query.where("status", "==", normalizedStatus);
    }

    const snapshot = await query
      .orderBy("lastActivityAt", "desc")
      .limit(limit)
      .get();

    const missions = [];
    for (const doc of snapshot.docs) {
      if (missions.length >= limit) {
        break;
      }

      const data = doc.data();
      missions.push({
        id: doc.id,
        missionNotionPageId: data.missionNotionPageId,
        missionTitle: data.missionTitle,
        startedAt: data.startedAt?.toDate?.()?.toISOString?.() || data.startedAt,
      });
    }

    return missions;
  }
}

module.exports = new MissionService();

