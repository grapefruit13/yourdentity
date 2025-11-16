import { Typography } from "@/components/shared/typography";

/**
 * @description 미션 첫 진입 시 표시되는 환영 메시지 컴포넌트
 */
const MissionFirstEnterMessage = () => {
  return (
    <div className="flex flex-col gap-1">
      <Typography font="noto" variant="heading3B" className="text-gray-950">
        나다운 성장을 위한 <br />
        특별한 미션을 만나보세요!
      </Typography>
      <Typography font="noto" variant="body2R" className="text-gray-500">
        오늘 진행할 미션을 선택해 보세요!
      </Typography>
    </div>
  );
};

export default MissionFirstEnterMessage;
