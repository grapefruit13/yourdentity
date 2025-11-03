/**
 * @description Announcements 관련 타입 정의
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import type * as Schema from "./api-schema";

export interface TGETNotionAnnouncementsReq {
  limit?: number;
  cursor?: string;
}

export type TGETNotionAnnouncementsRes = Schema.AnnouncementListResponse;

export interface TGETNotionAnnouncementsSyncByIdReq {
  pageId: string;
}

export type TGETNotionAnnouncementsSyncByIdRes =
  Schema.AnnouncementSyncResponse;

export interface TGETNotionAnnouncementsDeleteByIdReq {
  pageId: string;
}

export type TGETNotionAnnouncementsDeleteByIdRes =
  Schema.AnnouncementDeleteResponse;

export interface TGETNotionAnnouncementsByIdReq {
  pageId: string;
}

export type TGETNotionAnnouncementsByIdRes = Schema.AnnouncementDetailResponse;
