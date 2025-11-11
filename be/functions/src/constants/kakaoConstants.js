/**
 * 카카오 API 관련 상수
 */

// 카카오 API 타임아웃 (10초)
const KAKAO_API_TIMEOUT = 10000;

// 카카오 API 재시도 지연 시간 (1.5초)
const KAKAO_API_RETRY_DELAY = 1500;

// 카카오 API 최대 재시도 횟수
const KAKAO_API_MAX_RETRIES = 2;

module.exports = {
  KAKAO_API_TIMEOUT,
  KAKAO_API_RETRY_DELAY,
  KAKAO_API_MAX_RETRIES,
};

