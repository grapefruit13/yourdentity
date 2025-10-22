/**
 * user_terms 컬렉션 스키마 정의
 * 
 * 컬렉션 구조: Root Collection (비용 효율 + 통계 쿼리 용이)
 * - user_terms/{recordId}
 * 
 * 히스토리 관리:
 * - 사용자가 약관에 동의/철회할 때마다 새 레코드 생성
 * - 동일 userId + type + version에 대해 최신 레코드 조회
 * 
 * 인덱스 필요:
 * - userId (ASC) + type (ASC) + agreedAt (DESC)
 * - type (ASC) + version (ASC) + agreedAt (DESC)
 */

/**
 * @typedef {Object} UserTerm
 * @property {string} userId - 사용자 UID
 * @property {"SERVICE" | "PRIVACY" | "MARKETING" | "THIRD_PARTY"} type - 약관 타입
 * @property {string} version - 약관 버전 (예: "v1.0.0")
 * @property {boolean} agreed - 동의 여부
 * @property {FirebaseFirestore.Timestamp | null} agreedAt - 동의 시각
 * @property {FirebaseFirestore.Timestamp} createdAt - 레코드 생성 시각
 */

const TERM_TYPES = {
  SERVICE: "SERVICE", // 서비스 이용약관 (필수)
  PRIVACY: "PRIVACY", // 개인정보 처리방침 (필수)
  MARKETING: "MARKETING", // 마케팅 수신 동의 (선택)
  THIRD_PARTY: "THIRD_PARTY", // 제3자 정보 제공 동의 (선택)
};

// 현재 버전 (배포 시 업데이트 필요)
const CURRENT_VERSIONS = {
  SERVICE: "v1.0.0",
  PRIVACY: "v1.0.0",
  MARKETING: "v1.0.0",
  THIRD_PARTY: "v1.0.0",
};

// 필수 약관 목록
const REQUIRED_TERMS = [TERM_TYPES.SERVICE, TERM_TYPES.PRIVACY];

module.exports = {
  TERM_TYPES,
  CURRENT_VERSIONS,
  REQUIRED_TERMS,
};

