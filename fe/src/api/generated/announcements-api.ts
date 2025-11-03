/**
 * @description Announcements 관련 API 함수들
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import { get, post, put, patch, del } from "@/lib/axios";
import type * as Types from "@/types/generated/announcements-types";

export const getNotionAnnouncements = (
  request: Types.TGETNotionAnnouncementsReq
) => {
  return get<Types.TGETNotionAnnouncementsRes>(`/notion/announcements`, {
    params: request,
  });
};

export const getNotionAnnouncementsSyncById = (
  request: Types.TGETNotionAnnouncementsSyncByIdReq
) => {
  return get<Types.TGETNotionAnnouncementsSyncByIdRes>(
    `/notion/announcements/${request.pageId}/sync`
  );
};

export const getNotionAnnouncementsDeleteById = (
  request: Types.TGETNotionAnnouncementsDeleteByIdReq
) => {
  return get<Types.TGETNotionAnnouncementsDeleteByIdRes>(
    `/notion/announcements/${request.pageId}/delete`
  );
};

export const getNotionAnnouncementsById = (
  request: Types.TGETNotionAnnouncementsByIdReq
) => {
  return get<Types.TGETNotionAnnouncementsByIdRes>(
    `/notion/announcements/${request.pageId}`
  );
};
