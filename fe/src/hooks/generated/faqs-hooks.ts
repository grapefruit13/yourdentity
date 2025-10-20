/**
 * @description FAQs 관련 React Query Hooks
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import { useQuery, useMutation } from "@tanstack/react-query";
import * as Api from "@/api/generated/faqs-api";
import { faqsKeys } from "@/constants/generated/query-keys";
import type * as Types from "@/types/generated/faqs-types";

export const useGetFaqs = (request: Types.TGETFaqsReq) => {
  return useQuery({
    queryKey: faqsKeys.getFaqs(request),
    queryFn: () => Api.getFaqs(request),
  });
};

export const useGetFaqsBlocksById = (request: Types.TGETFaqsBlocksByIdReq) => {
  return useQuery({
    queryKey: faqsKeys.getFaqsBlocksById(request),
    queryFn: () => Api.getFaqsBlocksById(request),
  });
};
