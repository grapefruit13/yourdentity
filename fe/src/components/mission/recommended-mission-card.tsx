import { Heart } from "lucide-react";
import { Typography } from "@/components/shared/typography";
import { MissionTag } from "./mission-tag";

type RecommendedMissionCardProps = {
  title: string;
  tagName: string;
  likeCount: number;
  onClick?: () => void;
};

/**
 * @description 추천 미션 카드 컴포넌트
 * 다음 미션으로 추천되는 미션을 표시하는 카드
 */
export const RecommendedMissionCard = ({
  title,
  tagName,
  likeCount,
  onClick,
}: RecommendedMissionCardProps) => {
  return (
    <button
      className="flex h-25 w-[35%] max-w-[35%] min-w-[35%] flex-shrink-0 flex-col justify-between rounded-lg border border-gray-200 bg-white px-4 py-3"
      onClick={onClick}
    >
      <Typography font="noto" variant="body2B" className="text-gray-950">
        {title}
      </Typography>
      <div className="flex items-center justify-between">
        <MissionTag tagName={tagName} />
        <div className="flex items-center gap-1">
          <Heart className="text-main-500 fill-main-500 size-4" />
          <Typography font="noto" variant="label2R" className="text-main-500">
            {likeCount}
          </Typography>
        </div>
      </div>
    </button>
  );
};

export default RecommendedMissionCard;
