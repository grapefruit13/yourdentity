import { useEffect } from "react";
import type { RefObject } from "react";
import type { ReplyingToState } from "@/types/shared/comment";

interface UseCommentFocusOptions {
  onFocusRequestRef?: RefObject<(() => void) | null>;
  replyingTo: ReplyingToState;
  setReplyingTo: (value: ReplyingToState) => void;
  setCommentInput: (value: string) => void;
  inputRef: RefObject<HTMLDivElement | HTMLTextAreaElement>;
}

/**
 * @description 댓글 입력창 포커스 관리 훅
 */
export function useCommentFocus({
  onFocusRequestRef,
  replyingTo,
  setReplyingTo,
  setCommentInput,
  inputRef,
}: UseCommentFocusOptions) {
  useEffect(() => {
    if (!onFocusRequestRef) return;

    const handleFocus = () => {
      // 답글에 대한 답글 입력창이 열려있으면 닫기
      if (replyingTo?.isReply === true) {
        setReplyingTo(null);
        setCommentInput("");
      }
      // 입력창으로 스크롤 및 포커스
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    };

    (onFocusRequestRef as React.MutableRefObject<(() => void) | null>).current =
      handleFocus;
  }, [
    onFocusRequestRef,
    replyingTo?.isReply,
    inputRef,
    setReplyingTo,
    setCommentInput,
  ]);
}
