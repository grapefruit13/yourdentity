"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { Typography } from "../typography";

interface Props {
  /** 다이얼로그 열림 여부 */
  isOpen: boolean;
  /** 다이얼로그 제목 */
  title: string;
  /** 다이얼로그 설명 (선택) */
  description?: string;
  /** 다이얼로그 내부에 렌더링할 버튼/콘텐츠 (확인/취소 버튼 등) */
  children: ReactNode;
  /** 닫기 핸들러 (children 내부 버튼에서 호출) */
  onClose?: () => void;
}

/**
 * @description figma > AlertDialog
 */
const AlertDialog = ({ isOpen, title, description, children }: Props) => {
  const previousOverflow = useRef<string>("");
  const previousPosition = useRef<string>("");
  const previousTop = useRef<string>("");
  const scrollY = useRef<number>(0);

  // 다이얼로그가 열리는 동안 스크롤/터치 스크롤 차단
  useEffect(() => {
    if (!isOpen) return;

    // 현재 스크롤 위치 저장
    scrollY.current = window.scrollY;

    // 기존 스타일 저장
    previousOverflow.current = document.body.style.overflow;
    previousPosition.current = document.body.style.position;
    previousTop.current = document.body.style.top;

    // body 스크롤 방지 (모바일 포함)
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY.current}px`;
    document.body.style.width = "100%";

    // 터치 스크롤 방지 (추가 보안)
    const preventTouchMove = (e: TouchEvent) => {
      // 다이얼로그 내부가 아닌 경우에만 preventDefault
      const target = e.target as HTMLElement;
      const dialog = target.closest('[role="dialog"]');
      if (!dialog) {
        e.preventDefault();
      }
    };

    document.addEventListener("touchmove", preventTouchMove, {
      passive: false,
    });

    return () => {
      // 스타일 복원
      document.body.style.overflow = previousOverflow.current;
      document.body.style.position = previousPosition.current;
      document.body.style.top = previousTop.current;
      document.body.style.width = "";

      // 스크롤 위치 복원
      window.scrollTo(0, scrollY.current);

      // 터치 이벤트 리스너 제거
      document.removeEventListener("touchmove", preventTouchMove);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black/60" aria-hidden="true" />

      {/* 다이얼로그 카드 - 배경 클릭으로 닫히지 않도록 오버레이에 핸들러 없음 */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-[292px] rounded-lg bg-white p-6 shadow-xl"
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col">
            <Typography
              font="noto"
              variant="heading2B"
              className="text-gray-900"
            >
              {title}
            </Typography>
            {description && (
              <Typography
                font="noto"
                variant="body2R"
                className="pt-2 text-gray-700"
              >
                {description}
              </Typography>
            )}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AlertDialog;
