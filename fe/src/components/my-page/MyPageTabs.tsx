"use client";

import React from "react";
import { Typography } from "@/components/shared/typography";
import { cn } from "@/utils/shared/cn";

export type TabType = "posts" | "comments" | "liked";

interface MyPageTabsProps {
  /** 현재 활성화된 탭 */
  activeTab: TabType;
  /** 탭 변경 핸들러 */
  onTabChange: (tab: TabType) => void;
}

/**
 * @description 마이페이지 탭 컴포넌트
 * - 게시글, 댓글 남긴 글, 좋아요 탭
 */
const MyPageTabs: React.FC<MyPageTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: TabType; label: string }[] = [
    { id: "posts", label: "게시글" },
    { id: "comments", label: "댓글 남긴 글" },
    { id: "liked", label: "좋아요" },
  ];

  return (
    <div className="flex w-full border-b border-gray-200 bg-white">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "flex-1 py-4 transition-colors",
            activeTab === tab.id
              ? "border-b-2 border-gray-900"
              : "border-b-2 border-transparent"
          )}
          aria-label={tab.label}
          aria-selected={activeTab === tab.id}
        >
          <Typography
            font="noto"
            variant="body1M"
            className={cn(
              activeTab === tab.id ? "text-gray-900" : "text-gray-400"
            )}
          >
            {tab.label}
          </Typography>
        </button>
      ))}
    </div>
  );
};

export default MyPageTabs;
