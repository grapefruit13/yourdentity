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
  TData = Types.TGETNotionAnnouncementsRes,
>(
  options: {
    request: Types.TGETNotionAnnouncementsReq;
  } & Omit<
    UseQueryOptions<Types.TGETNotionAnnouncementsRes, Error, TData>,
    "queryKey" | "queryFn"
  >
) => {
  const { request, ...queryOptions } = options;
  return useQuery<Types.TGETNotionAnnouncementsRes, Error, TData>({
    queryKey: announcementsKeys.getNotionAnnouncements(request),
    queryFn: async () => {
      const response = await Api.getNotionAnnouncements(request);
      return response.data;
    },
    ...queryOptions,
  });
};

export const useGetNotionAnnouncementsSyncById = <
  TData = Types.TGETNotionAnnouncementsSyncByIdRes,
>(
  options: {
    request: Types.TGETNotionAnnouncementsSyncByIdReq;
  } & Omit<
    UseQueryOptions<Types.TGETNotionAnnouncementsSyncByIdRes, Error, TData>,
    "queryKey" | "queryFn"
  >
) => {
  const { request, ...queryOptions } = options;
  return useQuery<Types.TGETNotionAnnouncementsSyncByIdRes, Error, TData>({
    queryKey: announcementsKeys.getNotionAnnouncementsSyncById(request),
    queryFn: async () => {
      const response = await Api.getNotionAnnouncementsSyncById(request);
      return response.data;
    },
    ...queryOptions,
  });
};

export const useGetNotionAnnouncementsDeleteById = <
  TData = Types.TGETNotionAnnouncementsDeleteByIdRes,
>(
  options: {
    request: Types.TGETNotionAnnouncementsDeleteByIdReq;
  } & Omit<
    UseQueryOptions<Types.TGETNotionAnnouncementsDeleteByIdRes, Error, TData>,
    "queryKey" | "queryFn"
  >
) => {
  const { request, ...queryOptions } = options;
  return useQuery<Types.TGETNotionAnnouncementsDeleteByIdRes, Error, TData>({
    queryKey: announcementsKeys.getNotionAnnouncementsDeleteById(request),
    queryFn: async () => {
      const response = await Api.getNotionAnnouncementsDeleteById(request);
      return response.data;
    },
    ...queryOptions,
  });
};

export const useGetNotionAnnouncementsById = <
  TData = Types.TGETNotionAnnouncementsByIdRes,
>(
  options: {
    request: Types.TGETNotionAnnouncementsByIdReq;
  } & Omit<
    UseQueryOptions<Types.TGETNotionAnnouncementsByIdRes, Error, TData>,
    "queryKey" | "queryFn"
  >
) => {
  const { request, ...queryOptions } = options;
  return useQuery<Types.TGETNotionAnnouncementsByIdRes, Error, TData>({
    queryKey: announcementsKeys.getNotionAnnouncementsById(request),
    queryFn: async () => {
      const response = await Api.getNotionAnnouncementsById(request);
      return response.data;
    },
    ...queryOptions,
  });
};
