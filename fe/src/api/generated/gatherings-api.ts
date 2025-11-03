/**
 * @description Gatherings 관련 API 함수들
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { get, post, put, patch, del } from "@/lib/axios";
import type * as Types from "@/types/generated/gatherings-types";

export const getGatherings = (request: Types.TGETGatheringsReq) => {
  return get<Types.TGETGatheringsRes>(`/gatherings`, { params: request });
};

export const getGatheringsById = (request: Types.TGETGatheringsByIdReq) => {
  return get<Types.TGETGatheringsByIdRes>(`/gatherings/${request.gatheringId}`);
};

export const postGatheringsApplyById = (
  request: Types.TPOSTGatheringsApplyByIdReq
) => {
  const { gatheringId, ...data } = request;
  return post<Types.TPOSTGatheringsApplyByIdRes>(
    `/gatherings/${request.gatheringId}/apply`,
    data.data ?? data
  );
};

export const postGatheringsLikeById = (
  request: Types.TPOSTGatheringsLikeByIdReq
) => {
  return post<Types.TPOSTGatheringsLikeByIdRes>(
    `/gatherings/${request.gatheringId}/like`
  );
};

export const postGatheringsQnaById = (
  request: Types.TPOSTGatheringsQnaByIdReq
) => {
  const { gatheringId, ...data } = request;
  return post<Types.TPOSTGatheringsQnaByIdRes>(
    `/gatherings/${request.gatheringId}/qna`,
    data.data ?? data
  );
};

export const putGatheringsQnaByTwoIds = (
  request: Types.TPUTGatheringsQnaByTwoIdsReq
) => {
  const { gatheringId, qnaId, ...data } = request;
  return put<Types.TPUTGatheringsQnaByTwoIdsRes>(
    `/gatherings/${request.gatheringId}/qna/${request.qnaId}`,
    data.data ?? data
  );
};

export const postGatheringsQnaLikeById = (
  request: Types.TPOSTGatheringsQnaLikeByIdReq
) => {
  return post<Types.TPOSTGatheringsQnaLikeByIdRes>(
    `/gatherings/qna/${request.qnaId}/like`
  );
};

export const deleteGatheringsQnaById = (
  request: Types.TDELETEGatheringsQnaByIdReq
) => {
  return del<any>(`/gatherings/qna/${request.qnaId}`);
};
