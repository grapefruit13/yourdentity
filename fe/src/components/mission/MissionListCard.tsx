"use client";

import { MouseEvent, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { Typography } from "@/components/shared/typography";
import { missionsKeys } from "@/constants/generated/query-keys";
import { usePostMissionsLikeById } from "@/hooks/generated/missions-hooks";
import { cn } from "@/utils/shared/cn";
import { getTimeAgo } from "@/utils/shared/date";
import { debug } from "@/utils/shared/debugger";

interface MissionListCardProps {
  id: string;
  title: string;
  categories: string[];
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
  categories,
  thumbnailUrl,
  likeCount: initialLikeCount,
  createdAt,
  isLiked: initialIsLiked = false,
  className,
}: MissionListCardProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);

  // 좋아요 mutation
  const { mutateAsync: likeMissionAsync, isPending: isLikePending } =
    usePostMissionsLikeById({
      onMutate: () => {
        // Optimistic update: 즉시 UI 업데이트
        const previousIsLiked = isLiked;
        const previousLikeCount = likeCount;

        const newIsLiked = !previousIsLiked;
        setIsLiked(newIsLiked);
        setLikeCount((prev) => (newIsLiked ? prev + 1 : Math.max(0, prev - 1)));

        return { previousIsLiked, previousLikeCount };
      },
      onError: (error, _variables, context) => {
        // 에러 발생 시 롤백
        if (context) {
          setIsLiked(context.previousIsLiked);
          setLikeCount(context.previousLikeCount);
        }
        debug.error("미션 좋아요 실패:", error);
      },
      onSuccess: (response) => {
        // 성공 시 서버 응답으로 상태 업데이트
        if (response.data?.liked !== undefined) {
          setIsLiked(response.data.liked);
        }
        if (response.data?.likesCount !== undefined) {
          setLikeCount(response.data.likesCount);
        }

        // 미션 목록 캐시 무효화하여 최신 데이터 반영
        queryClient.invalidateQueries({
          queryKey: missionsKeys.getMissions({}),
        });
      },
    });

  const handleClick = () => {
    router.push(`/mission/${id}`);
  };

  const handleHeartClick = async (e: MouseEvent) => {
    e.stopPropagation();
    if (isLikePending) return;

    try {
      await likeMissionAsync({ missionId: id });
    } catch (error) {
      // 에러는 onError에서 처리됨
      debug.error("미션 좋아요 처리 중 오류:", error);
    }
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
      <div className="relative shrink-0">
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
            {categories.length > 0 ? `${categories.join(" | ")} | ` : ""}
            {timeAgo}
          </Typography>
          <button
            type="button"
            onClick={handleHeartClick}
            className="flex shrink-0 items-center gap-0.5"
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
