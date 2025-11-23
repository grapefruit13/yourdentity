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
 * 친구들이 인증한 미션을 표시하는 카드
 * 가로 슬라이드 컨테이너 내에서 사용되며, 고정 width를 가집니다.
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
      className="flex w-full shrink-0 gap-2"
      onClick={onClick}
    >
      <div className="flex h-full max-h-[88px] w-full flex-col justify-between">
        <Typography font="noto" variant="body2B" className="text-gray-950">
          {title}
        </Typography>
        <Typography
          font="noto"
          variant="label1R"
          className="line-clamp-2 text-gray-950"
        >
          {thumbnailText}
        </Typography>
        <MissionTag tagName={tagName} />
      </div>
      <Image
        src={thumbnailImageUrl}
        alt={`${title} 썸네일 이미지`}
        width={88}
        height={88}
        className="h-[88px] min-h-[88px] w-[88px] min-w-[88px] rounded-lg object-cover"
      />
    </Link>
  );
};

export default MissionCertificationCard;
