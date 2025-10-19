const {admin} = require("../config/database");
const FirestoreService = require("./firestoreService");

// FirestoreService 인스턴스 생성
const usersService = new FirestoreService("users");

/**
 * 이메일 중복 체크 (회원가입 전 사전 검증)
 * 
 * @description
 * Firebase Auth는 provider별로 계정을 관리하므로,
 * 이메일+카카오, 이메일+이메일 크로스 중복을 감지하지 못함.
 * 따라서 Firestore users 컬렉션을 직접 조회하여 중복 확인 필요.
 * 
 * @param {string} email - 확인할 이메일
 * @returns {{ available: boolean, existingProvider?: string, existingAuthType?: string }}
 */
const checkEmailAvailability = async (email) => {
  try {
    if (!email) {
      const error = new Error("이메일이 필요합니다");
      error.code = "BAD_REQUEST";
      throw error;
    }

    // FirestoreService를 통한 이메일 중복 체크
    const existingUsers = await usersService.getWhere("email", "==", email);

    if (existingUsers.length > 0) {
      // 중복된 이메일 발견
      const existingUser = existingUsers[0];

      console.log("📧 이메일 중복 감지:", {
        email,
        existingUID: existingUser.id,
        authType: existingUser.authType,
        snsProvider: existingUser.snsProvider,
      });

      return {
        available: false,
        existingAuthType: existingUser.authType, // "email" or "sns"
        existingProvider:
          existingUser.authType === "email"
            ? "email"
            : existingUser.snsProvider, // "kakao", "google" etc
      };
    }

    // 사용 가능한 이메일
    console.log("✅ 이메일 사용 가능:", {email});
    return {
      available: true,
    };
  } catch (error) {
    console.error("❌ 이메일 중복 체크 실패:", error);
    throw error;
  }
};

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
  checkEmailAvailability,
  logout,
};

