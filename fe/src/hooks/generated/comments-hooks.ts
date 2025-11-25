/**
 * @description Comments 관련 React Query Hooks
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */


import {
  useQuery,
  useMutation,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";
import * as Api from "@/api/generated/comments-api";
import { commentsKeys } from "@/constants/generated/query-keys";
import type * as Types from "@/types/generated/comments-types";

export const useDeleteCommentsById = <
  TContext = unknown,
  TVariables = Types.TDELETECommentsByIdReq,
>(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof Api.deleteCommentsById>>,
      Error,
      TVariables,
      TContext
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    Awaited<ReturnType<typeof Api.deleteCommentsById>>,
    Error,
    TVariables,
    TContext
  >({
    mutationFn: (variables: TVariables) =>
      Api.deleteCommentsById(variables as Types.TDELETECommentsByIdReq),
    ...options,
  });
};

export const usePutCommentsById = <
  TContext = unknown,
  TVariables = Types.TPUTCommentsByIdReq,
>(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof Api.putCommentsById>>,
      Error,
      TVariables,
      TContext
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    Awaited<ReturnType<typeof Api.putCommentsById>>,
    Error,
    TVariables,
    TContext
  >({
    mutationFn: (variables: TVariables) =>
      Api.putCommentsById(variables as Types.TPUTCommentsByIdReq),
    ...options,
  });
};

export const usePostCommentsLikeById = <
  TContext = unknown,
  TVariables = Types.TPOSTCommentsLikeByIdReq,
>(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof Api.postCommentsLikeById>>,
      Error,
      TVariables,
      TContext
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    Awaited<ReturnType<typeof Api.postCommentsLikeById>>,
    Error,
    TVariables,
    TContext
  >({
    mutationFn: (variables: TVariables) =>
      Api.postCommentsLikeById(variables as Types.TPOSTCommentsLikeByIdReq),
    ...options,
  });
};

export const useGetCommentsCommunitiesPostsByTwoIds = <
  TData = Types.TGETCommentsCommunitiesPostsByTwoIdsRes,
>(
  options: {
    request: Types.TGETCommentsCommunitiesPostsByTwoIdsReq;
  } & Omit<
    UseQueryOptions<
      Types.TGETCommentsCommunitiesPostsByTwoIdsRes,
      Error,
      TData
    >,
    "queryKey" | "queryFn"
  >
) => {
  const { request, ...queryOptions } = options;
  return useQuery<Types.TGETCommentsCommunitiesPostsByTwoIdsRes, Error, TData>({
    queryKey: commentsKeys.getCommentsCommunitiesPostsByTwoIds(request),
    queryFn: async () => {
      const response = await Api.getCommentsCommunitiesPostsByTwoIds(request);
      return response.data;
    },
    ...queryOptions,
  });
};

export const usePostCommentsCommunitiesPostsByTwoIds = <
  TContext = unknown,
  TVariables = Types.TPOSTCommentsCommunitiesPostsByTwoIdsReq,
>(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof Api.postCommentsCommunitiesPostsByTwoIds>>,
      Error,
      TVariables,
      TContext
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    Awaited<ReturnType<typeof Api.postCommentsCommunitiesPostsByTwoIds>>,
    Error,
    TVariables,
    TContext
  >({
    mutationFn: (variables: TVariables) =>
      Api.postCommentsCommunitiesPostsByTwoIds(
        variables as Types.TPOSTCommentsCommunitiesPostsByTwoIdsReq
      ),
    ...options,
  });
};
