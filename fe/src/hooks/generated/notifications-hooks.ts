/**
 * @description Notifications 관련 React Query Hooks
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */


import {
  useQuery,
  useMutation,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";
import * as Api from "@/api/generated/notifications-api";
import { notificationsKeys } from "@/constants/generated/query-keys";
import type * as Types from "@/types/generated/notifications-types";

export const useGetNotifications = <TData = Types.TGETNotificationsRes>(
  options: {
    request: Types.TGETNotificationsReq;
  } & Omit<
    UseQueryOptions<Types.TGETNotificationsRes, Error, TData>,
    "queryKey" | "queryFn"
  >
) => {
  const { request, ...queryOptions } = options;
  return useQuery<Types.TGETNotificationsRes, Error, TData>({
    queryKey: notificationsKeys.getNotifications(request),
    queryFn: async () => {
      const response = await Api.getNotifications(request);
      return response.data;
    },
    ...queryOptions,
  });
};

export const usePatchNotificationsReadById = <
  TContext = unknown,
  TVariables = Types.TPATCHNotificationsReadByIdReq,
>(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof Api.patchNotificationsReadById>>,
      Error,
      TVariables,
      TContext
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    Awaited<ReturnType<typeof Api.patchNotificationsReadById>>,
    Error,
    TVariables,
    TContext
  >({
    mutationFn: (variables: TVariables) =>
      Api.patchNotificationsReadById(
        variables as Types.TPATCHNotificationsReadByIdReq
      ),
    ...options,
  });
};

export const usePatchNotificationsReadAll = <
  TContext = unknown,
  TVariables = void,
>(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof Api.patchNotificationsReadAll>>,
      Error,
      TVariables,
      TContext
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    Awaited<ReturnType<typeof Api.patchNotificationsReadAll>>,
    Error,
    TVariables,
    TContext
  >({
    mutationFn: (_variables: TVariables) => Api.patchNotificationsReadAll(),
    ...options,
  });
};

export const useGetNotificationsSendAllPending = <
  TData = Types.TGETNotificationsSendAllPendingRes,
>(
  options?: Omit<
    UseQueryOptions<Types.TGETNotificationsSendAllPendingRes, Error, TData>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery<Types.TGETNotificationsSendAllPendingRes, Error, TData>({
    queryKey: notificationsKeys.getNotificationsSendAllPending,
    queryFn: async () => {
      const response = await Api.getNotificationsSendAllPending();
      return response.data;
    },
    ...options,
  });
};
