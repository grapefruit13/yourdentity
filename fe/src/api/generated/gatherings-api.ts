/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @description Gatherings 관련 API 함수들
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import { get, post, put, patch, del } from "@/lib/axios";
import type * as Types from "@/types/generated/gatherings-types";
import type { Result } from "@/types/shared/response";

export const getGatherings = (request: Types.TGETGatheringsReq) => {
  return get<Result<Types.TGETGatheringsRes>>(`/gatherings`, {
    params: request,
  });
};

export const getGatheringsById = (request: Types.TGETGatheringsByIdReq) => {
  return get<Result<Types.TGETGatheringsByIdRes>>(
    `/gatherings/${request.gatheringId}`
  );
};

export const postGatheringsApplyById = (
  request: Types.TPOSTGatheringsApplyByIdReq
) => {
  const { gatheringId, ...data } = request;
  return post<Result<Types.TPOSTGatheringsApplyByIdRes>>(
    `/gatherings/${request.gatheringId}/apply`,
    data
  );
};

export const postGatheringsLikeById = (
  request: Types.TPOSTGatheringsLikeByIdReq
) => {
  return post<Result<Types.TPOSTGatheringsLikeByIdRes>>(
    `/gatherings/${request.gatheringId}/like`
  );
};

export const postGatheringsQnaById = (
  request: Types.TPOSTGatheringsQnaByIdReq
) => {
  const { gatheringId, ...data } = request;
  return post<Result<Types.TPOSTGatheringsQnaByIdRes>>(
    `/gatherings/${request.gatheringId}/qna`,
    data
  );
};

export const putGatheringsQnaByTwoIds = (
  request: Types.TPUTGatheringsQnaByTwoIdsReq
) => {
  const { gatheringId, qnaId, ...data } = request;
  return put<Result<Types.TPUTGatheringsQnaByTwoIdsRes>>(
    `/gatherings/${request.gatheringId}/qna/${request.qnaId}`,
    data
  );
};

export const postGatheringsQnaLikeById = (
  request: Types.TPOSTGatheringsQnaLikeByIdReq
) => {
  return post<Result<Types.TPOSTGatheringsQnaLikeByIdRes>>(
    `/gatherings/qna/${request.qnaId}/like`
  );
};

export const deleteGatheringsQnaById = (
  request: Types.TDELETEGatheringsQnaByIdReq
) => {
  return del<Result<any>>(`/gatherings/qna/${request.qnaId}`);
};
