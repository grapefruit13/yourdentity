const {admin} = require("../config/database");

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
      throw new Error("이메일이 필요합니다.");
    }

    // Firestore에서 이메일 중복 체크
    const existingUserQuery = await admin
        .firestore()
        .collection("users")
        .where("email", "==", email)
        .limit(1)
        .get();

    if (!existingUserQuery.empty) {
      // 중복된 이메일 발견
      const existingDoc = existingUserQuery.docs[0];
      const existingData = existingDoc.data();

      console.log("📧 이메일 중복 감지:", {
        email,
        existingUID: existingDoc.id,
        authType: existingData.authType,
        snsProvider: existingData.snsProvider,
      });

      return {
        available: false,
        existingAuthType: existingData.authType, // "email" or "sns"
        existingProvider:
          existingData.authType === "email"
            ? "email"
            : existingData.snsProvider, // "kakao", "google" etc
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

module.exports = {
  checkEmailAvailability,
};

