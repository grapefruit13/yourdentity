/**
 * @description Images 관련 React Query Hooks
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import { useQuery, useMutation } from "@tanstack/react-query";
import * as Api from "@/api/generated/images-api";
import { imagesKeys } from "@/constants/generated/query-keys";
import type * as Types from "@/types/generated/images-types";

export const usePostImagesUploadImage = () => {
  return useMutation({
    mutationFn: () => Api.postImagesUploadImage(),
  });
};
