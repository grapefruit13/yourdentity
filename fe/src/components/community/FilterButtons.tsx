"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Icon from "@/components/shared/ui/icon";
import { IMAGE_URL } from "@/constants/shared/_image-url";
import { cn } from "@/utils/shared/cn";

interface FilterButtonsProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const sortOptions = [
  { id: "최신", label: "최신" },
  { id: "구현예정", label: "구현예정" },
];

const filters = [
  { id: "전체", label: "전체" },
  { id: "참여중", label: "참여중" },
  { id: "10월~12월", label: "10월 ~ 12월" },
  { id: "1월~3월", label: "1월 ~ 3월" },
  { id: "4월~6월", label: "4월 ~ 6월" },
  { id: "7월~9월", label: "7월 ~ 9월" },
];

const FilterButtons = ({
  activeFilter,
  onFilterChange,
}: FilterButtonsProps) => {
  const [selectedSort, setSelectedSort] = useState("최신");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 드롭다운 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isDropdownOpen]);

  const handleToggleDropdown = useCallback(() => {
    setIsDropdownOpen((prev) => !prev);
  }, []);

  const handleSortChange = useCallback((sortId: string) => {
    setSelectedSort(sortId);
    setIsDropdownOpen(false);
    // TODO: 정렬 로직 구현
  }, []);

  // 스크롤 위치 확인 및 화살표 표시 여부 업데이트
  const updateScrollPosition = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    const isAtStart = scrollLeft <= 0;
    const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 1; // 1px 오차 허용

    setShowLeftArrow(!isAtStart);
    setShowRightArrow(!isAtEnd);
  }, []);

  // 스크롤 이벤트 리스너
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    // 초기 상태 확인
    updateScrollPosition();

    // 리사이즈 이벤트 리스너 (컨텐츠 크기 변경 시)
    const resizeObserver = new ResizeObserver(() => {
      updateScrollPosition();
    });
    resizeObserver.observe(scrollContainer);

    // 스크롤 이벤트 리스너
    scrollContainer.addEventListener("scroll", updateScrollPosition);
    window.addEventListener("resize", updateScrollPosition);

    return () => {
      scrollContainer.removeEventListener("scroll", updateScrollPosition);
      window.removeEventListener("resize", updateScrollPosition);
      resizeObserver.disconnect();
    };
  }, [updateScrollPosition]);

  // 화살표 클릭으로 스크롤 이동
  const handleScrollLeft = useCallback(() => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollBy({
      left: -200,
      behavior: "smooth",
    });
  }, []);

  const handleScrollRight = useCallback(() => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollBy({
      left: 200,
      behavior: "smooth",
    });
  }, []);

  return (
    <>
      <div className="relative">
        <div
          ref={scrollContainerRef}
          // className="scrollbar-hide flex gap-2 overflow-x-auto"
          className="scrollbar-hide flex gap-2 overflow-x-auto"
        >
          {/* 정렬 방식 드롭다운 버튼 */}
          <div className="flex-shrink-0">
            <button
              ref={buttonRef}
              onClick={handleToggleDropdown}
              className={cn(
                "flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              <span>{selectedSort}</span>
              <svg
                className={cn(
                  "h-4 w-4 transition-transform",
                  isDropdownOpen && "rotate-180"
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* 드롭다운 메뉴 */}
            {isDropdownOpen && (
              <div
                ref={dropdownRef}
                className="ring-opacity-5 absolute top-full left-0 z-50 mt-2 w-32 rounded-lg bg-white shadow-lg ring-1 ring-black"
              >
                <div className="py-1">
                  {sortOptions.map((option) => {
                    const isSelected = selectedSort === option.id;
                    return (
                      <button
                        key={option.id}
                        onClick={() => handleSortChange(option.id)}
                        className={cn(
                          "block w-full px-4 py-2 text-left text-sm transition-colors",
                          isSelected
                            ? "bg-gray-100 font-medium text-gray-900"
                            : "text-gray-700 hover:bg-gray-50"
                        )}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 나머지 필터 버튼들 */}
          {filters.map((filter) => {
            const isActive = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => onFilterChange(filter.id)}
                className={cn(
                  "flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* 왼쪽 그라데이션 + 화살표 */}
        {showLeftArrow && (
          <div className="pointer-events-none absolute top-0 left-0 z-10 flex h-full items-center">
            {/* 그라데이션 + 화살표를 함께 배치 */}
            <div className="relative h-full w-20">
              {/* 그라데이션 */}
              <div
                className="h-full w-full bg-gradient-to-r from-white via-white to-transparent"
                style={{ pointerEvents: "none" }}
              />
              {/* 화살표 버튼 - 그라데이션 영역 중앙 */}
              <button
                onClick={handleScrollLeft}
                className="pointer-events-auto absolute top-1/2 left-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
                aria-label="왼쪽으로 스크롤"
              >
                <Icon
                  src={IMAGE_URL.ICON.chevron.left.url}
                  width={20}
                  height={20}
                  className="text-gray-400"
                />
              </button>
            </div>
          </div>
        )}

        {/* 오른쪽 그라데이션 + 화살표 */}
        {showRightArrow && (
          <div className="pointer-events-none absolute top-0 right-0 z-10 flex h-full items-center">
            {/* 그라데이션 + 화살표를 함께 배치 */}
            <div className="relative h-full w-20">
              {/* 그라데이션 */}
              <div
                className="h-full w-full bg-gradient-to-l from-white via-white to-transparent"
                style={{ pointerEvents: "none" }}
              />
              {/* 화살표 버튼 - 그라데이션 영역 중앙 */}
              <button
                onClick={handleScrollRight}
                className="pointer-events-auto absolute top-1/2 left-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
                aria-label="오른쪽으로 스크롤"
              >
                <Icon
                  src={IMAGE_URL.ICON.settings.chevronRight.url}
                  width={20}
                  height={20}
                  className="text-gray-400"
                />
              </button>
            </div>
          </div>
        )}
        {/* 하단 블러 요소 */}
        <div
          className="pointer-events-none absolute right-0 bottom-[-2] left-0 z-10 h-5 w-full bg-gradient-to-b from-white via-white to-transparent"
          style={{ pointerEvents: "none" }}
        />
      </div>
    </>
  );
};

export default FilterButtons;
