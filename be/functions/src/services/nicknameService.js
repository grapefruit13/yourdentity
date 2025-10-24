const {db} = require("../config/database");
const admin = require("firebase-admin");

// Admin 초기화
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * 닉네임 관리 서비스
 * 닉네임 중복 체크 및 예약 전용
 */
class NicknameService {
  constructor() {
    this.collectionName = "nicknames";
  }

  /**
   * 닉네임 중복 체크 및 예약
   * @param {string} nickname - 닉네임
   * @param {string} uid - 사용자 UID
   * @param {string} existingNickname - 기존 닉네임 (선택사항)
   * @return {Promise<boolean>} 사용 가능 여부
   */
  async reserveNickname(nickname, uid, existingNickname = null) {
    const lower = nickname.toLowerCase();
    const nickRef = db.collection(this.collectionName).doc(lower);
    
    // 트랜잭션으로 닉네임 중복 체크 및 예약
    return await db.runTransaction(async (tx) => {
      const nickDoc = await tx.get(nickRef);
      
      // 이미 존재하고 다른 사용자가 사용 중인 경우
      if (nickDoc.exists && nickDoc.data()?.uid !== uid) {
        const e = new Error("NICKNAME_TAKEN");
        e.code = "NICKNAME_TAKEN";
        throw e;
      }
      
      // 닉네임 예약
      tx.set(nickRef, {uid});
      
      // 기존 닉네임이 있고 다른 경우, 이전 닉네임 해제
      if (existingNickname && existingNickname.toLowerCase() !== lower) {
        const prevRef = db.collection(this.collectionName).doc(existingNickname.toLowerCase());
        tx.delete(prevRef);
      }
      
      return true;
    });
  }

  /**
   * 닉네임 중복 체크 (예약 없이)
   * @param {string} nickname - 닉네임
   * @param {string} uid - 사용자 UID (선택사항)
   * @return {Promise<boolean>} 사용 가능 여부
   */
  async checkNicknameAvailability(nickname, uid = null) {
    const lower = nickname.toLowerCase();
    const nickRef = db.collection(this.collectionName).doc(lower);
    const nickDoc = await nickRef.get();
    
    if (!nickDoc.exists) {
      return true; // 사용 가능
    }
    
    // 같은 사용자가 이미 사용 중인 경우
    if (uid && nickDoc.data()?.uid === uid) {
      return true; // 사용 가능
    }
    
    return false; // 사용 불가
  }
}

module.exports = NicknameService;
