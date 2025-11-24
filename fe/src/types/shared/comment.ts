/**
 * @description 댓글 관련 공통 타입 정의
 */

export type ReplyingToState = {
  commentId: string;
  author: string;
  isReply?: boolean;
} | null;
