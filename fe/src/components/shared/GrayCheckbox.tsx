"use client";

import { Check } from "lucide-react";
import { cn } from "@/utils/shared/cn";

interface GrayCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id?: string;
  "aria-label"?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * @description 회색 체크박스 컴포넌트
 */
const GrayCheckbox = ({
  checked,
  onCheckedChange,
  id,
  "aria-label": ariaLabel,
  disabled = false,
}: GrayCheckboxProps) => {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => !disabled && onCheckedChange(!checked)}
      className={cn(
        "flex size-4 items-center justify-center rounded border border-gray-500 transition-colors focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-gray-500" : "bg-transparent"
      )}
      id={id}
    >
      {checked && (
        <Check className="size-3 stroke-[3] text-white" aria-hidden="true" />
      )}
    </button>
  );
};

export default GrayCheckbox;
