/**
 * 약관 버전 상수
 */
const TERMS_VERSIONS = {
  SERVICE: "v1",
  PRIVACY: "v1",
  PERSONAL: "v1",
};

// 카카오 간편가입 약관 태그 (카카오 콘솔 설정과 일치해야 함)
const TERMS_TAGS = {
  SERVICE: "terms_service",     // 서비스 이용약관
  PRIVACY: "terms_privacy",     // 개인정보 처리방침
  PERSONAL: "consent_privacy",  // 개인정보 수집 이용 동의
  AGE14: "user_age_check",      // 만 14세 이상 동의
  MARKETING: "consent_marketing",      // 이벤트 홍보 등을 위한 개인정보 이용 및 정보 수신 동의
};

module.exports = {
  TERMS_VERSIONS,
  TERMS_TAGS,
};


