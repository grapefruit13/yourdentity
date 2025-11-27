"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { GiphyFetch, type GifsResult } from "@giphy/js-fetch-api";
import type { IGif } from "@giphy/js-types";
import { Grid } from "@giphy/react-components";

interface GiphySelectorProps {
  onGifSelect: (gifUrl: string) => void;
  onClose: () => void;
}

/**
 * @description GIPHY GIF 선택 컴포넌트
 */
export const GiphySelector = ({ onGifSelect, onClose }: GiphySelectorProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [gridWidth, setGridWidth] = useState(400);
  const containerRef = useRef<HTMLDivElement>(null);
  const apiKey = process.env.NEXT_PUBLIC_GIPHY_API_KEY;

  // 컨테이너 너비에 맞춰 Grid width 조정
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        setGridWidth(containerWidth - 24); // padding 고려
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // GiphyFetch 인스턴스를 useMemo로 생성 (hooks는 항상 같은 순서로 호출되어야 함)
  const gf = useMemo(() => {
    if (!apiKey) return null;
    return new GiphyFetch(apiKey);
  }, [apiKey]);

  const fetchGifs = useCallback(
    (offset: number): Promise<GifsResult> => {
      if (!gf) {
        return Promise.resolve({
          data: [],
          pagination: { total_count: 0, count: 0, offset: 0 },
          meta: { msg: "", response_id: "", status: 200 },
        });
      }
      if (searchTerm.trim()) {
        return gf.search(searchTerm.trim(), { offset, limit: 20 });
      }
      return gf.trending({ offset, limit: 20 });
    },
    [searchTerm, gf]
  );

  const handleGifClick = useCallback(
    (gif: IGif) => {
      const gifUrl = gif.images.fixed_height.url || gif.images.original.url;
      onGifSelect(gifUrl);
      onClose();
    },
    [onGifSelect, onClose]
  );

  if (!apiKey) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <p className="text-sm text-gray-500">
          GIPHY API 키가 설정되지 않았습니다.
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative flex h-full flex-col bg-white">
      {/* 검색 입력 */}
      <div className="border-b border-gray-200 px-3 py-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="GIF 검색..."
          className="focus:border-main-500 focus:ring-main-200 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:outline-none"
        />
      </div>

      {/* GIF 그리드 */}
      <div className="flex-1 overflow-y-auto p-3">
        {gridWidth > 0 && (
          <Grid
            key={searchTerm} // searchTerm 변경 시 Grid 리마운트하여 검색 결과 갱신
            width={gridWidth}
            columns={2}
            fetchGifs={fetchGifs}
            onGifClick={handleGifClick}
            hideAttribution
            noLink
            className="giphy-grid"
          />
        )}
      </div>
    </div>
  );
};
