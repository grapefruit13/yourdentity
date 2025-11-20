/**
 * @description Missions 관련 React Query Hooks
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */


import {
  useQuery,
  useMutation,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";
import * as Api from "@/api/generated/missions-api";
import { missionsKeys } from "@/constants/generated/query-keys";
import type * as Types from "@/types/generated/missions-types";

export const useGetMissions = <TData = Types.TGETMissionsRes>(
  options: {
    request: Types.TGETMissionsReq;
  } & Omit<
    UseQueryOptions<Types.TGETMissionsRes, Error, TData>,
    "queryKey" | "queryFn"
  >
) => {
  const { request, ...queryOptions } = options;
  return useQuery<Types.TGETMissionsRes, Error, TData>({
    queryKey: missionsKeys.getMissions(request),
    queryFn: async () => {
      const response = await Api.getMissions(request);
      return response.data;
    },
    ...queryOptions,
  });
};

export const useGetMissionsById = <TData = Types.TGETMissionsByIdRes>(
  options: {
    request: Types.TGETMissionsByIdReq;
  } & Omit<
    UseQueryOptions<Types.TGETMissionsByIdRes, Error, TData>,
    "queryKey" | "queryFn"
  >
) => {
  const { request, ...queryOptions } = options;
  return useQuery<Types.TGETMissionsByIdRes, Error, TData>({
    queryKey: missionsKeys.getMissionsById(request),
    queryFn: async () => {
      const response = await Api.getMissionsById(request);
      return response.data;
    },
    ...queryOptions,
  });
};

export const usePostMissionsApplyById = <
  TContext = unknown,
  TVariables = Types.TPOSTMissionsApplyByIdReq,
>(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof Api.postMissionsApplyById>>,
      Error,
      TVariables,
      TContext
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    Awaited<ReturnType<typeof Api.postMissionsApplyById>>,
    Error,
    TVariables,
    TContext
  >({
    mutationFn: (variables: TVariables) =>
      Api.postMissionsApplyById(variables as Types.TPOSTMissionsApplyByIdReq),
    ...options,
  });
};

export const useGetMissionsCategories = <
  TData = Types.TGETMissionsCategoriesRes,
>(
  options?: Omit<
    UseQueryOptions<Types.TGETMissionsCategoriesRes, Error, TData>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery<Types.TGETMissionsCategoriesRes, Error, TData>({
    queryKey: missionsKeys.getMissionsCategories,
    queryFn: async () => {
      const response = await Api.getMissionsCategories();
      return response.data;
    },
    ...options,
  });
};
