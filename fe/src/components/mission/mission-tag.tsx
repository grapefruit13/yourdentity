import { Typography } from "@/components/shared/typography";

type MissionTagProps = {
  tagName: string;
};

/**
 * @description 미션 태그 컴포넌트
 * 미션 카드에서 사용되는 태그 표시
 */
export const MissionTag = ({ tagName }: MissionTagProps) => {
  return (
    <Typography
      font="noto"
      variant="label1R"
      className="h-fit w-fit rounded bg-gray-100 px-0.5 text-gray-400"
    >
      {tagName}
    </Typography>
  );
};

export default MissionTag;
