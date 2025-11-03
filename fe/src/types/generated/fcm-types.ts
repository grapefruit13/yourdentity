/**
 * @description FCM 관련 타입 정의
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */


import type * as Schema from "./api-schema";

export interface TPOSTFcmTokenReq {
  data: Schema.FCMToken;
}

export type TPOSTFcmTokenRes = Schema.FCMTokenResponse;

export type TGETFcmTokensRes = Schema.FCMTokenListResponse;

export interface TDELETEFcmTokenByIdReq {
  deviceId: string;
}

export type TDELETEFcmTokenByIdRes = Schema.FCMDeleteResponse;
