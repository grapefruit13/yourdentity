"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
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
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [isPositionReady, setIsPositionReady] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 클라이언트 사이드에서만 Portal 사용
  useEffect(() => {
    setIsMounted(true);
  }, []);

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
        setIsPositionReady(false);
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
    if (!isDropdownOpen && buttonRef.current) {
      // 드롭다운을 열기 전에 위치를 먼저 계산
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8, // 8px gap
        left: rect.left,
      });

      // 위치 설정 후 드롭다운 열기
      requestAnimationFrame(() => {
        setIsPositionReady(true);
        setIsDropdownOpen(true);
      });
    } else {
      setIsDropdownOpen(false);
      setIsPositionReady(false);
    }
  }, [isDropdownOpen]);

  const handleSortChange = useCallback((sortId: string) => {
    setSelectedSort(sortId);
    setIsDropdownOpen(false);
    setIsPositionReady(false);
    // TODO: 정렬 로직 구현
  }, []);

  return (
    <>
      <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
        {/* 최신 드롭다운 버튼 */}
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

      {/* 드롭다운 메뉴 - Portal로 body에 렌더링 */}
      {isMounted &&
        isDropdownOpen &&
        isPositionReady &&
        createPortal(
          <div
            ref={dropdownRef}
            className="ring-opacity-5 animate-in fade-in-0 zoom-in-95 fixed z-[9999] w-32 rounded-lg bg-white shadow-lg ring-1 ring-black duration-100"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
            }}
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
          </div>,
          document.body
        )}
    </>
  );
};

export default FilterButtons;
