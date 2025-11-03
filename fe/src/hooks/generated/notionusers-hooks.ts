/**
 * @description NotionUsers 관련 React Query Hooks
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import {
  useQuery,
  useMutation,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";
import * as Api from "@/api/generated/notionusers-api";
import { notionusersKeys } from "@/constants/generated/query-keys";
import type * as Types from "@/types/generated/notionusers-types";

export const useGetNotionusersSyncActive = <
  TData = Awaited<ReturnType<typeof Api.getNotionusersSyncActive>>,
>(
  options?: Omit<
    UseQueryOptions<
      Awaited<ReturnType<typeof Api.getNotionusersSyncActive>>,
      Error,
      TData
    >,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery<
    Awaited<ReturnType<typeof Api.getNotionusersSyncActive>>,
    Error,
    TData
  >({
    queryKey: notionusersKeys.getNotionusersSyncActive,
    queryFn: () => Api.getNotionusersSyncActive(),
    ...options,
  });
};

export const useGetNotionusersSyncFull = <
  TData = Awaited<ReturnType<typeof Api.getNotionusersSyncFull>>,
>(
  options?: Omit<
    UseQueryOptions<
      Awaited<ReturnType<typeof Api.getNotionusersSyncFull>>,
      Error,
      TData
    >,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery<
    Awaited<ReturnType<typeof Api.getNotionusersSyncFull>>,
    Error,
    TData
  >({
    queryKey: notionusersKeys.getNotionusersSyncFull,
    queryFn: () => Api.getNotionusersSyncFull(),
    ...options,
  });
};

export const useGetNotionusersSyncPenalty = <
  TData = Awaited<ReturnType<typeof Api.getNotionusersSyncPenalty>>,
>(
  options?: Omit<
    UseQueryOptions<
      Awaited<ReturnType<typeof Api.getNotionusersSyncPenalty>>,
      Error,
      TData
    >,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery<
    Awaited<ReturnType<typeof Api.getNotionusersSyncPenalty>>,
    Error,
    TData
  >({
    queryKey: notionusersKeys.getNotionusersSyncPenalty,
    queryFn: () => Api.getNotionusersSyncPenalty(),
    ...options,
  });
};
