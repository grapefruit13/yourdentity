import { useInfiniteQuery } from "@tanstack/react-query";
import * as Api from "@/api/generated/missions-api";
import { missionsKeys } from "@/constants/generated/query-keys";
import {
  DEFAULT_MISSION_POSTS_PAGE_SIZE,
  type BaseMissionPostsRequest,
} from "@/constants/mission/_mission-posts-infinite";
import type { TGETMissionsPostsRes } from "@/types/generated/missions-types";

/**
 * @description 미션 인증글 목록 무한 스크롤용 훅
 * - cursor 기반 페이지네이션 (pageSize, startCursor)
 * - 필터 값이 변경되면 캐시 키가 변경되어 첫 페이지부터 다시 요청
 */
export const useInfiniteMissionPosts = (
  baseRequest: BaseMissionPostsRequest
) => {
  const pageSize = baseRequest.pageSize ?? DEFAULT_MISSION_POSTS_PAGE_SIZE;

  return useInfiniteQuery<TGETMissionsPostsRes, Error>({
    queryKey: missionsKeys.getMissionsPosts({
      ...baseRequest,
      pageSize,
      startCursor: undefined,
    }),
    queryFn: async ({ pageParam }) => {
      const response = await Api.getMissionsPosts({
        ...baseRequest,
        pageSize,
        ...(pageParam ? { startCursor: pageParam as string } : {}),
      });
      return response.data;
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo?.hasNext ? lastPage.pageInfo.nextCursor : undefined,
  });
};
