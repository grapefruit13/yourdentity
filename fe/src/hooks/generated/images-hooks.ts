/**
 * @description Images 관련 React Query Hooks
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import {
  useQuery,
  useMutation,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";
import * as Api from "@/api/generated/images-api";
import { imagesKeys } from "@/constants/generated/query-keys";
import type * as Types from "@/types/generated/images-types";

export const usePostImagesUploadImage = <
  TContext = unknown,
  TVariables = FormData,
>(
  options?: Omit<
    UseMutationOptions<
      Awaited<ReturnType<typeof Api.postImagesUploadImage>>,
      Error,
      TVariables,
      TContext
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    Awaited<ReturnType<typeof Api.postImagesUploadImage>>,
    Error,
    TVariables,
    TContext
  >({
    mutationFn: (formData: FormData) => Api.postImagesUploadImage(formData),
    ...options,
  });
};
