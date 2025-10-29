const {FieldValue} = require("firebase-admin/firestore");
const FirestoreService = require("./firestoreService");
const NicknameService = require("./nicknameService");
const {isValidPhoneNumber} = require("../utils/helpers");

/**
 * User Service (비즈니스 로직 계층)
 * Firebase Auth + Firestore 통합 관리
 */
class UserService {
  constructor() {
    this.firestoreService = new FirestoreService("users");
    this.nicknameService = new NicknameService();
  }

  /**
   * 온보딩 업데이트
   * - 허용 필드만 부분 업데이트
   * - 닉네임 중복 방지(트랜잭션)
   * - 닉네임이 유효하면 onboardingCompleted=true
   * @param {Object} params
   * @param {string} params.uid
   * @param {Object} params.payload
   * @return {Promise<{onboardingCompleted:boolean}>}
   */
  async updateOnboarding({uid, payload}) {
    // 1) 현재 사용자 문서 조회 (FirestoreService 사용)
    const existing = await this.firestoreService.getById(uid);
    if (!existing) {
      const e = new Error("User document not found");
      e.code = "NOT_FOUND";
      throw e;
    }

    // 2) 허용 필드 화이트리스트 적용
    const allowedFields = [
      "nickname",
    ];
    const update = {};
    for (const key of allowedFields) {
      if (payload[key] !== undefined) update[key] = payload[key];
    }

    // 3) 필수 필드 체크 (카카오 전용: 닉네임만 필수)
    const hasValidNickname = typeof update.nickname === "string" && update.nickname.trim().length > 0;
    if (!hasValidNickname) {
      const e = new Error("REQUIRE_FIELDS_MISSING: nickname");
      e.code = "REQUIRE_FIELDS_MISSING";
      throw e;
    }

    // 4) 닉네임 설정 (중복 체크 및 예약)
    const nickname = update.nickname;
    const setNickname = typeof nickname === "string" && nickname.trim().length > 0;

    if (setNickname) {
      await this.nicknameService.setNickname(nickname, uid, existing.nickname);
    }

    // 5) 온보딩 완료 처리
    const userUpdate = {
      ...update,
      onboardingCompleted: true,
      updatedAt: FieldValue.serverTimestamp(),
    };

    // 사용자 문서 업데이트 (FirestoreService 사용)
    await this.firestoreService.update(uid, userUpdate);
    
    return {onboardingCompleted: true};
  }

  /**
   * 모든 사용자 조회
   * @return {Promise<Array>} 사용자 목록
   */
  async getAllUsers() {
    try {
      return await this.firestoreService.getAll();
    } catch (error) {
      console.error("사용자 목록 조회 에러:", error.message);
      throw new Error("사용자 목록을 조회할 수 없습니다");
    }
  }

  /**
   * 사용자 정보 조회
   * @param {string} uid - 사용자 ID
   * @return {Promise<Object|null>} 사용자 정보
   */
  async getUserById(uid) {
    try {
      return await this.firestoreService.getById(uid);
    } catch (error) {
      console.error("사용자 조회 에러:", error.message);
      throw new Error("사용자를 조회할 수 없습니다");
    }
  }

  /**
   * 일반 수정용 : 사용자 정보 업데이트
   * @param {string} uid - 사용자 ID
   * @param {Object} updateData - 업데이트할 데이터
   * @return {Promise<Object>} 업데이트된 사용자 정보
   */
  async updateUser(uid, updateData) {
    try {
      // 업데이트 데이터에 updatedAt 추가
      const updatePayload = {
        ...updateData,
        updatedAt: FieldValue.serverTimestamp(),
      };

      return await this.firestoreService.update(uid, updatePayload);
    } catch (error) {
      console.error("사용자 업데이트 에러:", error.message);
      throw new Error("사용자 정보를 업데이트할 수 없습니다");
    }
  }

  /**
   * 사용자 삭제 (Firebase Auth + Firestore)
   * @param {string} uid
   * @return {Promise<void>}
   */
  async deleteUser(uid) {
    try {
      await admin.auth().deleteUser(uid);
      await this.firestoreService.delete(uid);
    } catch (error) {
      console.error("사용자 삭제 에러:", error.message);
      throw new Error("사용자를 삭제할 수 없습니다");
    }
  }
}

module.exports = UserService;