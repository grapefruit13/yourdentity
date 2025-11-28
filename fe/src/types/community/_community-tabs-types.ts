/**
 * @description 커뮤니티 탭 타입 정의
 */

import { COMMUNITY_TAB_VALUES } from "@/constants/community/_community-tabs-constants";

/**
 * @description 커뮤니티 탭 타입
 * - 상수 값으로부터 추출된 타입
 */
export type CommunityTab =
  (typeof COMMUNITY_TAB_VALUES)[keyof typeof COMMUNITY_TAB_VALUES];
