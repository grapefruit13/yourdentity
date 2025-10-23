/**
 * @description Communities 관련 React Query Hooks
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import { useQuery, useMutation } from "@tanstack/react-query";
import * as Api from "@/api/generated/communities-api";
import { communitiesKeys } from "@/constants/generated/query-keys";
import type * as Types from "@/types/generated/communities-types";

export const useGetCommunities = (request: Types.TGETCommunitiesReq) => {
  return useQuery({
    queryKey: communitiesKeys.getCommunities(request),
    queryFn: () => Api.getCommunities(request),
  });
};

export const useGetCommunitiesPosts = (
  request: Types.TGETCommunitiesPostsReq
) => {
  return useQuery({
    queryKey: communitiesKeys.getCommunitiesPosts(request),
    queryFn: () => Api.getCommunitiesPosts(request),
  });
};

export const useGetCommunitiesById = (
  request: Types.TGETCommunitiesByIdReq
) => {
  return useQuery({
    queryKey: communitiesKeys.getCommunitiesById(request),
    queryFn: () => Api.getCommunitiesById(request),
  });
};

export const useGetCommunitiesMembersById = (
  request: Types.TGETCommunitiesMembersByIdReq
) => {
  return useQuery({
    queryKey: communitiesKeys.getCommunitiesMembersById(request),
    queryFn: () => Api.getCommunitiesMembersById(request),
  });
};

export const useGetCommunitiesPostsById = (
  request: Types.TGETCommunitiesPostsByIdReq
) => {
  return useQuery({
    queryKey: communitiesKeys.getCommunitiesPostsById(request),
    queryFn: () => Api.getCommunitiesPostsById(request),
  });
};

export const usePostCommunitiesPostsById = () => {
  return useMutation({
    mutationFn: (request: Types.TPOSTCommunitiesPostsByIdReq) =>
      Api.postCommunitiesPostsById(request),
  });
};

export const useGetCommunitiesPostsByTwoIds = (
  request: Types.TGETCommunitiesPostsByTwoIdsReq
) => {
  return useQuery({
    queryKey: communitiesKeys.getCommunitiesPostsByTwoIds(request),
    queryFn: () => Api.getCommunitiesPostsByTwoIds(request),
  });
};

export const usePutCommunitiesPostsByTwoIds = () => {
  return useMutation({
    mutationFn: (request: Types.TPUTCommunitiesPostsByTwoIdsReq) =>
      Api.putCommunitiesPostsByTwoIds(request),
  });
};

export const useDeleteCommunitiesPostsByTwoIds = () => {
  return useMutation({
    mutationFn: (request: Types.TDELETECommunitiesPostsByTwoIdsReq) =>
      Api.deleteCommunitiesPostsByTwoIds(request),
  });
};

export const usePostCommunitiesPostsLikeByTwoIds = () => {
  return useMutation({
    mutationFn: (request: Types.TPOSTCommunitiesPostsLikeByTwoIdsReq) =>
      Api.postCommunitiesPostsLikeByTwoIds(request),
  });
};
