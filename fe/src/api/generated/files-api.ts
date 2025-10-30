/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @description Files 관련 API 함수들
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import { get, post, put, patch, del } from "@/lib/axios";
import type * as Types from "@/types/generated/files-types";
import type { Result } from "@/types/shared/response";

export const postFilesUploadMultiple = () => {
  return post<Result<Types.TPOSTFilesUploadMultipleRes>>(
    `/files/upload-multiple`
  );
};

export const deleteFilesById = (request: Types.TDELETEFilesByIdReq) => {
  return del<Result<any>>(`/files/${request.filePath}`);
};
