/**
 * @description Files 관련 React Query Hooks
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import { useQuery, useMutation } from "@tanstack/react-query";
import * as Api from "@/api/generated/files-api";
import { filesKeys } from "@/constants/generated/query-keys";
import type * as Types from "@/types/generated/files-types";

export const usePostFilesUploadMultiple = () => {
  return useMutation({
    mutationFn: (formData: FormData) => Api.postFilesUploadMultiple(formData),
  });
};

export const useDeleteFilesById = () => {
  return useMutation({
    mutationFn: (request: Types.TDELETEFilesByIdReq) =>
      Api.deleteFilesById(request),
  });
};
