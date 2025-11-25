/**
 * @description QnA 관련 React Query Hooks
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */


import {
  useQuery,
  useMutation,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";
import * as Api from "@/api/generated/qna-api";
import { qnaKeys } from "@/constants/generated/query-keys";
import type * as Types from "@/types/generated/qna-types";

export const useGetQnaById = <TData = Types.TGETQnaByIdRes>(
  options: {
    request: Types.TGETQnaByIdReq;
  } & Omit<
    UseQueryOptions<Types.TGETQnaByIdRes, Error, TData>,
    "queryKey" | "queryFn"
  >
) => {
  const { request, ...queryOptions } = options;
  return useQuery<Types.TGETQnaByIdRes, Error, TData>({
    queryKey: qnaKeys.getQnaById(request),
    queryFn: async () => {
      const response = await Api.getQnaById(request);
      return response.data;
    },
    ...queryOptions,
  });
};

export const usePostQnaById = <
  TContext = unknown,
  TVariables = Types.TPOSTQnaByIdReq,
>(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof Api.postQnaById>>,
      Error,
      TVariables,
      TContext
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    Awaited<ReturnType<typeof Api.postQnaById>>,
    Error,
    TVariables,
    TContext
  >({
    mutationFn: (variables: TVariables) =>
      Api.postQnaById(variables as Types.TPOSTQnaByIdReq),
    ...options,
  });
};

export const useDeleteQnaById = <
  TContext = unknown,
  TVariables = Types.TDELETEQnaByIdReq,
>(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof Api.deleteQnaById>>,
      Error,
      TVariables,
      TContext
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    Awaited<ReturnType<typeof Api.deleteQnaById>>,
    Error,
    TVariables,
    TContext
  >({
    mutationFn: (variables: TVariables) =>
      Api.deleteQnaById(variables as Types.TDELETEQnaByIdReq),
    ...options,
  });
};

export const usePutQnaById = <
  TContext = unknown,
  TVariables = Types.TPUTQnaByIdReq,
>(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof Api.putQnaById>>,
      Error,
      TVariables,
      TContext
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    Awaited<ReturnType<typeof Api.putQnaById>>,
    Error,
    TVariables,
    TContext
  >({
    mutationFn: (variables: TVariables) =>
      Api.putQnaById(variables as Types.TPUTQnaByIdReq),
    ...options,
  });
};

export const usePostQnaLikeById = <
  TContext = unknown,
  TVariables = Types.TPOSTQnaLikeByIdReq,
>(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof Api.postQnaLikeById>>,
      Error,
      TVariables,
      TContext
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    Awaited<ReturnType<typeof Api.postQnaLikeById>>,
    Error,
    TVariables,
    TContext
  >({
    mutationFn: (variables: TVariables) =>
      Api.postQnaLikeById(variables as Types.TPOSTQnaLikeByIdReq),
    ...options,
  });
};
