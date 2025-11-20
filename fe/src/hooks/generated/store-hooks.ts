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

export const useGetStoreProducts = <TData = Types.TGETStoreProductsRes>(
  options: {
    request: Types.TGETStoreProductsReq;
  } & Omit<
    UseQueryOptions<Types.TGETStoreProductsRes, Error, TData>,
    "queryKey" | "queryFn"
  >
) => {
  const { request, ...queryOptions } = options;
  return useQuery<Types.TGETStoreProductsRes, Error, TData>({
    queryKey: storeKeys.getStoreProducts(request),
    queryFn: async () => {
      const response = await Api.getStoreProducts(request);
      return response.data;
    },
    ...queryOptions,
  });
};

export const useGetStoreProductsById = <TData = Types.TGETStoreProductsByIdRes>(
  options: {
    request: Types.TGETStoreProductsByIdReq;
  } & Omit<
    UseQueryOptions<Types.TGETStoreProductsByIdRes, Error, TData>,
    "queryKey" | "queryFn"
  >
) => {
  const { request, ...queryOptions } = options;
  return useQuery<Types.TGETStoreProductsByIdRes, Error, TData>({
    queryKey: storeKeys.getStoreProductsById(request),
    queryFn: async () => {
      const response = await Api.getStoreProductsById(request);
      return response.data;
    },
    ...queryOptions,
  });
};

export const useGetStorePurchases = <TData = Types.TGETStorePurchasesRes>(
  options: {
    request: Types.TGETStorePurchasesReq;
  } & Omit<
    UseQueryOptions<Types.TGETStorePurchasesRes, Error, TData>,
    "queryKey" | "queryFn"
  >
) => {
  const { request, ...queryOptions } = options;
  return useQuery<Types.TGETStorePurchasesRes, Error, TData>({
    queryKey: storeKeys.getStorePurchases(request),
    queryFn: async () => {
      const response = await Api.getStorePurchases(request);
      return response.data;
    },
    ...queryOptions,
  });
};

export const usePostStorePurchases = <
  TContext = unknown,
  TVariables = Types.TPOSTStorePurchasesReq,
>(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof Api.postStorePurchases>>,
      Error,
      TVariables,
      TContext
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    Awaited<ReturnType<typeof Api.postStorePurchases>>,
    Error,
    TVariables,
    TContext
  >({
    mutationFn: (variables: TVariables) =>
      Api.postStorePurchases(variables as Types.TPOSTStorePurchasesReq),
    ...options,
  });
};
