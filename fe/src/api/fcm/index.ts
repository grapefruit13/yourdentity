/**
 * @description FCM 토큰 관련 API 함수
 */
import { post } from "@/lib/axios";
import { FCMTokenRequest, FCMTokenResponse } from "@/types/shared/fcm";
import { Result } from "@/types/shared/response";

/**
 * @description FCM 토큰 저장/업데이트
 */
export const saveFCMToken = async (
  data: FCMTokenRequest
): Promise<Result<FCMTokenResponse>> => {
  try {
    const response = await post<Result<FCMTokenResponse>>("/fcm/token", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};
