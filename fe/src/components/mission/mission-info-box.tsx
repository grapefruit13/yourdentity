import { Typography } from "@/components/shared/typography";

interface MissionInfoItem {
  label: string;
  value: string;
}

interface MissionInfoBoxProps {
  /**
   * @description 정보 항목 배열
   */
  items: MissionInfoItem[];
}

/**
 * @description 미션 정보 박스 컴포넌트
 */
const MissionInfoBox = ({ items }: MissionInfoBoxProps) => {
  return (
    <div className="flex flex-col gap-3 rounded-sm border border-gray-200 bg-gray-100 p-4">
      {/* 첫 번째 항목: 신청 기간 */}
      <div className="flex items-center gap-4">
        <Typography font="noto" variant="label1B" className="text-gray-950">
          {items[0].label}
        </Typography>
        <Typography font="noto" variant="label1R" className="text-gray-600">
          {items[0].value as string}
        </Typography>
      </div>

      {/* 두 번째 항목: 인증 마감 */}
      <div className="flex items-center gap-4">
        <Typography font="noto" variant="label1B" className="text-gray-950">
          {items[1].label}
        </Typography>
        <Typography font="noto" variant="label1R" className="text-gray-600">
          {items[1].value as string}
        </Typography>
      </div>

      {/* 세 번째 항목: 참여 대상 */}
      <div className="flex items-start gap-4">
        <Typography
          font="noto"
          variant="label1B"
          className="shrink-0 text-gray-950"
        >
          {items[2].label}
        </Typography>
        <Typography font="noto" variant="label1R" className="text-gray-600">
          {items[2].value || "-"}
        </Typography>
      </div>
    </div>
  );
};

export default MissionInfoBox;
