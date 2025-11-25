import type { ReplyingToState } from "@/types/shared/comment";

/**
 * @description 댓글 관련 유틸리티 함수
 */

type Comment = {
  id?: string;
  replies?: Array<{ id?: string }>;
};

/**
 * parentId 계산 로직
 * @param replyingToState - 답글 작성 상태
 * @param comments - 댓글 목록
 * @returns parentId 또는 undefined
 */
export function getParentId(
  replyingToState: ReplyingToState,
  comments: Comment[]
): string | undefined {
  if (!replyingToState) return undefined;

  if (replyingToState.isReply && replyingToState.commentId) {
    const parentComment = comments.find((comment) =>
      comment.replies?.some((r) => r.id === replyingToState.commentId)
    );
    return parentComment?.id;
  }

  if (replyingToState.commentId) {
    return replyingToState.commentId;
  }

  return undefined;
}

/**
 * 특정 댓글에 대한 입력값 계산
 * @param commentId - 댓글 ID
 * @param replyingTo - 답글 작성 상태
 * @param commentInput - 현재 입력값
 * @param comments - 댓글 목록
 * @returns 해당 댓글에 대한 입력값 또는 빈 문자열
 */
export function getCommentInputForItem(
  commentId: string,
  replyingTo: ReplyingToState,
  commentInput: string,
  comments: Comment[]
): string {
  const isReplyingToThisComment =
    replyingTo?.commentId === commentId && !replyingTo?.isReply;
  const isReplyingToThisCommentReply =
    replyingTo?.isReply &&
    comments
      .find((c) => c.id === commentId)
      ?.replies?.some((r) => r.id === replyingTo.commentId);

  return isReplyingToThisComment || isReplyingToThisCommentReply
    ? commentInput
    : "";
}
/**
 * 답글 placeholder 텍스트 생성
 * @param author - 작성자 닉네임
 * @returns placeholder 텍스트
 */
export function getReplyPlaceholder(author: string): string {
  return `${author}에게 답글 남기기`;
}
