/**
 * @description FAQs 관련 React Query Hooks
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import {
  useQuery,
  useMutation,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";
import * as Api from "@/api/generated/faqs-api";
import { faqsKeys } from "@/constants/generated/query-keys";
import type * as Types from "@/types/generated/faqs-types";

export const useGetFaqs = <TData = Awaited<ReturnType<typeof Api.getFaqs>>>(
  options: {
    request: Types.TGETFaqsReq;
  } & Omit<
    UseQueryOptions<Awaited<ReturnType<typeof Api.getFaqs>>, Error, TData>,
    "queryKey" | "queryFn"
  >
) => {
  const { request, ...queryOptions } = options;
  return useQuery<Awaited<ReturnType<typeof Api.getFaqs>>, Error, TData>({
    queryKey: faqsKeys.getFaqs(request),
    queryFn: () => Api.getFaqs(request),
    ...queryOptions,
  });
};

export const useGetFaqsBlocksById = <
  TData = Awaited<ReturnType<typeof Api.getFaqsBlocksById>>,
>(
  options: {
    request: Types.TGETFaqsBlocksByIdReq;
  } & Omit<
    UseQueryOptions<
      Awaited<ReturnType<typeof Api.getFaqsBlocksById>>,
      Error,
      TData
    >,
    "queryKey" | "queryFn"
  >
) => {
  const { request, ...queryOptions } = options;
  return useQuery<
    Awaited<ReturnType<typeof Api.getFaqsBlocksById>>,
    Error,
    TData
  >({
    queryKey: faqsKeys.getFaqsBlocksById(request),
    queryFn: () => Api.getFaqsBlocksById(request),
    ...queryOptions,
  });
};
