import Image from "next/image";
import Link from "next/link";
import { Typography } from "@/components/shared/typography";
import { LINK_URL } from "@/constants/shared/_link-url";
import { MissionTag } from "./mission-tag";

type MissionCertificationCardProps = {
  title: string;
  thumbnailText: string;
  thumbnailImageUrl: string;
  tagName: string;
  postId: string | number;
  onClick?: () => void;
};

/**
 * @description 미션 인증 카드 컴포넌트
 * - 친구들이 인증한 미션/인증글을 보여주는 카드
 * - 좌측 텍스트, 우측 썸네일 구조
 */
export const MissionCertificationCard = ({
  title,
  thumbnailText,
  thumbnailImageUrl,
  tagName,
  postId,
  onClick,
}: MissionCertificationCardProps) => {
  return (
    <Link
      href={`${LINK_URL.COMMUNITY_POST}/${postId}`}
      className="flex w-full shrink-0 gap-3 rounded-2xl bg-white"
      onClick={onClick}
    >
      <div className="flex flex-1 flex-col justify-between py-1">
        <Typography
          font="noto"
          variant="title4"
          className="mb-1 line-clamp-1 text-gray-950"
        >
          {title}
        </Typography>
        <Typography
          font="noto"
          variant="body2R"
          className="line-clamp-2 text-gray-700"
        >
          {thumbnailText}
        </Typography>
        <div className="mt-2 flex items-center text-xs text-gray-400">
          <span className="text-main-500 mr-1 font-medium">미션</span>
          <span className="mx-1 text-gray-300">|</span>
          <MissionTag tagName={tagName} />
        </div>
      </div>

      <div className="relative h-[88px] min-h-[88px] w-[88px] min-w-[88px]">
        <Image
          src={thumbnailImageUrl}
          alt={`${title} 썸네일 이미지`}
          width={88}
          height={88}
          className="h-full w-full rounded-xl object-cover"
        />
      </div>
    </Link>
  );
};

export default MissionCertificationCard;
