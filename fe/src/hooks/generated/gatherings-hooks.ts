/**
 * @description Gatherings 관련 React Query Hooks
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import { useQuery, useMutation } from "@tanstack/react-query";
import * as Api from "@/api/generated/gatherings-api";
import { gatheringsKeys } from "@/constants/generated/query-keys";
import type * as Types from "@/types/generated/gatherings-types";

export const useGetGatherings = (request: Types.TGETGatheringsReq) => {
  return useQuery({
    queryKey: gatheringsKeys.getGatherings,
    queryFn: () => Api.getGatherings(request),
  });
};

export const useGetGatheringsById = (request: Types.TGETGatheringsByIdReq) => {
  return useQuery({
    queryKey: gatheringsKeys.getGatheringsById,
    queryFn: () => Api.getGatheringsById(request),
  });
};

export const usePostGatheringsApplyById = () => {
  return useMutation({
    mutationFn: (request: Types.TPOSTGatheringsApplyByIdReq) =>
      Api.postGatheringsApplyById(request),
  });
};

export const usePostGatheringsLikeById = () => {
  return useMutation({
    mutationFn: (request: Types.TPOSTGatheringsLikeByIdReq) =>
      Api.postGatheringsLikeById(request),
  });
};

export const usePostGatheringsQnaById = () => {
  return useMutation({
    mutationFn: (request: Types.TPOSTGatheringsQnaByIdReq) =>
      Api.postGatheringsQnaById(request),
  });
};

export const usePutGatheringsQnaByTwoIds = () => {
  return useMutation({
    mutationFn: (request: Types.TPUTGatheringsQnaByTwoIdsReq) =>
      Api.putGatheringsQnaByTwoIds(request),
  });
};

export const usePostGatheringsQnaLikeById = () => {
  return useMutation({
    mutationFn: (request: Types.TPOSTGatheringsQnaLikeByIdReq) =>
      Api.postGatheringsQnaLikeById(request),
  });
};

export const useDeleteGatheringsQnaById = () => {
  return useMutation({
    mutationFn: (request: Types.TDELETEGatheringsQnaByIdReq) =>
      Api.deleteGatheringsQnaById(request),
  });
};
