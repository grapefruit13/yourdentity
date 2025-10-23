/**
 * @description Routines 관련 React Query Hooks
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import { useQuery, useMutation } from "@tanstack/react-query";
import * as Api from "@/api/generated/routines-api";
import { routinesKeys } from "@/constants/generated/query-keys";
import type * as Types from "@/types/generated/routines-types";

export const useGetRoutines = (request: Types.TGETRoutinesReq) => {
  return useQuery({
    queryKey: routinesKeys.getRoutines(request),
    queryFn: () => Api.getRoutines(request),
  });
};

export const useGetRoutinesById = (request: Types.TGETRoutinesByIdReq) => {
  return useQuery({
    queryKey: routinesKeys.getRoutinesById(request),
    queryFn: () => Api.getRoutinesById(request),
  });
};

export const usePostRoutinesApplyById = () => {
  return useMutation({
    mutationFn: (request: Types.TPOSTRoutinesApplyByIdReq) =>
      Api.postRoutinesApplyById(request),
  });
};

export const usePostRoutinesLikeById = () => {
  return useMutation({
    mutationFn: (request: Types.TPOSTRoutinesLikeByIdReq) =>
      Api.postRoutinesLikeById(request),
  });
};

export const usePostRoutinesQnaById = () => {
  return useMutation({
    mutationFn: (request: Types.TPOSTRoutinesQnaByIdReq) =>
      Api.postRoutinesQnaById(request),
  });
};

export const usePutRoutinesQnaByTwoIds = () => {
  return useMutation({
    mutationFn: (request: Types.TPUTRoutinesQnaByTwoIdsReq) =>
      Api.putRoutinesQnaByTwoIds(request),
  });
};

export const usePostRoutinesQnaLikeById = () => {
  return useMutation({
    mutationFn: (request: Types.TPOSTRoutinesQnaLikeByIdReq) =>
      Api.postRoutinesQnaLikeById(request),
  });
};

export const useDeleteRoutinesQnaById = () => {
  return useMutation({
    mutationFn: (request: Types.TDELETERoutinesQnaByIdReq) =>
      Api.deleteRoutinesQnaById(request),
  });
};
