/**
 * @description 닉네임 검증 관련 상수
 * - 공백 제외
 * - 한글/영어/숫자만 허용
 * - 최대 8글자 제한
 */

/** 닉네임 최대 길이 (백엔드와 일치) */
export const MAX_NICKNAME_LENGTH = 8;

/**
 * 닉네임 허용 문자 패턴 (한글, 영어, 숫자만 허용)
 * - 가-힣: 완성형 한글
 * - ㄱ-ㅎ: 자음 단독 형태
 * - ㅏ-ㅣ: 모음 단독 형태
 * - a-zA-Z: 영어 대소문자
 * - 0-9: 숫자
 */
export const NICKNAME_ALLOWED_CHARACTERS = /[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9]/;

/**
 * 닉네임 허용 문자 제거 패턴 (replace에서 사용)
 * 허용되지 않은 문자를 제거하기 위한 negated character class
 */
export const NICKNAME_ALLOWED_PATTERN = /[^가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9]/g;

/**
 * 닉네임 전체 검증 패턴 (test에서 사용)
 * 문자열 전체가 허용된 문자로만 구성되어 있는지 검증
 */
export const NICKNAME_VALIDATION_PATTERN = /^[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9]+$/;
