"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { cn } from "@/utils/shared/cn";
import { Typography } from "../typography";

interface DialogProps {
  /** 다이얼로그 열림/닫힘 상태 */
  isOpen: boolean;
  /** 다이얼로그 제목 */
  title?: string;
  /** 다이얼로그 본문 */
  description?: string;
  /** 다이얼로그 콘텐츠 (커스텀) */
  children?: ReactNode;
  /** 추가 클래스명 (선택) */
  className?: string;
}

/**
 * @description AlertDialog 컴포넌트 (피그마 정의에 따름)
 * - 화면 중앙에 표시되는 모달 형태
 * - 제목과 설명을 왼쪽 정렬로 표시
 * - children으로 버튼 등 커스텀 콘텐츠 전달
 */
const Dialog = ({
  isOpen,
  title,
  description,
  children,
  className,
}: DialogProps) => {
  const previousOverflow = useRef<string>("");
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // 다이얼로그 열림/닫힘 애니메이션 처리
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Body 스크롤 방지 (다이얼로그 열릴 때)
  useEffect(() => {
    if (isOpen) {
      previousOverflow.current = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = previousOverflow.current;
      };
    }

    return () => {
      document.body.style.overflow = previousOverflow.current;
    };
  }, [isOpen]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-6">
      {/* 오버레이 */}
      <div
        className={cn(
          "absolute inset-0 bg-black/60 transition-opacity duration-200",
          isAnimating ? "opacity-100" : "opacity-0"
        )}
        aria-hidden="true"
      />

      {/* 다이얼로그 컨텐츠 */}
      <div
        className={cn(
          "relative mx-auto w-full max-w-[320px] rounded-2xl bg-white p-6 shadow-lg transition-all duration-200",
          isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0",
          className
        )}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 제목 */}
        {title && (
          <Typography
            as="div"
            font="noto"
            variant="title3B"
            className="mb-2 block text-left text-gray-950"
          >
            {title}
          </Typography>
        )}

        {/* 설명 */}
        {description && (
          <Typography
            as="div"
            font="noto"
            variant="body2R"
            className="block text-left text-gray-700"
          >
            {description}
          </Typography>
        )}

        {/* 커스텀 콘텐츠 (버튼 등) */}
        {children}
      </div>
    </div>
  );
};

export default Dialog;
