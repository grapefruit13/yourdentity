/**
 * @description Users 관련 React Query Hooks
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import {
  useQuery,
  useMutation,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";
import * as Api from "@/api/generated/users-api";
import { usersKeys } from "@/constants/generated/query-keys";
import type * as Types from "@/types/generated/users-types";

export const usePatchUsersMeOnboarding = <
  TContext = unknown,
  TVariables = Types.TPATCHUsersMeOnboardingReq,
>(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof Api.patchUsersMeOnboarding>>,
      Error,
      TVariables,
      TContext
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    Awaited<ReturnType<typeof Api.patchUsersMeOnboarding>>,
    Error,
    TVariables,
    TContext
  >({
    mutationFn: (request: Types.TPATCHUsersMeOnboardingReq) =>
      Api.patchUsersMeOnboarding(request),
    ...options,
  });
};

export const useGetUsersMe = <
  TData = Awaited<ReturnType<typeof Api.getUsersMe>>,
>(
  options?: Omit<
    UseQueryOptions<Awaited<ReturnType<typeof Api.getUsersMe>>, Error, TData>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery<Awaited<ReturnType<typeof Api.getUsersMe>>, Error, TData>({
    queryKey: usersKeys.getUsersMe,
    queryFn: () => Api.getUsersMe(),
    ...options,
  });
};

export const useGetUsersMeMyPage = <
  TData = Awaited<ReturnType<typeof Api.getUsersMeMyPage>>,
>(
  options?: Omit<
    UseQueryOptions<
      Awaited<ReturnType<typeof Api.getUsersMeMyPage>>,
      Error,
      TData
    >,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery<
    Awaited<ReturnType<typeof Api.getUsersMeMyPage>>,
    Error,
    TData
  >({
    queryKey: usersKeys.getUsersMeMyPage,
    queryFn: () => Api.getUsersMeMyPage(),
    ...options,
  });
};

export const useGetUsersMePosts = <
  TData = Awaited<ReturnType<typeof Api.getUsersMePosts>>,
>(
  options: {
    request: Types.TGETUsersMePostsReq;
  } & Omit<
    UseQueryOptions<
      Awaited<ReturnType<typeof Api.getUsersMePosts>>,
      Error,
      TData
    >,
    "queryKey" | "queryFn"
  >
) => {
  const { request, ...queryOptions } = options;
  return useQuery<
    Awaited<ReturnType<typeof Api.getUsersMePosts>>,
    Error,
    TData
  >({
    queryKey: usersKeys.getUsersMePosts(request),
    queryFn: () => Api.getUsersMePosts(request),
    ...queryOptions,
  });
};

export const useGetUsersMeLikedPosts = <
  TData = Awaited<ReturnType<typeof Api.getUsersMeLikedPosts>>,
>(
  options: {
    request: Types.TGETUsersMeLikedPostsReq;
  } & Omit<
    UseQueryOptions<
      Awaited<ReturnType<typeof Api.getUsersMeLikedPosts>>,
      Error,
      TData
    >,
    "queryKey" | "queryFn"
  >
) => {
  const { request, ...queryOptions } = options;
  return useQuery<
    Awaited<ReturnType<typeof Api.getUsersMeLikedPosts>>,
    Error,
    TData
  >({
    queryKey: usersKeys.getUsersMeLikedPosts(request),
    queryFn: () => Api.getUsersMeLikedPosts(request),
    ...queryOptions,
  });
};

export const useGetUsersMeCommentedPosts = <
  TData = Awaited<ReturnType<typeof Api.getUsersMeCommentedPosts>>,
>(
  options: {
    request: Types.TGETUsersMeCommentedPostsReq;
  } & Omit<
    UseQueryOptions<
      Awaited<ReturnType<typeof Api.getUsersMeCommentedPosts>>,
      Error,
      TData
    >,
    "queryKey" | "queryFn"
  >
) => {
  const { request, ...queryOptions } = options;
  return useQuery<
    Awaited<ReturnType<typeof Api.getUsersMeCommentedPosts>>,
    Error,
    TData
  >({
    queryKey: usersKeys.getUsersMeCommentedPosts(request),
    queryFn: () => Api.getUsersMeCommentedPosts(request),
    ...queryOptions,
  });
};

export const useGetUsersNicknameAvailability = <
  TData = Awaited<ReturnType<typeof Api.getUsersNicknameAvailability>>,
>(
  options: {
    request: Types.TGETUsersNicknameAvailabilityReq;
  } & Omit<
    UseQueryOptions<
      Awaited<ReturnType<typeof Api.getUsersNicknameAvailability>>,
      Error,
      TData
    >,
    "queryKey" | "queryFn"
  >
) => {
  const { request, ...queryOptions } = options;
  return useQuery<
    Awaited<ReturnType<typeof Api.getUsersNicknameAvailability>>,
    Error,
    TData
  >({
    queryKey: usersKeys.getUsersNicknameAvailability(request),
    queryFn: () => Api.getUsersNicknameAvailability(request),
    ...queryOptions,
  });
};

export const usePostUsersMeSyncKakaoProfile = <
  TContext = unknown,
  TVariables = Types.TPOSTUsersMeSyncKakaoProfileReq,
>(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof Api.postUsersMeSyncKakaoProfile>>,
      Error,
      TVariables,
      TContext
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    Awaited<ReturnType<typeof Api.postUsersMeSyncKakaoProfile>>,
    Error,
    TVariables,
    TContext
  >({
    mutationFn: (request: Types.TPOSTUsersMeSyncKakaoProfileReq) =>
      Api.postUsersMeSyncKakaoProfile(request),
    ...options,
  });
};

export const useGetUsers = <TData = Awaited<ReturnType<typeof Api.getUsers>>>(
  options?: Omit<
    UseQueryOptions<Awaited<ReturnType<typeof Api.getUsers>>, Error, TData>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery<Awaited<ReturnType<typeof Api.getUsers>>, Error, TData>({
    queryKey: usersKeys.getUsers,
    queryFn: () => Api.getUsers(),
    ...options,
  });
};

export const useGetUsersById = <
  TData = Awaited<ReturnType<typeof Api.getUsersById>>,
>(
  options: {
    request: Types.TGETUsersByIdReq;
  } & Omit<
    UseQueryOptions<Awaited<ReturnType<typeof Api.getUsersById>>, Error, TData>,
    "queryKey" | "queryFn"
  >
) => {
  const { request, ...queryOptions } = options;
  return useQuery<Awaited<ReturnType<typeof Api.getUsersById>>, Error, TData>({
    queryKey: usersKeys.getUsersById(request),
    queryFn: () => Api.getUsersById(request),
    ...queryOptions,
  });
};

export const usePutUsersById = <
  TContext = unknown,
  TVariables = Types.TPUTUsersByIdReq,
>(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof Api.putUsersById>>,
      Error,
      TVariables,
      TContext
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    Awaited<ReturnType<typeof Api.putUsersById>>,
    Error,
    TVariables,
    TContext
  >({
    mutationFn: (request: Types.TPUTUsersByIdReq) => Api.putUsersById(request),
    ...options,
  });
};

export const useDeleteUsersById = <
  TContext = unknown,
  TVariables = Types.TDELETEUsersByIdReq,
>(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof Api.deleteUsersById>>,
      Error,
      TVariables,
      TContext
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    Awaited<ReturnType<typeof Api.deleteUsersById>>,
    Error,
    TVariables,
    TContext
  >({
    mutationFn: (request: Types.TDELETEUsersByIdReq) =>
      Api.deleteUsersById(request),
    ...options,
  });
};
