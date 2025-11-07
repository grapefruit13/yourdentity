/**
 * @description Users 관련 API 함수들
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import { get, post, put, patch, del } from "@/lib/axios";
import type * as Types from "@/types/generated/users-types";

export const patchUsersMeOnboarding = (
  request: Types.TPATCHUsersMeOnboardingReq
) => {
  return patch<Types.TPATCHUsersMeOnboardingRes>(
    `/users/me/onboarding`,
    request.data ?? request
  );
};

export const getUsersMe = () => {
  return get<Types.TGETUsersMeRes>(`/users/me`);
};

export const getUsersMeMyPage = () => {
  return get<Types.TGETUsersMeMyPageRes>(`/users/me/my-page`);
};

export const getUsersMePosts = (request: Types.TGETUsersMePostsReq) => {
  return get<Types.TGETUsersMePostsRes>(`/users/me/posts`, { params: request });
};

export const getUsersMeLikedPosts = (
  request: Types.TGETUsersMeLikedPostsReq
) => {
  return get<Types.TGETUsersMeLikedPostsRes>(`/users/me/liked-posts`, {
    params: request,
  });
};

export const getUsersMeCommentedPosts = (
  request: Types.TGETUsersMeCommentedPostsReq
) => {
  return get<Types.TGETUsersMeCommentedPostsRes>(`/users/me/commented-posts`, {
    params: request,
  });
};

export const getUsersMeParticipatingCommunities = () => {
  return get<Types.TGETUsersMeParticipatingCommunitiesRes>(
    `/users/me/participating-communities`
  );
};

export const getUsersNicknameAvailability = (
  request: Types.TGETUsersNicknameAvailabilityReq
) => {
  return get<Types.TGETUsersNicknameAvailabilityRes>(
    `/users/nickname-availability`,
    { params: request }
  );
};

export const postUsersMeSyncKakaoProfile = (
  request: Types.TPOSTUsersMeSyncKakaoProfileReq
) => {
  return post<Types.TPOSTUsersMeSyncKakaoProfileRes>(
    `/users/me/sync-kakao-profile`,
    request.data ?? request
  );
};

export const getUsers = () => {
  return get<Types.TGETUsersRes>(`/users`);
};

export const getUsersById = (request: Types.TGETUsersByIdReq) => {
  return get<Types.TGETUsersByIdRes>(`/users/${request.userId}`);
};

export const putUsersById = (request: Types.TPUTUsersByIdReq) => {
  const { userId, ...data } = request;
  return put<Types.TPUTUsersByIdRes>(
    `/users/${request.userId}`,
    data.data ?? data
  );
};

export const deleteUsersById = (request: Types.TDELETEUsersByIdReq) => {
  return del<Types.TDELETEUsersByIdRes>(`/users/${request.userId}`);
};
