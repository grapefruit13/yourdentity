/**
 * @description FAQs 관련 API 함수들
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import { get, post, put, patch, del } from "@/lib/axios";
import type * as Types from "@/types/generated/faqs-types";
import type { Result } from "@/types/shared/response";

export const getFaqs = (request: Types.TGETFaqsReq) => {
  return get<Result<Types.TGETFaqsRes>>(`/faqs`, { params: request });
};

export const getFaqsBlocksById = (request: Types.TGETFaqsBlocksByIdReq) => {
  return get<Result<Types.TGETFaqsBlocksByIdRes>>(
    `/faqs/${request.pageId}/blocks`,
    { params: request }
  );
};
