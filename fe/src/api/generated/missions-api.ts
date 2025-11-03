/**
 * @description Missions 관련 API 함수들
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import { get, post, put, patch, del } from "@/lib/axios";
import type * as Types from "@/types/generated/missions-types";

export const postUsersMissionsById = (
  request: Types.TPOSTUsersMissionsByIdReq
) => {
  const { userId, ...data } = request;
  return post<Types.TPOSTUsersMissionsByIdRes>(
    `/users/${request.userId}/missions`,
    data.data ?? data
  );
};

export const getUsersMissionsById = (
  request: Types.TGETUsersMissionsByIdReq
) => {
  return get<Types.TGETUsersMissionsByIdRes>(
    `/users/${request.userId}/missions`,
    { params: request }
  );
};

export const getUsersMissionsByTwoIds = (
  request: Types.TGETUsersMissionsByTwoIdsReq
) => {
  return get<Types.TGETUsersMissionsByTwoIdsRes>(
    `/users/${request.userId}/missions/${request.missionId}`
  );
};

export const putUsersMissionsByTwoIds = (
  request: Types.TPUTUsersMissionsByTwoIdsReq
) => {
  const { userId, missionId, ...data } = request;
  return put<Types.TPUTUsersMissionsByTwoIdsRes>(
    `/users/${request.userId}/missions/${request.missionId}`,
    data.data ?? data
  );
};

export const deleteUsersMissionsByTwoIds = (
  request: Types.TDELETEUsersMissionsByTwoIdsReq
) => {
  return del<Types.TDELETEUsersMissionsByTwoIdsRes>(
    `/users/${request.userId}/missions/${request.missionId}`
  );
};
