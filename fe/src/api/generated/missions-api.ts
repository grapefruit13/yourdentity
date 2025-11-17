/**
 * @description Missions 관련 API 함수들
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { get, post, put, patch, del } from "@/lib/axios";
import type * as Types from "@/types/generated/missions-types";

export const getMissions = (request: Types.TGETMissionsReq) => {
  return get<any>(`/missions`, { params: request });
};

export const getMissionsById = (request: Types.TGETMissionsByIdReq) => {
  return get<any>(`/missions/${request.missionId}`);
};
