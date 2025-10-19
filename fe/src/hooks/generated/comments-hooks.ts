/**
 * @description Comments 관련 React Query Hooks
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import { useQuery, useMutation } from "@tanstack/react-query";
import * as Api from "@/api/generated/comments-api";
import { commentsKeys } from "@/constants/generated/query-keys";
import type * as Types from "@/types/generated/comments-types";

export const useGetCommentsCommunitiesPostsByTwoIds = (
  request: Types.TGETCommentsCommunitiesPostsByTwoIdsReq
) => {
  return useQuery({
    queryKey: commentsKeys.getCommentsCommunitiesPostsByTwoIds,
    queryFn: () => Api.getCommentsCommunitiesPostsByTwoIds(request),
  });
};

export const usePostCommentsCommunitiesPostsByTwoIds = () => {
  return useMutation({
    mutationFn: (request: Types.TPOSTCommentsCommunitiesPostsByTwoIdsReq) =>
      Api.postCommentsCommunitiesPostsByTwoIds(request),
  });
};

export const usePutCommentsById = () => {
  return useMutation({
    mutationFn: (request: Types.TPUTCommentsByIdReq) =>
      Api.putCommentsById(request),
  });
};

export const useDeleteCommentsById = () => {
  return useMutation({
    mutationFn: (request: Types.TDELETECommentsByIdReq) =>
      Api.deleteCommentsById(request),
  });
};

export const usePostCommentsLikeById = () => {
  return useMutation({
    mutationFn: (request: Types.TPOSTCommentsLikeByIdReq) =>
      Api.postCommentsLikeById(request),
  });
};
