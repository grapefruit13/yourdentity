const {admin} = require("../config/database");
const FirestoreService = require("./firestoreService");
const {isValidEmail} = require("../utils/helpers");

// FirestoreService 인스턴스 생성
const usersService = new FirestoreService("users");

/**
 * 로그아웃 - Refresh Token 무효화
 * 
 * @description
 * 사용자의 모든 Refresh Token을 무효화하여 기존 토큰 사용 불가능하게 함
 * - revokeRefreshTokens()로 모든 디바이스의 토큰 무효화
 * - authGuard에서 tokensValidAfterTime 체크로 로그아웃된 토큰 거부
 * 
 * @param {string} uid - 사용자 UID
 * @returns {{ success: boolean, revokedAt: string }}
 */
const logout = async (uid) => {
  try {
    if (!uid) {
      const error = new Error("UID가 필요합니다");
      error.code = "BAD_REQUEST";
      throw error;
    }

    // 모든 Refresh Token 무효화
    await admin.auth().revokeRefreshTokens(uid);

    // tokensValidAfterTime 업데이트됨 (현재 시간)
    const user = await admin.auth().getUser(uid);

    console.log(`✅ AuthService: Logout - Tokens revoked at ${user.tokensValidAfterTime}`, {
      uid,
    });

    return {
      success: true,
      revokedAt: user.tokensValidAfterTime,
    };
  } catch (error) {
    console.error("❌ AuthService: Logout 실패:", error);
    throw error;
  }
};

module.exports = {
  logout,
};

