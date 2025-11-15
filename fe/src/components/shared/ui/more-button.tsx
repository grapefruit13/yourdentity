import { ChevronRight } from "lucide-react";
import ButtonBase from "@/components/shared/base/button-base";
import { Typography } from "@/components/shared/typography";
import { cn } from "@/utils/shared/cn";

type MoreButtonProps = {
  onClick: () => void;
  className?: string;
};

/**
 * @description 더 보기 버튼 컴포넌트
 * 섹션 헤더에서 사용되는 더 보기 버튼
 */
export const MoreButton = ({ onClick, className }: MoreButtonProps) => {
  return (
    <ButtonBase
      className={cn("flex items-center justify-center gap-1", className)}
      onClick={onClick}
    >
      <Typography font="noto" variant="body3R" className="text-gray-400">
        더 보기
      </Typography>
      <ChevronRight className="size-3 text-gray-400" />
    </ButtonBase>
  );
};

export default MoreButton;
