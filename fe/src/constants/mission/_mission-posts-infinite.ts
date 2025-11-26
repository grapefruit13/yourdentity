import type { TGETMissionsPostsReq } from "@/types/generated/missions-types";

export const DEFAULT_MISSION_POSTS_PAGE_SIZE = 20;

export type BaseMissionPostsRequest = Omit<
  TGETMissionsPostsReq,
  "pageSize" | "startCursor"
> & {
  pageSize?: number;
};
