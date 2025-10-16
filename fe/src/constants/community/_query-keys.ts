import { KEY } from "@/constants/shared/_query-keys-base";
import {
  GETCommunityListReq,
  GETCommunityPostListReq,
} from "@/types/community/request";

const { BASE, COMMON } = KEY;

/**
 * @description 커뮤니티 서비스 Query Key 정의
 * BASE KEY에 정의된 키 사용하여 키 충돌 방지
 */
const COMMUNITY_KEYS = {
  LIST: [BASE.COMMUNITY, COMMON.LIST] as const,
  POST_LIST: [BASE.COMMUNITY, BASE.POST, COMMON.LIST] as const,
} as const;

export const communityKeys = {
  all: [BASE.COMMUNITY] as const,
  list: (request: GETCommunityListReq) =>
    [...COMMUNITY_KEYS.LIST, request.page, request.size, request.type] as const,
  postList: (request: GETCommunityPostListReq) =>
    [
      ...COMMUNITY_KEYS.POST_LIST,
      request.page,
      request.size,
      request.filter,
    ] as const,
} as const;
