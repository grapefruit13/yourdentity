import type { ComponentProps } from "react";
import { MoreVertical } from "lucide-react";
import ButtonBase from "@/components/shared/base/button-base";
import { cn } from "@/utils/shared/cn";

type KebabButtonProps = ComponentProps<typeof ButtonBase> & {
  /**
   * 아이콘 크기 (기본값: 18)
   */
  iconSize?: number;
  /**
   * 아이콘 색상 클래스 (기본값: "text-gray-700")
   */
  iconClassName?: string;
};

/**
 * @description 케밥 메뉴 버튼 (세로 점 3개 아이콘)
 */
export const KebabButton = ({
  iconSize = 18,
  iconClassName,
  className,
  ...props
}: KebabButtonProps) => {
  return (
    <ButtonBase
      aria-label="메뉴 열기"
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-50 active:bg-gray-100",
        className
      )}
      {...props}
    >
      <MoreVertical
        size={iconSize}
        className={iconClassName || "text-gray-700"}
      />
    </ButtonBase>
  );
};
