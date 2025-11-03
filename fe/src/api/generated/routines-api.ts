/**
 * @description Routines 관련 API 함수들
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { get, post, put, patch, del } from "@/lib/axios";
import type * as Types from "@/types/generated/routines-types";

export const getRoutines = (request: Types.TGETRoutinesReq) => {
  return get<Types.TGETRoutinesRes>(`/routines`, { params: request });
};

export const getRoutinesById = (request: Types.TGETRoutinesByIdReq) => {
  return get<Types.TGETRoutinesByIdRes>(`/routines/${request.routineId}`);
};

export const postRoutinesApplyById = (
  request: Types.TPOSTRoutinesApplyByIdReq
) => {
  const { routineId, ...data } = request;
  return post<Types.TPOSTRoutinesApplyByIdRes>(
    `/routines/${request.routineId}/apply`,
    data.data ?? data
  );
};

export const postRoutinesLikeById = (
  request: Types.TPOSTRoutinesLikeByIdReq
) => {
  return post<Types.TPOSTRoutinesLikeByIdRes>(
    `/routines/${request.routineId}/like`
  );
};

export const postRoutinesQnaById = (request: Types.TPOSTRoutinesQnaByIdReq) => {
  const { routineId, ...data } = request;
  return post<Types.TPOSTRoutinesQnaByIdRes>(
    `/routines/${request.routineId}/qna`,
    data.data ?? data
  );
};

export const putRoutinesQnaByTwoIds = (
  request: Types.TPUTRoutinesQnaByTwoIdsReq
) => {
  const { routineId, qnaId, ...data } = request;
  return put<Types.TPUTRoutinesQnaByTwoIdsRes>(
    `/routines/${request.routineId}/qna/${request.qnaId}`,
    data.data ?? data
  );
};

export const postRoutinesQnaLikeById = (
  request: Types.TPOSTRoutinesQnaLikeByIdReq
) => {
  return post<Types.TPOSTRoutinesQnaLikeByIdRes>(
    `/routines/qna/${request.qnaId}/like`
  );
};

export const deleteRoutinesQnaById = (
  request: Types.TDELETERoutinesQnaByIdReq
) => {
  return del<any>(`/routines/qna/${request.qnaId}`);
};
