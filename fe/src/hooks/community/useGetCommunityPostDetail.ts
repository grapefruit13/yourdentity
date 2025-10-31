import { useQuery } from "@tanstack/react-query";
import { communityApi } from "@/api/community";
import { communityKeys } from "@/constants/community/_query-keys";
import { GETCommunityPostDetailReq } from "@/types/community/request";
import { debug } from "@/utils/shared/debugger";

/**
 * @description 커뮤니티 게시글 상세 조회
 */
export const useGetCommunityPostDetail = (request: GETCommunityPostDetailReq) =>
  useQuery({
    queryKey: communityKeys.postDetail(request),
    queryFn: async () => {
      debug.log("API 호출 시작:", {
        communityId: request.communityId,
        postId: request.postId,
      });
      try {
        const result = await communityApi.getPostDetail(request);
        debug.log("API 호출 성공:", result);
        return result;
      } catch (error) {
        debug.error("API 호출 실패:", error);
        throw error;
      }
    },
    enabled: !!request.communityId && !!request.postId,
  });
