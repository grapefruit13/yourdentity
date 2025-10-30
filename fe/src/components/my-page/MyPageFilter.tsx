"use client";

import React from "react";
import { Typography } from "@/components/shared/typography";
import { cn } from "@/utils/shared/cn";

export type FilterType = "program" | "mission";

interface MyPageFilterProps {
  /** 현재 활성화된 필터 */
  activeFilter: FilterType;
  /** 필터 변경 핸들러 */
  onFilterChange: (filter: FilterType) => void;
}

/**
 * @description 마이페이지 필터 컴포넌트
 * - 프로그램/미션 필터 버튼
 */
const MyPageFilter: React.FC<MyPageFilterProps> = ({
  activeFilter,
  onFilterChange,
}) => {
  const filters: { id: FilterType; label: string }[] = [
    { id: "program", label: "프로그램" },
    { id: "mission", label: "미션" },
  ];

  return (
    <div className="flex gap-2 bg-white px-4 py-4">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={cn(
            "rounded-full px-5 py-2 transition-colors",
            activeFilter === filter.id
              ? "bg-gray-900 text-white"
              : "bg-white text-gray-700 ring-1 ring-gray-300"
          )}
          aria-label={filter.label}
          aria-pressed={activeFilter === filter.id}
        >
          <Typography
            font="noto"
            variant="body2M"
            className={cn(
              activeFilter === filter.id ? "text-white" : "text-gray-700"
            )}
          >
            {filter.label}
          </Typography>
        </button>
      ))}
    </div>
  );
};

export default MyPageFilter;
