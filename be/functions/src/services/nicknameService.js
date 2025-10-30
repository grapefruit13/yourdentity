const {db} = require("../config/database");
const admin = require("firebase-admin");

// Admin 초기화
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * 닉네임 관리 서비스
 * 닉네임 중복 체크 및 설정
 */
class NicknameService {
  constructor() {
    this.collectionName = "nicknames";
  }

  /**
   * 닉네임 가용성 확인
   * @param {string} nickname - 닉네임
   * @return {Promise<boolean>} 사용 가능 여부 (true: 사용 가능, false: 중복)
   */
  async checkAvailability(nickname) {
    const lower = nickname.toLowerCase().trim();
    const nickRef = db.collection(this.collectionName).doc(lower);
    const nickDoc = await nickRef.get();
    
    return !nickDoc.exists;
  }

  /**
   * 닉네임 변경
   * @param {string} nickname - 닉네임
   * @param {string} uid - 사용자 UID
   * @param {string} existingNickname - 기존 닉네임 (선택사항)
   * @return {Promise<boolean>} 설정 성공 여부
   */
  async setNickname(nickname, uid, existingNickname = null) {
    const lower = nickname.toLowerCase();
    const nickRef = db.collection(this.collectionName).doc(lower);
    
    // 트랜잭션으로 닉네임 중복 체크 및 최종 확정
    return await db.runTransaction(async (tx) => {
      const nickDoc = await tx.get(nickRef);
      
      // 이미 존재하고 다른 사용자가 사용 중인 경우
      if (nickDoc.exists && nickDoc.data()?.uid !== uid) {
        const e = new Error("NICKNAME_TAKEN");
        e.code = "NICKNAME_TAKEN";
        throw e;
      }
      
      // 닉네임 최종 확정
      tx.set(nickRef, {uid});
      
      // (닉네임 변경용) 기존 닉네임이 있고 다른 경우, 이전 닉네임 해제
      if (existingNickname && existingNickname.toLowerCase() !== lower) {
        const prevRef = db.collection(this.collectionName).doc(existingNickname.toLowerCase());
        tx.delete(prevRef);
      }
      
      return true;
    });
  }

}

module.exports = NicknameService;
