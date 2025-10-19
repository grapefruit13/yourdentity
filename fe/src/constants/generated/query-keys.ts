/**
 * @description Swagger에서 자동 생성된 Query Keys
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

// Announcements Query Keys
export const announcementsKeys = {
  getNotionAnnouncements: ["announcements", "getNotionAnnouncements"] as const,
  getNotionAnnouncementsSyncById: [
    "announcements",
    "getNotionAnnouncementsSyncById",
  ] as const,
  getNotionAnnouncementsDeleteById: [
    "announcements",
    "getNotionAnnouncementsDeleteById",
  ] as const,
  getNotionAnnouncementsById: [
    "announcements",
    "getNotionAnnouncementsById",
  ] as const,
} as const;

// Auth Query Keys
export const authKeys = {
  postAuthLogout: ["auth", "postAuthLogout"] as const,
  getAuthVerify: ["auth", "getAuthVerify"] as const,
} as const;

// Comments Query Keys
export const commentsKeys = {
  getCommentsCommunitiesPostsByTwoIds: [
    "comments",
    "getCommentsCommunitiesPostsByTwoIds",
  ] as const,
  postCommentsCommunitiesPostsByTwoIds: [
    "comments",
    "postCommentsCommunitiesPostsByTwoIds",
  ] as const,
  putCommentsById: ["comments", "putCommentsById"] as const,
  deleteCommentsById: ["comments", "deleteCommentsById"] as const,
  postCommentsLikeById: ["comments", "postCommentsLikeById"] as const,
} as const;

// Communities Query Keys
export const communitiesKeys = {
  getCommunities: ["communities", "getCommunities"] as const,
  getCommunitiesPosts: ["communities", "getCommunitiesPosts"] as const,
  getCommunitiesById: ["communities", "getCommunitiesById"] as const,
  getCommunitiesMembersById: [
    "communities",
    "getCommunitiesMembersById",
  ] as const,
  getCommunitiesPostsById: ["communities", "getCommunitiesPostsById"] as const,
  postCommunitiesPostsById: [
    "communities",
    "postCommunitiesPostsById",
  ] as const,
  getCommunitiesPostsByTwoIds: [
    "communities",
    "getCommunitiesPostsByTwoIds",
  ] as const,
  putCommunitiesPostsByTwoIds: [
    "communities",
    "putCommunitiesPostsByTwoIds",
  ] as const,
  deleteCommunitiesPostsByTwoIds: [
    "communities",
    "deleteCommunitiesPostsByTwoIds",
  ] as const,
  postCommunitiesPostsLikeByTwoIds: [
    "communities",
    "postCommunitiesPostsLikeByTwoIds",
  ] as const,
} as const;

// FAQs Query Keys
export const faqsKeys = {
  getFaqs: ["faqs", "getFaqs"] as const,
  getFaqsBlocksById: ["faqs", "getFaqsBlocksById"] as const,
} as const;

// FCM Query Keys
export const fcmKeys = {
  postFcmToken: ["fcm", "postFcmToken"] as const,
  getFcmTokens: ["fcm", "getFcmTokens"] as const,
  deleteFcmTokenById: ["fcm", "deleteFcmTokenById"] as const,
} as const;

// Gatherings Query Keys
export const gatheringsKeys = {
  getGatherings: ["gatherings", "getGatherings"] as const,
  getGatheringsById: ["gatherings", "getGatheringsById"] as const,
  postGatheringsApplyById: ["gatherings", "postGatheringsApplyById"] as const,
  postGatheringsLikeById: ["gatherings", "postGatheringsLikeById"] as const,
  postGatheringsQnaById: ["gatherings", "postGatheringsQnaById"] as const,
  putGatheringsQnaByTwoIds: ["gatherings", "putGatheringsQnaByTwoIds"] as const,
  postGatheringsQnaLikeById: [
    "gatherings",
    "postGatheringsQnaLikeById",
  ] as const,
  deleteGatheringsQnaById: ["gatherings", "deleteGatheringsQnaById"] as const,
} as const;

// Images Query Keys
export const imagesKeys = {
  postImagesUploadImage: ["images", "postImagesUploadImage"] as const,
} as const;

// Missions Query Keys
export const missionsKeys = {
  postUsersMissionsById: ["missions", "postUsersMissionsById"] as const,
  getUsersMissionsById: ["missions", "getUsersMissionsById"] as const,
  getUsersMissionsByTwoIds: ["missions", "getUsersMissionsByTwoIds"] as const,
  putUsersMissionsByTwoIds: ["missions", "putUsersMissionsByTwoIds"] as const,
  deleteUsersMissionsByTwoIds: [
    "missions",
    "deleteUsersMissionsByTwoIds",
  ] as const,
} as const;

// NotionUsers Query Keys
export const notionusersKeys = {
  getNotionusersSyncActive: [
    "notionusers",
    "getNotionusersSyncActive",
  ] as const,
} as const;

// Reports Query Keys
export const reportsKeys = {
  postReportcontent: ["reports", "postReportcontent"] as const,
  getReportcontentSyncNotionReports: [
    "reports",
    "getReportcontentSyncNotionReports",
  ] as const,
  postReportcontentMy: ["reports", "postReportcontentMy"] as const,
} as const;

// Routines Query Keys
export const routinesKeys = {
  getRoutines: ["routines", "getRoutines"] as const,
  getRoutinesById: ["routines", "getRoutinesById"] as const,
  postRoutinesApplyById: ["routines", "postRoutinesApplyById"] as const,
  postRoutinesLikeById: ["routines", "postRoutinesLikeById"] as const,
  postRoutinesQnaById: ["routines", "postRoutinesQnaById"] as const,
  putRoutinesQnaByTwoIds: ["routines", "putRoutinesQnaByTwoIds"] as const,
  postRoutinesQnaLikeById: ["routines", "postRoutinesQnaLikeById"] as const,
  deleteRoutinesQnaById: ["routines", "deleteRoutinesQnaById"] as const,
} as const;

// Store Query Keys
export const storeKeys = {
  getStoreProducts: ["store", "getStoreProducts"] as const,
  getStoreProductsById: ["store", "getStoreProductsById"] as const,
  postStorePurchase: ["store", "postStorePurchase"] as const,
  postStoreProductsLikeById: ["store", "postStoreProductsLikeById"] as const,
  postStoreProductsQnaById: ["store", "postStoreProductsQnaById"] as const,
  putStoreProductsQnaByTwoIds: [
    "store",
    "putStoreProductsQnaByTwoIds",
  ] as const,
  postStoreQnaLikeById: ["store", "postStoreQnaLikeById"] as const,
  deleteStoreQnaById: ["store", "deleteStoreQnaById"] as const,
} as const;

// TMI Query Keys
export const tmiKeys = {
  getTmis: ["tmi", "getTmis"] as const,
  getTmisById: ["tmi", "getTmisById"] as const,
  postTmisApplyById: ["tmi", "postTmisApplyById"] as const,
  postTmisLikeById: ["tmi", "postTmisLikeById"] as const,
  postTmisQnaById: ["tmi", "postTmisQnaById"] as const,
  putTmisQnaByTwoIds: ["tmi", "putTmisQnaByTwoIds"] as const,
  postTmisQnaLikeById: ["tmi", "postTmisQnaLikeById"] as const,
  deleteTmisQnaById: ["tmi", "deleteTmisQnaById"] as const,
} as const;

// Users Query Keys
export const usersKeys = {
  postUsersProvision: ["users", "postUsersProvision"] as const,
  postUsers: ["users", "postUsers"] as const,
  getUsers: ["users", "getUsers"] as const,
  getUsersById: ["users", "getUsersById"] as const,
  putUsersById: ["users", "putUsersById"] as const,
  deleteUsersById: ["users", "deleteUsersById"] as const,
} as const;
