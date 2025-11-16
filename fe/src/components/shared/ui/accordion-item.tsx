"use client";

import type { ComponentProps, ReactNode } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Typography } from "@/components/shared/typography";
import { cn } from "@/utils/shared/cn";

interface AccordionItemProps extends Omit<ComponentProps<"button">, "content"> {
  /**
   * @description 아코디언 제목
   */
  title: string;
  /**
   * @description 아코디언 내용
   */
  content: ReactNode;
  /**
   * @description 아코디언 열림/닫힘 상태
   */
  isOpen: boolean;
  /**
   * @description 클릭 핸들러
   */
  onToggle: () => void;
  /**
   * @description 마지막 아이템 여부 (border 제거용)
   */
  isLast?: boolean;
}

/**
 * @description 아코디언 아이템 컴포넌트
 */
const AccordionItem = ({
  title,
  content,
  isOpen,
  onToggle,
  isLast = false,
  className,
  ...props
}: AccordionItemProps) => {
  return (
    <div
      className={cn("border-b border-gray-200", isLast && "last:border-b-0")}
    >
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "flex w-full items-center justify-between px-5 py-4 text-left",
          className
        )}
        {...props}
      >
        <Typography font="noto" variant="body2M" className="text-gray-950">
          {title}
        </Typography>
        {isOpen ? (
          <ChevronUp size={16} className="shrink-0 text-gray-950" />
        ) : (
          <ChevronDown size={16} className="shrink-0 text-gray-950" />
        )}
      </button>
      {isOpen && (
        <div className="p-5">
          {typeof content === "string" ? (
            <Typography font="noto" variant="body2R" className="text-gray-600">
              {content}
            </Typography>
          ) : (
            content
          )}
        </div>
      )}
    </div>
  );
};

export default AccordionItem;
