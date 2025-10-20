/**
 * @description FCM 관련 타입 정의
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import type * as Schema from "./api-schema";

export interface TPOSTFcmTokenReq {
  data: Schema.FCMToken;
}

export type TPOSTFcmTokenRes = any;

export type TGETFcmTokensRes = any;

export interface TDELETEFcmTokenByIdReq {
  deviceId: string;
}

export type TDELETEFcmTokenByIdRes = any;
