/**
 * @description Auth 관련 React Query Hooks
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import { useQuery, useMutation } from "@tanstack/react-query";
import * as Api from "@/api/generated/auth-api";
import { authKeys } from "@/constants/generated/query-keys";
import type * as Types from "@/types/generated/auth-types";

export const usePostAuthLogout = () => {
  return useMutation({
    mutationFn: () => Api.postAuthLogout(),
  });
};

export const useGetAuthVerify = () => {
  return useQuery({
    queryKey: authKeys.getAuthVerify,
    queryFn: () => Api.getAuthVerify(),
  });
};
