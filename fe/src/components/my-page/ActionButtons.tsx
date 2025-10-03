"use client";

import { RotateCcw, MessageSquare, ClipboardCheck } from "lucide-react";

/**
 * @description 액션 버튼들 컴포넌트
 */
const ActionButtons = () => {
  const buttons = [
    {
      icon: RotateCcw,
      text: "참여한 미션",
      onClick: () => {
        // TODO: 참여한 미션 페이지로 이동
        console.log("참여한 미션 클릭");
      }
    },
    {
      icon: MessageSquare,
      text: "남긴 댓글",
      onClick: () => {
        // TODO: 남긴 댓글 페이지로 이동
        console.log("남긴 댓글 클릭");
      }
    },
    {
      icon: ClipboardCheck,
      text: "업로드한 게시물",
      onClick: () => {
        // TODO: 업로드한 게시물 페이지로 이동
        console.log("업로드한 게시물 클릭");
      }
    }
  ];

  return (
    <div className="flex w-full rounded-2xl bg-[#FF006C]">
      {buttons.map((button, index) => {
        const IconComponent = button.icon;
        return (
          <button
            key={index}
            onClick={button.onClick}
            className="flex flex-1 flex-col items-center justify-center gap-1 p-4 hover:bg-[#e6005a] transition-colors"
          >
            <IconComponent className="h-6 w-6 text-white" />
            <span className="text-xs font-medium text-white whitespace-nowrap">
              {button.text}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default ActionButtons;
