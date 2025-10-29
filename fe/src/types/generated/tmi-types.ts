/**
 * @description TMI 관련 타입 정의
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import type * as Schema from "./api-schema";

export interface TGETTmisReq {
  page?: number;
  size?: number;
}

export type TGETTmisRes = {
  tmis?: Schema.TmiProjectListItem[];
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

export interface TGETTmisByIdReq {
  projectId: string;
}

export type TGETTmisByIdRes = {
  id?: string;
  name?: string;
  description?: string;
  status?: string;
  price?: number;
  currency?: string;
  stockCount?: number;
  soldCount?: number;
  viewCount?: number;
  buyable?: boolean;
  sellerId?: string;
  sellerName?: string;
  content?: Schema.ContentItem[];
  media?: Schema.MediaItem[];
  options?: any[];
  primaryDetails?: any[];
  variants?: any[];
  customFields?: any[];
  deadline?: string;
  createdAt?: string;
  updatedAt?: string;
  qna?: Schema.QnAItem[];
  communityPosts?: Record<string, any>[];
};

export interface TPOSTTmisApplyByIdReq {
  projectId: string;
  data: {
    selectedVariant?: string;
    quantity?: number;
    customFieldsRequest?: Record<string, any>;
    activityNickname?: string;
    activityPhoneNumber?: string;
    region?: {
      city?: string;
      district?: string;
    };
    currentSituation?: string;
    applicationSource?: string;
    applicationMotivation?: string;
    canAttendEvents?: boolean;
  };
}

export type TPOSTTmisApplyByIdRes = Schema.ApplicationResponse;

export interface TPOSTTmisLikeByIdReq {
  projectId: string;
}

export type TPOSTTmisLikeByIdRes = {
  projectId?: string;
  userId?: string;
  isLiked?: boolean;
  likesCount?: number;
};

export interface TPOSTTmisQnaByIdReq {
  projectId: string;
  data: {
    content: any[];
  };
}

export type TPOSTTmisQnaByIdRes = {
  qnaId?: string;
  tmiId?: string;
  userId?: string;
  content?: Record<string, any>[];
  media?: Record<string, any>[];
  answerContent?: any[];
  answerMedia?: any[];
  likesCount?: number;
  createdAt?: string;
};

export interface TPUTTmisQnaByTwoIdsReq {
  projectId: string;
  qnaId: string;
  data: {
    content: any[];
  };
}

export type TPUTTmisQnaByTwoIdsRes = {
  qnaId?: string;
  tmiId?: string;
  userId?: string;
  content?: Record<string, any>[];
  media?: Record<string, any>[];
  answerContent?: any[];
  answerMedia?: any[];
  likesCount?: number;
  updatedAt?: string;
};

export interface TPOSTTmisQnaLikeByIdReq {
  qnaId: string;
}

export type TPOSTTmisQnaLikeByIdRes = {
  qnaId?: string;
  userId?: string;
  isLiked?: boolean;
  likesCount?: number;
};

export interface TDELETETmisQnaByIdReq {
  qnaId: string;
}
