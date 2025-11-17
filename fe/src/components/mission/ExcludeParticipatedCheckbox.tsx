"use client";

import GrayCheckbox from "@/components/shared/GrayCheckbox";
import { Typography } from "@/components/shared/typography";

interface ExcludeParticipatedCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

const CHECKBOX_LABEL = "참여한 미션 제외하기";
const CHECKBOX_ID = "exclude-participated-checkbox";

/**
 * @description 참여한 미션 제외하기 체크박스 컴포넌트
 */
const ExcludeParticipatedCheckbox = ({
  checked,
  onCheckedChange,
}: ExcludeParticipatedCheckboxProps) => {
  return (
    <div className="flex items-center justify-center gap-2">
      <GrayCheckbox
        checked={checked}
        onCheckedChange={onCheckedChange}
        id={CHECKBOX_ID}
        aria-label={CHECKBOX_LABEL}
      />
      <label htmlFor={CHECKBOX_ID} className="flex cursor-pointer items-center">
        <Typography font="noto" variant="label1M" className="text-gray-500">
          {CHECKBOX_LABEL}
        </Typography>
      </label>
    </div>
  );
};

export default ExcludeParticipatedCheckbox;
