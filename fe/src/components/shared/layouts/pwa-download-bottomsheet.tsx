"use client";

import * as React from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { cn } from "@/utils/shared/cn";
import ButtonBase from "../base/button-base";
import { Typography } from "../typography";

interface PwaDownloadBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onInstall: () => void;
}

const DRAG_THRESHOLD = 100;
const ANIMATION_DURATION_MS = 300;

const PwaDownloadBottomSheet = ({
  isOpen,
  onClose,
  onInstall,
}: PwaDownloadBottomSheetProps) => {
  const [mounted, setMounted] = React.useState(false);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const sheetRef = React.useRef<HTMLDivElement>(null);
  const dragStartY = React.useRef<number>(0);
  const currentTranslateY = React.useRef<number>(0);
  const isDragging = React.useRef<boolean>(false);

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.style.overflow = "hidden";
    } else {
      const timer = setTimeout(() => {
        setIsAnimating(false);
        document.body.style.overflow = "";
      }, ANIMATION_DURATION_MS);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
    isDragging.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || !sheetRef.current) return;

    const currentY = e.touches[0].clientY;
    const deltaY = currentY - dragStartY.current;

    if (deltaY > 0) {
      currentTranslateY.current = deltaY;
      sheetRef.current.style.transform = `translateY(${deltaY}px)`;
      sheetRef.current.style.transition = "none";
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging.current || !sheetRef.current) return;

    isDragging.current = false;

    if (currentTranslateY.current > DRAG_THRESHOLD) {
      onClose();
    } else {
      sheetRef.current.style.transform = "";
      sheetRef.current.style.transition = "";
    }

    currentTranslateY.current = 0;
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!mounted || (!isOpen && !isAnimating)) return null;

  const content = (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-end justify-center",
        "transition-opacity duration-300",
        isOpen ? "opacity-100" : "pointer-events-none opacity-0"
      )}
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" />

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className={cn(
          "relative z-10 w-full max-w-screen-sm bg-white",
          "rounded-t-[20px] shadow-2xl",
          "transition-transform duration-300 ease-out",
          "touch-pan-y",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="dialog"
        aria-modal="true"
      >
        {/* Drag Handle */}
        <div className="flex justify-center py-4">
          <ButtonBase className="h-1 w-8 rounded-full bg-gray-400" />
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <div className="flex flex-col items-center gap-6 text-center">
            {/* Icon */}
            <div className="mb-6">
              <div className="relative h-[60px] w-[60px]">
                <Image
                  src="/icons/app/app-icon-192x192.png"
                  alt="유스-잇 앱 아이콘"
                  width={60}
                  height={60}
                  className="rounded-[12px] border border-gray-200"
                  priority
                />
              </div>
            </div>

            {/* Title */}
            <p>
              <Typography font="noto" variant="body1M">
                홈 화면에
              </Typography>
              &nbsp;
              <Typography font="noto" variant="body1B">
                유스-잇
              </Typography>
              <Typography font="noto" variant="body1M">
                을 추가하고 간편하게 이용해보세요!
              </Typography>
            </p>
            <ButtonBase
              onClick={onInstall}
              className={
                "bg-primary-600 w-full rounded-lg px-4 py-3.5 font-semibold text-white transition-colors duration-200 hover:cursor-pointer"
              }
            >
              설치 없이 앱으로 열기
            </ButtonBase>
            <ButtonBase onClick={onClose} className="hover:cursor-pointer">
              <Typography
                font="noto"
                variant="body2M"
                className="text-gray-400 underline"
              >
                다음에 하기
              </Typography>
            </ButtonBase>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default PwaDownloadBottomSheet;
