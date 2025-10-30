/**
 * @description Users 관련 React Query Hooks
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import { useQuery, useMutation } from "@tanstack/react-query";
import * as Api from "@/api/generated/users-api";
import { usersKeys } from "@/constants/generated/query-keys";
import type * as Types from "@/types/generated/users-types";

export const usePatchUsersMeOnboarding = () => {
  return useMutation({
    mutationFn: (request: Types.TPATCHUsersMeOnboardingReq) =>
      Api.patchUsersMeOnboarding(request),
  });
};

export const useGetUsersMe = () => {
  return useQuery({
    queryKey: usersKeys.getUsersMe,
    queryFn: () => Api.getUsersMe(),
  });
};

export const useGetUsersNicknameAvailability = (
  request: Types.TGETUsersNicknameAvailabilityReq
) => {
  return useQuery({
    queryKey: usersKeys.getUsersNicknameAvailability(request),
    queryFn: () => Api.getUsersNicknameAvailability(request),
  });
};

export const usePostUsersMeSyncKakaoProfile = () => {
  return useMutation({
    mutationFn: (request: Types.TPOSTUsersMeSyncKakaoProfileReq) =>
      Api.postUsersMeSyncKakaoProfile(request),
  });
};

export const useGetUsers = () => {
  return useQuery({
    queryKey: usersKeys.getUsers,
    queryFn: () => Api.getUsers(),
  });
};

export const useGetUsersById = (request: Types.TGETUsersByIdReq) => {
  return useQuery({
    queryKey: usersKeys.getUsersById(request),
    queryFn: () => Api.getUsersById(request),
  });
};

export const usePutUsersById = () => {
  return useMutation({
    mutationFn: (request: Types.TPUTUsersByIdReq) => Api.putUsersById(request),
  });
};

export const useDeleteUsersById = () => {
  return useMutation({
    mutationFn: (request: Types.TDELETEUsersByIdReq) =>
      Api.deleteUsersById(request),
  });
};
