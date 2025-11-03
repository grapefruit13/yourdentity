
/**
 * @description Home 관련 API 함수들
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import { get, post, put, patch, del } from "@/lib/axios";
import type * as Types from "@/types/generated/home-types";
import type { Result } from "@/types/shared/response";

export const getHome = () => {
  return get<Result<Types.TGETHomeRes>>(`/home`);
};
