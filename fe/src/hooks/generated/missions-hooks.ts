/**
 * @description Missions 관련 React Query Hooks
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import { useQuery, useMutation } from "@tanstack/react-query";
import * as Api from "@/api/generated/missions-api";
import { missionsKeys } from "@/constants/generated/query-keys";
import type * as Types from "@/types/generated/missions-types";

export const usePostUsersMissionsById = () => {
  return useMutation({
    mutationFn: (request: Types.TPOSTUsersMissionsByIdReq) =>
      Api.postUsersMissionsById(request),
  });
};

export const useGetUsersMissionsById = (
  request: Types.TGETUsersMissionsByIdReq
) => {
  return useQuery({
    queryKey: missionsKeys.getUsersMissionsById,
    queryFn: () => Api.getUsersMissionsById(request),
  });
};

export const useGetUsersMissionsByTwoIds = (
  request: Types.TGETUsersMissionsByTwoIdsReq
) => {
  return useQuery({
    queryKey: missionsKeys.getUsersMissionsByTwoIds,
    queryFn: () => Api.getUsersMissionsByTwoIds(request),
  });
};

export const usePutUsersMissionsByTwoIds = () => {
  return useMutation({
    mutationFn: (request: Types.TPUTUsersMissionsByTwoIdsReq) =>
      Api.putUsersMissionsByTwoIds(request),
  });
};

export const useDeleteUsersMissionsByTwoIds = () => {
  return useMutation({
    mutationFn: (request: Types.TDELETEUsersMissionsByTwoIdsReq) =>
      Api.deleteUsersMissionsByTwoIds(request),
  });
};
