const { db, Timestamp } = require("../config/database");
const notionMissionService = require("./notionMissionService");
const { getDateKeyByKST, getTodayByKST } = require("../utils/helpers");
const {
  USER_MISSIONS_COLLECTION,
  USER_MISSION_STATS_COLLECTION,
  MISSION_POSTS_COLLECTION,
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
            consecutiveDays: 0,
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

      // 통계 업데이트 (activeCount, dailyAppliedCount 감소)
      // 오늘 신청한 미션을 그만두면 dailyAppliedCount도 감소
      const currentDailyAppliedCount = statsData.dailyAppliedCount || 0;
      const newDailyAppliedCount = Math.max(0, currentDailyAppliedCount - 1);

      transaction.set(
        userMissionStatsRef,
        {
          userId,
          activeCount: newActiveCount,
          dailyAppliedCount: newDailyAppliedCount,
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

  /**
   * 미션 통계 조회
   * @param {Object} params
   * @param {string} params.userId - 사용자 UID
   * @returns {Promise<Object>} 통계 데이터
   */
  async getMissionStats({ userId }) {
    if (!userId) {
      throw buildError("사용자 정보가 필요합니다.", "UNAUTHORIZED", 401);
    }

    // AM 05:00 기준으로 오늘 날짜 계산
    const today = getTodayByKST();

    const todayStart = Timestamp.fromDate(today);
    const todayEnd = Timestamp.fromDate(
      new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
    );

    // 1. 오늘의 미션 인증 현황 (userMissionStats에서 가져오기)
    const statsDoc = await db
      .collection(USER_MISSION_STATS_COLLECTION)
      .doc(userId)
      .get();

    const statsData = statsDoc.exists ? statsDoc.data() : {};

    // 오늘 신청한 미션 수 (QUIT 제외) - dailyAppliedCount는 QUIT 시 감소되므로 이미 QUIT 제외됨
    const todayTotalCount = statsData.dailyAppliedCount || 0;

    // 오늘 완료한 미션 수
    const todayCompletedCount = statsData.dailyCompletedCount || 0;

    // 진행 중인 미션 수 (오늘 신청한 미션 중 IN_PROGRESS만)
    // 오늘 신청한 미션 중 완료하지 않은 것 = total - completed
    const todayActiveCount = Math.max(0, todayTotalCount - todayCompletedCount);

    // 3. 연속 미션일 (userMissionStats에서 가져오기)
    let consecutiveDays = statsData.consecutiveDays || 0;
    
    // lastCompletedAt을 날짜로 변환하여 비교
    const lastPostDateKey = getDateKeyByKST(statsData.lastCompletedAt);

    // 어제 날짜 계산 (AM 05:00 기준)
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().substring(0, 10);
    const todayKey = today.toISOString().substring(0, 10);

    // 어제 인증 안 했으면 연속일자 0으로 처리
    if (lastPostDateKey !== yesterdayKey && lastPostDateKey !== todayKey) {
      consecutiveDays = 0;
    }

    // 4. 누적 게시글 수 (전체 인증글 개수)
    const allPostsSnapshot = await db
      .collection(MISSION_POSTS_COLLECTION)
      .where("userId", "==", userId)
      .get();
    const totalPostsCount = allPostsSnapshot.size;

    return {
      todayTotalCount, // 오늘 신청한 미션 수 (QUIT 제외, IN_PROGRESS + COMPLETED)
      todayCompletedCount, // 오늘 완료한 미션 수 (COMPLETED만)
      todayActiveCount, // 진행 중인 미션 수 (오늘 신청한 미션 중 IN_PROGRESS만)
      consecutiveDays, // 연속 미션일
      totalPostsCount, // 누적 게시글 수
    };
  }
}

module.exports = new MissionService();

