"use client";

import { Typography } from "@/components/shared/typography";
import { COMMENT_EMPTY_MESSAGE } from "@/constants/shared/_comment-constants";

/**
 * @description 댓글이 없을 때 표시하는 메시지 컴포넌트
 */
export const CommentEmptyMessage = () => {
  return (
    <div className="flex items-center justify-center py-12">
      <Typography font="noto" variant="body2R" className="text-gray-500">
        {COMMENT_EMPTY_MESSAGE}
      </Typography>
    </div>
  );
};
