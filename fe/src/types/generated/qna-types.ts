/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @description QnA 관련 타입 정의
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import type * as Schema from "./api-schema";

export interface TGETQnaByIdReq {
  pageId: string;
  page?: number;
  size?: number;
}

export type TGETQnaByIdRes = {
  qnas?: {
    id?: string;
    pageId?: string;
    pageType?: "program" | "announcement" | "store";
    author?: string;
    content?: string;
    parentId?: string;
    depth?: number;
    isLocked?: boolean;
    likesCount?: number;
    isLiked?: boolean;
    repliesCount?: number;
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

export interface TPOSTQnaByIdReq {
  pageId: string;
  data: {
    pageType: "program" | "announcement" | "store";
    content: string;
    parentId?: string;
  };
}

export type TPOSTQnaByIdRes = {
  id?: string;
  pageId?: string;
  pageType?: "program" | "announcement" | "store";
  author?: string;
  content?: string;
  parentId?: string;
  depth?: number;
  isLocked?: boolean;
  likesCount?: number;
  isLiked?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export interface TDELETEQnaByIdReq {
  qnaId: string;
}

export interface TPUTQnaByIdReq {
  qnaId: string;
  data: {
    content: string;
  };
}

export type TPUTQnaByIdRes = Schema.QnA;

export interface TPOSTQnaLikeByIdReq {
  qnaId: string;
}

export type TPOSTQnaLikeByIdRes = {
  qnaId?: string;
  userId?: string;
  isLiked?: boolean;
  likesCount?: number;
};
