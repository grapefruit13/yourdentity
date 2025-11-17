import Image from "next/image";
import { Typography } from "@/components/shared/typography";

interface MissionReviewCardProps {
  /**
   * @description 후기 이미지 URL
   */
  imageUrl: string;
  /**
   * @description 후기 이미지 alt 텍스트
   */
  imageAlt?: string;
  /**
   * @description 후기 제목
   */
  title: string;
  /**
   * @description 후기 내용
   */
  content: string;
}

/**
 * @description 미션 후기 카드 컴포넌트
 */
const MissionReviewCard = ({
  imageUrl,
  imageAlt = "미션 후기",
  title,
  content,
}: MissionReviewCardProps) => {
  return (
    <div className="flex max-w-[90%] min-w-[90%] flex-shrink-0 border-collapse items-center rounded-xl border border-gray-200">
      <Image
        src={imageUrl}
        alt={imageAlt}
        width={100}
        height={100}
        className="h-25 min-h-25 w-25 min-w-25 rounded-tl-xl rounded-bl-xl object-cover"
      />
      <div className="flex flex-col px-3 py-5">
        <Typography
          font="noto"
          variant="body3B"
          className="line-clamp-1 text-gray-950"
        >
          {title}
        </Typography>
        <Typography
          font="noto"
          variant="label2R"
          className="line-clamp-2 text-gray-950"
        >
          {content}
        </Typography>
      </div>
    </div>
  );
};

export default MissionReviewCard;
