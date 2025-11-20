/**
 * @description Missions 관련 API 함수들
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import { get, post, put, patch, del } from "@/lib/axios";
import type * as Types from "@/types/generated/missions-types";

export const getMissions = (request: Types.TGETMissionsReq) => {
  return get<Types.TGETMissionsRes>(`/missions`, { params: request });
};

export const getMissionsById = (request: Types.TGETMissionsByIdReq) => {
  return get<Types.TGETMissionsByIdRes>(`/missions/${request.missionId}`);
};

export const postMissionsApplyById = (
  request: Types.TPOSTMissionsApplyByIdReq
) => {
  return post<Types.TPOSTMissionsApplyByIdRes>(
    `/missions/${request.missionId}/apply`
  );
};

export const getMissionsCategories = () => {
  return get<Types.TGETMissionsCategoriesRes>(`/missions/categories`);
};
