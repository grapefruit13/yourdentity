"use client";

import type { ComponentProps } from "react";
import ButtonBase from "@/components/shared/base/button-base";
import { Typography } from "@/components/shared/typography";
import { cn } from "@/utils/shared/cn";

interface SubmitButtonProps extends ComponentProps<typeof ButtonBase> {
  label?: string;
  disabled?: boolean;
}

/**
 * @description 제출 완료 버튼 컴포넌트
 * TopBar의 오른쪽 슬롯에 사용되는 완료 버튼
 */
const SubmitButton = ({
  label = "완료",
  disabled = false,
  className,
  ...props
}: SubmitButtonProps) => {
  return (
    <ButtonBase
      type="submit"
      className={cn("disabled:opacity-50", className)}
      disabled={disabled}
      {...props}
    >
      <Typography font="noto" variant="body2M" className="text-main-500">
        {label}
      </Typography>
    </ButtonBase>
  );
};

export default SubmitButton;
