/**
 * @description FCM 관련 React Query Hooks
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import {
  useQuery,
  useMutation,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";
import * as Api from "@/api/generated/fcm-api";
import { fcmKeys } from "@/constants/generated/query-keys";
import type * as Types from "@/types/generated/fcm-types";

export const usePostFcmToken = <
  TContext = unknown,
  TVariables = Types.TPOSTFcmTokenReq,
>(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof Api.postFcmToken>>,
      Error,
      TVariables,
      TContext
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    Awaited<ReturnType<typeof Api.postFcmToken>>,
    Error,
    TVariables,
    TContext
  >({
    mutationFn: (request: Types.TPOSTFcmTokenReq) => Api.postFcmToken(request),
    ...options,
  });
};

export const useGetFcmTokens = <
  TData = Awaited<ReturnType<typeof Api.getFcmTokens>>,
>(
  options?: Omit<
    UseQueryOptions<Awaited<ReturnType<typeof Api.getFcmTokens>>, Error, TData>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery<Awaited<ReturnType<typeof Api.getFcmTokens>>, Error, TData>({
    queryKey: fcmKeys.getFcmTokens,
    queryFn: () => Api.getFcmTokens(),
    ...options,
  });
};

export const useDeleteFcmTokenById = <
  TContext = unknown,
  TVariables = Types.TDELETEFcmTokenByIdReq,
>(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof Api.deleteFcmTokenById>>,
      Error,
      TVariables,
      TContext
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    Awaited<ReturnType<typeof Api.deleteFcmTokenById>>,
    Error,
    TVariables,
    TContext
  >({
    mutationFn: (request: Types.TDELETEFcmTokenByIdReq) =>
      Api.deleteFcmTokenById(request),
    ...options,
  });
};
