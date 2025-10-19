/**
 * @description Store 관련 React Query Hooks
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import { useQuery, useMutation } from "@tanstack/react-query";
import * as Api from "@/api/generated/store-api";
import { storeKeys } from "@/constants/generated/query-keys";
import type * as Types from "@/types/generated/store-types";

export const useGetStoreProducts = (request: Types.TGETStoreProductsReq) => {
  return useQuery({
    queryKey: storeKeys.getStoreProducts,
    queryFn: () => Api.getStoreProducts(request),
  });
};

export const useGetStoreProductsById = (
  request: Types.TGETStoreProductsByIdReq
) => {
  return useQuery({
    queryKey: storeKeys.getStoreProductsById,
    queryFn: () => Api.getStoreProductsById(request),
  });
};

export const usePostStorePurchase = () => {
  return useMutation({
    mutationFn: (request: Types.TPOSTStorePurchaseReq) =>
      Api.postStorePurchase(request),
  });
};

export const usePostStoreProductsLikeById = () => {
  return useMutation({
    mutationFn: (request: Types.TPOSTStoreProductsLikeByIdReq) =>
      Api.postStoreProductsLikeById(request),
  });
};

export const usePostStoreProductsQnaById = () => {
  return useMutation({
    mutationFn: (request: Types.TPOSTStoreProductsQnaByIdReq) =>
      Api.postStoreProductsQnaById(request),
  });
};

export const usePutStoreProductsQnaByTwoIds = () => {
  return useMutation({
    mutationFn: (request: Types.TPUTStoreProductsQnaByTwoIdsReq) =>
      Api.putStoreProductsQnaByTwoIds(request),
  });
};

export const usePostStoreQnaLikeById = () => {
  return useMutation({
    mutationFn: (request: Types.TPOSTStoreQnaLikeByIdReq) =>
      Api.postStoreQnaLikeById(request),
  });
};

export const useDeleteStoreQnaById = () => {
  return useMutation({
    mutationFn: (request: Types.TDELETEStoreQnaByIdReq) =>
      Api.deleteStoreQnaById(request),
  });
};
