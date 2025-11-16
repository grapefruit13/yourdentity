import { Check, Image as ImageIcon, PencilLine } from "lucide-react";
import { Typography } from "@/components/shared/typography";
import { cn } from "@/utils/shared/cn";

interface MissionCertificationStatusCardProps {
  label: string;
  isActive: boolean;
  icon: "pencil" | "photo";
}

/**
 * @description 미션 인증 상태 카드 컴포넌트
 * 인증 완료 여부를 표시하는 카드
 */
const MissionCertificationStatusCard = ({
  label,
  isActive,
  icon,
}: MissionCertificationStatusCardProps) => {
  const iconComponent =
    icon === "pencil" ? (
      <PencilLine
        className={cn("size-4", isActive ? "text-main-500" : "text-gray-400")}
      />
    ) : (
      <ImageIcon
        className={cn("size-4", isActive ? "text-main-500" : "text-gray-400")}
      />
    );

  return (
    <div
      className={cn(
        "flex w-full items-center justify-between rounded-lg border bg-white px-4 py-3.5",
        isActive ? "border-main-500" : "border-gray-400"
      )}
    >
      <div className="flex items-center gap-1.5">
        {iconComponent}
        <Typography
          font="noto"
          variant="label1M"
          className={cn(isActive ? "text-main-500" : "text-gray-400")}
        >
          {label}
        </Typography>
      </div>
      {isActive && <Check className="text-main-500 size-4" />}
    </div>
  );
};

export default MissionCertificationStatusCard;
