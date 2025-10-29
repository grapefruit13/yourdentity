/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @description Communities 관련 API 함수들
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import { get, post, put, patch, del } from "@/lib/axios";
import type * as Types from "@/types/generated/communities-types";
import type { Result } from "@/types/shared/response";

export const getCommunities = (request: Types.TGETCommunitiesReq) => {
  return get<Result<Types.TGETCommunitiesRes>>(`/communities`, {
    params: request,
  });
};

export const getCommunitiesPosts = (request: Types.TGETCommunitiesPostsReq) => {
  return get<Result<Types.TGETCommunitiesPostsRes>>(`/communities/posts`, {
    params: request,
  });
};

export const postCommunitiesPostsById = (
  request: Types.TPOSTCommunitiesPostsByIdReq
) => {
  const { communityId, ...data } = request;
  return post<Result<Types.TPOSTCommunitiesPostsByIdRes>>(
    `/communities/${request.communityId}/posts`,
    data
  );
};

export const getCommunitiesPostsByTwoIds = (
  request: Types.TGETCommunitiesPostsByTwoIdsReq
) => {
  return get<Result<Types.TGETCommunitiesPostsByTwoIdsRes>>(
    `/communities/${request.communityId}/posts/${request.postId}`
  );
};

export const putCommunitiesPostsByTwoIds = (
  request: Types.TPUTCommunitiesPostsByTwoIdsReq
) => {
  const { communityId, postId, ...data } = request;
  return put<Result<Types.TPUTCommunitiesPostsByTwoIdsRes>>(
    `/communities/${request.communityId}/posts/${request.postId}`,
    data
  );
};

export const deleteCommunitiesPostsByTwoIds = (
  request: Types.TDELETECommunitiesPostsByTwoIdsReq
) => {
  return del<Result<any>>(
    `/communities/${request.communityId}/posts/${request.postId}`
  );
};

export const postCommunitiesPostsLikeByTwoIds = (
  request: Types.TPOSTCommunitiesPostsLikeByTwoIdsReq
) => {
  return post<Result<Types.TPOSTCommunitiesPostsLikeByTwoIdsRes>>(
    `/communities/${request.communityId}/posts/${request.postId}/like`
  );
};
