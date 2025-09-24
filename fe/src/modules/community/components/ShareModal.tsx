"use client";

import React, { useState } from "react";
import { cn } from "@/shared/utils/cn";
import {
  mainShareOptionsConfig,
  additionalShareOptions,
  ShareOptionConfig,
} from "../constants/share-options";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  postTitle?: string;
  postUrl?: string;
}

const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  postTitle = "커뮤니티 포스트",
  postUrl = "https://youthvoice.vake.io/sharing/4...",
}) => {
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("링크 복사 실패:", err);
    }
  };

  // 아이콘 렌더링 함수
  const renderShareIcon = (iconType: ShareOptionConfig["iconType"]) => {
    switch (iconType) {
      case "facebook":
        return (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
            <span className="text-lg font-bold text-white">f</span>
          </div>
        );
      case "twitter":
        return (
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 bg-white">
            <span className="text-lg font-bold text-black">X</span>
          </div>
        );
      case "whatsapp":
        return (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500">
            <svg
              className="h-6 w-6 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
            </svg>
          </div>
        );
      case "line":
        return (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-400">
            <span className="text-xs font-bold text-white">LINE</span>
          </div>
        );
      case "email":
        return (
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 bg-white">
            <svg
              className="h-6 w-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const shareOptions = mainShareOptionsConfig.map((option) => ({
    ...option,
    icon: renderShareIcon(option.iconType),
  }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className={cn(
          "mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-2xl"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={onClose}
            className={cn("p-1 text-gray-500 hover:text-gray-700")}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <h2 className="text-lg font-semibold text-gray-800">공유하기</h2>
          <div className="w-6"></div> {/* 공간 맞추기 */}
        </div>

        {/* 주요 공유 옵션 */}
        <div className="mb-6 flex justify-center gap-4">
          {shareOptions.map((option, index) => (
            <button
              key={index}
              onClick={option.action}
              className={cn(
                "flex flex-col items-center gap-2 transition-opacity hover:opacity-80"
              )}
            >
              {option.icon}
              <span className="text-xs text-gray-600">{option.name}</span>
            </button>
          ))}
        </div>

        {/* 링크 복사 섹션 */}
        <div className="mb-4">
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 p-3">
            <input
              type="text"
              value={postUrl}
              readOnly
              className="flex-1 border-none bg-transparent text-sm text-gray-600 outline-none"
            />
            <button
              onClick={handleCopyLink}
              className={cn(
                "rounded px-3 py-1 text-sm font-medium transition-colors",
                isCopied
                  ? "bg-green-100 text-green-600"
                  : "bg-blue-100 text-blue-600 hover:bg-blue-200"
              )}
            >
              {isCopied ? "복사됨" : "복사"}
            </button>
          </div>
        </div>

        {/* 도움말 텍스트 */}
        <p className="mb-4 text-center text-sm text-gray-500">
          도움: 링크를 복사해서 어디든 공유해 보세요.
        </p>

        {/* 추가 공유 옵션 */}
        <div className="flex justify-center gap-3">
          {additionalShareOptions.map((option, index) => (
            <button
              key={index}
              className={cn(
                "flex h-8 w-8 items-center justify-center text-gray-500 transition-colors hover:text-gray-700"
              )}
              title={option.name}
            >
              <span className="text-lg">{option.icon}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
