/**
 * @description Store 관련 API 함수들
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { get, post, put, patch, del } from "@/lib/axios";
import type * as Types from "@/types/generated/store-types";

export const getStoreProducts = (request: Types.TGETStoreProductsReq) => {
  return get<Types.TGETStoreProductsRes>(`/store/products`, {
    params: request,
  });
};

export const getStoreProductsById = (
  request: Types.TGETStoreProductsByIdReq
) => {
  return get<Types.TGETStoreProductsByIdRes>(
    `/store/products/${request.productId}`
  );
};

export const postStorePurchase = (request: Types.TPOSTStorePurchaseReq) => {
  return post<Types.TPOSTStorePurchaseRes>(
    `/store/purchase`,
    request.data ?? request
  );
};

export const postStoreProductsLikeById = (
  request: Types.TPOSTStoreProductsLikeByIdReq
) => {
  return post<Types.TPOSTStoreProductsLikeByIdRes>(
    `/store/products/${request.productId}/like`
  );
};

export const postStoreProductsQnaById = (
  request: Types.TPOSTStoreProductsQnaByIdReq
) => {
  const { productId, ...data } = request;
  return post<Types.TPOSTStoreProductsQnaByIdRes>(
    `/store/products/${request.productId}/qna`,
    data.data ?? data
  );
};

export const putStoreProductsQnaByTwoIds = (
  request: Types.TPUTStoreProductsQnaByTwoIdsReq
) => {
  const { productId, qnaId, ...data } = request;
  return put<Types.TPUTStoreProductsQnaByTwoIdsRes>(
    `/store/products/${request.productId}/qna/${request.qnaId}`,
    data.data ?? data
  );
};

export const postStoreQnaLikeById = (
  request: Types.TPOSTStoreQnaLikeByIdReq
) => {
  return post<Types.TPOSTStoreQnaLikeByIdRes>(
    `/store/qna/${request.qnaId}/like`
  );
};

export const deleteStoreQnaById = (request: Types.TDELETEStoreQnaByIdReq) => {
  return del<any>(`/store/qna/${request.qnaId}`);
};
