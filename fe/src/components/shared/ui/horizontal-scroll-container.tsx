"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils/shared/cn";

interface HorizontalScrollContainerProps {
  /** 스크롤 컨테이너의 자식 요소 */
  children: ReactNode;
  /** 추가 클래스명 */
  className?: string;
  /** 스크롤 컨테이너의 추가 클래스명 */
  containerClassName?: string;
  /** 한 번에 스크롤할 거리 (px). 기본값: 컨테이너 너비의 80% */
  scrollOffset?: number;
}

/**
 * @description 가로 스크롤 컨테이너 컴포넌트
 * - 양쪽 끝에 화살표 버튼을 absolute로 배치
 * - 왼쪽 버튼: 한 칸씩 왼쪽으로 스크롤
 * - 오른쪽 버튼: 한 칸씩 오른쪽으로 스크롤
 * - 스크롤 가능 여부에 따라 버튼 표시/숨김
 */
const HorizontalScrollContainer = ({
  children,
  className,
  containerClassName,
  scrollOffset,
}: HorizontalScrollContainerProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(false);

  const updateScrollButtons = useCallback(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
    const isAtStart = scrollLeft <= 1;
    const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 1;

    setShowLeftButton(!isAtStart);
    setShowRightButton(!isAtEnd);
  }, []);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    updateScrollButtons();

    const handleScroll = () => updateScrollButtons();
    const resizeObserver = new ResizeObserver(() => {
      updateScrollButtons();
    });

    scrollContainer.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);
    resizeObserver.observe(scrollContainer);

    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      resizeObserver.disconnect();
    };
  }, [updateScrollButtons]);

  const handleScrollLeft = () => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const offset = scrollOffset ?? Math.floor(scrollContainer.clientWidth * 1);

    scrollContainer.scrollBy({
      left: -offset,
      behavior: "smooth",
    });
  };

  const handleScrollRight = () => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const offset = scrollOffset ?? Math.floor(scrollContainer.clientWidth * 1);

    scrollContainer.scrollBy({
      left: offset,
      behavior: "smooth",
    });
  };

  return (
    <div className={cn("relative", className)}>
      <div
        ref={scrollContainerRef}
        className={cn(
          "scrollbar-hide overflow-x-auto overflow-y-hidden",
          containerClassName
        )}
      >
        {children}
      </div>

      {/* 왼쪽 그라데이션 및 버튼 */}
      {showLeftButton && (
        <div className="pointer-events-none absolute top-0 left-0 z-10 flex h-full items-center">
          {/* 그라데이션 영역: 버튼과 그라데이션 효과를 위한 충분한 너비 확보 */}
          <div className="relative h-full w-12">
            {/* 그라데이션 배경 */}
            <div className="h-full w-full bg-linear-to-r from-gray-200/60 via-gray-200/30 to-transparent" />
            {/* 버튼 */}
            <button
              type="button"
              onClick={handleScrollLeft}
              className="focus-visible:outline-main-500 pointer-events-auto absolute top-1/2 left-0 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-lg backdrop-blur-sm transition-all hover:scale-110 hover:bg-white/90 focus:outline-none focus-visible:outline-2"
              aria-label="왼쪽으로 스크롤"
            >
              <ChevronLeft className="h-5 w-5 text-gray-700" />
            </button>
          </div>
        </div>
      )}

      {/* 오른쪽 그라데이션 및 버튼 */}
      {showRightButton && (
        <div className="pointer-events-none absolute top-0 right-0 z-10 flex h-full items-center">
          {/* 그라데이션 영역: 버튼과 그라데이션 효과를 위한 충분한 너비 확보 */}
          <div className="relative h-full w-12">
            {/* 그라데이션 배경 */}
            <div className="h-full w-full bg-linear-to-l from-gray-200/60 via-gray-200/30 to-transparent" />
            {/* 버튼 */}
            <button
              type="button"
              onClick={handleScrollRight}
              className="focus-visible:outline-main-500 pointer-events-auto absolute top-1/2 right-0 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-lg backdrop-blur-sm transition-all hover:scale-110 hover:bg-white/90 focus:outline-none focus-visible:outline-2"
              aria-label="오른쪽으로 스크롤"
            >
              <ChevronRight className="h-5 w-5 text-gray-700" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HorizontalScrollContainer;
