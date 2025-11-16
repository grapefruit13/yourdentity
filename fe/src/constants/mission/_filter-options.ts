/**
 * @description 미션 필터 옵션 상수 정의
 */

import type {
  FilterOption,
  SingleSelectFilterId,
} from "@/types/mission/filter-types";

/**
 * @description 기본 단일 선택 필터 ID (전체)
 */
export const DEFAULT_SINGLE_SELECT_FILTER_ID: SingleSelectFilterId = "all";

/**
 * @description 찜한 미션 필터 ID
 */
export const LIKED_FILTER_ID: SingleSelectFilterId = "liked";

/**
 * @description 단일 선택 필터 옵션 (왼쪽 그룹)
 */
export const SINGLE_SELECT_FILTERS: FilterOption[] = [
  { id: DEFAULT_SINGLE_SELECT_FILTER_ID, label: "전체" },
  { id: LIKED_FILTER_ID, label: "찜한 미션" },
];

/**
 * @description 단일 선택 필터 옵션 (오른쪽 그룹)
 * 한 개만 선택 가능
 */
export const RIGHT_SELECT_FILTERS: FilterOption[] = [
  { id: "self-satisfaction", label: "자기 만족" },
  { id: "self-exploration", label: "자기 탐색" },
  { id: "self-exploration1", label: "자기 탐색1" },
  { id: "self-exploration2", label: "자기 탐색2" },
  { id: "self-exploration3", label: "자기 탐색3" },
];
