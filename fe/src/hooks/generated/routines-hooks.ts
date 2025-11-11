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

export const useGetRoutines = <TData = Types.TGETRoutinesRes>(
  options: {
    request: Types.TGETRoutinesReq;
  } & Omit<
    UseQueryOptions<Types.TGETRoutinesRes, Error, TData>,
    "queryKey" | "queryFn"
  >
) => {
  const { request, ...queryOptions } = options;
  return useQuery<Types.TGETRoutinesRes, Error, TData>({
    queryKey: routinesKeys.getRoutines(request),
    queryFn: async () => {
      const response = await Api.getRoutines(request);
      return response.data;
    },
    ...queryOptions,
  });
};

export const useGetRoutinesById = <TData = Types.TGETRoutinesByIdRes>(
  options: {
    request: Types.TGETRoutinesByIdReq;
  } & Omit<
    UseQueryOptions<Types.TGETRoutinesByIdRes, Error, TData>,
    "queryKey" | "queryFn"
  >
) => {
  const { request, ...queryOptions } = options;
  return useQuery<Types.TGETRoutinesByIdRes, Error, TData>({
    queryKey: routinesKeys.getRoutinesById(request),
    queryFn: async () => {
      const response = await Api.getRoutinesById(request);
      return response.data;
    },
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
    mutationFn: (variables: TVariables) =>
      Api.postRoutinesApplyById(variables as Types.TPOSTRoutinesApplyByIdReq),
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
    mutationFn: (variables: TVariables) =>
      Api.postRoutinesLikeById(variables as Types.TPOSTRoutinesLikeByIdReq),
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
    mutationFn: (variables: TVariables) =>
      Api.postRoutinesQnaById(variables as Types.TPOSTRoutinesQnaByIdReq),
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
    mutationFn: (variables: TVariables) =>
      Api.putRoutinesQnaByTwoIds(variables as Types.TPUTRoutinesQnaByTwoIdsReq),
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
    mutationFn: (variables: TVariables) =>
      Api.postRoutinesQnaLikeById(
        variables as Types.TPOSTRoutinesQnaLikeByIdReq
      ),
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
    mutationFn: (variables: TVariables) =>
      Api.deleteRoutinesQnaById(variables as Types.TDELETERoutinesQnaByIdReq),
    ...options,
  });
};
