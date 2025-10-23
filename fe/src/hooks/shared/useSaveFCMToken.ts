import { useMutation } from "@tanstack/react-query";
import { fcmApi } from "@/api/fcm";
import { fcmKeys } from "@/constants/shared/_fcm-query-keys";

/**
 * @description FCM 토큰 저장 Mutation 훅
 */
export const useSaveFCMToken = () =>
  useMutation({
    mutationFn: fcmApi.saveToken,
    mutationKey: fcmKeys.token(),
  });
