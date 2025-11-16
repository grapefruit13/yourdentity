/**
 * @description 미션 정렬 옵션 상수 정의
 */

import type { SortOption } from "@/components/shared/SortDropdown";
import type { SortType } from "@/types/mission/sort-types";

/**
 * @description 미션 정렬 옵션
 */
export const MISSION_SORT_OPTIONS: SortOption<SortType>[] = [
  { value: "latest", label: "최신순" },
  { value: "oldest", label: "오래된 순" },
];
