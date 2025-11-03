/**
 * @description Home 관련 React Query Hooks
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import {
  useQuery,
  useMutation,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";
import * as Api from "@/api/generated/home-api";
import { homeKeys } from "@/constants/generated/query-keys";
import type * as Types from "@/types/generated/home-types";

export const useGetHome = <TData = Awaited<ReturnType<typeof Api.getHome>>>(
  options?: Omit<
    UseQueryOptions<Awaited<ReturnType<typeof Api.getHome>>, Error, TData>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery<Awaited<ReturnType<typeof Api.getHome>>, Error, TData>({
    queryKey: homeKeys.getHome,
    queryFn: () => Api.getHome(),
    ...options,
  });
};
