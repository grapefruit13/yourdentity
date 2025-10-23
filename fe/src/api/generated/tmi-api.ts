/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @description TMI 관련 API 함수들
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import { get, post, put, patch, del } from "@/lib/axios";
import type * as Types from "@/types/generated/tmi-types";
import type { Result } from "@/types/shared/response";

export const getTmis = (request: Types.TGETTmisReq) => {
  return get<Result<Types.TGETTmisRes>>(`/tmis`, { params: request });
};

export const getTmisById = (request: Types.TGETTmisByIdReq) => {
  return get<Result<Types.TGETTmisByIdRes>>(`/tmis/${request.projectId}`);
};

export const postTmisApplyById = (request: Types.TPOSTTmisApplyByIdReq) => {
  const { projectId, ...data } = request;
  return post<Result<Types.TPOSTTmisApplyByIdRes>>(
    `/tmis/${request.projectId}/apply`,
    data
  );
};

export const postTmisLikeById = (request: Types.TPOSTTmisLikeByIdReq) => {
  return post<Result<Types.TPOSTTmisLikeByIdRes>>(
    `/tmis/${request.projectId}/like`
  );
};

export const postTmisQnaById = (request: Types.TPOSTTmisQnaByIdReq) => {
  const { projectId, ...data } = request;
  return post<Result<Types.TPOSTTmisQnaByIdRes>>(
    `/tmis/${request.projectId}/qna`,
    data
  );
};

export const putTmisQnaByTwoIds = (request: Types.TPUTTmisQnaByTwoIdsReq) => {
  const { projectId, qnaId, ...data } = request;
  return put<Result<Types.TPUTTmisQnaByTwoIdsRes>>(
    `/tmis/${request.projectId}/qna/${request.qnaId}`,
    data
  );
};

export const postTmisQnaLikeById = (request: Types.TPOSTTmisQnaLikeByIdReq) => {
  return post<Result<Types.TPOSTTmisQnaLikeByIdRes>>(
    `/tmis/qna/${request.qnaId}/like`
  );
};

export const deleteTmisQnaById = (request: Types.TDELETETmisQnaByIdReq) => {
  return del<Result<any>>(`/tmis/qna/${request.qnaId}`);
};
