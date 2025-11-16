"use client";

import type { ComponentProps } from "react";
import { Typography } from "@/components/shared/typography";
import { cn } from "@/utils/shared/cn";

interface TabButtonProps extends ComponentProps<"button"> {
  /**
   * @description 탭 라벨 텍스트
   */
  label: string;
  /**
   * @description 탭 활성화 여부
   */
  isActive: boolean;
}

/**
 * @description 탭 버튼 컴포넌트
 */
const TabButton = ({ label, isActive, ...props }: TabButtonProps) => {
  return (
    <button
      type="button"
      className={cn(
        "flex-1 border-b-2 px-4 py-2.5 text-center transition-colors",
        isActive
          ? "border-gray-950 text-gray-950"
          : "border-transparent text-gray-400"
      )}
      {...props}
    >
      <Typography
        font="noto"
        variant="body3B"
        className={cn(!isActive && "font-normal")}
      >
        {label}
      </Typography>
    </button>
  );
};

export default TabButton;
