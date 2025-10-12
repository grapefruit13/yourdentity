const {onCall} = require("firebase-functions/v2/https");
const authService = require("../services/authService");

/**
 * 이메일 중복 체크 (회원가입 전 사전 검증)
 * 
 * @description
 * Firebase Auth는 provider별로 계정을 관리하므로,
 * 이메일+카카오, 이메일+이메일 크로스 중복을 감지하지 못함.
 * 따라서 회원가입 전 Firestore를 직접 조회하여 중복 확인.
 * 
 * @example
 * // 프론트엔드에서 호출
 * const checkEmail = httpsCallable(functions, 'checkEmailAvailability');
 * const result = await checkEmail({ email: 'test@example.com' });
 * 
 * if (!result.data.available) {
 *   console.log(`이미 ${result.data.existingProvider}로 가입된 계정입니다.`);
 * }
 */
module.exports = onCall(
    {
      region: "asia-northeast3",
    },
    async (request) => {
      try {
        const {email} = request.data;

        if (!email) {
          throw new Error("이메일이 필요합니다.");
        }

        const result = await authService.checkEmailAvailability(email);
        return result;
      } catch (error) {
        console.error("❌ checkEmailAvailability 실패:", error);
        throw error;
      }
    },
);

