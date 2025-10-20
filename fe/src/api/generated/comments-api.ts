/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @description Comments 관련 API 함수들
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import { get, post, put, patch, del } from "@/lib/axios";
import type * as Types from "@/types/generated/comments-types";
import type { Result } from "@/types/shared/response";

export const getCommentsCommunitiesPostsByTwoIds = (
  request: Types.TGETCommentsCommunitiesPostsByTwoIdsReq
) => {
  return get<Result<Types.TGETCommentsCommunitiesPostsByTwoIdsRes>>(
    `/comments/communities/${request.communityId}/posts/${request.postId}`
  );
};

export const postCommentsCommunitiesPostsByTwoIds = (
  request: Types.TPOSTCommentsCommunitiesPostsByTwoIdsReq
) => {
  const { communityId, postId, ...data } = request;
  return post<Result<Types.TPOSTCommentsCommunitiesPostsByTwoIdsRes>>(
    `/comments/communities/${request.communityId}/posts/${request.postId}`,
    data
  );
};

export const putCommentsById = (request: Types.TPUTCommentsByIdReq) => {
  const { commentId, ...data } = request;
  return put<Result<Types.TPUTCommentsByIdRes>>(
    `/comments/${request.commentId}`,
    data
  );
};

export const deleteCommentsById = (request: Types.TDELETECommentsByIdReq) => {
  return del<Result<any>>(`/comments/${request.commentId}`);
};

export const postCommentsLikeById = (
  request: Types.TPOSTCommentsLikeByIdReq
) => {
  return post<Result<Types.TPOSTCommentsLikeByIdRes>>(
    `/comments/${request.commentId}/like`
  );
};
