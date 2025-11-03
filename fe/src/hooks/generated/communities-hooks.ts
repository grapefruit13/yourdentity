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

export const useGetCommunities = <
  TData = Awaited<ReturnType<typeof Api.getCommunities>>,
>(
  options: {
    request: Types.TGETCommunitiesReq;
  } & Omit<
    UseQueryOptions<
      Awaited<ReturnType<typeof Api.getCommunities>>,
      Error,
      TData
    >,
    "queryKey" | "queryFn"
  >
) => {
  const { request, ...queryOptions } = options;
  return useQuery<Awaited<ReturnType<typeof Api.getCommunities>>, Error, TData>(
    {
      queryKey: communitiesKeys.getCommunities(request),
      queryFn: () => Api.getCommunities(request),
      ...queryOptions,
    }
  );
};

export const useGetCommunitiesPosts = <
  TData = Awaited<ReturnType<typeof Api.getCommunitiesPosts>>,
>(
  options: {
    request: Types.TGETCommunitiesPostsReq;
  } & Omit<
    UseQueryOptions<
      Awaited<ReturnType<typeof Api.getCommunitiesPosts>>,
      Error,
      TData
    >,
    "queryKey" | "queryFn"
  >
) => {
  const { request, ...queryOptions } = options;
  return useQuery<
    Awaited<ReturnType<typeof Api.getCommunitiesPosts>>,
    Error,
    TData
  >({
    queryKey: communitiesKeys.getCommunitiesPosts(request),
    queryFn: () => Api.getCommunitiesPosts(request),
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
  TData = Awaited<ReturnType<typeof Api.getCommunitiesPostsByTwoIds>>,
>(
  options: {
    request: Types.TGETCommunitiesPostsByTwoIdsReq;
  } & Omit<
    UseQueryOptions<
      Awaited<ReturnType<typeof Api.getCommunitiesPostsByTwoIds>>,
      Error,
      TData
    >,
    "queryKey" | "queryFn"
  >
) => {
  const { request, ...queryOptions } = options;
  return useQuery<
    Awaited<ReturnType<typeof Api.getCommunitiesPostsByTwoIds>>,
    Error,
    TData
  >({
    queryKey: communitiesKeys.getCommunitiesPostsByTwoIds(request),
    queryFn: () => Api.getCommunitiesPostsByTwoIds(request),
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
