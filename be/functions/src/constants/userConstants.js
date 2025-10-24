/**
 * 사용자 관련 상수 정의
 */

// 인증 타입
const AUTH_TYPES = {
  EMAIL: "email",
  SNS: "sns",
};

// 사용자 역할
const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
};

// 사용자 상태
const USER_STATUS = {
  CREATED: "CREATED",     // 최초 가입
  PENDING: "PENDING",     // 온보딩 완료, 이메일 인증 대기
  ACTIVE: "ACTIVE",       // 이메일 인증 완료
  SUSPENDED: "SUSPENDED", // 정지
  DELETED: "DELETED",     // 삭제
};

// 성별
const GENDER = {
  MALE: "MALE",
  FEMALE: "FEMALE",
};

module.exports = {
  AUTH_TYPES,
  USER_ROLES,
  USER_STATUS,
  GENDER,
};
