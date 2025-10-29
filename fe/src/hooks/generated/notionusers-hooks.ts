/**
 * @description NotionUsers 관련 React Query Hooks
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import { useQuery, useMutation } from "@tanstack/react-query";
import * as Api from "@/api/generated/notionusers-api";
import { notionusersKeys } from "@/constants/generated/query-keys";
import type * as Types from "@/types/generated/notionusers-types";

export const useGetNotionusersSyncActive = () => {
  return useQuery({
    queryKey: notionusersKeys.getNotionusersSyncActive,
    queryFn: () => Api.getNotionusersSyncActive(),
  });
};

export const useGetNotionusersSyncFull = () => {
  return useQuery({
    queryKey: notionusersKeys.getNotionusersSyncFull,
    queryFn: () => Api.getNotionusersSyncFull(),
  });
};

export const useGetNotionusersSyncPenalty = () => {
  return useQuery({
    queryKey: notionusersKeys.getNotionusersSyncPenalty,
    queryFn: () => Api.getNotionusersSyncPenalty(),
  });
};
