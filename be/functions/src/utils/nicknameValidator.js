/**
 * 닉네임 검증 유틸리티
 * - 공백 제외
 * - 한글/영어/숫자만 허용
 * - 최대 8글자 제한
 */

// 한글(완성형 + 자음/모음), 영어(대소문자), 숫자만 허용하는 정규식
// 가-힣: 완성형 한글, ㄱ-ㅎ: 자음, ㅏ-ㅣ: 모음
const NICKNAME_PATTERN = /^[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9]+$/;

/**
 * 닉네임 검증 함수
 * @param {string} nickname - 검증할 닉네임
 * @return {Object} { isValid: boolean, error: string|null }
 */
function validateNickname(nickname) {
  // 1. null/undefined 체크
  if (!nickname || typeof nickname !== "string") {
    return {
      isValid: false,
      error: "닉네임을 입력해주세요.",
    };
  }

  // 2. 공백 제거 (trim)
  const trimmedNickname = nickname.trim();

  // 3. 빈 문자열 체크
  if (trimmedNickname.length === 0) {
    return {
      isValid: false,
      error: "닉네임을 입력해주세요.",
    };
  }

  // 4. 길이 체크 (1-8글자)
  if (trimmedNickname.length > 8) {
    return {
      isValid: false,
      error: "닉네임은 최대 8글자까지 입력 가능합니다.",
    };
  }

  // 5. 문자 패턴 체크 (한글/영어/숫자만)
  if (!NICKNAME_PATTERN.test(trimmedNickname)) {
    let errorMessage = "닉네임은 다음 규칙을 따라야 합니다:\n";
    errorMessage += "• 한글, 영어(대소문자), 숫자만 사용 가능\n";
    errorMessage += "• 최대 8글자까지 입력 가능\n";
    errorMessage += "• 특수문자, 공백, 이모지는 사용 불가\n";
    return {
      isValid: false,
      error: errorMessage,
    };
  }

  // 검증 통과
  return {
    isValid: true,
    error: null,
  };
}

/**
 * 닉네임 검증 및 에러 throw 헬퍼 함수
 * @param {string} nickname - 검증할 닉네임
 * @throws {Error} 검증 실패 시 BAD_REQUEST 에러
 */
function validateNicknameOrThrow(nickname) {
  const result = validateNickname(nickname);
  if (!result.isValid) {
    const error = new Error(result.error);
    error.code = "BAD_REQUEST";
    error.statusCode = 400;
    throw error;
  }
}

module.exports = {
  validateNickname,
  validateNicknameOrThrow,
};

