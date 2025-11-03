/**
 * @description Reports 관련 React Query Hooks
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import {
  useQuery,
  useMutation,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";
import * as Api from "@/api/generated/reports-api";
import { reportsKeys } from "@/constants/generated/query-keys";
import type * as Types from "@/types/generated/reports-types";

export const usePostReportcontent = <
  TContext = unknown,
  TVariables = Types.TPOSTReportContentReq,
>(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof Api.postReportcontent>>,
      Error,
      TVariables,
      TContext
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    Awaited<ReturnType<typeof Api.postReportcontent>>,
    Error,
    TVariables,
    TContext
  >({
    mutationFn: (variables: TVariables) =>
      Api.postReportcontent(variables as Types.TPOSTReportContentReq),
    ...options,
  });
};

export const useGetReportcontentSyncNotionReports = <
  TData = Types.TGETReportContentSyncNotionReportsRes,
>(
  options?: Omit<
    UseQueryOptions<Types.TGETReportContentSyncNotionReportsRes, Error, TData>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery<Types.TGETReportContentSyncNotionReportsRes, Error, TData>({
    queryKey: reportsKeys.getReportcontentSyncNotionReports,
    queryFn: async () => {
      const response = await Api.getReportcontentSyncNotionReports();
      return response.data;
    },
    ...options,
  });
};

export const usePostReportcontentMy = <
  TContext = unknown,
  TVariables = Types.TPOSTReportContentMyReq,
>(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof Api.postReportcontentMy>>,
      Error,
      TVariables,
      TContext
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    Awaited<ReturnType<typeof Api.postReportcontentMy>>,
    Error,
    TVariables,
    TContext
  >({
    mutationFn: (variables: TVariables) =>
      Api.postReportcontentMy(variables as Types.TPOSTReportContentMyReq),
    ...options,
  });
};
