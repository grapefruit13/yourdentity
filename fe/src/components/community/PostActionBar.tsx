import { memo } from "react";
import { Heart, MessageCircleMore } from "lucide-react";
import { Typography } from "@/components/shared/typography";
import { cn } from "@/utils/shared/cn";

/**
 * @description 좋아요/댓글 액션 바 (최적화된 컴포넌트)
 */
export const PostActionBar = memo<{
  isLiked: boolean;
  likesCount: number;
  commentsCount: number;
  onLikeClick: () => void;
  onCommentClick: () => void;
}>(({ isLiked, likesCount, commentsCount, onLikeClick, onCommentClick }) => {
  return (
    <div className="flex items-center gap-6 border-t border-gray-200 p-4">
      <button
        onClick={onLikeClick}
        className={cn(
          "flex items-center gap-2 transition-opacity hover:opacity-80"
        )}
        aria-label={isLiked ? "좋아요 취소" : "좋아요"}
      >
        <Heart
          className={cn(
            "h-5 w-5 transition-colors",
            isLiked ? "fill-main-500 text-main-500" : "text-gray-600"
          )}
        />
        <Typography
          font="noto"
          variant="body2R"
          className={cn(
            "transition-colors",
            isLiked ? "text-main-500" : "text-gray-600"
          )}
        >
          {likesCount || 0}
        </Typography>
      </button>
      <button
        onClick={onCommentClick}
        className="flex items-center gap-2 transition-opacity hover:opacity-80"
        aria-label="댓글 작성"
      >
        <MessageCircleMore className="h-5 w-5 text-gray-600" />
        <Typography font="noto" variant="body2R" className="text-gray-600">
          {commentsCount || 0}
        </Typography>
      </button>
    </div>
  );
});

PostActionBar.displayName = "PostActionBar";
