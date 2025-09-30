"use client";

import React from "react";
import { cn } from "@/utils/shared/cn";

interface FilterButtonsProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const filters = [
  { id: "전체", label: "전체" },
  { id: "TMI", label: "TMI" },
  { id: "한끗루틴", label: "한끗 루틴" },
  { id: "월간 소모임", label: "월간 소모임" },
];

const FilterButtons: React.FC<FilterButtonsProps> = ({ activeFilter, onFilterChange }) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={cn(
            "flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
            activeFilter === filter.id
              ? "bg-black text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};

export default FilterButtons;
