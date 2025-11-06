import { API_PATH } from "@/constants/shared/_api-path";
import { get } from "@/lib/axios";
import {
  TGETCommunitiesReq,
  TGETCommunitiesRes,
  TGETCommunitiesPostsReq,
  TGETCommunitiesPostsRes,
  TGETCommunitiesPostsByTwoIdsReq,
  TGETCommunitiesPostsByTwoIdsRes,
} from "@/types/generated/communities-types";
import { Result } from "@/types/shared/response";

/**
 * @description 커뮤니티 목록 조회
 */
const getList = async (request: TGETCommunitiesReq) => {
  const response = await get<Result<TGETCommunitiesRes>>(
    API_PATH.COMMUNITIES.ROOT,
    {
      params: request,
    }
  );
  return response.data;
};

/**
 * @description 전체 커뮤니티 포스트 조회
 */
const getPostList = async (request: TGETCommunitiesPostsReq) => {
  const response = await get<Result<TGETCommunitiesPostsRes>>(
    API_PATH.COMMUNITIES.POSTS,
    {
      params: request,
    }
  );
  return response.data;
};

/**
 * @description 커뮤니티 게시글 상세 조회
 */
const getPostDetail = async (request: TGETCommunitiesPostsByTwoIdsReq) => {
  const response = await get<Result<TGETCommunitiesPostsByTwoIdsRes>>(
    API_PATH.COMMUNITIES.POST_DETAIL(request.communityId, request.postId)
  );
  return response.data;
};

export const communityApi = {
  getList,
  getPostList,
  getPostDetail,
};
