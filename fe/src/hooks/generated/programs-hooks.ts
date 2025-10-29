/**
 * @description Programs 관련 React Query Hooks
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import { useQuery, useMutation } from "@tanstack/react-query";
import * as Api from "@/api/generated/programs-api";
import { programsKeys } from "@/constants/generated/query-keys";
import type * as Types from "@/types/generated/programs-types";

export const useGetApiPrograms = (request: Types.TGETApiProgramsReq) => {
  return useQuery({
    queryKey: programsKeys.getApiPrograms(request),
    queryFn: () => Api.getApiPrograms(request),
  });
};

export const useGetApiProgramsSearch = (
  request: Types.TGETApiProgramsSearchReq
) => {
  return useQuery({
    queryKey: programsKeys.getApiProgramsSearch(request),
    queryFn: () => Api.getApiProgramsSearch(request),
  });
};

export const useGetApiProgramsById = (
  request: Types.TGETApiProgramsByIdReq
) => {
  return useQuery({
    queryKey: programsKeys.getApiProgramsById(request),
    queryFn: () => Api.getApiProgramsById(request),
  });
};
