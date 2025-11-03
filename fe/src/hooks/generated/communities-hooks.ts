/**
 * @description Communities 관련 React Query Hooks
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import {
  useQuery,
  useMutation,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";
import * as Api from "@/api/generated/communities-api";
import { communitiesKeys } from "@/constants/generated/query-keys";
import type * as Types from "@/types/generated/communities-types";

export const useGetCommunities = <TData = Types.TGETCommunitiesRes>(
  options: {
    request: Types.TGETCommunitiesReq;
  } & Omit<
    UseQueryOptions<Types.TGETCommunitiesRes, Error, TData>,
    "queryKey" | "queryFn"
  >
) => {
  const { request, ...queryOptions } = options;
  return useQuery<Types.TGETCommunitiesRes, Error, TData>({
    queryKey: communitiesKeys.getCommunities(request),
    queryFn: async () => {
      const response = await Api.getCommunities(request);
      return response.data;
    },
    ...queryOptions,
  });
};

export const useGetCommunitiesPosts = <TData = Types.TGETCommunitiesPostsRes>(
  options: {
    request: Types.TGETCommunitiesPostsReq;
  } & Omit<
    UseQueryOptions<Types.TGETCommunitiesPostsRes, Error, TData>,
    "queryKey" | "queryFn"
  >
) => {
  const { request, ...queryOptions } = options;
  return useQuery<Types.TGETCommunitiesPostsRes, Error, TData>({
    queryKey: communitiesKeys.getCommunitiesPosts(request),
    queryFn: async () => {
      const response = await Api.getCommunitiesPosts(request);
      return response.data;
    },
    ...queryOptions,
  });
};

export const usePostCommunitiesPostsById = <
  TContext = unknown,
  TVariables = Types.TPOSTCommunitiesPostsByIdReq,
>(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof Api.postCommunitiesPostsById>>,
      Error,
      TVariables,
      TContext
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    Awaited<ReturnType<typeof Api.postCommunitiesPostsById>>,
    Error,
    TVariables,
    TContext
  >({
    mutationFn: (variables: TVariables) =>
      Api.postCommunitiesPostsById(
        variables as Types.TPOSTCommunitiesPostsByIdReq
      ),
    ...options,
  });
};

export const useGetCommunitiesPostsByTwoIds = <
  TData = Types.TGETCommunitiesPostsByTwoIdsRes,
>(
  options: {
    request: Types.TGETCommunitiesPostsByTwoIdsReq;
  } & Omit<
    UseQueryOptions<Types.TGETCommunitiesPostsByTwoIdsRes, Error, TData>,
    "queryKey" | "queryFn"
  >
) => {
  const { request, ...queryOptions } = options;
  return useQuery<Types.TGETCommunitiesPostsByTwoIdsRes, Error, TData>({
    queryKey: communitiesKeys.getCommunitiesPostsByTwoIds(request),
    queryFn: async () => {
      const response = await Api.getCommunitiesPostsByTwoIds(request);
      return response.data;
    },
    ...queryOptions,
  });
};

export const usePutCommunitiesPostsByTwoIds = <
  TContext = unknown,
  TVariables = Types.TPUTCommunitiesPostsByTwoIdsReq,
>(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof Api.putCommunitiesPostsByTwoIds>>,
      Error,
      TVariables,
      TContext
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    Awaited<ReturnType<typeof Api.putCommunitiesPostsByTwoIds>>,
    Error,
    TVariables,
    TContext
  >({
    mutationFn: (variables: TVariables) =>
      Api.putCommunitiesPostsByTwoIds(
        variables as Types.TPUTCommunitiesPostsByTwoIdsReq
      ),
    ...options,
  });
};

export const useDeleteCommunitiesPostsByTwoIds = <
  TContext = unknown,
  TVariables = Types.TDELETECommunitiesPostsByTwoIdsReq,
>(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof Api.deleteCommunitiesPostsByTwoIds>>,
      Error,
      TVariables,
      TContext
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    Awaited<ReturnType<typeof Api.deleteCommunitiesPostsByTwoIds>>,
    Error,
    TVariables,
    TContext
  >({
    mutationFn: (variables: TVariables) =>
      Api.deleteCommunitiesPostsByTwoIds(
        variables as Types.TDELETECommunitiesPostsByTwoIdsReq
      ),
    ...options,
  });
};

export const usePostCommunitiesPostsLikeByTwoIds = <
  TContext = unknown,
  TVariables = Types.TPOSTCommunitiesPostsLikeByTwoIdsReq,
>(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof Api.postCommunitiesPostsLikeByTwoIds>>,
      Error,
      TVariables,
      TContext
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    Awaited<ReturnType<typeof Api.postCommunitiesPostsLikeByTwoIds>>,
    Error,
    TVariables,
    TContext
  >({
    mutationFn: (variables: TVariables) =>
      Api.postCommunitiesPostsLikeByTwoIds(
        variables as Types.TPOSTCommunitiesPostsLikeByTwoIdsReq
      ),
    ...options,
  });
};
