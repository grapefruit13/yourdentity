/**
 * @description Routines 관련 타입 정의
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import type * as Schema from "./api-schema";

export interface TGETRoutinesReq {
  page?: number;
  size?: number;
}

export type TGETRoutinesRes = {
  routines?: Schema.RoutineListItem[];
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

export interface TGETRoutinesByIdReq {
  routineId: string;
}

export type TGETRoutinesByIdRes = Schema.RoutineDetail;

export interface TPOSTRoutinesApplyByIdReq {
  routineId: string;
  data: {
    selectedVariant?: string;
    quantity?: number;
    customFieldsResponse?: Record<string, any>;
  };
}

export type TPOSTRoutinesApplyByIdRes = Schema.ApplicationResponse;

export interface TPOSTRoutinesLikeByIdReq {
  routineId: string;
}

export type TPOSTRoutinesLikeByIdRes = Schema.LikeToggleResponse;

export interface TPOSTRoutinesQnaByIdReq {
  routineId: string;
  data: {
    content: any[];
  };
}

export type TPOSTRoutinesQnaByIdRes = {
  qnaId?: string;
  routineId?: string;
  userId?: string;
  content?: Record<string, any>[];
  media?: Record<string, any>[];
  answerContent?: Record<string, any>[];
  answerMedia?: Record<string, any>[];
  likesCount?: number;
  createdAt?: string;
};

export interface TPUTRoutinesQnaByTwoIdsReq {
  routineId: string;
  qnaId: string;
  data: {
    content: any[];
  };
}

export type TPUTRoutinesQnaByTwoIdsRes = {
  qnaId?: string;
  routineId?: string;
  userId?: string;
  content?: Record<string, any>[];
  media?: Record<string, any>[];
  answerContent?: Record<string, any>[];
  answerMedia?: Record<string, any>[];
  likesCount?: number;
  updatedAt?: string;
};

export interface TPOSTRoutinesQnaLikeByIdReq {
  qnaId: string;
}

export type TPOSTRoutinesQnaLikeByIdRes = Schema.QnALikeToggleResponse;

export interface TDELETERoutinesQnaByIdReq {
  qnaId: string;
}
