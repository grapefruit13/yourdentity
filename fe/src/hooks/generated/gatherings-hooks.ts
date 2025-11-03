/**
 * @description Gatherings 관련 React Query Hooks
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import {
  useQuery,
  useMutation,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";
import * as Api from "@/api/generated/gatherings-api";
import { gatheringsKeys } from "@/constants/generated/query-keys";
import type * as Types from "@/types/generated/gatherings-types";

export const useGetGatherings = <
  TData = Awaited<ReturnType<typeof Api.getGatherings>>,
>(
  options: {
    request: Types.TGETGatheringsReq;
  } & Omit<
    UseQueryOptions<
      Awaited<ReturnType<typeof Api.getGatherings>>,
      Error,
      TData
    >,
    "queryKey" | "queryFn"
  >
) => {
  const { request, ...queryOptions } = options;
  return useQuery<Awaited<ReturnType<typeof Api.getGatherings>>, Error, TData>({
    queryKey: gatheringsKeys.getGatherings(request),
    queryFn: () => Api.getGatherings(request),
    ...queryOptions,
  });
};

export const useGetGatheringsById = <
  TData = Awaited<ReturnType<typeof Api.getGatheringsById>>,
>(
  options: {
    request: Types.TGETGatheringsByIdReq;
  } & Omit<
    UseQueryOptions<
      Awaited<ReturnType<typeof Api.getGatheringsById>>,
      Error,
      TData
    >,
    "queryKey" | "queryFn"
  >
) => {
  const { request, ...queryOptions } = options;
  return useQuery<
    Awaited<ReturnType<typeof Api.getGatheringsById>>,
    Error,
    TData
  >({
    queryKey: gatheringsKeys.getGatheringsById(request),
    queryFn: () => Api.getGatheringsById(request),
    ...queryOptions,
  });
};

export const usePostGatheringsApplyById = <
  TContext = unknown,
  TVariables = Types.TPOSTGatheringsApplyByIdReq,
>(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof Api.postGatheringsApplyById>>,
      Error,
      TVariables,
      TContext
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    Awaited<ReturnType<typeof Api.postGatheringsApplyById>>,
    Error,
    TVariables,
    TContext
  >({
    mutationFn: (request: Types.TPOSTGatheringsApplyByIdReq) =>
      Api.postGatheringsApplyById(request),
    ...options,
  });
};

export const usePostGatheringsLikeById = <
  TContext = unknown,
  TVariables = Types.TPOSTGatheringsLikeByIdReq,
>(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof Api.postGatheringsLikeById>>,
      Error,
      TVariables,
      TContext
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    Awaited<ReturnType<typeof Api.postGatheringsLikeById>>,
    Error,
    TVariables,
    TContext
  >({
    mutationFn: (request: Types.TPOSTGatheringsLikeByIdReq) =>
      Api.postGatheringsLikeById(request),
    ...options,
  });
};

export const usePostGatheringsQnaById = <
  TContext = unknown,
  TVariables = Types.TPOSTGatheringsQnaByIdReq,
>(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof Api.postGatheringsQnaById>>,
      Error,
      TVariables,
      TContext
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    Awaited<ReturnType<typeof Api.postGatheringsQnaById>>,
    Error,
    TVariables,
    TContext
  >({
    mutationFn: (request: Types.TPOSTGatheringsQnaByIdReq) =>
      Api.postGatheringsQnaById(request),
    ...options,
  });
};

export const usePutGatheringsQnaByTwoIds = <
  TContext = unknown,
  TVariables = Types.TPUTGatheringsQnaByTwoIdsReq,
>(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof Api.putGatheringsQnaByTwoIds>>,
      Error,
      TVariables,
      TContext
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    Awaited<ReturnType<typeof Api.putGatheringsQnaByTwoIds>>,
    Error,
    TVariables,
    TContext
  >({
    mutationFn: (request: Types.TPUTGatheringsQnaByTwoIdsReq) =>
      Api.putGatheringsQnaByTwoIds(request),
    ...options,
  });
};

export const usePostGatheringsQnaLikeById = <
  TContext = unknown,
  TVariables = Types.TPOSTGatheringsQnaLikeByIdReq,
>(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof Api.postGatheringsQnaLikeById>>,
      Error,
      TVariables,
      TContext
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    Awaited<ReturnType<typeof Api.postGatheringsQnaLikeById>>,
    Error,
    TVariables,
    TContext
  >({
    mutationFn: (request: Types.TPOSTGatheringsQnaLikeByIdReq) =>
      Api.postGatheringsQnaLikeById(request),
    ...options,
  });
};

export const useDeleteGatheringsQnaById = <
  TContext = unknown,
  TVariables = Types.TDELETEGatheringsQnaByIdReq,
>(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof Api.deleteGatheringsQnaById>>,
      Error,
      TVariables,
      TContext
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    Awaited<ReturnType<typeof Api.deleteGatheringsQnaById>>,
    Error,
    TVariables,
    TContext
  >({
    mutationFn: (request: Types.TDELETEGatheringsQnaByIdReq) =>
      Api.deleteGatheringsQnaById(request),
    ...options,
  });
};
