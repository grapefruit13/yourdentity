/**
 * @description NotionUsers 관련 API 함수들
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import { get, post, put, patch, del } from "@/lib/axios";
import type * as Types from "@/types/generated/notionusers-types";
import type { Result } from "@/types/shared/response";

export const getNotionusersSyncActive = () => {
  return get<Result<Types.TGETNotionUsersSyncActiveRes>>(
    `/notionUsers/sync/active`
  );
};
