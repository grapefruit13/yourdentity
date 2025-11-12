"use client";

import { useRef } from "react";
import { Pencil, Trash2, Flag } from "lucide-react";
import { useClickOutside } from "@/hooks/shared/useClickOutside";
import useToggle from "@/hooks/shared/useToggle";
import { cn } from "@/utils/shared/cn";
import ButtonBase from "./base/button-base";
import { Typography } from "./typography";
import { KebabButton } from "./ui/kebab-button";

type KebabMenuProps = {
  onShare?: () => void;
  onReport?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
  align?: "right" | "left";
};

/**
 * KebabMenu
 * - 상단 우측 등에서 사용하는 케밥 버튼 + 컨텍스트 메뉴
 * - 외부 클릭 시 자동으로 닫힘
 */
const KebabMenu = ({
  onShare,
  onReport,
  onEdit,
  onDelete,
  className,
  align = "right",
}: KebabMenuProps) => {
  const { isOpen, toggle, close } = useToggle();
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuRef, () => close, isOpen);

  return (
    <div ref={menuRef} className={`relative ${className ?? ""}`}>
      <KebabButton onClick={() => toggle()} />

      {isOpen && (
        <div
          className={cn(
            "absolute top-7 z-[60] w-36 rounded-lg border border-gray-200 bg-white p-1 shadow-lg",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          {onShare && (
            <ButtonBase
              onClick={() => {
                onShare();
                close();
              }}
              className="flex w-full items-center justify-between rounded-md px-3 py-2 hover:bg-gray-50"
            >
              <Typography
                font="noto"
                variant="body1M"
                className="text-gray-700"
              >
                공유
              </Typography>
              {/* share icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-950"
              >
                <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
                <path d="M16 6l-4-4-4 4" />
                <path d="M12 2v13" />
              </svg>
            </ButtonBase>
          )}
          {onReport && (
            <ButtonBase
              onClick={() => {
                onReport();
                close();
              }}
              className="flex w-full items-center justify-between rounded-md px-3 py-2 hover:bg-gray-50"
            >
              <Typography
                font="noto"
                variant="body1M"
                className="text-gray-700"
              >
                신고
              </Typography>
              <Flag size={16} className="text-gray-700" />
            </ButtonBase>
          )}
          {onEdit && (
            <ButtonBase
              onClick={() => {
                onEdit();
                close();
              }}
              className="mt-1 flex w-full items-center justify-between rounded-md px-3 py-2 hover:bg-gray-50"
            >
              <Typography
                font="noto"
                variant="body1M"
                className="text-gray-700"
              >
                수정
              </Typography>
              <Pencil size={16} className="text-gray-700" />
            </ButtonBase>
          )}
          {onDelete && (
            <ButtonBase
              onClick={() => {
                onDelete();
                close();
              }}
              className="text-main-600 mt-1 flex w-full items-center justify-between rounded-md px-3 py-2 hover:bg-red-50"
            >
              <Typography
                font="noto"
                variant="body1M"
                className="text-gray-700"
              >
                삭제
              </Typography>
              <Trash2 size={16} className="text-main-600" />
            </ButtonBase>
          )}
        </div>
      )}
    </div>
  );
};

export default KebabMenu;
