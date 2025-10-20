/**
 * @description Gatherings 관련 타입 정의
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import type * as Schema from "./api-schema";

export interface TGETGatheringsReq {
  page?: number;
  size?: number;
}

export type TGETGatheringsRes = {
  gatherings?: Schema.GatheringListItem[];
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

export interface TGETGatheringsByIdReq {
  gatheringId: string;
}

export type TGETGatheringsByIdRes = Schema.GatheringDetail;

export interface TPOSTGatheringsApplyByIdReq {
  gatheringId: string;
  data: {
    selectedVariant?: string;
    quantity?: number;
    customFieldsResponse?: Record<string, any>;
  };
}

export type TPOSTGatheringsApplyByIdRes = {
  applicationId?: string;
  type?: string;
  targetId?: string;
  userId?: string;
  status?: string;
};

export interface TPOSTGatheringsLikeByIdReq {
  gatheringId: string;
}

export type TPOSTGatheringsLikeByIdRes = {
  gatheringId?: string;
  userId?: string;
  isLiked?: boolean;
  likesCount?: number;
};

export interface TPOSTGatheringsQnaByIdReq {
  gatheringId: string;
  data: {
    content: any[];
  };
}

export type TPOSTGatheringsQnaByIdRes = {
  qnaId?: string;
  gatheringId?: string;
  userId?: string;
  content?: Record<string, any>[];
  media?: Record<string, any>[];
  answerContent?: any[];
  answerMedia?: any[];
  likesCount?: number;
  createdAt?: string;
};

export interface TPUTGatheringsQnaByTwoIdsReq {
  gatheringId: string;
  qnaId: string;
  data: {
    content: any[];
  };
}

export type TPUTGatheringsQnaByTwoIdsRes = {
  qnaId?: string;
  gatheringId?: string;
  userId?: string;
  content?: Record<string, any>[];
  media?: Record<string, any>[];
  answerContent?: any[];
  answerMedia?: any[];
  likesCount?: number;
  updatedAt?: string;
};

export interface TPOSTGatheringsQnaLikeByIdReq {
  qnaId: string;
}

export type TPOSTGatheringsQnaLikeByIdRes = {
  qnaId?: string;
  userId?: string;
  isLiked?: boolean;
  likesCount?: number;
};

export interface TDELETEGatheringsQnaByIdReq {
  qnaId: string;
}
