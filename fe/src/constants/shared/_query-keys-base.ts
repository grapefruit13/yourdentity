/**
 * @description Query Key 네임스페이스 정의
 * 각 서비스별로 고유한 네임스페이스를 사용하여 키 충돌 방지
 */
const BASE_KEY = {
  USER: "user",
  MISSION: "mission",
  IMAGE: "image",
  ROUTINE: "routine",
  GATHERING: "gathering",
  COMMUNITY: "community",
  ANNOUNCEMENT: "announcement",
  FAQ: "faqs",
  AUTH: "auth",
  COMMENT: "comments",
  REPORT: "reportContent",
  STORE: "store",
  TMI: "tmis",
  NOTION: "notion",
  POST: "post",
} as const;

/**
 * @description 공통 Query Key 패턴
 */
const COMMON_KEY = {
  LIST: "list",
  DETAIL: "detail",
} as const;

export const KEY = {
  BASE: BASE_KEY,
  COMMON: COMMON_KEY,
};
