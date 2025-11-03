
/**
 * @description FCM 관련 API 함수들
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import { get, post, put, patch, del } from "@/lib/axios";
import type * as Types from "@/types/generated/fcm-types";
import type { Result } from "@/types/shared/response";

export const postFcmToken = (request: Types.TPOSTFcmTokenReq) => {
  return post<Result<Types.TPOSTFcmTokenRes>>(
    `/fcm/token`,
    request.data ?? request
  );
};

export const getFcmTokens = () => {
  return get<Result<Types.TGETFcmTokensRes>>(`/fcm/tokens`);
};

export const deleteFcmTokenById = (request: Types.TDELETEFcmTokenByIdReq) => {
  return del<Result<Types.TDELETEFcmTokenByIdRes>>(
    `/fcm/token/${request.deviceId}`
  );
};
