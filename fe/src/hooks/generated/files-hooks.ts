/**
 * @description Files 관련 React Query Hooks
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import {
  useQuery,
  useMutation,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";
import * as Api from "@/api/generated/files-api";
import { filesKeys } from "@/constants/generated/query-keys";
import type * as Types from "@/types/generated/files-types";

export const usePostFilesUploadMultiple = <
  TContext = unknown,
  TVariables = FormData,
>(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof Api.postFilesUploadMultiple>>,
      Error,
      TVariables,
      TContext
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    Awaited<ReturnType<typeof Api.postFilesUploadMultiple>>,
    Error,
    TVariables,
    TContext
  >({
    mutationFn: (formData: FormData) => Api.postFilesUploadMultiple(formData),
    ...options,
  });
};

export const useDeleteFilesById = <
  TContext = unknown,
  TVariables = Types.TDELETEFilesByIdReq,
>(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof Api.deleteFilesById>>,
      Error,
      TVariables,
      TContext
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    Awaited<ReturnType<typeof Api.deleteFilesById>>,
    Error,
    TVariables,
    TContext
  >({
    mutationFn: (request: Types.TDELETEFilesByIdReq) =>
      Api.deleteFilesById(request),
    ...options,
  });
};
