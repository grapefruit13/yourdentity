/**
 * @description Communities 관련 타입 정의
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import type * as Schema from "./api-schema";

export interface TGETCommunitiesReq {
  type?: "interest" | "anonymous";
  page?: number;
  size?: number;
}

export type TGETCommunitiesRes = {
  communities?: Schema.Community[];
  pagination?: {
    pageNumber?: number;
    pageSize?: number;
    totalElements?: number;
    totalPages?: number;
    hasNext?: boolean;
    hasPrevious?: boolean;
    isFirst?: boolean;
    isLast?: boolean;
  };
};

export interface TGETCommunitiesPostsReq {
  page?: number;
  size?: number;
  filter?: "routine" | "gathering" | "tmi";
}

export type TGETCommunitiesPostsRes = {
  posts?: Schema.CommunityPost[];
  pagination?: {
    pageNumber?: number;
    pageSize?: number;
    totalElements?: number;
    totalPages?: number;
    hasNext?: boolean;
    hasPrevious?: boolean;
    isFirst?: boolean;
    isLast?: boolean;
  };
};

export interface TGETCommunitiesByIdReq {
  communityId: string;
}

export type TGETCommunitiesByIdRes = Schema.Community;

export interface TGETCommunitiesMembersByIdReq {
  communityId: string;
  page?: number;
  size?: number;
}

export type TGETCommunitiesMembersByIdRes = {
  members?: Schema.CommunityMember[];
  pagination?: {
    pageNumber?: number;
    pageSize?: number;
    totalElements?: number;
    totalPages?: number;
    hasNext?: boolean;
    hasPrevious?: boolean;
    isFirst?: boolean;
    isLast?: boolean;
  };
};

export interface TGETCommunitiesPostsByIdReq {
  communityId: string;
  page?: number;
  size?: number;
}

export type TGETCommunitiesPostsByIdRes = {
  posts?: Schema.CommunityPost[];
  pagination?: {
    pageNumber?: number;
    pageSize?: number;
    totalElements?: number;
    totalPages?: number;
    hasNext?: boolean;
    hasPrevious?: boolean;
    isFirst?: boolean;
    isLast?: boolean;
  };
};

export interface TPOSTCommunitiesPostsByIdReq {
  communityId: string;
  data: {
    title: string;
    content?: Schema.ContentItem[];
    refId?: string;
    visibility?: "public" | "private";
    category?: string;
    tags?: string[];
    scheduledDate?: string;
  };
}

export type TPOSTCommunitiesPostsByIdRes = {
  id?: string;
  type?: string;
  refId?: string;
  authorId?: string;
  author?: string;
  communityPath?: string;
  title?: string;
  content?: Schema.ContentItem[];
  media?: Schema.MediaItem[];
  channel?: string;
  category?: string;
  tags?: string[];
  scheduledDate?: string;
  isLocked?: boolean;
  visibility?: string;
  rewardGiven?: boolean;
  reactionsCount?: number;
  likesCount?: number;
  commentsCount?: number;
  reportsCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

export interface TGETCommunitiesPostsByTwoIdsReq {
  communityId: string;
  postId: string;
}

export type TGETCommunitiesPostsByTwoIdsRes = any;

export interface TPUTCommunitiesPostsByTwoIdsReq {
  communityId: string;
  postId: string;
  data: {
    title?: string;
    content?: Schema.ContentItem[];
    refId?: string;
    visibility?: "public" | "private";
    category?: string;
    tags?: string[];
    scheduledDate?: string;
  };
}

export type TPUTCommunitiesPostsByTwoIdsRes = {
  id?: string;
  type?: string;
  refId?: string;
  authorId?: string;
  author?: string;
  communityPath?: string;
  title?: string;
  content?: Schema.ContentItem[];
  media?: Schema.MediaItem[];
  channel?: string;
  category?: string;
  tags?: string[];
  scheduledDate?: string;
  isLocked?: boolean;
  visibility?: string;
  rewardGiven?: boolean;
  reactionsCount?: number;
  likesCount?: number;
  commentsCount?: number;
  reportsCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

export interface TDELETECommunitiesPostsByTwoIdsReq {
  communityId: string;
  postId: string;
}

export interface TPOSTCommunitiesPostsLikeByTwoIdsReq {
  communityId: string;
  postId: string;
}

export type TPOSTCommunitiesPostsLikeByTwoIdsRes = {
  postId?: string;
  userId?: string;
  isLiked?: boolean;
  likesCount?: number;
};
