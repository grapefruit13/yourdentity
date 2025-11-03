/**
 * @description Store 관련 React Query Hooks
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import {
  useQuery,
  useMutation,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";
import * as Api from "@/api/generated/store-api";
import { storeKeys } from "@/constants/generated/query-keys";
import type * as Types from "@/types/generated/store-types";

export const useGetStoreProducts = <
  TData = Awaited<ReturnType<typeof Api.getStoreProducts>>,
>(
  options: {
    request: Types.TGETStoreProductsReq;
  } & Omit<
    UseQueryOptions<
      Awaited<ReturnType<typeof Api.getStoreProducts>>,
      Error,
      TData
    >,
    "queryKey" | "queryFn"
  >
) => {
  const { request, ...queryOptions } = options;
  return useQuery<
    Awaited<ReturnType<typeof Api.getStoreProducts>>,
    Error,
    TData
  >({
    queryKey: storeKeys.getStoreProducts(request),
    queryFn: () => Api.getStoreProducts(request),
    ...queryOptions,
  });
};

export const useGetStoreProductsById = <
  TData = Awaited<ReturnType<typeof Api.getStoreProductsById>>,
>(
  options: {
    request: Types.TGETStoreProductsByIdReq;
  } & Omit<
    UseQueryOptions<
      Awaited<ReturnType<typeof Api.getStoreProductsById>>,
      Error,
      TData
    >,
    "queryKey" | "queryFn"
  >
) => {
  const { request, ...queryOptions } = options;
  return useQuery<
    Awaited<ReturnType<typeof Api.getStoreProductsById>>,
    Error,
    TData
  >({
    queryKey: storeKeys.getStoreProductsById(request),
    queryFn: () => Api.getStoreProductsById(request),
    ...queryOptions,
  });
};

export const usePostStorePurchase = <
  TContext = unknown,
  TVariables = Types.TPOSTStorePurchaseReq,
>(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof Api.postStorePurchase>>,
      Error,
      TVariables,
      TContext
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    Awaited<ReturnType<typeof Api.postStorePurchase>>,
    Error,
    TVariables,
    TContext
  >({
    mutationFn: (variables: TVariables) =>
      Api.postStorePurchase(variables as Types.TPOSTStorePurchaseReq),
    ...options,
  });
};

export const usePostStoreProductsLikeById = <
  TContext = unknown,
  TVariables = Types.TPOSTStoreProductsLikeByIdReq,
>(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof Api.postStoreProductsLikeById>>,
      Error,
      TVariables,
      TContext
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    Awaited<ReturnType<typeof Api.postStoreProductsLikeById>>,
    Error,
    TVariables,
    TContext
  >({
    mutationFn: (variables: TVariables) =>
      Api.postStoreProductsLikeById(
        variables as Types.TPOSTStoreProductsLikeByIdReq
      ),
    ...options,
  });
};

export const usePostStoreProductsQnaById = <
  TContext = unknown,
  TVariables = Types.TPOSTStoreProductsQnaByIdReq,
>(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof Api.postStoreProductsQnaById>>,
      Error,
      TVariables,
      TContext
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    Awaited<ReturnType<typeof Api.postStoreProductsQnaById>>,
    Error,
    TVariables,
    TContext
  >({
    mutationFn: (variables: TVariables) =>
      Api.postStoreProductsQnaById(
        variables as Types.TPOSTStoreProductsQnaByIdReq
      ),
    ...options,
  });
};

export const usePutStoreProductsQnaByTwoIds = <
  TContext = unknown,
  TVariables = Types.TPUTStoreProductsQnaByTwoIdsReq,
>(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof Api.putStoreProductsQnaByTwoIds>>,
      Error,
      TVariables,
      TContext
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    Awaited<ReturnType<typeof Api.putStoreProductsQnaByTwoIds>>,
    Error,
    TVariables,
    TContext
  >({
    mutationFn: (variables: TVariables) =>
      Api.putStoreProductsQnaByTwoIds(
        variables as Types.TPUTStoreProductsQnaByTwoIdsReq
      ),
    ...options,
  });
};

export const usePostStoreQnaLikeById = <
  TContext = unknown,
  TVariables = Types.TPOSTStoreQnaLikeByIdReq,
>(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof Api.postStoreQnaLikeById>>,
      Error,
      TVariables,
      TContext
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    Awaited<ReturnType<typeof Api.postStoreQnaLikeById>>,
    Error,
    TVariables,
    TContext
  >({
    mutationFn: (variables: TVariables) =>
      Api.postStoreQnaLikeById(variables as Types.TPOSTStoreQnaLikeByIdReq),
    ...options,
  });
};

export const useDeleteStoreQnaById = <
  TContext = unknown,
  TVariables = Types.TDELETEStoreQnaByIdReq,
>(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof Api.deleteStoreQnaById>>,
      Error,
      TVariables,
      TContext
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    Awaited<ReturnType<typeof Api.deleteStoreQnaById>>,
    Error,
    TVariables,
    TContext
  >({
    mutationFn: (variables: TVariables) =>
      Api.deleteStoreQnaById(variables as Types.TDELETEStoreQnaByIdReq),
    ...options,
  });
};
