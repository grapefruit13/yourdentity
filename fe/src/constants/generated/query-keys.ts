/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * @description Swagger에서 자동 생성된 Query Keys
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import type * as announcementsTypes from "@/types/generated/announcements-types";
import type * as authTypes from "@/types/generated/auth-types";
import type * as commentsTypes from "@/types/generated/comments-types";
import type * as communitiesTypes from "@/types/generated/communities-types";
import type * as faqsTypes from "@/types/generated/faqs-types";
import type * as fcmTypes from "@/types/generated/fcm-types";
import type * as gatheringsTypes from "@/types/generated/gatherings-types";
import type * as imagesTypes from "@/types/generated/images-types";
import type * as missionsTypes from "@/types/generated/missions-types";
import type * as notionusersTypes from "@/types/generated/notionusers-types";
import type * as reportsTypes from "@/types/generated/reports-types";
import type * as routinesTypes from "@/types/generated/routines-types";
import type * as storeTypes from "@/types/generated/store-types";
import type * as tmiTypes from "@/types/generated/tmi-types";
import type * as usersTypes from "@/types/generated/users-types";

function __normalizeQuery(obj: Record<string, unknown>) {
  const normalized: Record<string, unknown> = {};
  Object.keys(obj).forEach((k) => {
    const val = (obj as any)[k];
    if (val === undefined) return;
    normalized[k] = val instanceof Date ? val.toISOString() : val;
  });
  return normalized;
}

function __buildKey(
  tag: string,
  name: string,
  parts?: { path?: Record<string, unknown>; query?: Record<string, unknown> }
) {
  if (!parts) return [tag, name] as const;
  const { path, query } = parts;
  return [tag, name, path ?? {}, __normalizeQuery(query ?? {})] as const;
}

// Announcements Query Keys
export const announcementsKeys = {
  getNotionAnnouncements: (
    request: announcementsTypes.TGETNotionAnnouncementsReq
  ) =>
    __buildKey("announcements", "getNotionAnnouncements", {
      path: {},
      query: { limit: request.limit, cursor: request.cursor },
    }),
  getNotionAnnouncementsSyncById: (
    request: announcementsTypes.TGETNotionAnnouncementsSyncByIdReq
  ) =>
    __buildKey("announcements", "getNotionAnnouncementsSyncById", {
      path: { pageId: request.pageId },
      query: {},
    }),
  getNotionAnnouncementsDeleteById: (
    request: announcementsTypes.TGETNotionAnnouncementsDeleteByIdReq
  ) =>
    __buildKey("announcements", "getNotionAnnouncementsDeleteById", {
      path: { pageId: request.pageId },
      query: {},
    }),
  getNotionAnnouncementsById: (
    request: announcementsTypes.TGETNotionAnnouncementsByIdReq
  ) =>
    __buildKey("announcements", "getNotionAnnouncementsById", {
      path: { pageId: request.pageId },
      query: {},
    }),
} as const;

// Auth Query Keys
export const authKeys = {
  getAuthVerify: __buildKey("auth", "getAuthVerify"),
} as const;

// Comments Query Keys
export const commentsKeys = {
  getCommentsCommunitiesPostsByTwoIds: (
    request: commentsTypes.TGETCommentsCommunitiesPostsByTwoIdsReq
  ) =>
    __buildKey("comments", "getCommentsCommunitiesPostsByTwoIds", {
      path: { communityId: request.communityId, postId: request.postId },
      query: { page: request.page, size: request.size },
    }),
} as const;

// Communities Query Keys
export const communitiesKeys = {
  getCommunities: (request: communitiesTypes.TGETCommunitiesReq) =>
    __buildKey("communities", "getCommunities", {
      path: {},
      query: { type: request.type, page: request.page, size: request.size },
    }),
  getCommunitiesPosts: (request: communitiesTypes.TGETCommunitiesPostsReq) =>
    __buildKey("communities", "getCommunitiesPosts", {
      path: {},
      query: { page: request.page, size: request.size, filter: request.filter },
    }),
  getCommunitiesById: (request: communitiesTypes.TGETCommunitiesByIdReq) =>
    __buildKey("communities", "getCommunitiesById", {
      path: { communityId: request.communityId },
      query: {},
    }),
  getCommunitiesMembersById: (
    request: communitiesTypes.TGETCommunitiesMembersByIdReq
  ) =>
    __buildKey("communities", "getCommunitiesMembersById", {
      path: { communityId: request.communityId },
      query: { page: request.page, size: request.size },
    }),
  getCommunitiesPostsById: (
    request: communitiesTypes.TGETCommunitiesPostsByIdReq
  ) =>
    __buildKey("communities", "getCommunitiesPostsById", {
      path: { communityId: request.communityId },
      query: { page: request.page, size: request.size },
    }),
  getCommunitiesPostsByTwoIds: (
    request: communitiesTypes.TGETCommunitiesPostsByTwoIdsReq
  ) =>
    __buildKey("communities", "getCommunitiesPostsByTwoIds", {
      path: { communityId: request.communityId, postId: request.postId },
      query: {},
    }),
} as const;

// FAQs Query Keys
export const faqsKeys = {
  getFaqs: (request: faqsTypes.TGETFaqsReq) =>
    __buildKey("faqs", "getFaqs", {
      path: {},
      query: {
        category: request.category,
        pageSize: request.pageSize,
        startCursor: request.startCursor,
      },
    }),
  getFaqsBlocksById: (request: faqsTypes.TGETFaqsBlocksByIdReq) =>
    __buildKey("faqs", "getFaqsBlocksById", {
      path: { pageId: request.pageId },
      query: { pageSize: request.pageSize, startCursor: request.startCursor },
    }),
} as const;

// FCM Query Keys
export const fcmKeys = {
  getFcmTokens: __buildKey("fcm", "getFcmTokens"),
} as const;

// Gatherings Query Keys
export const gatheringsKeys = {
  getGatherings: (request: gatheringsTypes.TGETGatheringsReq) =>
    __buildKey("gatherings", "getGatherings", {
      path: {},
      query: { page: request.page, size: request.size },
    }),
  getGatheringsById: (request: gatheringsTypes.TGETGatheringsByIdReq) =>
    __buildKey("gatherings", "getGatheringsById", {
      path: { gatheringId: request.gatheringId },
      query: {},
    }),
} as const;

// Images Query Keys
export const imagesKeys = {} as const;

// Missions Query Keys
export const missionsKeys = {
  getUsersMissionsById: (request: missionsTypes.TGETUsersMissionsByIdReq) =>
    __buildKey("missions", "getUsersMissionsById", {
      path: { userId: request.userId },
      query: { status: request.status },
    }),
  getUsersMissionsByTwoIds: (
    request: missionsTypes.TGETUsersMissionsByTwoIdsReq
  ) =>
    __buildKey("missions", "getUsersMissionsByTwoIds", {
      path: { userId: request.userId, missionId: request.missionId },
      query: {},
    }),
} as const;

// NotionUsers Query Keys
export const notionusersKeys = {
  getNotionusersSyncActive: __buildKey(
    "notionusers",
    "getNotionusersSyncActive"
  ),
} as const;

// Reports Query Keys
export const reportsKeys = {
  getReportcontentSyncNotionReports: __buildKey(
    "reports",
    "getReportcontentSyncNotionReports"
  ),
} as const;

// Routines Query Keys
export const routinesKeys = {
  getRoutines: (request: routinesTypes.TGETRoutinesReq) =>
    __buildKey("routines", "getRoutines", {
      path: {},
      query: { page: request.page, size: request.size },
    }),
  getRoutinesById: (request: routinesTypes.TGETRoutinesByIdReq) =>
    __buildKey("routines", "getRoutinesById", {
      path: { routineId: request.routineId },
      query: {},
    }),
} as const;

// Store Query Keys
export const storeKeys = {
  getStoreProducts: (request: storeTypes.TGETStoreProductsReq) =>
    __buildKey("store", "getStoreProducts", {
      path: {},
      query: { page: request.page, size: request.size },
    }),
  getStoreProductsById: (request: storeTypes.TGETStoreProductsByIdReq) =>
    __buildKey("store", "getStoreProductsById", {
      path: { productId: request.productId },
      query: {},
    }),
} as const;

// TMI Query Keys
export const tmiKeys = {
  getTmis: (request: tmiTypes.TGETTmisReq) =>
    __buildKey("tmi", "getTmis", {
      path: {},
      query: { page: request.page, size: request.size },
    }),
  getTmisById: (request: tmiTypes.TGETTmisByIdReq) =>
    __buildKey("tmi", "getTmisById", {
      path: { projectId: request.projectId },
      query: {},
    }),
} as const;

// Users Query Keys
export const usersKeys = {
  getUsers: __buildKey("users", "getUsers"),
  getUsersById: (request: usersTypes.TGETUsersByIdReq) =>
    __buildKey("users", "getUsersById", {
      path: { userId: request.userId },
      query: {},
    }),
} as const;
