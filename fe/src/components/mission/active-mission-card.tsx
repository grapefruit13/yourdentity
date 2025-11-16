"use client";

import { useEffect, useState } from "react";
import { Clock, Trash2 } from "lucide-react";
import { Typography } from "@/components/shared/typography";
import { cn } from "@/utils/shared/cn";
import { MissionTag } from "./mission-tag";

type ActiveMissionCardProps = {
  title: string;
  tags: string[];
  endTime: Date; // 미션 종료 시간
  onDelete?: () => void;
  onClick?: () => void;
};

const COUNTDOWN_UPDATE_INTERVAL_MS = 1000; // 1초마다 업데이트

/**
 * @description 진행 중인 미션 카드 컴포넌트
 * 실시간으로 남은 시간을 표시하는 미션 카드
 */
export function ActiveMissionCard({
  title,
  tags,
  endTime,
  onDelete,
  onClick,
}: ActiveMissionCardProps) {
  const [remainingTime, setRemainingTime] = useState<string>("");

  useEffect(() => {
    const updateRemainingTime = () => {
      const now = new Date().getTime();
      const end = endTime.getTime();
      const diff = end - now;

      if (diff <= 0) {
        setRemainingTime("00:00:00");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const formattedHours = hours.toString().padStart(2, "0");
      const formattedMinutes = minutes.toString().padStart(2, "0");
      const formattedSeconds = seconds.toString().padStart(2, "0");

      setRemainingTime(
        `${formattedHours}:${formattedMinutes}:${formattedSeconds}`
      );
    };

    // 초기 업데이트
    updateRemainingTime();

    // 1초마다 업데이트
    const interval = setInterval(
      updateRemainingTime,
      COUNTDOWN_UPDATE_INTERVAL_MS
    );

    return () => clearInterval(interval);
  }, [endTime]);

  return (
    <div
      className={cn(
        "flex w-[85%] max-w-[85%] min-w-[85%] flex-shrink-0 flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4",
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {/* 헤더: 시계 아이콘 + 시간, 휴지통 아이콘 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Clock className="text-main-500 h-4 w-4" />
          <Typography font="noto" variant="label2R" className="text-main-500">
            {remainingTime}
          </Typography>
        </div>
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="flex items-center justify-center"
            aria-label="미션 삭제"
          >
            <Trash2 className="h-4 w-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* 미션 정보 */}
      <div className="flex flex-col gap-1">
        <Typography font="noto" variant="body1B" className="text-gray-950">
          {title}
        </Typography>
      </div>

      {/* 태그 */}
      {tags.length > 0 && (
        <div className="relative max-h-[48px] overflow-hidden">
          <div className="flex flex-wrap gap-1">
            {tags.map((tag, index) => (
              <MissionTag key={index} tagName={tag} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
