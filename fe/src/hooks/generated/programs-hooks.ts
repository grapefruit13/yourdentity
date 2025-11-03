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

export const useGetApiPrograms = <
  TData = Awaited<ReturnType<typeof Api.getApiPrograms>>,
>(
  options: {
    request: Types.TGETApiProgramsReq;
  } & Omit<
    UseQueryOptions<
      Awaited<ReturnType<typeof Api.getApiPrograms>>,
      Error,
      TData
    >,
    "queryKey" | "queryFn"
  >
) => {
  const { request, ...queryOptions } = options;
  return useQuery<Awaited<ReturnType<typeof Api.getApiPrograms>>, Error, TData>(
    {
      queryKey: programsKeys.getApiPrograms(request),
      queryFn: () => Api.getApiPrograms(request),
      ...queryOptions,
    }
  );
};

export const useGetApiProgramsSearch = <
  TData = Awaited<ReturnType<typeof Api.getApiProgramsSearch>>,
>(
  options: {
    request: Types.TGETApiProgramsSearchReq;
  } & Omit<
    UseQueryOptions<
      Awaited<ReturnType<typeof Api.getApiProgramsSearch>>,
      Error,
      TData
    >,
    "queryKey" | "queryFn"
  >
) => {
  const { request, ...queryOptions } = options;
  return useQuery<
    Awaited<ReturnType<typeof Api.getApiProgramsSearch>>,
    Error,
    TData
  >({
    queryKey: programsKeys.getApiProgramsSearch(request),
    queryFn: () => Api.getApiProgramsSearch(request),
    ...queryOptions,
  });
};

export const useGetApiProgramsById = <
  TData = Awaited<ReturnType<typeof Api.getApiProgramsById>>,
>(
  options: {
    request: Types.TGETApiProgramsByIdReq;
  } & Omit<
    UseQueryOptions<
      Awaited<ReturnType<typeof Api.getApiProgramsById>>,
      Error,
      TData
    >,
    "queryKey" | "queryFn"
  >
) => {
  const { request, ...queryOptions } = options;
  return useQuery<
    Awaited<ReturnType<typeof Api.getApiProgramsById>>,
    Error,
    TData
  >({
    queryKey: programsKeys.getApiProgramsById(request),
    queryFn: () => Api.getApiProgramsById(request),
    ...queryOptions,
  });
};
