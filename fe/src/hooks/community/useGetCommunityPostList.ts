import { useQuery } from "@tanstack/react-query";
import { communityApi } from "@/api/community";
import { communityKeys } from "@/constants/community/_query-keys";
import { GETCommunityPostListReq } from "@/types/community/request";

/**
 * @description 커뮤니티 포스트 목록 조회
 */
export const useGetCommunityPostList = (request: GETCommunityPostListReq) =>
  useQuery({
    queryKey: communityKeys.postList(request),
    queryFn: () => communityApi.getPostList(request),
  });
