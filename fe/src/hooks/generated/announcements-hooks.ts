/**
 * @description Announcements 관련 React Query Hooks
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import {
  useQuery,
  useMutation,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";
import * as Api from "@/api/generated/announcements-api";
import { announcementsKeys } from "@/constants/generated/query-keys";
import type * as Types from "@/types/generated/announcements-types";

export const useGetNotionAnnouncements = <
  TData = Awaited<ReturnType<typeof Api.getNotionAnnouncements>>,
>(
  options: {
    request: Types.TGETNotionAnnouncementsReq;
  } & Omit<
    UseQueryOptions<
      Awaited<ReturnType<typeof Api.getNotionAnnouncements>>,
      Error,
      TData
    >,
    "queryKey" | "queryFn"
  >
) => {
  const { request, ...queryOptions } = options;
  return useQuery<
    Awaited<ReturnType<typeof Api.getNotionAnnouncements>>,
    Error,
    TData
  >({
    queryKey: announcementsKeys.getNotionAnnouncements(request),
    queryFn: () => Api.getNotionAnnouncements(request),
    ...queryOptions,
  });
};

export const useGetNotionAnnouncementsSyncById = <
  TData = Awaited<ReturnType<typeof Api.getNotionAnnouncementsSyncById>>,
>(
  options: {
    request: Types.TGETNotionAnnouncementsSyncByIdReq;
  } & Omit<
    UseQueryOptions<
      Awaited<ReturnType<typeof Api.getNotionAnnouncementsSyncById>>,
      Error,
      TData
    >,
    "queryKey" | "queryFn"
  >
) => {
  const { request, ...queryOptions } = options;
  return useQuery<
    Awaited<ReturnType<typeof Api.getNotionAnnouncementsSyncById>>,
    Error,
    TData
  >({
    queryKey: announcementsKeys.getNotionAnnouncementsSyncById(request),
    queryFn: () => Api.getNotionAnnouncementsSyncById(request),
    ...queryOptions,
  });
};

export const useGetNotionAnnouncementsDeleteById = <
  TData = Awaited<ReturnType<typeof Api.getNotionAnnouncementsDeleteById>>,
>(
  options: {
    request: Types.TGETNotionAnnouncementsDeleteByIdReq;
  } & Omit<
    UseQueryOptions<
      Awaited<ReturnType<typeof Api.getNotionAnnouncementsDeleteById>>,
      Error,
      TData
    >,
    "queryKey" | "queryFn"
  >
) => {
  const { request, ...queryOptions } = options;
  return useQuery<
    Awaited<ReturnType<typeof Api.getNotionAnnouncementsDeleteById>>,
    Error,
    TData
  >({
    queryKey: announcementsKeys.getNotionAnnouncementsDeleteById(request),
    queryFn: () => Api.getNotionAnnouncementsDeleteById(request),
    ...queryOptions,
  });
};

export const useGetNotionAnnouncementsById = <
  TData = Awaited<ReturnType<typeof Api.getNotionAnnouncementsById>>,
>(
  options: {
    request: Types.TGETNotionAnnouncementsByIdReq;
  } & Omit<
    UseQueryOptions<
      Awaited<ReturnType<typeof Api.getNotionAnnouncementsById>>,
      Error,
      TData
    >,
    "queryKey" | "queryFn"
  >
) => {
  const { request, ...queryOptions } = options;
  return useQuery<
    Awaited<ReturnType<typeof Api.getNotionAnnouncementsById>>,
    Error,
    TData
  >({
    queryKey: announcementsKeys.getNotionAnnouncementsById(request),
    queryFn: () => Api.getNotionAnnouncementsById(request),
    ...queryOptions,
  });
};
