/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @description Store 관련 API 함수들
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import { get, post, put, patch, del } from "@/lib/axios";
import type * as Types from "@/types/generated/store-types";
import type { Result } from "@/types/shared/response";

export const getStoreProducts = (request: Types.TGETStoreProductsReq) => {
  return get<Result<Types.TGETStoreProductsRes>>(`/store/products`, {
    params: request,
  });
};

export const getStoreProductsById = (
  request: Types.TGETStoreProductsByIdReq
) => {
  return get<Result<Types.TGETStoreProductsByIdRes>>(
    `/store/products/${request.productId}`
  );
};

export const postStorePurchase = (request: Types.TPOSTStorePurchaseReq) => {
  return post<Result<Types.TPOSTStorePurchaseRes>>(
    `/store/purchase`,
    request.data ?? request
  );
};

export const postStoreProductsLikeById = (
  request: Types.TPOSTStoreProductsLikeByIdReq
) => {
  return post<Result<Types.TPOSTStoreProductsLikeByIdRes>>(
    `/store/products/${request.productId}/like`
  );
};

export const postStoreProductsQnaById = (
  request: Types.TPOSTStoreProductsQnaByIdReq
) => {
  const { productId, ...data } = request;
  return post<Result<Types.TPOSTStoreProductsQnaByIdRes>>(
    `/store/products/${request.productId}/qna`,
    data.data ?? data
  );
};

export const putStoreProductsQnaByTwoIds = (
  request: Types.TPUTStoreProductsQnaByTwoIdsReq
) => {
  const { productId, qnaId, ...data } = request;
  return put<Result<Types.TPUTStoreProductsQnaByTwoIdsRes>>(
    `/store/products/${request.productId}/qna/${request.qnaId}`,
    data.data ?? data
  );
};

export const postStoreQnaLikeById = (
  request: Types.TPOSTStoreQnaLikeByIdReq
) => {
  return post<Result<Types.TPOSTStoreQnaLikeByIdRes>>(
    `/store/qna/${request.qnaId}/like`
  );
};

export const deleteStoreQnaById = (request: Types.TDELETEStoreQnaByIdReq) => {
  return del<Result<any>>(`/store/qna/${request.qnaId}`);
};
