"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { HomeContentRenderer } from "@/components/shared/HomeContentRenderer";
import { useGetHome } from "@/hooks/generated/home-hooks";
import { useTopBarStore } from "@/stores/shared/topbar-store";
import type { TGETHomeRes } from "@/types/generated/home-types";
import { cn } from "@/utils/shared/cn";
import { isS3UrlExpired } from "@/utils/shared/s3-url-parser";

const INITIAL_HEIGHT = 950;

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
  const contentRef = useRef<HTMLDivElement>(null);

  const [imageHeights, setImageHeights] = useState<number[]>([]);
  const [contentHeight, setContentHeight] = useState<number>(0);
  const [defaultHeight, setDefaultHeight] = useState<number>(INITIAL_HEIGHT);

  const content = homeData?.content || [];

  // 클라이언트에서만 window.innerHeight 설정
  useEffect(() => {
    if (typeof window !== "undefined") {
      setDefaultHeight(window.innerHeight);
    }
  }, []);

  const backgroundImages = useMemo(() => {
    if (!homeData?.backgroundImage) return [];
    // 만료된 URL 필터링
    return homeData.backgroundImage.filter((img) => {
      if (!img.url) return false;
      const expired = isS3UrlExpired(img.url);
      return expired !== true; // 만료되지 않은 URL만 반환
    });
  }, [homeData?.backgroundImage]);

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

    return () => {
      observer.disconnect();
      setIsScrolled(false);
    };
  }, [setIsScrolled]);

  // 배경 이미지 높이 계산
  useEffect(() => {
    if (backgroundImages.length === 0 || typeof window === "undefined") return;

    let active = true;
    const heights: number[] = [];
    let loadedCount = 0;

    backgroundImages.forEach((bgImage, index: number) => {
      const imageUrl = bgImage?.url;
      if (!imageUrl) {
        heights[index] = 0;
        loadedCount++;
        return;
      }

      const img = new window.Image();
      img.onload = () => {
        if (!active) return;
        const screenWidth = window.innerWidth;
        const imageAspectRatio = img.height / img.width;
        const containerHeight = screenWidth * imageAspectRatio;
        heights[index] = containerHeight;
        loadedCount++;

        if (loadedCount === backgroundImages.length && active) {
          setImageHeights(heights);
        }
      };
      img.onerror = () => {
        if (!active) return;
        heights[index] = 0;
        loadedCount++;
        if (loadedCount === backgroundImages.length && active) {
          setImageHeights(heights);
        }
      };
      img.src = imageUrl;
    });

    return () => {
      active = false;
    };
  }, [backgroundImages]);

  // 누적 높이 계산 (이전 이미지들의 높이 합계)
  const getCumulativeHeight = (index: number): number => {
    let cumulativeHeight = 0;
    for (let i = 0; i < index; i++) {
      cumulativeHeight += imageHeights[i] || 0;
    }
    return cumulativeHeight;
  };

  // 모든 배경 이미지의 총 높이 계산
  const totalBackgroundHeight = useMemo(() => {
    if (backgroundImages.length === 0) return 0;
    return imageHeights.reduce((sum, height) => sum + (height || 0), 0);
  }, [backgroundImages.length, imageHeights]);

  // 콘텐츠 높이 계산 및 배경 이미지 컨테이너 높이 업데이트
  useEffect(() => {
    if (!contentRef.current) return;

    const updateContentHeight = () => {
      const height = contentRef.current?.scrollHeight || 0;
      setContentHeight(height);
    };

    // 초기 높이 계산
    updateContentHeight();

    // ResizeObserver로 콘텐츠 높이 변경 감지
    const resizeObserver = new ResizeObserver(updateContentHeight);
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [content]);

  // 배경 이미지 컨테이너의 최종 높이 계산
  const backgroundContainerHeight = useMemo(() => {
    // 총 배경 이미지 높이와 콘텐츠 높이 중 큰 값 사용
    const fallbackHeight = defaultHeight;
    return Math.max(
      totalBackgroundHeight || fallbackHeight,
      contentHeight || fallbackHeight,
      fallbackHeight
    );
  }, [totalBackgroundHeight, contentHeight, defaultHeight]);

  return (
    <div className="relative h-screen w-full">
      {/* 배경 이미지 레이어 - 콘텐츠 높이에 맞춰 스크롤 가능 */}
      {backgroundImages.length > 0 && (
        <div
          className="absolute z-1 mx-auto w-full max-w-[470px]"
          style={{
            height: `${backgroundContainerHeight}px`,
          }}
        >
          <div
            className="relative w-full"
            style={{
              height: `${backgroundContainerHeight}px`,
            }}
          >
            {backgroundImages.map((bgImage, index: number) => {
              const imageUrl = bgImage?.url;
              if (!imageUrl) return null;

              const imageHeight = imageHeights[index] || defaultHeight;
              const cumulativeTop = getCumulativeHeight(index);

              return (
                <div
                  key={index}
                  className="absolute right-0 left-0 bg-contain bg-center bg-no-repeat"
                  style={{
                    backgroundSize: "contain",
                    top: `${cumulativeTop}px`,
                    height: `${imageHeight}px`,
                    width: "100%",
                    pointerEvents: "none",
                  }}
                >
                  <Image
                    src={imageUrl}
                    alt=""
                    fill
                    className="object-contain"
                    priority={index === 0}
                    unoptimized={!imageUrl.startsWith("/")}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 콘텐츠 레이어 */}
      <div
        ref={contentRef}
        className={cn(
          "relative min-h-screen",
          "bg-gradient-to-b from-white to-[#FFD7E8]"
        )}
      >
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
    </div>
  );
};

export default HomePage;
