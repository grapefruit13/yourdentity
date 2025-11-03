
/**
 * @description Auth 관련 API 함수들
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import { get, post, put, patch, del } from "@/lib/axios";
import type * as Types from "@/types/generated/auth-types";
import type { Result } from "@/types/shared/response";

export const postAuthLogout = () => {
  return post<Result<Types.TPOSTAuthLogoutRes>>(`/auth/logout`);
};

export const getAuthVerify = () => {
  return get<Result<Types.TGETAuthVerifyRes>>(`/auth/verify`);
};
