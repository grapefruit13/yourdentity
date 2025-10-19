import { API_PATH } from "@/constants/shared/_api-path";
import { get } from "@/lib/axios";
import {
  GETCommunityListReq,
  GETCommunityPostListReq,
} from "@/types/community/request";
import {
  GETCommunityListRes,
  GETCommunityPostListRes,
} from "@/types/community/response";
import { Result } from "@/types/shared/response";

/**
 * @description 커뮤니티 목록 조회
 */
const getList = async (request: GETCommunityListReq) => {
  const response = await get<Result<GETCommunityListRes>>(
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
const getPostList = async (request: GETCommunityPostListReq) => {
  const response = await get<Result<GETCommunityPostListRes>>(
    API_PATH.COMMUNITIES.POSTS,
    {
      params: request,
    }
  );
  return response.data;
};

export const communityApi = {
  getList,
  getPostList,
};
