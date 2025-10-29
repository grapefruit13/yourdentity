/**
 * @description Comments 관련 타입 정의
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import type * as Schema from "./api-schema";

export interface TGETCommentsCommunitiesPostsByTwoIdsReq {
  communityId: string;
  postId: string;
  page?: number;
  size?: number;
}

export type TGETCommentsCommunitiesPostsByTwoIdsRes = {
  comments?: {
    id?: string;
    type?: string;
    targetId?: string;
    targetPath?: string;
    userId?: string;
    author?: string;
    content?: Schema.ContentItem[];
    media?: Schema.MediaItem[];
    parentId?: string;
    depth?: number;
    isReply?: boolean;
    isLocked?: boolean;
    reportsCount?: number;
    likesCount?: number;
    deleted?: boolean;
    deletedAt?: string;
    createdAt?: string;
    updatedAt?: string;
    replies?: Record<string, any>[];
  }[];
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

export interface TPOSTCommentsCommunitiesPostsByTwoIdsReq {
  communityId: string;
  postId: string;
  data: {
    content: Schema.ContentItem[];
    parentId?: string;
  };
}

export type TPOSTCommentsCommunitiesPostsByTwoIdsRes = {
  id?: string;
  type?: string;
  targetId?: string;
  targetPath?: string;
  userId?: string;
  author?: string;
  content?: Schema.ContentItem[];
  media?: Schema.MediaItem[];
  parentId?: string;
  depth?: number;
  isReply?: boolean;
  isLocked?: boolean;
  reportsCount?: number;
  likesCount?: number;
  deleted?: boolean;
  deletedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export interface TPUTCommentsByIdReq {
  commentId: string;
  data: {
    content: Schema.ContentItem[];
  };
}

export type TPUTCommentsByIdRes = {
  id?: string;
  type?: string;
  targetId?: string;
  targetPath?: string;
  userId?: string;
  author?: string;
  content?: Schema.ContentItem[];
  media?: Schema.MediaItem[];
  parentId?: string;
  depth?: number;
  isReply?: boolean;
  isLocked?: boolean;
  reportsCount?: number;
  likesCount?: number;
  deleted?: boolean;
  deletedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export interface TDELETECommentsByIdReq {
  commentId: string;
}

export interface TPOSTCommentsLikeByIdReq {
  commentId: string;
}

export type TPOSTCommentsLikeByIdRes = {
  commentId?: string;
  userId?: string;
  isLiked?: boolean;
  likesCount?: number;
};
