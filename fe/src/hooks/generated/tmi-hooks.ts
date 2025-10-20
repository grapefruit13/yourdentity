/**
 * @description TMI 관련 React Query Hooks
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import { useQuery, useMutation } from "@tanstack/react-query";
import * as Api from "@/api/generated/tmi-api";
import { tmiKeys } from "@/constants/generated/query-keys";
import type * as Types from "@/types/generated/tmi-types";

export const useGetTmis = (request: Types.TGETTmisReq) => {
  return useQuery({
    queryKey: tmiKeys.getTmis(request),
    queryFn: () => Api.getTmis(request),
  });
};

export const useGetTmisById = (request: Types.TGETTmisByIdReq) => {
  return useQuery({
    queryKey: tmiKeys.getTmisById(request),
    queryFn: () => Api.getTmisById(request),
  });
};

export const usePostTmisApplyById = () => {
  return useMutation({
    mutationFn: (request: Types.TPOSTTmisApplyByIdReq) =>
      Api.postTmisApplyById(request),
  });
};

export const usePostTmisLikeById = () => {
  return useMutation({
    mutationFn: (request: Types.TPOSTTmisLikeByIdReq) =>
      Api.postTmisLikeById(request),
  });
};

export const usePostTmisQnaById = () => {
  return useMutation({
    mutationFn: (request: Types.TPOSTTmisQnaByIdReq) =>
      Api.postTmisQnaById(request),
  });
};

export const usePutTmisQnaByTwoIds = () => {
  return useMutation({
    mutationFn: (request: Types.TPUTTmisQnaByTwoIdsReq) =>
      Api.putTmisQnaByTwoIds(request),
  });
};

export const usePostTmisQnaLikeById = () => {
  return useMutation({
    mutationFn: (request: Types.TPOSTTmisQnaLikeByIdReq) =>
      Api.postTmisQnaLikeById(request),
  });
};

export const useDeleteTmisQnaById = () => {
  return useMutation({
    mutationFn: (request: Types.TDELETETmisQnaByIdReq) =>
      Api.deleteTmisQnaById(request),
  });
};
