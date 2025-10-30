"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/utils/shared/cn";

interface BottomSheetProps {
  /** 바텀시트 열림/닫힘 상태 */
  isOpen: boolean;
  /** 바텀시트 닫기 핸들러 */
  onClose: () => void;
  /** 바텀시트 콘텐츠 */
  children: React.ReactNode;
  /** 추가 클래스명 (선택) */
  className?: string;
}

/**
 * @description 공통 바텀시트 컴포넌트
 * - 하단에서 올라오는 모달 형태
 * - 오버레이 클릭 시 닫힘
 * - 애니메이션 포함
 */
const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  children,
  className,
}) => {
  const previousOverflow = useRef<string>("");
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // 이전 포커스 요소 저장 (바텀시트 열릴 때)
  useEffect(() => {
    if (!isOpen) return;
    previouslyFocusedElementRef.current =
      document.activeElement as HTMLElement | null;
  }, [isOpen]);

  // 바텀시트 열림/닫힘 애니메이션 처리
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
      }, 300); // 애니메이션 지속 시간과 동일
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // 바텀시트 닫기 핸들러 (포커스 복원)
  const handleClose = () => {
    onClose();
    // 바텀시트가 닫힌 후 이전 포커스 요소로 복원
    setTimeout(() => {
      const target = previouslyFocusedElementRef.current;
      if (target && typeof target.focus === "function") {
        target.focus();
      }
    }, 300);
  };

  // Body 스크롤 방지 (바텀시트 열릴 때)
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

  // Escape 키로 바텀시트 닫기
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      {/* 오버레이 */}
      <div
        className={cn(
          "absolute inset-0 bg-black/60 transition-opacity duration-300",
          isAnimating ? "opacity-100" : "opacity-0"
        )}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* 바텀시트 컨텐츠 */}
      <div
        className={cn(
          "pb-safe relative mx-auto w-full max-w-[470px] rounded-t-3xl bg-white transition-transform duration-300 ease-out",
          isAnimating ? "translate-y-0" : "translate-y-full",
          className
        )}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 핸들 바 */}
        <div className="flex w-full justify-center py-3">
          <div className="h-1 w-12 rounded-full bg-gray-300" />
        </div>

        {/* 컨텐츠 */}
        <div className="px-4 pb-6">{children}</div>
      </div>
    </div>
  );
};

export default BottomSheet;
