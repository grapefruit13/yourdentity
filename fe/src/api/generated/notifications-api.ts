/**
 * @description Notifications 관련 API 함수들
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import { get, post, put, patch, del } from "@/lib/axios";
import type * as Types from "@/types/generated/notifications-types";

export const getNotificationsSendAllPending = () => {
  return get<Types.TGETNotificationsSendAllPendingRes>(
    `/notifications/send-all-pending`
  );
};
