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

export const useGetTmis = <TData = Awaited<ReturnType<typeof Api.getTmis>>>(
  options: {
    request: Types.TGETTmisReq;
  } & Omit<
    UseQueryOptions<Awaited<ReturnType<typeof Api.getTmis>>, Error, TData>,
    "queryKey" | "queryFn"
  >
) => {
  const { request, ...queryOptions } = options;
  return useQuery<Awaited<ReturnType<typeof Api.getTmis>>, Error, TData>({
    queryKey: tmiKeys.getTmis(request),
    queryFn: () => Api.getTmis(request),
    ...queryOptions,
  });
};

export const useGetTmisById = <
  TData = Awaited<ReturnType<typeof Api.getTmisById>>,
>(
  options: {
    request: Types.TGETTmisByIdReq;
  } & Omit<
    UseQueryOptions<Awaited<ReturnType<typeof Api.getTmisById>>, Error, TData>,
    "queryKey" | "queryFn"
  >
) => {
  const { request, ...queryOptions } = options;
  return useQuery<Awaited<ReturnType<typeof Api.getTmisById>>, Error, TData>({
    queryKey: tmiKeys.getTmisById(request),
    queryFn: () => Api.getTmisById(request),
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
    mutationFn: (request: Types.TPOSTTmisApplyByIdReq) =>
      Api.postTmisApplyById(request),
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
    mutationFn: (request: Types.TPOSTTmisLikeByIdReq) =>
      Api.postTmisLikeById(request),
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
    mutationFn: (request: Types.TPOSTTmisQnaByIdReq) =>
      Api.postTmisQnaById(request),
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
    mutationFn: (request: Types.TPUTTmisQnaByTwoIdsReq) =>
      Api.putTmisQnaByTwoIds(request),
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
    mutationFn: (request: Types.TPOSTTmisQnaLikeByIdReq) =>
      Api.postTmisQnaLikeById(request),
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
    mutationFn: (request: Types.TDELETETmisQnaByIdReq) =>
      Api.deleteTmisQnaById(request),
    ...options,
  });
};
