/**
 * @description API 경로 정의 상수
 * api 함수 생성 시 해당 파일에서 경로 불러와 사용해주세요.
 */

const BASE = {
  USERS: "/users",
  MISSIONS: "/missions",
  IMAGES: "/images",
  ROUTINES: "/routines",
  GATHERINGS: "/gatherings",
  COMMUNITIES: "/communities",
  ANNOUNCEMENTS: "/announcements",
  FAQS: "/faqs",
  AUTH: "/auth",
  COMMENTS: "/comments",
  REPORTS: "/reportContent",
  STORE: "/store",
  TMI: "/tmis",
  NOTION: "/notion",
} as const;

/**
 * @description 부분 경로(세그먼트) 상수: 동적 ID 사이에 끼워 넣어 사용
 * @example 미션 생성 api 요청 경로 : `${BASE_API.USERS.ROOT}/${userId}/${SEGMENTS.MISSIONS}`
 */
const SEGMENTS = {
  MISSIONS: "missions",
  IMAGES: "images",
  ROUTINES: "routines",
  GATHERINGS: "gatherings",
  COMMUNITIES: "communities",
  ANNOUNCEMENTS: "announcements",
  FAQS: "faqs",
  COMMENTS: "comments",
  REPORTS: "reportContent",
  STORE: "store",
  TMI: "tmis",
  APPLY: "apply",
  LIKE: "like",
  QNA: "qna",
  MEMBERS: "members",
  POSTS: "posts",
  SYNC: "sync",
  DELETE: "delete",
  BLOCKS: "blocks",
  UPLOAD_IMAGE: "upload-image",
} as const;

const USERS = {
  ROOT: BASE.USERS,
  PROVISION: `${BASE.USERS}/provision`,
} as const;

const MISSIONS = {
  ROOT: BASE.MISSIONS,
} as const;

const IMAGES = {
  ROOT: BASE.IMAGES,
} as const;

const ROUTINES = {
  ROOT: BASE.ROUTINES,
  QNA: `${BASE.ROUTINES}/${SEGMENTS.QNA}`,
} as const;

const GATHERINGS = {
  ROOT: BASE.GATHERINGS,
} as const;

const COMMUNITIES = {
  ROOT: BASE.COMMUNITIES,
  POSTS: `${BASE.COMMUNITIES}/${SEGMENTS.POSTS}`,
};

const ANNOUNCEMENTS = {
  LIST: `${BASE.NOTION}/${BASE.ANNOUNCEMENTS}`,
};

const FAQS = {
  ROOT: BASE.FAQS,
};

const AUTH = {
  LOGOUT: `${BASE.AUTH}/logout`,
  VERIFY: `${BASE.AUTH}/verify`,
};

const COMMENTS = {
  ROOT: BASE.COMMENTS,
};

const REPORTS = {
  ROOT: BASE.REPORTS,
  SYNC_NOTION_REPORTS: `${BASE.REPORTS}/syncNotionReports`,
  MY: `${BASE.REPORTS}/my`,
};

const STORE = {
  PRODUCTS: `${BASE.STORE}/products`,
  PURCHASES: `${BASE.STORE}/purchase`,
};

const TMI = {
  ROOT: BASE.TMI,
};

export const API_PATH = {
  BASE,
  SEGMENTS,
  USERS,
  MISSIONS,
  IMAGES,
  ROUTINES,
  GATHERINGS,
  COMMUNITIES,
  ANNOUNCEMENTS,
  FAQS,
  AUTH,
  COMMENTS,
  REPORTS,
  STORE,
  TMI,
} as const;
