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
