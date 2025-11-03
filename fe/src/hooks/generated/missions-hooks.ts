/**
 * @description Missions 관련 React Query Hooks
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import {
  useQuery,
  useMutation,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";
import * as Api from "@/api/generated/missions-api";
import { missionsKeys } from "@/constants/generated/query-keys";
import type * as Types from "@/types/generated/missions-types";

export const usePostUsersMissionsById = <
  TContext = unknown,
  TVariables = Types.TPOSTUsersMissionsByIdReq,
>(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof Api.postUsersMissionsById>>,
      Error,
      TVariables,
      TContext
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    Awaited<ReturnType<typeof Api.postUsersMissionsById>>,
    Error,
    TVariables,
    TContext
  >({
    mutationFn: (variables: TVariables) =>
      Api.postUsersMissionsById(variables as Types.TPOSTUsersMissionsByIdReq),
    ...options,
  });
};

export const useGetUsersMissionsById = <
  TData = Awaited<ReturnType<typeof Api.getUsersMissionsById>>,
>(
  options: {
    request: Types.TGETUsersMissionsByIdReq;
  } & Omit<
    UseQueryOptions<
      Awaited<ReturnType<typeof Api.getUsersMissionsById>>,
      Error,
      TData
    >,
    "queryKey" | "queryFn"
  >
) => {
  const { request, ...queryOptions } = options;
  return useQuery<
    Awaited<ReturnType<typeof Api.getUsersMissionsById>>,
    Error,
    TData
  >({
    queryKey: missionsKeys.getUsersMissionsById(request),
    queryFn: () => Api.getUsersMissionsById(request),
    ...queryOptions,
  });
};

export const useGetUsersMissionsByTwoIds = <
  TData = Awaited<ReturnType<typeof Api.getUsersMissionsByTwoIds>>,
>(
  options: {
    request: Types.TGETUsersMissionsByTwoIdsReq;
  } & Omit<
    UseQueryOptions<
      Awaited<ReturnType<typeof Api.getUsersMissionsByTwoIds>>,
      Error,
      TData
    >,
    "queryKey" | "queryFn"
  >
) => {
  const { request, ...queryOptions } = options;
  return useQuery<
    Awaited<ReturnType<typeof Api.getUsersMissionsByTwoIds>>,
    Error,
    TData
  >({
    queryKey: missionsKeys.getUsersMissionsByTwoIds(request),
    queryFn: () => Api.getUsersMissionsByTwoIds(request),
    ...queryOptions,
  });
};

export const usePutUsersMissionsByTwoIds = <
  TContext = unknown,
  TVariables = Types.TPUTUsersMissionsByTwoIdsReq,
>(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof Api.putUsersMissionsByTwoIds>>,
      Error,
      TVariables,
      TContext
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    Awaited<ReturnType<typeof Api.putUsersMissionsByTwoIds>>,
    Error,
    TVariables,
    TContext
  >({
    mutationFn: (variables: TVariables) =>
      Api.putUsersMissionsByTwoIds(
        variables as Types.TPUTUsersMissionsByTwoIdsReq
      ),
    ...options,
  });
};

export const useDeleteUsersMissionsByTwoIds = <
  TContext = unknown,
  TVariables = Types.TDELETEUsersMissionsByTwoIdsReq,
>(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof Api.deleteUsersMissionsByTwoIds>>,
      Error,
      TVariables,
      TContext
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    Awaited<ReturnType<typeof Api.deleteUsersMissionsByTwoIds>>,
    Error,
    TVariables,
    TContext
  >({
    mutationFn: (variables: TVariables) =>
      Api.deleteUsersMissionsByTwoIds(
        variables as Types.TDELETEUsersMissionsByTwoIdsReq
      ),
    ...options,
  });
};
