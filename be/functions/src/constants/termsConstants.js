/**
 * 약관 버전 상수
 */
const TERMS_VERSIONS = {
  SERVICE: "v1",
  PRIVACY: "v1",
  AGE14: "v1",
  PUSH: "v1",
};

// 카카오 간편가입 약관 태그 (카카오 콘솔 설정과 일치해야 함)
const TERMS_TAGS = {
  SERVICE: "terms_service_v1",
  PRIVACY: "terms_privacy_v1",
  AGE14: "user_age_check", // 만 14세 이상 고정 태그
  PUSH: "terms_push_v1",
};

module.exports = {
  TERMS_VERSIONS,
  TERMS_TAGS,
};


