/**
 * @description TMI 관련 React Query Hooks
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import {
  useQuery,
  useMutation,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";
import * as Api from "@/api/generated/tmi-api";
import { tmiKeys } from "@/constants/generated/query-keys";
import type * as Types from "@/types/generated/tmi-types";

export const useGetTmis = <TData = Types.TGETTmisRes>(
  options: {
    request: Types.TGETTmisReq;
  } & Omit<
    UseQueryOptions<Types.TGETTmisRes, Error, TData>,
    "queryKey" | "queryFn"
  >
) => {
  const { request, ...queryOptions } = options;
  return useQuery<Types.TGETTmisRes, Error, TData>({
    queryKey: tmiKeys.getTmis(request),
    queryFn: async () => {
      const response = await Api.getTmis(request);
      return response.data;
    },
    ...queryOptions,
  });
};

export const useGetTmisById = <TData = Types.TGETTmisByIdRes>(
  options: {
    request: Types.TGETTmisByIdReq;
  } & Omit<
    UseQueryOptions<Types.TGETTmisByIdRes, Error, TData>,
    "queryKey" | "queryFn"
  >
) => {
  const { request, ...queryOptions } = options;
  return useQuery<Types.TGETTmisByIdRes, Error, TData>({
    queryKey: tmiKeys.getTmisById(request),
    queryFn: async () => {
      const response = await Api.getTmisById(request);
      return response.data;
    },
    ...queryOptions,
  });
};

export const usePostTmisApplyById = <
  TContext = unknown,
  TVariables = Types.TPOSTTmisApplyByIdReq,
>(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof Api.postTmisApplyById>>,
      Error,
      TVariables,
      TContext
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    Awaited<ReturnType<typeof Api.postTmisApplyById>>,
    Error,
    TVariables,
    TContext
  >({
    mutationFn: (variables: TVariables) =>
      Api.postTmisApplyById(variables as Types.TPOSTTmisApplyByIdReq),
    ...options,
  });
};

export const usePostTmisLikeById = <
  TContext = unknown,
  TVariables = Types.TPOSTTmisLikeByIdReq,
>(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof Api.postTmisLikeById>>,
      Error,
      TVariables,
      TContext
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    Awaited<ReturnType<typeof Api.postTmisLikeById>>,
    Error,
    TVariables,
    TContext
  >({
    mutationFn: (variables: TVariables) =>
      Api.postTmisLikeById(variables as Types.TPOSTTmisLikeByIdReq),
    ...options,
  });
};

export const usePostTmisQnaById = <
  TContext = unknown,
  TVariables = Types.TPOSTTmisQnaByIdReq,
>(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof Api.postTmisQnaById>>,
      Error,
      TVariables,
      TContext
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    Awaited<ReturnType<typeof Api.postTmisQnaById>>,
    Error,
    TVariables,
    TContext
  >({
    mutationFn: (variables: TVariables) =>
      Api.postTmisQnaById(variables as Types.TPOSTTmisQnaByIdReq),
    ...options,
  });
};

export const usePutTmisQnaByTwoIds = <
  TContext = unknown,
  TVariables = Types.TPUTTmisQnaByTwoIdsReq,
>(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof Api.putTmisQnaByTwoIds>>,
      Error,
      TVariables,
      TContext
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    Awaited<ReturnType<typeof Api.putTmisQnaByTwoIds>>,
    Error,
    TVariables,
    TContext
  >({
    mutationFn: (variables: TVariables) =>
      Api.putTmisQnaByTwoIds(variables as Types.TPUTTmisQnaByTwoIdsReq),
    ...options,
  });
};

export const usePostTmisQnaLikeById = <
  TContext = unknown,
  TVariables = Types.TPOSTTmisQnaLikeByIdReq,
>(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof Api.postTmisQnaLikeById>>,
      Error,
      TVariables,
      TContext
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    Awaited<ReturnType<typeof Api.postTmisQnaLikeById>>,
    Error,
    TVariables,
    TContext
  >({
    mutationFn: (variables: TVariables) =>
      Api.postTmisQnaLikeById(variables as Types.TPOSTTmisQnaLikeByIdReq),
    ...options,
  });
};

export const useDeleteTmisQnaById = <
  TContext = unknown,
  TVariables = Types.TDELETETmisQnaByIdReq,
>(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof Api.deleteTmisQnaById>>,
      Error,
      TVariables,
      TContext
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    Awaited<ReturnType<typeof Api.deleteTmisQnaById>>,
    Error,
    TVariables,
    TContext
  >({
    mutationFn: (variables: TVariables) =>
      Api.deleteTmisQnaById(variables as Types.TDELETETmisQnaByIdReq),
    ...options,
  });
};
