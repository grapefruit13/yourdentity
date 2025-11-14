const {db} = require("../config/database");
const admin = require("firebase-admin");
const { validateNicknameOrThrow } = require("../utils/nicknameValidator");

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
    // 닉네임 검증 (공백 제외, 한글/영어/숫자만, 최대 8글자)
    validateNicknameOrThrow(nickname);
    
    const lower = nickname.toLowerCase().trim();
    const nickRef = db.collection(this.collectionName).doc(lower);
    const nickDoc = await nickRef.get();
    
    return !nickDoc.exists;
  }

  /**
   * 트랜잭션 내에서 닉네임 설정
   * @param {FirebaseFirestore.Transaction} transaction - Firestore 트랜잭션 객체
   * @param {string} nickname - 닉네임
   * @param {string} uid - 사용자 UID
   * @param {string} existingNickname - 기존 닉네임 (선택사항)
   */
  setNickname(transaction, nickname, uid, existingNickname = null) {
    const lower = nickname.toLowerCase();
    const nickRef = db.collection(this.collectionName).doc(lower);
    
    // 닉네임 최종 확정
    transaction.set(nickRef, {uid});
    
    // (닉네임 변경용) 기존 닉네임이 있고 다른 경우, 이전 닉네임 해제
    if (existingNickname && existingNickname.toLowerCase() !== lower) {
      const prevRef = db.collection(this.collectionName).doc(existingNickname.toLowerCase());
      transaction.delete(prevRef);
    }
  }

}

module.exports = NicknameService;
