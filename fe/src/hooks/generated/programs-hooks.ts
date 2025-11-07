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

export const useGetPrograms = <TData = Types.TGETProgramsRes>(
  options: {
    request: Types.TGETProgramsReq;
  } & Omit<
    UseQueryOptions<Types.TGETProgramsRes, Error, TData>,
    "queryKey" | "queryFn"
  >
) => {
  const { request, ...queryOptions } = options;
  return useQuery<Types.TGETProgramsRes, Error, TData>({
    queryKey: programsKeys.getPrograms(request),
    queryFn: async () => {
      const response = await Api.getPrograms(request);
      return response.data;
    },
    ...queryOptions,
  });
};

export const useGetProgramsSearch = <TData = Types.TGETProgramsSearchRes>(
  options: {
    request: Types.TGETProgramsSearchReq;
  } & Omit<
    UseQueryOptions<Types.TGETProgramsSearchRes, Error, TData>,
    "queryKey" | "queryFn"
  >
) => {
  const { request, ...queryOptions } = options;
  return useQuery<Types.TGETProgramsSearchRes, Error, TData>({
    queryKey: programsKeys.getProgramsSearch(request),
    queryFn: async () => {
      const response = await Api.getProgramsSearch(request);
      return response.data;
    },
    ...queryOptions,
  });
};

export const useGetProgramsById = <TData = Types.TGETProgramsByIdRes>(
  options: {
    request: Types.TGETProgramsByIdReq;
  } & Omit<
    UseQueryOptions<Types.TGETProgramsByIdRes, Error, TData>,
    "queryKey" | "queryFn"
  >
) => {
  const { request, ...queryOptions } = options;
  return useQuery<Types.TGETProgramsByIdRes, Error, TData>({
    queryKey: programsKeys.getProgramsById(request),
    queryFn: async () => {
      const response = await Api.getProgramsById(request);
      return response.data;
    },
    ...queryOptions,
  });
};

export const usePostProgramsApplyById = <
  TContext = unknown,
  TVariables = Types.TPOSTProgramsApplyByIdReq,
>(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof Api.postProgramsApplyById>>,
      Error,
      TVariables,
      TContext
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    Awaited<ReturnType<typeof Api.postProgramsApplyById>>,
    Error,
    TVariables,
    TContext
  >({
    mutationFn: (variables: TVariables) =>
      Api.postProgramsApplyById(variables as Types.TPOSTProgramsApplyByIdReq),
    ...options,
  });
};

export const useGetProgramsApplicationsApproveByTwoIds = <
  TData = Types.TGETProgramsApplicationsApproveByTwoIdsRes,
>(
  options: {
    request: Types.TGETProgramsApplicationsApproveByTwoIdsReq;
  } & Omit<
    UseQueryOptions<
      Types.TGETProgramsApplicationsApproveByTwoIdsRes,
      Error,
      TData
    >,
    "queryKey" | "queryFn"
  >
) => {
  const { request, ...queryOptions } = options;
  return useQuery<
    Types.TGETProgramsApplicationsApproveByTwoIdsRes,
    Error,
    TData
  >({
    queryKey: programsKeys.getProgramsApplicationsApproveByTwoIds(request),
    queryFn: async () => {
      const response =
        await Api.getProgramsApplicationsApproveByTwoIds(request);
      return response.data;
    },
    ...queryOptions,
  });
};

export const useGetProgramsApplicationsRejectByTwoIds = <
  TData = Types.TGETProgramsApplicationsRejectByTwoIdsRes,
>(
  options: {
    request: Types.TGETProgramsApplicationsRejectByTwoIdsReq;
  } & Omit<
    UseQueryOptions<
      Types.TGETProgramsApplicationsRejectByTwoIdsRes,
      Error,
      TData
    >,
    "queryKey" | "queryFn"
  >
) => {
  const { request, ...queryOptions } = options;
  return useQuery<
    Types.TGETProgramsApplicationsRejectByTwoIdsRes,
    Error,
    TData
  >({
    queryKey: programsKeys.getProgramsApplicationsRejectByTwoIds(request),
    queryFn: async () => {
      const response = await Api.getProgramsApplicationsRejectByTwoIds(request);
      return response.data;
    },
    ...queryOptions,
  });
};
