/**
 * @description Programs 관련 API 함수들
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import { get, post, put, patch, del } from "@/lib/axios";
import type * as Types from "@/types/generated/programs-types";

export const getApiPrograms = (request: Types.TGETApiProgramsReq) => {
  return get<Types.TGETApiProgramsRes>(`/api/programs`, { params: request });
};

export const getApiProgramsSearch = (
  request: Types.TGETApiProgramsSearchReq
) => {
  return get<Types.TGETApiProgramsSearchRes>(`/api/programs/search`, {
    params: request,
  });
};

export const getApiProgramsById = (request: Types.TGETApiProgramsByIdReq) => {
  return get<Types.TGETApiProgramsByIdRes>(
    `/api/programs/${request.programId}`
  );
};
