"use client";

import type { ComponentProps } from "react";
import { IMAGE_URL } from "@/constants/shared/_image-url";
import { cn } from "@/utils/shared/cn";
import Icon from "./icon";

interface ShareButtonProps extends ComponentProps<"button"> {
  /**
   * @description 아이콘 크기 (기본값: 24)
   */
  iconSize?: number;
  /**
   * @description 버튼 크기 클래스 (기본값: "h-10 w-10")
   */
  buttonSize?: string;
}

/**
 * @description 공유하기 버튼 컴포넌트
 */
const ShareButton = ({
  onClick,
  iconSize = 24,
  buttonSize = "h-10 w-10",
  ...props
}: ShareButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn("flex items-center justify-center", buttonSize)}
      aria-label="공유하기"
      {...props}
    >
      <Icon
        src={IMAGE_URL.ICON.share.url}
        width={iconSize}
        height={iconSize}
        className="text-gray-600"
      />
    </button>
  );
};

export default ShareButton;
