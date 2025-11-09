/**
 * @description Notifications 관련 타입 정의
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import type * as Schema from "./api-schema";

export type TGETNotificationsSendAllPendingRes = {
  success?: boolean;
  message?: string;
  total?: number;
  successCount?: number;
  errorCount?: number;
  results?: {
    pageId?: string;
    success?: boolean;
    title?: string;
    totalUsers?: number;
    successCount?: number;
    failureCount?: number;
  }[];
};
