/**
 * @description Missions 관련 React Query Hooks
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useQuery,
  useMutation,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";
import * as Api from "@/api/generated/missions-api";
import { missionsKeys } from "@/constants/generated/query-keys";
import type * as Types from "@/types/generated/missions-types";

export const useGetMissions = <TData = any>(
  options: {
    request: Types.TGETMissionsReq;
  } & Omit<UseQueryOptions<any, Error, TData>, "queryKey" | "queryFn">
) => {
  const { request, ...queryOptions } = options;
  return useQuery<any, Error, TData>({
    queryKey: missionsKeys.getMissions(request),
    queryFn: async () => {
      const response = await Api.getMissions(request);
      return response.data;
    },
    ...queryOptions,
  });
};

export const useGetMissionsById = <TData = any>(
  options: {
    request: Types.TGETMissionsByIdReq;
  } & Omit<UseQueryOptions<any, Error, TData>, "queryKey" | "queryFn">
) => {
  const { request, ...queryOptions } = options;
  return useQuery<any, Error, TData>({
    queryKey: missionsKeys.getMissionsById(request),
    queryFn: async () => {
      const response = await Api.getMissionsById(request);
      return response.data;
    },
    ...queryOptions,
  });
};
