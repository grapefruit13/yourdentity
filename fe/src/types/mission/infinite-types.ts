import type { TGETMissionsReq } from "@/types/generated/missions-types";

/**
 * @description 미션 목록 무한스크롤 공통 요청 타입
 * - 페이지네이션 필드(pageSize, startCursor)는 훅 내부에서 관리
 */
export type BaseMissionsRequest = Omit<
  TGETMissionsReq,
  "pageSize" | "startCursor"
> & {
  pageSize?: number;
};
