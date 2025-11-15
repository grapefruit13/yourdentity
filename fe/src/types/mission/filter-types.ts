/**
 * @description 미션 필터 타입 정의
 */

export type SingleSelectFilterId = "all" | "liked";

export type MultiSelectFilterId =
  | "self-satisfaction"
  | "self-exploration"
  | string;

export interface FilterOption {
  id: SingleSelectFilterId | MultiSelectFilterId;
  label: string;
}
