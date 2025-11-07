/**
 * @description Auth 관련 React Query Hooks
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import {
  useQuery,
  useMutation,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";
import * as Api from "@/api/generated/auth-api";
import { authKeys } from "@/constants/generated/query-keys";
import type * as Types from "@/types/generated/auth-types";

export const usePostAuthLogout = <TContext = unknown, TVariables = void>(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof Api.postAuthLogout>>,
      Error,
      TVariables,
      TContext
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    Awaited<ReturnType<typeof Api.postAuthLogout>>,
    Error,
    TVariables,
    TContext
  >({
    mutationFn: (_variables: TVariables) => Api.postAuthLogout(),
    ...options,
  });
};

export const useGetAuthVerify = <TData = Types.TGETAuthVerifyRes>(
  options?: Omit<
    UseQueryOptions<Types.TGETAuthVerifyRes, Error, TData>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery<Types.TGETAuthVerifyRes, Error, TData>({
    queryKey: authKeys.getAuthVerify,
    queryFn: async () => {
      const response = await Api.getAuthVerify();
      return response.data;
    },
    ...options,
  });
};

export const useDeleteAuthDeleteAccount = <
  TContext = unknown,
  TVariables = Types.TDELETEAuthDeleteAccountReq,
>(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof Api.deleteAuthDeleteAccount>>,
      Error,
      TVariables,
      TContext
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    Awaited<ReturnType<typeof Api.deleteAuthDeleteAccount>>,
    Error,
    TVariables,
    TContext
  >({
    mutationFn: (variables: TVariables) =>
      Api.deleteAuthDeleteAccount(
        variables as Types.TDELETEAuthDeleteAccountReq
      ),
    ...options,
  });
};
