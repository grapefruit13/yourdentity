import { useQuery } from "@tanstack/react-query";
import { communityApi } from "@/api/community";
import { communityKeys } from "@/constants/community/_query-keys";
import { GETCommunityPostDetailReq } from "@/types/community/request";

/**
 * @description 커뮤니티 게시글 상세 조회
 */
export const useGetCommunityPostDetail = (request: GETCommunityPostDetailReq) =>
  useQuery({
    queryKey: communityKeys.postDetail(request),
    queryFn: () => communityApi.getPostDetail(request),
    enabled: !!request.communityId && !!request.postId,
  });
