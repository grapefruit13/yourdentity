import { Loader } from "lucide-react";
import { Typography } from "@/components/shared/typography";

type MissionRecommendationCardProps = {
  message: string;
};

/**
 * @description 미션 참여 권장 카드 컴포넌트
 * 진행 중인 미션이 없을 때 미션 참여를 권장하는 카드
 */
export const MissionRecommendationCard = ({
  message,
}: MissionRecommendationCardProps) => {
  return (
    <div className="mt-4 mb-1 flex w-full flex-col items-center justify-center rounded-lg bg-white py-6">
      <Loader className="mb-2 h-6 w-6 text-gray-400" />
      <Typography
        font="noto"
        variant="body1B"
        className="text-center text-gray-950"
      >
        {message}
      </Typography>
    </div>
  );
};

export default MissionRecommendationCard;
