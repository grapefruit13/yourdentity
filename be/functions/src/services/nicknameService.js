const {db} = require("../config/database");

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
   * @throws {Error} NICKNAME_TAKEN - 이미 사용 중인 닉네임
   */
  async setNickname(nickname, uid, existingNickname = null) {
    const lower = nickname.toLowerCase();
    const nickRef = db.collection(this.collectionName).doc(lower);
    
    // 트랜잭션으로 닉네임 중복 체크 및 설정
    return await db.runTransaction(async (tx) => {
      const nickDoc = await tx.get(nickRef);
      
      // 다른 사용자가 이미 사용 중인 경우
      if (nickDoc.exists && nickDoc.data()?.uid !== uid) {
        console.log(`[NICKNAME_TAKEN] nickname="${lower}" 이미 사용 중 (owner: ${nickDoc.data()?.uid})`);
        const e = new Error("이미 사용 중인 닉네임입니다");
        e.code = "NICKNAME_TAKEN";
        throw e;
      }
      
      // 닉네임 설정
      tx.set(nickRef, {uid});
      
      // 기존 닉네임 해제 (닉네임 변경 시)
      if (existingNickname && existingNickname.toLowerCase() !== lower) {
        const prevRef = db.collection(this.collectionName).doc(existingNickname.toLowerCase());
        tx.delete(prevRef);
        console.log(`[NICKNAME_CHANGED] uid=${uid}, old="${existingNickname.toLowerCase()}" → new="${lower}"`);
      } else {
        console.log(`[NICKNAME_SET] uid=${uid}, nickname="${lower}"`);
      }
      
      return true;
    });
  }

}

module.exports = NicknameService;
