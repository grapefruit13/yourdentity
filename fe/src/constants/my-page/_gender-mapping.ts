/**
 * @description 성별 매핑 상수
 */

export const GENDER_MAPPING = {
  female: "여성",
  male: "남성",
} as const;

export type GenderKey = keyof typeof GENDER_MAPPING;
