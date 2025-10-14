import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { get } from "@/lib/axios";
import type { ExtendedRecordMap } from "@/types/shared/notion-extended-record-map";

interface UseNotionPageOptions {
  pageId: string;
  enabled?: boolean;
}

interface UseNotionPageReturn {
  data: ExtendedRecordMap | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

interface NotionApiResponse {
  status: number;
  data?: ExtendedRecordMap;
  error?: string;
}

/**
 * @description Notion 페이지 데이터를 가져오는 커스텀 훅
 * @param options.pageId - Notion 페이지 ID
 * @param options.enabled - 데이터 fetch 활성화 여부 (기본값: true)
 * @returns Notion 페이지 데이터, 로딩 상태, 에러, 재시도 함수
 *
 * TODO: BE API 엔드포인트가 구현되면 아래 URL을 실제 엔드포인트로 수정
 * 예상 엔드포인트: GET /api/notion/pages/:pageId 또는 GET /api/v1/notion/pages/:pageId
 */
export const useNotionPage = ({
  pageId,
  enabled = true,
}: UseNotionPageOptions): UseNotionPageReturn => {
  const [data, setData] = useState<ExtendedRecordMap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const refetch = () => {
    setRefetchTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    if (!enabled || !pageId) {
      setIsLoading(false);
      return;
    }

    const fetchNotionPage = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log("Notion 페이지 로딩 시작:", pageId);

        // TODO: BE에서 Notion API 구현 후 실제 엔드포인트로 변경 필요
        // 임시 엔드포인트: /api/notion/pages/:pageId
        const response = await get<NotionApiResponse>(
          `/api/notion/pages/${pageId}`
        );

        // BE API 응답 구조에 맞춰 검증
        if (response.data.status !== 200 || !response.data.data) {
          throw new Error(
            response.data.error || "올바른 데이터를 받지 못했습니다."
          );
        }

        console.log("Notion 페이지 로딩 성공:", response.data.data);
        setData(response.data.data);
      } catch (err) {
        console.error("Notion 페이지 로드 실패:", err);

        // AxiosError 처리
        if (err instanceof AxiosError) {
          const apiResponse = err.response?.data as
            | NotionApiResponse
            | undefined;
          const errorMessage = apiResponse?.error || err.message;
          setError(`페이지를 불러오는데 실패했습니다.\n${errorMessage}`);
        } else {
          const errorMessage = err instanceof Error ? err.message : String(err);
          setError(`페이지를 불러오는데 실패했습니다.\n${errorMessage}`);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotionPage();
  }, [pageId, enabled, refetchTrigger]);

  return { data, isLoading, error, refetch };
};
