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
    mutationFn: (variables: TVariables) =>
      Api.postFcmToken(variables as Types.TPOSTFcmTokenReq),
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
    mutationFn: (variables: TVariables) =>
      Api.deleteFcmTokenById(variables as Types.TDELETEFcmTokenByIdReq),
    ...options,
  });
};

export const useGetFcmTokens = <TData = Types.TGETFcmTokensRes>(
  options?: Omit<
    UseQueryOptions<Types.TGETFcmTokensRes, Error, TData>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery<Types.TGETFcmTokensRes, Error, TData>({
    queryKey: fcmKeys.getFcmTokens,
    queryFn: async () => {
      const response = await Api.getFcmTokens();
      return response.data;
    },
    ...options,
  });
};
