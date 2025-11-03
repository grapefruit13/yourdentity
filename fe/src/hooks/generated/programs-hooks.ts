/**
 * @description Programs 관련 React Query Hooks
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import {
  useQuery,
  useMutation,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";
import * as Api from "@/api/generated/programs-api";
import { programsKeys } from "@/constants/generated/query-keys";
import type * as Types from "@/types/generated/programs-types";

export const useGetApiPrograms = <TData = Types.TGETApiProgramsRes>(
  options: {
    request: Types.TGETApiProgramsReq;
  } & Omit<
    UseQueryOptions<Types.TGETApiProgramsRes, Error, TData>,
    "queryKey" | "queryFn"
  >
) => {
  const { request, ...queryOptions } = options;
  return useQuery<Types.TGETApiProgramsRes, Error, TData>({
    queryKey: programsKeys.getApiPrograms(request),
    queryFn: async () => {
      const response = await Api.getApiPrograms(request);
      return response.data;
    },
    ...queryOptions,
  });
};

export const useGetApiProgramsSearch = <TData = Types.TGETApiProgramsSearchRes>(
  options: {
    request: Types.TGETApiProgramsSearchReq;
  } & Omit<
    UseQueryOptions<Types.TGETApiProgramsSearchRes, Error, TData>,
    "queryKey" | "queryFn"
  >
) => {
  const { request, ...queryOptions } = options;
  return useQuery<Types.TGETApiProgramsSearchRes, Error, TData>({
    queryKey: programsKeys.getApiProgramsSearch(request),
    queryFn: async () => {
      const response = await Api.getApiProgramsSearch(request);
      return response.data;
    },
    ...queryOptions,
  });
};

export const useGetApiProgramsById = <TData = Types.TGETApiProgramsByIdRes>(
  options: {
    request: Types.TGETApiProgramsByIdReq;
  } & Omit<
    UseQueryOptions<Types.TGETApiProgramsByIdRes, Error, TData>,
    "queryKey" | "queryFn"
  >
) => {
  const { request, ...queryOptions } = options;
  return useQuery<Types.TGETApiProgramsByIdRes, Error, TData>({
    queryKey: programsKeys.getApiProgramsById(request),
    queryFn: async () => {
      const response = await Api.getApiProgramsById(request);
      return response.data;
    },
    ...queryOptions,
  });
};
