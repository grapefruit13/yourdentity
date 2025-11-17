/**
 * @description 미션 필터 타입 정의
 */

export type SingleSelectFilterId = "all" | "liked";

export interface TFilterOption {
  id: string;
  label: string;
}
