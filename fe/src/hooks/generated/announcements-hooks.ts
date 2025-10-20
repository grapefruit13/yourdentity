/**
 * @description Announcements 관련 React Query Hooks
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import { useQuery, useMutation } from "@tanstack/react-query";
import * as Api from "@/api/generated/announcements-api";
import { announcementsKeys } from "@/constants/generated/query-keys";
import type * as Types from "@/types/generated/announcements-types";

export const useGetNotionAnnouncements = (
  request: Types.TGETNotionAnnouncementsReq
) => {
  return useQuery({
    queryKey: announcementsKeys.getNotionAnnouncements(request),
    queryFn: () => Api.getNotionAnnouncements(request),
  });
};

export const useGetNotionAnnouncementsSyncById = (
  request: Types.TGETNotionAnnouncementsSyncByIdReq
) => {
  return useQuery({
    queryKey: announcementsKeys.getNotionAnnouncementsSyncById(request),
    queryFn: () => Api.getNotionAnnouncementsSyncById(request),
  });
};

export const useGetNotionAnnouncementsDeleteById = (
  request: Types.TGETNotionAnnouncementsDeleteByIdReq
) => {
  return useQuery({
    queryKey: announcementsKeys.getNotionAnnouncementsDeleteById(request),
    queryFn: () => Api.getNotionAnnouncementsDeleteById(request),
  });
};

export const useGetNotionAnnouncementsById = (
  request: Types.TGETNotionAnnouncementsByIdReq
) => {
  return useQuery({
    queryKey: announcementsKeys.getNotionAnnouncementsById(request),
    queryFn: () => Api.getNotionAnnouncementsById(request),
  });
};
