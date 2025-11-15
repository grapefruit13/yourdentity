"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/utils/shared/cn";
import { Typography } from "./typography";

export interface SortOption<T extends string = string> {
  value: T;
  label: string;
}

interface SortDropdownProps<T extends string = string> {
  options: SortOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/**
 * @description 재사용 가능한 정렬 드롭다운 컴포넌트
 */
const SortDropdown = <T extends string = string>({
  options,
  value,
  onChange,
  className,
}: SortDropdownProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((option) => option.value === value);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  const handleSelect = (optionValue: T) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1"
        aria-label="정렬 옵션 선택"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Typography font="noto" variant="body2R" className="text-gray-600">
          {selectedOption?.label}
        </Typography>
        <ChevronDown
          className={cn(
            "size-4 text-gray-600 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-2 min-w-[120px] rounded-lg border border-gray-200 bg-white shadow-lg">
          <ul role="listbox" className="py-1" aria-label="정렬 옵션">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <li key={option.value} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      "w-full px-4 py-2 text-left transition-colors",
                      isSelected ? "text-gray-600" : "text-gray-600"
                    )}
                  >
                    <Typography
                      font="noto"
                      variant="body2R"
                      className="text-gray-600"
                    >
                      {option.label}
                    </Typography>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SortDropdown;
