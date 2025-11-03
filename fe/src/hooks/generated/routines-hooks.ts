/**
 * @description Routines 관련 React Query Hooks
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import {
  useQuery,
  useMutation,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";
import * as Api from "@/api/generated/routines-api";
import { routinesKeys } from "@/constants/generated/query-keys";
import type * as Types from "@/types/generated/routines-types";

export const useGetRoutines = <
  TData = Awaited<ReturnType<typeof Api.getRoutines>>,
>(
  options: {
    request: Types.TGETRoutinesReq;
  } & Omit<
    UseQueryOptions<Awaited<ReturnType<typeof Api.getRoutines>>, Error, TData>,
    "queryKey" | "queryFn"
  >
) => {
  const { request, ...queryOptions } = options;
  return useQuery<Awaited<ReturnType<typeof Api.getRoutines>>, Error, TData>({
    queryKey: routinesKeys.getRoutines(request),
    queryFn: () => Api.getRoutines(request),
    ...queryOptions,
  });
};

export const useGetRoutinesById = <
  TData = Awaited<ReturnType<typeof Api.getRoutinesById>>,
>(
  options: {
    request: Types.TGETRoutinesByIdReq;
  } & Omit<
    UseQueryOptions<
      Awaited<ReturnType<typeof Api.getRoutinesById>>,
      Error,
      TData
    >,
    "queryKey" | "queryFn"
  >
) => {
  const { request, ...queryOptions } = options;
  return useQuery<
    Awaited<ReturnType<typeof Api.getRoutinesById>>,
    Error,
    TData
  >({
    queryKey: routinesKeys.getRoutinesById(request),
    queryFn: () => Api.getRoutinesById(request),
    ...queryOptions,
  });
};

export const usePostRoutinesApplyById = <
  TContext = unknown,
  TVariables = Types.TPOSTRoutinesApplyByIdReq,
>(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof Api.postRoutinesApplyById>>,
      Error,
      TVariables,
      TContext
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    Awaited<ReturnType<typeof Api.postRoutinesApplyById>>,
    Error,
    TVariables,
    TContext
  >({
    mutationFn: (request: Types.TPOSTRoutinesApplyByIdReq) =>
      Api.postRoutinesApplyById(request),
    ...options,
  });
};

export const usePostRoutinesLikeById = <
  TContext = unknown,
  TVariables = Types.TPOSTRoutinesLikeByIdReq,
>(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof Api.postRoutinesLikeById>>,
      Error,
      TVariables,
      TContext
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    Awaited<ReturnType<typeof Api.postRoutinesLikeById>>,
    Error,
    TVariables,
    TContext
  >({
    mutationFn: (request: Types.TPOSTRoutinesLikeByIdReq) =>
      Api.postRoutinesLikeById(request),
    ...options,
  });
};

export const usePostRoutinesQnaById = <
  TContext = unknown,
  TVariables = Types.TPOSTRoutinesQnaByIdReq,
>(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof Api.postRoutinesQnaById>>,
      Error,
      TVariables,
      TContext
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    Awaited<ReturnType<typeof Api.postRoutinesQnaById>>,
    Error,
    TVariables,
    TContext
  >({
    mutationFn: (request: Types.TPOSTRoutinesQnaByIdReq) =>
      Api.postRoutinesQnaById(request),
    ...options,
  });
};

export const usePutRoutinesQnaByTwoIds = <
  TContext = unknown,
  TVariables = Types.TPUTRoutinesQnaByTwoIdsReq,
>(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof Api.putRoutinesQnaByTwoIds>>,
      Error,
      TVariables,
      TContext
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    Awaited<ReturnType<typeof Api.putRoutinesQnaByTwoIds>>,
    Error,
    TVariables,
    TContext
  >({
    mutationFn: (request: Types.TPUTRoutinesQnaByTwoIdsReq) =>
      Api.putRoutinesQnaByTwoIds(request),
    ...options,
  });
};

export const usePostRoutinesQnaLikeById = <
  TContext = unknown,
  TVariables = Types.TPOSTRoutinesQnaLikeByIdReq,
>(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof Api.postRoutinesQnaLikeById>>,
      Error,
      TVariables,
      TContext
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    Awaited<ReturnType<typeof Api.postRoutinesQnaLikeById>>,
    Error,
    TVariables,
    TContext
  >({
    mutationFn: (request: Types.TPOSTRoutinesQnaLikeByIdReq) =>
      Api.postRoutinesQnaLikeById(request),
    ...options,
  });
};

export const useDeleteRoutinesQnaById = <
  TContext = unknown,
  TVariables = Types.TDELETERoutinesQnaByIdReq,
>(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof Api.deleteRoutinesQnaById>>,
      Error,
      TVariables,
      TContext
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    Awaited<ReturnType<typeof Api.deleteRoutinesQnaById>>,
    Error,
    TVariables,
    TContext
  >({
    mutationFn: (request: Types.TDELETERoutinesQnaByIdReq) =>
      Api.deleteRoutinesQnaById(request),
    ...options,
  });
};
