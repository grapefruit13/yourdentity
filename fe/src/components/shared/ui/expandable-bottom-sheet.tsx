"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { cn } from "@/utils/shared/cn";

interface ExpandableBottomSheetProps {
  /** 바텀시트 열림/닫힘 상태 */
  isOpen: boolean;
  /** 바텀시트 닫기 핸들러 */
  onClose: () => void;
  /** 바텀시트 콘텐츠 */
  children: ReactNode;
  /** 추가 클래스명 (선택) */
  className?: string;
}

type SheetHeight = "half" | "full";

/**
 * @description 확장 가능한 바텀시트 컴포넌트
 * - 절반 높이로 시작
 * - 핸들 클릭/드래그로 풀시트까지 확장 가능
 * - 오버레이 클릭 시 닫힘
 * - 애니메이션 포함
 */
const ExpandableBottomSheet = ({
  isOpen,
  onClose,
  children,
  className,
}: ExpandableBottomSheetProps) => {
  const previousOverflow = useRef<string>("");
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [height, setHeight] = useState<SheetHeight>("half");
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartHeight, setDragStartHeight] = useState<SheetHeight>("half");
  const sheetRef = useRef<HTMLDivElement>(null);

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
      setHeight("half"); // 열릴 때 항상 절반 높이로 시작
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // 바텀시트 닫기 핸들러 (포커스 복원)
  const handleClose = useCallback(() => {
    onClose();
    setTimeout(() => {
      const target = previouslyFocusedElementRef.current;
      if (target && typeof target.focus === "function") {
        target.focus();
      }
    }, 300);
  }, [onClose]);

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
  }, [isOpen, handleClose]);

  // 핸들 클릭으로 높이 토글
  const handleHandleClick = useCallback(() => {
    setHeight((prev) => (prev === "half" ? "full" : "half"));
  }, []);

  // 드래그 시작
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!sheetRef.current) return;
      const touch = e.touches[0];
      setDragStartY(touch.clientY);
      setDragStartHeight(height);
      setIsDragging(true);
    },
    [height]
  );

  // 드래그 중
  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging || !sheetRef.current) return;
      const touch = e.touches[0];
      const deltaY = touch.clientY - dragStartY;
      const sheetElement = sheetRef.current;
      const sheetRect = sheetElement.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // 드래그 방향에 따라 높이 결정
      if (deltaY > 50) {
        // 아래로 드래그 - 닫기 또는 절반 높이로
        if (dragStartHeight === "half") {
          handleClose();
        } else {
          setHeight("half");
        }
        setIsDragging(false);
      } else if (deltaY < -50) {
        // 위로 드래그 - 풀시트로
        setHeight("full");
        setIsDragging(false);
      }
    },
    [isDragging, dragStartY, dragStartHeight, handleClose]
  );

  // 드래그 종료
  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

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
        ref={sheetRef}
        className={cn(
          "pb-safe relative mx-auto w-full max-w-[470px] rounded-t-3xl bg-white transition-all duration-300 ease-out",
          isAnimating ? "translate-y-0" : "translate-y-full",
          height === "half" ? "max-h-[50vh]" : "max-h-[90vh]",
          className
        )}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 핸들 바 - 클릭 가능 */}
        <div
          className="flex w-full cursor-pointer justify-center py-4"
          onClick={handleHandleClick}
          onTouchStart={(e) => {
            e.stopPropagation();
            handleTouchStart(e);
          }}
        >
          <div className="h-1 w-8 rounded-full bg-gray-400" />
        </div>

        {/* 컨텐츠 */}
        <div
          className={cn(
            "flex flex-col overflow-hidden",
            height === "half" ? "h-[calc(50vh-60px)]" : "h-[calc(90vh-60px)]"
          )}
        >
          <div className="flex-1 overflow-y-auto px-5 pb-6">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default ExpandableBottomSheet;
