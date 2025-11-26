import { useInfiniteQuery } from "@tanstack/react-query";
import * as Api from "@/api/generated/missions-api";
import { missionsKeys } from "@/constants/generated/query-keys";
import { DEFAULT_MISSIONS_PAGE_SIZE } from "@/constants/mission/_missions-infinite";
import type { TGETMissionsRes } from "@/types/generated/missions-types";
import type { BaseMissionsRequest } from "@/types/mission/infinite-types";

/**
 * @description 미션 목록 무한 스크롤용 훅
 * - cursor 기반 페이지네이션 (pageSize, startCursor)
 * - 필터/정렬 값이 변경되면 캐시 키가 변경되어 첫 페이지부터 다시 요청
 */
export const useInfiniteMissions = (baseRequest: BaseMissionsRequest) => {
  const pageSize = baseRequest.pageSize ?? DEFAULT_MISSIONS_PAGE_SIZE;

  return useInfiniteQuery<TGETMissionsRes, Error>({
    queryKey: missionsKeys.getMissions({
      ...baseRequest,
      pageSize,
      startCursor: undefined,
    }),
    queryFn: async ({ pageParam }) => {
      const response = await Api.getMissions({
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
