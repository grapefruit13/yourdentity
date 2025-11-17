"use client";

import { Typography } from "@/components/shared/typography";
import { cn } from "@/utils/shared/cn";

interface InfoItem {
  label: string;
  value: string | string[];
}

interface MissionDetailInfoBoxProps {
  items: InfoItem[];
  className?: string;
}

/**
 * @description 미션 상세 정보 박스 컴포넌트
 */
const MissionDetailInfoBox = ({
  items,
  className,
}: MissionDetailInfoBoxProps) => {
  return (
    <div className={cn("w-full bg-white", className)}>
      <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-100 px-3 py-4">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-4">
            <Typography
              font="noto"
              variant="label1B"
              className="shrink-0 text-gray-950"
            >
              {item.label}
            </Typography>
            <div className="flex-1">
              {Array.isArray(item.value) ? (
                <div className="flex flex-col gap-1">
                  {item.value.map((value, valueIndex) => (
                    <Typography
                      key={valueIndex}
                      font="noto"
                      variant="label1R"
                      className="text-gray-600"
                    >
                      {value}
                    </Typography>
                  ))}
                </div>
              ) : (
                <Typography
                  font="noto"
                  variant="label1R"
                  className="text-gray-600"
                >
                  {item.value}
                </Typography>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MissionDetailInfoBox;
