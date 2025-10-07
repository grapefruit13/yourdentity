"use client";

import React from "react";
import { ChevronRight } from "lucide-react";

interface PointsCardProps {
  points: number;
}

/**
 * @description 나다움 포인트 카드 컴포넌트
 */
const PointsCard = ({ points }: PointsCardProps) => {
  return (
    <div className="flex w-full items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
      {/* 포인트 텍스트 */}
      <span className="text-lg font-medium text-black">나다움 포인트</span>

      {/* 포인트 값과 화살표 */}
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold text-[#FF006C]">{points}N</span>
        <ChevronRight className="h-6 w-6 text-gray-400" />
      </div>
    </div>
  );
};

export default PointsCard;
