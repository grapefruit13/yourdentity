"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { Typography } from "@/components/shared/typography";
import { cn } from "@/utils/shared/cn";
import { getTimeAgo } from "@/utils/shared/date";

interface MissionListCardProps {
  id: string;
  title: string;
  category: string;
  thumbnailUrl: string;
  likeCount: number;
  createdAt: string | Date;
  isLiked?: boolean;
  className?: string;
}

/**
 * @description 미션 목록 카드 컴포넌트
 */
const MissionListCard = ({
  id,
  title,
  category,
  thumbnailUrl,
  likeCount: initialLikeCount,
  createdAt,
  isLiked: initialIsLiked = false,
  className,
}: MissionListCardProps) => {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);

  const handleClick = () => {
    router.push(`/mission/${id}`);
  };

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikeCount((prev) => (newIsLiked ? prev + 1 : prev - 1));
    // TODO: API 호출로 찜 상태 업데이트
  };

  const timeAgo = getTimeAgo(createdAt);

  return (
    <div
      onClick={handleClick}
      className={cn(
        "flex w-full cursor-pointer gap-4 border-b border-gray-100 py-4 text-left transition-colors first:border-t hover:bg-gray-50",
        className
      )}
    >
      {/* 썸네일 이미지 */}
      <div className="relative flex-shrink-0">
        <Image
          src={thumbnailUrl}
          alt={title}
          width={80}
          height={80}
          className="h-20 w-20 rounded-lg object-cover"
        />
      </div>

      {/* 텍스트 영역 */}
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        {/* 제목 */}
        <Typography
          font="noto"
          variant="body2B"
          className="line-clamp-2 text-gray-950"
        >
          {title}
        </Typography>

        {/* 부제목과 좋아요 */}
        <div className="mt-1 flex items-center justify-between gap-2">
          <Typography font="noto" variant="label2R" className="text-gray-400">
            {category} | {timeAgo}
          </Typography>
          <button
            type="button"
            onClick={handleHeartClick}
            className="flex flex-shrink-0 items-center gap-0.5"
            aria-label={isLiked ? "찜 해제" : "찜하기"}
          >
            <Heart
              className={cn(
                "size-4 transition-colors",
                isLiked ? "fill-main-500 text-main-500" : "text-gray-400"
              )}
            />
            <Typography
              font="noto"
              variant="label2R"
              className={cn(
                "transition-colors",
                isLiked ? "text-main-500" : "text-gray-400"
              )}
            >
              {likeCount}
            </Typography>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MissionListCard;
