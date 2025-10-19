/**
 * @description FCM 관련 React Query Hooks
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import { useQuery, useMutation } from "@tanstack/react-query";
import * as Api from "@/api/generated/fcm-api";
import { fcmKeys } from "@/constants/generated/query-keys";
import type * as Types from "@/types/generated/fcm-types";

export const usePostFcmToken = () => {
  return useMutation({
    mutationFn: (request: Types.TPOSTFcmTokenReq) => Api.postFcmToken(request),
  });
};

export const useGetFcmTokens = () => {
  return useQuery({
    queryKey: fcmKeys.getFcmTokens,
    queryFn: () => Api.getFcmTokens(),
  });
};

export const useDeleteFcmTokenById = () => {
  return useMutation({
    mutationFn: (request: Types.TDELETEFcmTokenByIdReq) =>
      Api.deleteFcmTokenById(request),
  });
};
