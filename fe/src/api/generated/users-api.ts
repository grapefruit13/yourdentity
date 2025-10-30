/**
 * @description Users 관련 API 함수들
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import { get, post, put, patch, del } from "@/lib/axios";
import type * as Types from "@/types/generated/users-types";
import type { Result } from "@/types/shared/response";

export const patchUsersMeOnboarding = (
  request: Types.TPATCHUsersMeOnboardingReq
) => {
  return patch<Result<Types.TPATCHUsersMeOnboardingRes>>(
    `/users/me/onboarding`,
    request.data ?? request
  );
};

export const getUsersMe = () => {
  return get<Result<Types.TGETUsersMeRes>>(`/users/me`);
};

export const getUsersNicknameAvailability = (
  request: Types.TGETUsersNicknameAvailabilityReq
) => {
  return get<Result<Types.TGETUsersNicknameAvailabilityRes>>(
    `/users/nickname-availability`,
    { params: request }
  );
};

export const postUsersMeSyncKakaoProfile = (
  request: Types.TPOSTUsersMeSyncKakaoProfileReq
) => {
  return post<Result<Types.TPOSTUsersMeSyncKakaoProfileRes>>(
    `/users/me/sync-kakao-profile`,
    request.data ?? request
  );
};

export const getUsers = () => {
  return get<Result<Types.TGETUsersRes>>(`/users`);
};

export const getUsersById = (request: Types.TGETUsersByIdReq) => {
  return get<Result<Types.TGETUsersByIdRes>>(`/users/${request.userId}`);
};

export const putUsersById = (request: Types.TPUTUsersByIdReq) => {
  const { userId, ...data } = request;
  return put<Result<Types.TPUTUsersByIdRes>>(
    `/users/${request.userId}`,
    data.data ?? data
  );
};

export const deleteUsersById = (request: Types.TDELETEUsersByIdReq) => {
  return del<Result<Types.TDELETEUsersByIdRes>>(`/users/${request.userId}`);
};
