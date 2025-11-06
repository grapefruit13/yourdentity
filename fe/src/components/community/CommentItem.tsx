"use client";

import { getTimeAgo } from "@/utils/shared/date";

interface CommentItemProps {
  comment: {
    id?: string;
    author?: string;
    content?: string;
    createdAt?: string;
    likesCount?: number;
  };
}

/**
 * @description 댓글 아이템 컴포넌트
 */
const CommentItem = ({ comment }: CommentItemProps) => {
  return (
    <div className="flex gap-3">
      <div className="h-8 w-8 rounded-full bg-gray-300"></div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-800">
            {comment.author || "익명"}
          </span>
          {comment.createdAt && (
            <span className="text-xs text-gray-500">
              {getTimeAgo(comment.createdAt)}
            </span>
          )}
        </div>
        {comment.content && (
          <div
            className="prose prose-sm mt-1 max-w-none text-sm text-gray-700 [&_img]:block [&_img]:h-auto [&_img]:max-h-[300px] [&_img]:w-auto [&_img]:max-w-full [&_img]:object-contain"
            dangerouslySetInnerHTML={{ __html: comment.content }}
          />
        )}
      </div>
    </div>
  );
};

export default CommentItem;
