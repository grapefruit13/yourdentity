/* eslint-disable @typescript-eslint/no-explicit-any */

import type { ExtendedRecordMap } from "notion-types";

/**
 * @description Notion recordMap에서 페이지 커버 이미지 URL 추출
 * @param recordMap - Notion recordMap
 * @param pageId - 페이지 ID (선택적, 없으면 첫 번째 페이지 블록 사용)
 * @returns 커버 이미지 URL 또는 null
 */
export const getNotionCoverImage = (
  recordMap: ExtendedRecordMap | null | undefined,
  pageId?: string
): string | null => {
  if (!recordMap?.block) return null;

  // 페이지 블록 찾기
  let pageBlock: any = null;
  if (pageId) {
    pageBlock = recordMap.block[pageId];
  } else {
    // 첫 번째 페이지 블록 찾기
    pageBlock = Object.values(recordMap.block).find(
      (block: any) => block?.value?.type === "page"
    );
  }

  if (!pageBlock?.value) return null;

  const pageValue = pageBlock.value;

  // 커버 이미지 확인
  if (pageValue.format?.page_cover) {
    const coverUrl = pageValue.format.page_cover;

    // 외부 URL인 경우
    if (coverUrl.startsWith("http://") || coverUrl.startsWith("https://")) {
      return coverUrl;
    }

    // Notion 내부 이미지인 경우
    if (coverUrl.startsWith("/")) {
      const pageIdForUrl = pageValue.id || pageId || "";
      // signed_urls에서 찾기
      if (recordMap.signed_urls) {
        const signedUrl = recordMap.signed_urls[coverUrl];
        if (signedUrl) return signedUrl;
      }

      // Notion 이미지 URL 생성
      return `https://www.notion.so${coverUrl}?table=block&id=${pageIdForUrl}&cache=v2`;
    }
  }

  return null;
};
