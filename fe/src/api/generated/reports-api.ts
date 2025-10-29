
/**
 * @description Reports 관련 API 함수들
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import { get, post, put, patch, del } from "@/lib/axios";
import type * as Types from "@/types/generated/reports-types";
import type { Result } from "@/types/shared/response";

export const postReportcontent = (request: Types.TPOSTReportContentReq) => {
  return post<Result<Types.TPOSTReportContentRes>>(
    `/reportContent`,
    request.data ?? request
  );
};

export const getReportcontentSyncNotionReports = () => {
  return get<Result<Types.TGETReportContentSyncNotionReportsRes>>(
    `/reportContent/syncNotionReports`
  );
};

export const postReportcontentMy = (request: Types.TPOSTReportContentMyReq) => {
  return post<Result<Types.TPOSTReportContentMyRes>>(
    `/reportContent/my`,
    request.data ?? request
  );
};
