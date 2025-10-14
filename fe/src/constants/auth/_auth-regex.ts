/**
 * @description 이메일 형식 검증
 */
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * @description 비밀번호 형식 검증 (6글자 이상)
 */
export const PASSWORD_REGEX = /^.{6,}$/;
