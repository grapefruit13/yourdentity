"use client";

import { useCallback } from "react";
import type { FormEvent, RefObject } from "react";
import { Typography } from "@/components/shared/typography";
import {
  COMMENT_PLACEHOLDER,
  COMMENT_ANONYMOUS_NAME,
  COMMENT_SUBMIT_BUTTON,
} from "@/constants/shared/_comment-constants";
import type { ReplyingToState } from "@/types/shared/comment";
import { cn } from "@/utils/shared/cn";
import { getReplyPlaceholder } from "@/utils/shared/comment";

interface CommentInputFormProps {
  commentInput: string;
  onCommentInputChange: (value: string) => void;
  onCommentSubmit: (
    e: FormEvent,
    customContent?: string
  ) => void | Promise<void>;
  replyingTo: ReplyingToState;
  onCancelReply: () => void;
  currentUserNickname: string;
  inputRef: RefObject<HTMLTextAreaElement>;
  isSubmitting?: boolean;
}

/**
 * @description 댓글 작성 폼 컴포넌트
 */
export const CommentInputForm = ({
  commentInput,
  onCommentInputChange,
  onCommentSubmit,
  replyingTo,
  onCancelReply,
  currentUserNickname,
  inputRef,
  isSubmitting = false,
}: CommentInputFormProps) => {
  const handleSubmit = useCallback(
    (e: FormEvent) => {
      onCommentSubmit(e);
    },
    [onCommentSubmit]
  );

  const placeholder =
    replyingTo && !replyingTo.isReply
      ? getReplyPlaceholder(replyingTo.author)
      : COMMENT_PLACEHOLDER;

  return (
    <div className="mt-6 border-t border-gray-200 p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-gray-300"></div>
          <Typography
            font="noto"
            variant="body2M"
            className={cn(
              "text-gray-800",
              replyingTo?.isReply && "text-gray-400"
            )}
          >
            {currentUserNickname || COMMENT_ANONYMOUS_NAME}
          </Typography>
          {replyingTo && !replyingTo.isReply && (
            <Typography font="noto" variant="body2R" className="text-gray-500">
              <span className="text-main-500">@{replyingTo.author}</span>
              에게 답글
            </Typography>
          )}
        </div>
        {replyingTo && !replyingTo.isReply && (
          <button
            type="button"
            onClick={onCancelReply}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            <Typography font="noto" variant="body2R">
              취소
            </Typography>
          </button>
        )}
      </div>
      <form onSubmit={handleSubmit} className="relative">
        <textarea
          ref={inputRef}
          value={commentInput}
          onChange={(e) => onCommentInputChange(e.target.value)}
          placeholder={placeholder}
          disabled={replyingTo?.isReply === true}
          className={cn(
            "w-full resize-none rounded-lg border p-3 pr-20 pb-12 text-sm focus:outline-none",
            replyingTo?.isReply
              ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
              : "focus:ring-main-400 border-gray-200 focus:ring-2"
          )}
          rows={
            commentInput.trim()
              ? Math.min(commentInput.split("\n").length + 1, 5)
              : 1
          }
        />
        <div className="absolute right-2 bottom-3 flex items-center gap-2">
          <button
            type="submit"
            disabled={
              !commentInput.trim() ||
              replyingTo?.isReply === true ||
              isSubmitting
            }
            className={cn(
              "h-[40px] rounded-lg px-4 py-2 text-sm font-medium transition-all",
              commentInput.trim() && !replyingTo?.isReply && !isSubmitting
                ? "bg-main-600 hover:bg-main-700 cursor-pointer text-white"
                : "cursor-not-allowed bg-gray-100 text-gray-400 opacity-50"
            )}
          >
            <Typography
              font="noto"
              variant="body2M"
              className={
                commentInput.trim() && !replyingTo?.isReply && !isSubmitting
                  ? "text-white"
                  : "text-gray-400"
              }
            >
              {COMMENT_SUBMIT_BUTTON}
            </Typography>
          </button>
        </div>
      </form>
    </div>
  );
};
