"use client";

import { ReactNode } from "react";
import Icon from "@/components/shared/ui/icon";
import { cn } from "@/utils/shared/cn";
import { Typography } from "./typography";

interface FilterButtonProps {
  label: string;
  icon?: string;
  customIcon?: ReactNode;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
}

/**
 * @description 재사용 가능한 필터 버튼 컴포넌트
 */
const FilterButton = ({
  label,
  icon,
  customIcon,
  isActive,
  onClick,
  disabled = false,
}: FilterButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex flex-shrink-0 items-center gap-1.5 rounded-full px-3 py-2 transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-50",
        isActive
          ? "bg-gray-950 text-white"
          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
      )}
      aria-label={label}
      aria-pressed={isActive}
    >
      {customIcon ||
        (icon && (
          <Icon
            src={icon}
            width={16}
            height={16}
            className={cn(isActive ? "text-white" : "text-gray-600")}
          />
        ))}
      <Typography font="noto" variant="body2M">
        {label}
      </Typography>
    </button>
  );
};

export default FilterButton;
