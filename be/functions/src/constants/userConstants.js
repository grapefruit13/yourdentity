/**
 * 사용자 관련 상수 정의
 */
const AUTH_TYPES = {
  SNS: "sns",
};

const SNS_PROVIDERS = {
  KAKAO: "kakao",
};

// 기본 업로드 쿼터 (1GB)
const DEFAULT_UPLOAD_QUOTA_BYTES = 1073741824;

module.exports = {
  AUTH_TYPES,
  SNS_PROVIDERS,
  DEFAULT_UPLOAD_QUOTA_BYTES,
};
