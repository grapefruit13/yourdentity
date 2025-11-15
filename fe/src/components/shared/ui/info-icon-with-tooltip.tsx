"use client";

import { useEffect, useRef, useState } from "react";
import { Info } from "lucide-react";
import { cn } from "@/utils/shared/cn";

type InfoIconWithTooltipProps = {
  message: string;
  className?: string;
  iconClassName?: string;
  durationMs?: number; // 툴팁 표시 시간 (밀리초), 기본값: 2000ms (2초)
};

const DEFAULT_TOOLTIP_DURATION_MS = 2000; // 기본값: 2초

/**
 * @description Info 아이콘과 툴팁을 함께 제공하는 컴포넌트
 * 아이콘 클릭 시 툴팁이 표시되고, 지정된 시간 후 자동으로 사라집니다.
 */
export const InfoIconWithTooltip = ({
  message,
  className,
  iconClassName,
  durationMs = DEFAULT_TOOLTIP_DURATION_MS,
}: InfoIconWithTooltipProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleClick = () => {
    // 기존 타이머가 있으면 취소
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setShowTooltip(true);

    // 지정된 시간 후 자동으로 숨김
    timeoutRef.current = setTimeout(() => {
      setShowTooltip(false);
    }, durationMs);
  };

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={handleClick}
        className="flex items-center justify-center"
        aria-label="정보 보기"
        type="button"
      >
        <Info className={cn("size-3 text-gray-400", iconClassName)} />
      </button>

      {/* 툴팁 */}
      {showTooltip && (
        <div className="absolute -top-13 -right-8 bottom-full z-50 mb-2">
          {/* 툴팁 박스 */}
          <div className="relative w-fit rounded-lg bg-gray-800 p-2 shadow-lg">
            <div className="text-xs leading-[1.5] font-normal whitespace-nowrap text-white">
              {message}
            </div>
            {/* 삼각형 꼬리 */}
            <div className="absolute top-full right-8 -translate-x-1/2">
              <div className="h-0 w-0 border-t-4 border-r-4 border-l-4 border-t-gray-800 border-r-transparent border-l-transparent" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InfoIconWithTooltip;
