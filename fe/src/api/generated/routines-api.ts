/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @description Routines 관련 API 함수들
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import { get, post, put, patch, del } from "@/lib/axios";
import type * as Types from "@/types/generated/routines-types";
import type { Result } from "@/types/shared/response";

export const getRoutines = (request: Types.TGETRoutinesReq) => {
  return get<Result<Types.TGETRoutinesRes>>(`/routines`, { params: request });
};

export const getRoutinesById = (request: Types.TGETRoutinesByIdReq) => {
  return get<Result<Types.TGETRoutinesByIdRes>>(
    `/routines/${request.routineId}`
  );
};

export const postRoutinesApplyById = (
  request: Types.TPOSTRoutinesApplyByIdReq
) => {
  const { routineId, ...data } = request;
  return post<Result<Types.TPOSTRoutinesApplyByIdRes>>(
    `/routines/${request.routineId}/apply`,
    data
  );
};

export const postRoutinesLikeById = (
  request: Types.TPOSTRoutinesLikeByIdReq
) => {
  return post<Result<Types.TPOSTRoutinesLikeByIdRes>>(
    `/routines/${request.routineId}/like`
  );
};

export const postRoutinesQnaById = (request: Types.TPOSTRoutinesQnaByIdReq) => {
  const { routineId, ...data } = request;
  return post<Result<Types.TPOSTRoutinesQnaByIdRes>>(
    `/routines/${request.routineId}/qna`,
    data
  );
};

export const putRoutinesQnaByTwoIds = (
  request: Types.TPUTRoutinesQnaByTwoIdsReq
) => {
  const { routineId, qnaId, ...data } = request;
  return put<Result<Types.TPUTRoutinesQnaByTwoIdsRes>>(
    `/routines/${request.routineId}/qna/${request.qnaId}`,
    data
  );
};

export const postRoutinesQnaLikeById = (
  request: Types.TPOSTRoutinesQnaLikeByIdReq
) => {
  return post<Result<Types.TPOSTRoutinesQnaLikeByIdRes>>(
    `/routines/qna/${request.qnaId}/like`
  );
};

export const deleteRoutinesQnaById = (
  request: Types.TDELETERoutinesQnaByIdReq
) => {
  return del<Result<any>>(`/routines/qna/${request.qnaId}`);
};
