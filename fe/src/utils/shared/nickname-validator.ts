/**
 * @description 닉네임 검증 유틸리티 (서버와 동일한 로직)
 * - 공백 제외
 * - 한글/영어/숫자만 허용
 * - 최대 8글자 제한
 */

// 한글(완성형 + 자음/모음), 영어(대소문자), 숫자만 허용하는 정규식
// 가-힣: 완성형 한글, ㄱ-ㅎ: 자음, ㅏ-ㅣ: 모음
const NICKNAME_PATTERN = /^[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9]+$/;

/**
 * 닉네임 검증 결과 타입
 */
export interface NicknameValidationResult {
  isValid: boolean;
  error: string | null;
}

/**
 * 닉네임 검증 함수 (서버와 동일한 로직)
 * @param nickname - 검증할 닉네임
 * @returns { isValid: boolean, error: string | null }
 */
export const validateNickname = (
  nickname: string
): NicknameValidationResult => {
  if (!nickname || typeof nickname !== "string") {
    return {
      isValid: false,
      error: "닉네임을 입력해주세요.",
    };
  }

  const trimmedNickname = nickname.trim();

  if (trimmedNickname.length === 0) {
    return {
      isValid: false,
      error: "닉네임을 입력해주세요.",
    };
  }

  if (trimmedNickname.length > 8) {
    return {
      isValid: false,
      error: "닉네임은 최대 8글자까지 입력 가능합니다.",
    };
  }

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

  return {
    isValid: true,
    error: null,
  };
};
