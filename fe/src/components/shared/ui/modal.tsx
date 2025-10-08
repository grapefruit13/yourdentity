"use client";

import React, { useEffect } from "react";

interface ModalProps {
  /** 모달 열림/닫힘 상태 */
  isOpen: boolean;
  /** 모달 제목 */
  title: string;
  /** 모달 설명 (선택) */
  description?: string;
  /** 추가 콘텐츠 (선택, 예: input 필드) */
  children?: React.ReactNode;
  /** 확인 버튼 텍스트 */
  confirmText: string;
  /** 취소 버튼 텍스트 */
  cancelText: string;
  /** 확인 버튼 클릭 핸들러 */
  onConfirm: () => void;
  /** 취소/닫기 핸들러 */
  onClose: () => void;
  /** 확인 버튼 비활성화 여부 (선택) */
  confirmDisabled?: boolean;
  /** 버튼 스타일 변형 (기본값: 'primary') */
  variant?: "primary" | "danger";
}

/**
 * @description 공통 모달 컴포넌트
 * - 오버레이: #000 60% 투명도 (rgba(0, 0, 0, 0.6))
 * - 모달 카드: 흰색 배경, 둥근 모서리
 * - 버튼: variant에 따라 primary(핑크) 또는 danger(빨강) 스타일
 */
const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  description,
  children,
  confirmText,
  cancelText,
  onConfirm,
  onClose,
  confirmDisabled = false,
  variant = "primary",
}) => {
  // Escape 키로 모달 닫기
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        // ESC로 닫을 때 트리거 버튼의 포커스 링 제거
        requestAnimationFrame(() => {
          const activeElement = document.activeElement as HTMLElement;
          if (activeElement && activeElement.blur) {
            activeElement.blur();
          }
        });
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // variant에 따른 버튼 색상 설정
  const confirmButtonStyle =
    variant === "danger"
      ? "bg-red-600 hover:bg-red-700 disabled:bg-gray-300"
      : "bg-[#FF006C] hover:bg-[#e6005a] disabled:bg-gray-300";

  const cancelButtonStyle =
    variant === "danger"
      ? "border-gray-300 text-gray-600 hover:bg-gray-50"
      : "border-[#FF006C] text-[#FF006C] hover:bg-gray-50";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* 오버레이: #000 60% 투명도 */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 모달 컨텐츠 */}
      <div
        className="relative mx-8 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 제목 */}
        <h2
          id="modal-title"
          className="mb-4 text-center text-lg font-medium text-black"
        >
          {title}
        </h2>

        {/* 설명 (선택) */}
        {description && (
          <p
            className={`mb-4 text-center text-sm ${
              variant === "danger" ? "text-red-600" : "text-gray-600"
            }`}
          >
            {description}
          </p>
        )}

        {/* 추가 콘텐츠 (선택) */}
        {children && <div className="mb-6">{children}</div>}

        {/* 버튼들 */}
        <div className="flex gap-3">
          {/* 취소 버튼 */}
          <button
            onClick={onClose}
            className={`flex-1 rounded-xl border-2 bg-white px-4 py-3 text-sm font-medium transition-colors focus:outline-none focus-visible:outline-2 focus-visible:outline-blue-500 ${cancelButtonStyle}`}
            aria-label={cancelText}
          >
            {cancelText}
          </button>

          {/* 확인 버튼 */}
          <button
            onClick={onConfirm}
            disabled={confirmDisabled}
            className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium text-white transition-colors focus:outline-none focus-visible:outline-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed ${confirmButtonStyle}`}
            aria-label={confirmText}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
