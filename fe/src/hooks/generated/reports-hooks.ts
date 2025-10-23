/**
 * @description Reports 관련 React Query Hooks
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import { useQuery, useMutation } from "@tanstack/react-query";
import * as Api from "@/api/generated/reports-api";
import { reportsKeys } from "@/constants/generated/query-keys";
import type * as Types from "@/types/generated/reports-types";

export const usePostReportcontent = () => {
  return useMutation({
    mutationFn: (request: Types.TPOSTReportContentReq) =>
      Api.postReportcontent(request),
  });
};

export const useGetReportcontentSyncNotionReports = () => {
  return useQuery({
    queryKey: reportsKeys.getReportcontentSyncNotionReports,
    queryFn: () => Api.getReportcontentSyncNotionReports(),
  });
};

export const usePostReportcontentMy = () => {
  return useMutation({
    mutationFn: (request: Types.TPOSTReportContentMyReq) =>
      Api.postReportcontentMy(request),
  });
};
