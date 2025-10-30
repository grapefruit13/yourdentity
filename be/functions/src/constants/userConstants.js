/**
 * 사용자 관련 상수 정의
 */
const AUTH_TYPES = {
  SNS: "sns",
};

const SNS_PROVIDERS = {
  KAKAO: "kakao",
};

// 사용자 상태
const USER_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
};

// 자격 정지 상태
const SUSPENSION_TYPES = {
  TEMPORARY: "temporary",
  PERMANENT: "permanent",
  ACTIVE: "active", // 제재 미적용 상태 의미
};

// 기본 업로드 쿼터 (1GB)
const DEFAULT_UPLOAD_QUOTA_BYTES = 1073741824;

module.exports = {
  AUTH_TYPES,
  SNS_PROVIDERS,
  USER_STATUS,
  SUSPENSION_TYPES,
  DEFAULT_UPLOAD_QUOTA_BYTES,
};
