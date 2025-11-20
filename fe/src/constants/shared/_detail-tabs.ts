/**
 * @description 상세 페이지 탭 공용 상수
 */

export type ProgramDetailTabType = "detail" | "reviews" | "faq";

export const PROGRAM_DETAIL_TABS = [
  { id: "detail" as const, label: "상세 설명" },
  { id: "reviews" as const, label: "프로그램 후기" },
  { id: "faq" as const, label: "자주 묻는 질문" },
] as const;
