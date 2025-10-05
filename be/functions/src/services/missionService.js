const { db, FieldValue } = require('../config/database');

/**
 * Mission Service - 미션 관련 비즈니스 로직
 */
class MissionService {
  /**
   * 미션 생성
   * @param {string} userId - 사용자 ID
   * @param {string} missionId - 미션 ID
   * @param {string} status - 미션 상태
   * @return {Promise<Object>} 생성된 미션 데이터
   */
  async createMission(userId, missionId, status = 'ONGOING') {
    const missionData = {
      status,
      startedAt: FieldValue.serverTimestamp(),
      certified: false
    };

    if (status === 'COMPLETED') {
      missionData.completedAt = FieldValue.serverTimestamp();
      missionData.certified = true;
    }

    await db.collection('users').doc(userId).collection('missions').doc(missionId).set(missionData);
    return { userId, missionId, ...missionData };
  }

  /**
   * 사용자 미션 목록 조회
   * @param {string} userId - 사용자 ID
   * @param {string} statusFilter - 상태 필터
   * @return {Promise<Array>} 미션 목록
   */
  async getUserMissions(userId, statusFilter = null) {
    let query = db.collection('users').doc(userId).collection('missions');
    
    if (statusFilter) {
      query = query.where('status', '==', statusFilter);
    }

    const snapshot = await query.get();
    const missions = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      missions.push({
        missionId: doc.id,
        ...data,
        startedAt: data.startedAt?.toDate().toISOString(),
        completedAt: data.completedAt?.toDate().toISOString()
      });
    });

    return missions;
  }

  /**
   * 미션 상세 조회
   * @param {string} userId - 사용자 ID
   * @param {string} missionId - 미션 ID
   * @return {Promise<Object|null>} 미션 데이터
   */
  async getMissionById(userId, missionId) {
    const doc = await db.collection('users').doc(userId).collection('missions').doc(missionId).get();

    if (!doc.exists) {
      return null;
    }

    const data = doc.data();
    return {
      missionId: doc.id,
      ...data,
      startedAt: data.startedAt?.toDate().toISOString(),
      completedAt: data.completedAt?.toDate().toISOString()
    };
  }

  /**
   * 미션 업데이트
   * @param {string} userId - 사용자 ID
   * @param {string} missionId - 미션 ID
   * @param {Object} updateData - 업데이트할 데이터
   * @return {Promise<Object>} 업데이트된 미션 데이터
   */
  async updateMission(userId, missionId, updateData) {
    if (updateData.status === "COMPLETED") {
      updateData.completedAt = FieldValue.serverTimestamp();
    }

    await db
        .collection("users")
        .doc(userId)
        .collection("missions")
        .doc(missionId)
        .update(updateData);
    return {userId, missionId, ...updateData};
  }

  /**
   * 미션 삭제
   * @param {string} userId - 사용자 ID
   * @param {string} missionId - 미션 ID
   * @return {Promise<void>}
   */
  async deleteMission(userId, missionId) {
    await db
        .collection("users")
        .doc(userId)
        .collection("missions")
        .doc(missionId)
        .delete();
  }
}

module.exports = new MissionService();
