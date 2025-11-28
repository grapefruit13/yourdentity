/**
 * @description 커뮤니티 탭 상수 정의
 */

/**
 * @description 커뮤니티 탭 값 상수
 */
export const COMMUNITY_TAB_VALUES = {
  PROGRAM: "program",
  MISSION: "mission",
} as const;

/**
 * @description 커뮤니티 탭 라벨 매핑
 */
export const COMMUNITY_TAB_LABELS: Record<
  (typeof COMMUNITY_TAB_VALUES)[keyof typeof COMMUNITY_TAB_VALUES],
  string
> = {
  [COMMUNITY_TAB_VALUES.PROGRAM]: "프로그램",
  [COMMUNITY_TAB_VALUES.MISSION]: "미션",
} as const;
