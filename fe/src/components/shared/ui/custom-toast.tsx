"use client";

import { CircleCheck } from "lucide-react";
import { Typography } from "@/components/shared/typography";

interface CustomToastProps {
  message: string;
}

/**
 * @description 커스텀 토스트 메시지 컴포넌트
 * 화면 하단 중앙에 표시되는 토스트 메시지
 */
export const CustomToast = ({ message }: CustomToastProps) => {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-black px-4 py-3 opacity-80">
      <CircleCheck className="size-[14px] text-white" strokeWidth={1} />
      <Typography font="noto" variant="label2M" className="text-white">
        {message}
      </Typography>
    </div>
  );
};
