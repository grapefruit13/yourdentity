import { useQuery } from "@tanstack/react-query";
import { communityApi } from "@/api/community";
import { communityKeys } from "@/constants/community/_query-keys";
import { GETCommunityListReq } from "@/types/community/request";

/**
 * @description 커뮤니티 목록 조회
 */
export const useGetCommunityList = (request: GETCommunityListReq) =>
  useQuery({
    queryKey: communityKeys.list(request),
    queryFn: () => communityApi.getList(request),
  });
