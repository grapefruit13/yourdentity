/**
 * @description TMI 관련 API 함수들
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { get, post, put, patch, del } from "@/lib/axios";
import type * as Types from "@/types/generated/tmi-types";

export const getTmis = (request: Types.TGETTmisReq) => {
  return get<Types.TGETTmisRes>(`/tmis`, { params: request });
};

export const getTmisById = (request: Types.TGETTmisByIdReq) => {
  return get<Types.TGETTmisByIdRes>(`/tmis/${request.projectId}`);
};

export const postTmisApplyById = (request: Types.TPOSTTmisApplyByIdReq) => {
  const { projectId, ...data } = request;
  return post<Types.TPOSTTmisApplyByIdRes>(
    `/tmis/${request.projectId}/apply`,
    data.data ?? data
  );
};

export const postTmisLikeById = (request: Types.TPOSTTmisLikeByIdReq) => {
  return post<Types.TPOSTTmisLikeByIdRes>(`/tmis/${request.projectId}/like`);
};

export const postTmisQnaById = (request: Types.TPOSTTmisQnaByIdReq) => {
  const { projectId, ...data } = request;
  return post<Types.TPOSTTmisQnaByIdRes>(
    `/tmis/${request.projectId}/qna`,
    data.data ?? data
  );
};

export const putTmisQnaByTwoIds = (request: Types.TPUTTmisQnaByTwoIdsReq) => {
  const { projectId, qnaId, ...data } = request;
  return put<Types.TPUTTmisQnaByTwoIdsRes>(
    `/tmis/${request.projectId}/qna/${request.qnaId}`,
    data.data ?? data
  );
};

export const postTmisQnaLikeById = (request: Types.TPOSTTmisQnaLikeByIdReq) => {
  return post<Types.TPOSTTmisQnaLikeByIdRes>(`/tmis/qna/${request.qnaId}/like`);
};

export const deleteTmisQnaById = (request: Types.TDELETETmisQnaByIdReq) => {
  return del<any>(`/tmis/qna/${request.qnaId}`);
};
