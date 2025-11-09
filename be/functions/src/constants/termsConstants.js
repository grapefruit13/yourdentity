/**
 * 약관 버전 상수
 */
const TERMS_VERSIONS = {
  SERVICE: "v1",
  PRIVACY: "v1",
};

// 카카오 간편가입 약관 태그 (카카오 콘솔 설정과 일치해야 함)
const TERMS_TAGS = {
  SERVICE: "terms_service",     // 카카오 API: "terms_service"
  PRIVACY: "terms_privacy",     // 카카오 API: "terms_privacy"
  AGE14: "user_age_check",      // 카카오 API: "user_age_check" (고정)
  PUSH: "terms_push",           // 카카오 API: "terms_push"
};

module.exports = {
  TERMS_VERSIONS,
  TERMS_TAGS,
};


