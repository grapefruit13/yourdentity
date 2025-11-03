"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { HomeContentRenderer } from "@/components/shared/HomeContentRenderer";
import { useGetHome } from "@/hooks/generated/home-hooks";
import { useTopBarStore } from "@/stores/shared/topbar-store";
import type { TGETHomeRes } from "@/types/generated/home-types";

/**
 * @description 홈 페이지 - Notion 기반 홈 화면
 * 서버에서 가져온 Notion 데이터를 나열식으로 렌더링
 */
const HomePage = () => {
  const { data: homeData } = useGetHome({
    select: (data) => {
      // API 응답이 { data: TGETHomeRes } 형태일 경우 unwrap
      if (data && typeof data === "object" && "data" in data) {
        return (data as { data: TGETHomeRes }).data;
      }
      return data;
    },
  });

  const setIsScrolled = useTopBarStore((state) => state.setIsScrolled);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const [imageHeights, setImageHeights] = useState<number[]>([]);

  const content = homeData?.content || [];

  const backgroundImages = useMemo(
    () => homeData?.backgroundImage || [],
    [homeData?.backgroundImage]
  );

  // 이미지가 1개일 때 고정 배경 이미지 URL 추출
  const singleBackgroundImage =
    backgroundImages.length === 1 ? backgroundImages[0]?.url || null : null;

  // TopBar 스크롤 감지 (Intersection Observer)
  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsScrolled(!entry.isIntersecting);
      },
      {
        threshold: 0,
        rootMargin: "-60px 0px 0px 0px",
      }
    );

    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [setIsScrolled]);

  // 배경 이미지 높이 계산 (이미지가 여러 개일 때만)
  useEffect(() => {
    if (backgroundImages.length <= 1) return;

    const heights: number[] = [];
    let loadedCount = 0;

    backgroundImages.forEach((bgImage, index: number) => {
      const imageUrl = bgImage?.url;
      if (!imageUrl) {
        heights[index] = 0;
        loadedCount++;
        return;
      }

      const img = new Image();
      img.onload = () => {
        const screenWidth = window.innerWidth;
        const imageAspectRatio = img.height / img.width;
        const containerHeight = screenWidth * imageAspectRatio;
        heights[index] = containerHeight;
        loadedCount++;

        if (loadedCount === backgroundImages.length) {
          setImageHeights(heights);
        }
      };
      img.onerror = () => {
        heights[index] = 0;
        loadedCount++;
        if (loadedCount === backgroundImages.length) {
          setImageHeights(heights);
        }
      };
      img.src = imageUrl;
    });
  }, [backgroundImages]);

  // 누적 높이 계산 (이전 이미지들의 높이 합계)
  const getCumulativeHeight = (index: number): number => {
    let cumulativeHeight = 0;
    for (let i = 0; i < index; i++) {
      cumulativeHeight += imageHeights[i] || 0;
    }
    return cumulativeHeight;
  };

  return (
    <>
      {/* 배경 이미지 레이어 - viewport 기준 화면 최상단 고정 */}
      <div className="fixed top-0 right-0 left-0 z-0 mx-auto h-screen w-full max-w-[470px]">
        {singleBackgroundImage ? (
          <div
            className="h-full w-full bg-contain bg-top bg-no-repeat"
            style={{
              backgroundImage: `url(${singleBackgroundImage})`,
              backgroundSize: "contain",
              pointerEvents: "none",
            }}
          />
        ) : (
          backgroundImages.length > 0 && (
            <div className="relative h-full w-full">
              {backgroundImages.map((bgImage, index: number) => {
                const imageUrl = bgImage?.url;
                if (!imageUrl) return null;

                const imageHeight = imageHeights[index] || window.innerHeight;
                const cumulativeTop = getCumulativeHeight(index);

                return (
                  <div
                    key={index}
                    className="absolute right-0 left-0 bg-contain bg-center bg-no-repeat"
                    style={{
                      backgroundImage: `url(${imageUrl})`,
                      backgroundSize: "contain",
                      top: `${cumulativeTop}px`,
                      height: `${imageHeight}px`,
                      width: "100%",
                      pointerEvents: "none",
                    }}
                  />
                );
              })}
            </div>
          )
        )}
      </div>

      {/* 콘텐츠 레이어 */}
      <div className="relative min-h-screen">
        {/* 스크롤 감지용 센티넬 */}
        <div
          ref={sentinelRef}
          className="pointer-events-none absolute top-[80px] left-0 h-px w-full"
          aria-hidden="true"
        />

        <div className="relative mx-auto w-full max-w-[470px] px-[24px]">
          <div className="relative z-10 mx-auto my-0 pt-[40px]">
            <HomeContentRenderer content={content} className="notion-home" />
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
