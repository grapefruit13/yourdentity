"use client";

import { useId } from "react";
import { cn } from "@/utils/shared/cn";
import { Typography } from "../typography";

interface ProgressGaugeProps {
  /** 전체 개수 */
  total: number;
  /** 완료 개수 */
  completed: number;
  /** 상태 메시지 */
  message?: string;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * @description 반원형 진행률 게이지 컴포넌트
 * 전체 개수와 완료 개수를 시각적으로 표시합니다.
 */
export const ProgressGauge = ({
  total,
  completed,
  message,
  className,
}: ProgressGaugeProps) => {
  // 고유한 gradient ID 생성
  const gradientId = useId();

  // 진행률 계산 (0 ~ 1 사이 값)
  const progressRatio = total > 0 ? Math.min(completed / total, 1) : 0;

  // SVG 반원 경로 설정
  const RADIUS = 80;
  const CENTER_X = 100;
  const CENTER_Y = 100;

  // 반원 둘레 (180도)
  const HALF_CIRCUMFERENCE = Math.PI * RADIUS;

  // 진행률에 따른 strokeDashoffset 계산
  const progressOffset = HALF_CIRCUMFERENCE * (1 - progressRatio);

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {/* SVG 게이지 */}
      <div className="relative h-[90px] w-[180px]">
        <svg
          width="180"
          height="90"
          viewBox="0 0 200 120"
          className="overflow-visible"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Gradient 정의 */}
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFC6DA" />
              <stop offset="100%" stopColor="#FF2479" />
            </linearGradient>
          </defs>

          {/* 배경 반원 (회색) */}
          <path
            d={`M ${CENTER_X - RADIUS} ${CENTER_Y} 
                A ${RADIUS} ${RADIUS} 0 0 1 ${CENTER_X + RADIUS} ${CENTER_Y}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={4}
            strokeLinecap="butt"
            className="text-gray-200"
          />

          {/* 진행률 반원 (핑크) */}
          <path
            d={`M ${CENTER_X - RADIUS} ${CENTER_Y} 
                A ${RADIUS} ${RADIUS} 0 0 1 ${CENTER_X + RADIUS} ${CENTER_Y}`}
            fill="none"
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={HALF_CIRCUMFERENCE}
            strokeDashoffset={progressOffset}
            stroke={`url(#${gradientId})`}
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* 중앙 텍스트 */}
        <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col text-center">
          <Typography font="noto" variant="label1R" className="text-gray-950">
            {total}개 중
          </Typography>
          <Typography font="noto" variant="body3B" className="text-gray-950">
            {completed}개 완료
          </Typography>
        </div>
      </div>

      {/* 메시지 */}
      {message && (
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-950">{message}</p>
        </div>
      )}
    </div>
  );
};

export default ProgressGauge;
