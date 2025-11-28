"use client";

import { cn } from "@/utils/shared/cn";

interface RadioButtonProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id?: string;
  "aria-label"?: string;
  disabled?: boolean;
}

/**
 * @description 라디오 버튼 컴포넌트
 * - 18x18 사이즈의 원형 라디오 버튼
 * - 선택 시 중앙에 #FF006C 색상의 원 표시
 */
const RadioButton = ({
  checked,
  onCheckedChange,
  id,
  "aria-label": ariaLabel,
  disabled = false,
}: RadioButtonProps) => {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => !disabled && onCheckedChange(!checked)}
      className={cn(
        "flex size-6 items-center justify-center rounded-full border border-gray-300 transition-colors focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "border-[#FF006C]" : "bg-transparent"
      )}
      id={id}
    >
      {checked && (
        <span
          className="size-[7.5px] rounded-full bg-[#FF006C]"
          aria-hidden="true"
        />
      )}
    </button>
  );
};

export default RadioButton;
