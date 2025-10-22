/**
 * @description FCM 토큰 관련 API 함수
 */
import { API_PATH } from "@/constants/shared/_api-path";
import { post } from "@/lib/axios";
import { FCMTokenRequest, FCMTokenResponse } from "@/types/shared/fcm";
import { Result } from "@/types/shared/response";

/**
 * @description FCM 토큰 저장/업데이트
 */
const saveToken = async (
  data: FCMTokenRequest
): Promise<Result<FCMTokenResponse>> => {
  const response = await post<Result<FCMTokenResponse>>(
    API_PATH.FCM.TOKEN,
    data
  );
  return response.data;
};

export const fcmApi = {
  saveToken,
};
