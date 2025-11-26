"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import type { FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import KebabMenu from "@/components/shared/kebab-menu";
import { Typography } from "@/components/shared/typography";
import { usePostCommentsLikeById } from "@/hooks/generated/comments-hooks";
import type * as Types from "@/types/generated/comments-types";
import { cn } from "@/utils/shared/cn";
import { getTimeAgo } from "@/utils/shared/date";

interface CommentItemProps {
  comment: NonNullable<
    Types.TGETCommentsCommunitiesPostsByTwoIdsRes["comments"]
  >[number];
  currentUserNickname: string;
  currentUserDisplayName: string;
  isExpanded?: boolean;
  onToggleReplies: () => void;
  onStartReply: (commentId: string, author: string) => void;
  onStartReplyToReply?: (commentId: string, author: string) => void;
  onStartEdit: (commentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  onReport?: (commentId: string) => void;
  editingCommentId: string | null;
  editingContent: string;
  onEditContentChange: (content: string) => void;
  onCancelEdit: () => void;
  onEditSubmit: (commentId: string) => void;
  replyingTo: { commentId: string; author: string; isReply?: boolean } | null;
  onCancelReply: () => void;
  onCommentSubmit: (
    e: FormEvent,
    customContent?: string
  ) => void | Promise<void>;
  commentInput: string;
  onCommentInputChange: (value: string) => void;
  openMenuId?: string | null;
  onMenuToggle?: (menuId: string | null) => void;
  replyToReplyInput?: string;
  onReplyToReplyInputChange?: (value: string) => void;
  isCommentSubmitting?: boolean;
}

/**
 * @description 댓글 아이템 컴포넌트
 * - 댓글 및 답글 표시
 * - 답글 더보기 기능
 * - 댓글 수정/삭제 메뉴
 * - 좋아요 기능
 */
const CommentItem = ({
  comment,
  currentUserNickname,
  currentUserDisplayName,
  isExpanded = false,
  onToggleReplies,
  onStartReply,
  onStartReplyToReply,
  onStartEdit,
  onDelete,
  onReport,
  editingCommentId,
  editingContent,
  onEditContentChange,
  onCancelEdit,
  onEditSubmit,
  replyingTo,
  onCancelReply,
  onCommentSubmit,
  commentInput,
  onCommentInputChange,
  openMenuId = null,
  onMenuToggle,
  replyToReplyInput,
  onReplyToReplyInputChange,
  isCommentSubmitting = false,
}: CommentItemProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [replyLikes, setReplyLikes] = useState<
    Record<string, { isLiked: boolean; likesCount: number }>
  >({});
  const [localReplyToReplyInput, setLocalReplyToReplyInput] = useState("");
  const queryClient = useQueryClient();

  const commentId = comment.id || "";
  const isRootComment = !comment.parentId;

  // replies 배열 정규화 및 메모이제이션
  const replies = useMemo(() => {
    const rawReplies = comment.replies;
    return Array.isArray(rawReplies)
      ? rawReplies.filter((reply) => reply && reply.id)
      : [];
  }, [comment.replies]);

  const repliesCount = comment.repliesCount ?? replies.length;
  const visibleReplies = useMemo(
    () => (isExpanded ? replies : replies.slice(0, 1)),
    [isExpanded, replies]
  );
  const hiddenRepliesCount = Math.max(0, repliesCount - 1);
  const shouldShowMoreButton = repliesCount >= 2 && !isExpanded;

  const isOwnComment = comment.author === currentUserNickname;
  const isEditing = editingCommentId === commentId;
  const isReplying =
    replyingTo?.commentId === commentId && !replyingTo?.isReply;

  // 답글에 대한 답글 입력창의 실제 입력값
  const actualReplyToReplyInput = replyToReplyInput ?? localReplyToReplyInput;
  const handleReplyToReplyInputChange =
    onReplyToReplyInputChange ?? setLocalReplyToReplyInput;

  // 답글에 대한 답글 입력창이 닫힐 때 로컬 state 초기화
  useEffect(() => {
    if (!replyingTo?.isReply) {
      // 답글에 대한 답글 입력창이 닫혔고, 로컬 state에 값이 있으면 초기화
      if (localReplyToReplyInput && !onReplyToReplyInputChange) {
        setLocalReplyToReplyInput("");
      }
    }
  }, [replyingTo?.isReply, localReplyToReplyInput, onReplyToReplyInputChange]);

  // 답글 작성자 프로필 썸네일 추출 (메모이제이션)
  const replyThumbnails = useMemo(() => {
    if (replies.length === 0) return [];
    if (replies.length === 1) return [replies[0]];
    // 2개 이상이면 처음 2개 선택 (랜덤 제거로 일관성 유지)
    return replies.slice(0, 2);
  }, [replies]);

  // 메뉴 제어
  const commentMenuId = useMemo(() => `comment-${commentId}`, [commentId]);
  const isCommentMenuOpen = openMenuId === commentMenuId;
  const handleCommentMenuToggle = useCallback(() => {
    if (onMenuToggle) {
      onMenuToggle(isCommentMenuOpen ? null : commentMenuId);
    }
  }, [onMenuToggle, isCommentMenuOpen, commentMenuId]);

  // 좋아요 mutation
  const { mutateAsync: likeCommentAsync, isPending: isLikePending } =
    usePostCommentsLikeById({
      onSuccess: (response, variables) => {
        const result = response.data;
        const targetCommentId = variables.commentId;

        if (result && targetCommentId) {
          const isReply = replies.some((reply) => reply.id === targetCommentId);

          if (isReply) {
            setReplyLikes((prev) => ({
              ...prev,
              [targetCommentId]: {
                isLiked: result.isLiked || false,
                likesCount: result.likesCount || 0,
              },
            }));
          } else if (targetCommentId === comment.id) {
            setIsLiked(result.isLiked || false);
          }
        }

        queryClient.invalidateQueries({
          queryKey: ["comments", "getCommentsCommunitiesPostsByTwoIds"],
        });
      },
    });

  // 좋아요 핸들러
  const handleLike = useCallback(async () => {
    if (!commentId || isLikePending) return;
    try {
      await likeCommentAsync({ commentId });
      // onSuccess에서 상태 업데이트하므로 여기서는 제거
    } catch (error) {
      console.error("좋아요 실패:", error);
    }
  }, [commentId, likeCommentAsync, isLikePending]);

  const handleReplyLike = useCallback(
    async (targetReplyId: string) => {
      if (!targetReplyId || isLikePending) return;
      try {
        await likeCommentAsync({ commentId: targetReplyId });
      } catch (error) {
        console.error("답글 좋아요 실패:", error);
      }
    },
    [isLikePending, likeCommentAsync]
  );

  // 메뉴 핸들러
  const handleEdit = useCallback(() => {
    if (comment.content) {
      onStartEdit(commentId, comment.content);
    }
  }, [comment.content, commentId, onStartEdit]);

  const handleDelete = useCallback(() => {
    onDelete(commentId);
  }, [commentId, onDelete]);

  const handleReport = useCallback(() => {
    if (onReport) {
      onReport(commentId);
    }
  }, [commentId, onReport]);

  // 답글에 대한 답글 제출 핸들러
  const handleReplyToReplySubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!actualReplyToReplyInput.trim() || isCommentSubmitting) return;

      try {
        await onCommentSubmit(e, actualReplyToReplyInput);
        if (onReplyToReplyInputChange) {
          handleReplyToReplyInputChange("");
        } else {
          setLocalReplyToReplyInput("");
        }
      } catch (error) {
        // 에러는 상위에서 처리됨
      }
    },
    [
      actualReplyToReplyInput,
      onCommentSubmit,
      onReplyToReplyInputChange,
      handleReplyToReplyInputChange,
      isCommentSubmitting,
    ]
  );

  // 답글에 대한 답글 취소 핸들러
  const handleCancelReplyToReply = useCallback(() => {
    onCancelReply();
    if (!onReplyToReplyInputChange) {
      setLocalReplyToReplyInput("");
    }
  }, [onCancelReply, onReplyToReplyInputChange]);

  // 답글 좋아요 상태 계산 (메모이제이션)
  const getReplyLikeState = useCallback(
    (replyId: string) => {
      const replyLikeState = replyLikes[replyId];
      return {
        isLiked: replyLikeState?.isLiked ?? false,
        likesCount: replyLikeState?.likesCount ?? 0,
      };
    },
    [replyLikes]
  );

  return (
    <div className="space-y-3">
      {/* 메인 댓글 */}
      <div className="flex gap-3">
        <div className="h-8 w-8 flex-shrink-0 rounded-full bg-gray-300"></div>

        <div className="flex-1">
          {/* 댓글 헤더 */}
          <div className="mb-1 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Typography
                font="noto"
                variant="body2M"
                className="text-gray-800"
              >
                {comment.author || "익명"}
              </Typography>
              {comment.createdAt && (
                <Typography
                  font="noto"
                  variant="caption1R"
                  className="text-gray-500"
                >
                  {getTimeAgo(comment.createdAt)}
                </Typography>
              )}
            </div>
            {!isEditing && (
              <KebabMenu
                onEdit={isOwnComment ? handleEdit : undefined}
                onDelete={isOwnComment ? handleDelete : undefined}
                onReport={!isOwnComment ? handleReport : undefined}
                className="flex-shrink-0"
                isOpen={isCommentMenuOpen}
                onToggle={handleCommentMenuToggle}
              />
            )}
          </div>

          {/* 댓글 내용 또는 수정 입력칸 */}
          {isEditing ? (
            <div className="mb-2 space-y-2">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-gray-300"></div>
                  <Typography
                    font="noto"
                    variant="body2M"
                    className="text-gray-800"
                  >
                    {comment.author || "익명"}
                  </Typography>
                </div>
                <button
                  onClick={onCancelEdit}
                  className="text-sm text-gray-600 hover:text-gray-800"
                  type="button"
                >
                  <Typography font="noto" variant="body2R">
                    취소
                  </Typography>
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (editingContent.trim()) {
                    onEditSubmit(commentId);
                  }
                }}
              >
                <textarea
                  value={editingContent}
                  onChange={(e) => onEditContentChange(e.target.value)}
                  className="focus:ring-main-400 w-full resize-none rounded-lg border border-gray-200 p-3 text-sm focus:ring-2 focus:outline-none"
                  rows={
                    editingContent.trim()
                      ? Math.min(editingContent.split("\n").length + 1, 5)
                      : 1
                  }
                />
                <div className="mt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={!editingContent.trim()}
                    className={cn(
                      "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                      editingContent.trim()
                        ? "bg-main-600 hover:bg-main-700 text-white"
                        : "bg-gray-200 text-gray-400"
                    )}
                  >
                    <Typography
                      font="noto"
                      variant="body2M"
                      className={
                        editingContent.trim() ? "text-white" : "text-gray-400"
                      }
                    >
                      등록
                    </Typography>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <>
              {comment.content && (
                <div
                  className="prose prose-sm mb-2 max-w-none text-sm text-gray-700 [&_img]:block [&_img]:h-auto [&_img]:max-h-[300px] [&_img]:w-auto [&_img]:max-w-full [&_img]:object-contain"
                  dangerouslySetInnerHTML={{ __html: comment.content }}
                />
              )}

              {/* 댓글 액션 버튼 */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => onStartReply(commentId, comment.author || "")}
                  className="text-sm text-gray-600 hover:text-gray-800"
                  type="button"
                >
                  <Typography font="noto" variant="body2R">
                    답글 쓰기
                  </Typography>
                </button>
                <button
                  onClick={handleLike}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
                  type="button"
                >
                  <svg
                    className={cn(
                      "h-4 w-4 transition-colors",
                      isLiked ? "fill-red-500 text-red-500" : "text-gray-600"
                    )}
                    fill={isLiked ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  <Typography font="noto" variant="body2R">
                    {comment.likesCount || 0}
                  </Typography>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 답글 목록 */}
      {isRootComment && (replies.length > 0 || repliesCount > 0) && (
        <div className="ml-11 space-y-3">
          {visibleReplies.length > 0 ? (
            visibleReplies.map((reply) => {
              const replyId = reply.id || "";
              const replyAuthor = reply.author || "익명";
              const isEditingReply = editingCommentId === replyId;
              const isReplyingToThisReply =
                replyingTo?.commentId === replyId &&
                replyingTo?.isReply === true &&
                !isReplying;

              const replyMenuId = `reply-${replyId}`;
              const isReplyMenuOpen = openMenuId === replyMenuId;
              const handleReplyMenuToggle = () => {
                if (onMenuToggle) {
                  onMenuToggle(isReplyMenuOpen ? null : replyMenuId);
                }
              };

              const replyLikeState = getReplyLikeState(replyId);
              const replyIsLiked = replyLikeState.isLiked;
              const replyLikesCount =
                replyLikeState.likesCount || reply.likesCount || 0;

              return (
                <div key={replyId} className="flex gap-3">
                  <div className="h-8 w-8 flex-shrink-0 rounded-full bg-gray-300"></div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Typography
                          font="noto"
                          variant="body2R"
                          className="text-gray-800"
                        >
                          <span className="text-main-500">
                            @{comment.author || "익명"}
                          </span>{" "}
                          {replyAuthor}
                        </Typography>
                        {reply.createdAt && (
                          <Typography
                            font="noto"
                            variant="caption1R"
                            className="text-gray-500"
                          >
                            {getTimeAgo(reply.createdAt)}
                          </Typography>
                        )}
                      </div>
                      {!isReplyingToThisReply && !isEditingReply && (
                        <KebabMenu
                          onEdit={
                            replyAuthor === currentUserNickname
                              ? () => {
                                  if (reply.content) {
                                    onStartEdit(replyId, reply.content);
                                  }
                                }
                              : undefined
                          }
                          onDelete={
                            replyAuthor === currentUserNickname
                              ? () => onDelete(replyId)
                              : undefined
                          }
                          onReport={
                            replyAuthor !== currentUserNickname && onReport
                              ? () => onReport(replyId)
                              : undefined
                          }
                          className="flex-shrink-0"
                          isOpen={isReplyMenuOpen}
                          onToggle={handleReplyMenuToggle}
                        />
                      )}
                    </div>
                    {/* 답글 내용 또는 수정 입력칸 */}
                    {isEditingReply ? (
                      <div className="mb-2 space-y-2">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-gray-300"></div>
                            <Typography
                              font="noto"
                              variant="body2M"
                              className="text-gray-800"
                            >
                              {replyAuthor || "익명"}
                            </Typography>
                          </div>
                          <button
                            onClick={onCancelEdit}
                            className="text-sm text-gray-600 hover:text-gray-800"
                            type="button"
                          >
                            <Typography font="noto" variant="body2R">
                              취소
                            </Typography>
                          </button>
                        </div>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (editingContent.trim()) {
                              onEditSubmit(replyId);
                            }
                          }}
                        >
                          <textarea
                            value={editingContent}
                            onChange={(e) =>
                              onEditContentChange(e.target.value)
                            }
                            className="focus:ring-main-400 w-full resize-none rounded-lg border border-gray-200 p-3 text-sm focus:ring-2 focus:outline-none"
                            rows={
                              editingContent.trim()
                                ? Math.min(
                                    editingContent.split("\n").length + 1,
                                    5
                                  )
                                : 1
                            }
                          />
                          <div className="mt-2 flex justify-end">
                            <button
                              type="submit"
                              disabled={!editingContent.trim()}
                              className={cn(
                                "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                                editingContent.trim()
                                  ? "bg-main-600 hover:bg-main-700 text-white"
                                  : "bg-gray-200 text-gray-400"
                              )}
                            >
                              <Typography
                                font="noto"
                                variant="body2M"
                                className={
                                  editingContent.trim()
                                    ? "text-white"
                                    : "text-gray-400"
                                }
                              >
                                등록
                              </Typography>
                            </button>
                          </div>
                        </form>
                      </div>
                    ) : (
                      <>
                        {reply.content && (
                          <div
                            className="prose prose-sm mb-2 max-w-none text-sm text-gray-700 [&_img]:block [&_img]:h-auto [&_img]:max-h-[300px] [&_img]:w-auto [&_img]:max-w-full [&_img]:object-contain"
                            dangerouslySetInnerHTML={{ __html: reply.content }}
                          />
                        )}
                        <div className="flex items-center gap-4">
                          {onStartReplyToReply && (
                            <button
                              onClick={() => {
                                onStartReplyToReply(replyId, replyAuthor);
                              }}
                              className="text-sm text-gray-600 transition-opacity hover:text-gray-800 hover:opacity-80"
                              type="button"
                            >
                              <Typography font="noto" variant="body2R">
                                답글 쓰기
                              </Typography>
                            </button>
                          )}
                          <button
                            onClick={() => {
                              handleReplyLike(replyId);
                            }}
                            className="flex items-center gap-1 text-sm transition-opacity hover:opacity-80"
                            type="button"
                          >
                            <svg
                              className={cn(
                                "h-4 w-4 transition-colors",
                                replyIsLiked
                                  ? "fill-red-500 text-red-500"
                                  : "text-gray-600"
                              )}
                              fill={replyIsLiked ? "currentColor" : "none"}
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                              />
                            </svg>
                            <Typography
                              font="noto"
                              variant="body2R"
                              className={cn(
                                "transition-colors",
                                replyIsLiked ? "text-red-500" : "text-gray-600"
                              )}
                            >
                              {replyLikesCount}
                            </Typography>
                          </button>
                        </div>
                      </>
                    )}
                    {/* 답글에 대한 답글 입력창 */}
                    {isReplyingToThisReply && (
                      <div className="mt-3 space-y-2">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-gray-300"></div>
                            <Typography
                              font="noto"
                              variant="body2R"
                              className="text-gray-800"
                            >
                              <span className="text-main-500">
                                @{replyingTo?.author}
                              </span>{" "}
                              {currentUserDisplayName}
                            </Typography>
                          </div>
                          <button
                            type="button"
                            onClick={handleCancelReplyToReply}
                            className="text-sm text-gray-600 hover:text-gray-800"
                          >
                            <Typography font="noto" variant="body2R">
                              취소
                            </Typography>
                          </button>
                        </div>
                        <form
                          onSubmit={handleReplyToReplySubmit}
                          className="relative"
                        >
                          <textarea
                            value={actualReplyToReplyInput}
                            onChange={(e) =>
                              handleReplyToReplyInputChange(e.target.value)
                            }
                            placeholder="서로 배려하는 댓글을 남겨요:)"
                            className="focus:ring-main-400 w-full resize-none rounded-lg border border-gray-200 p-3 pr-20 pb-12 text-sm focus:ring-2 focus:outline-none"
                            rows={
                              actualReplyToReplyInput.trim()
                                ? Math.min(
                                    actualReplyToReplyInput.split("\n").length +
                                      1,
                                    5
                                  )
                                : 1
                            }
                          />
                          <div className="absolute right-2 bottom-3 flex items-center gap-2">
                            <button
                              type="submit"
                              disabled={
                                !actualReplyToReplyInput.trim() ||
                                isCommentSubmitting
                              }
                              className={cn(
                                "h-[40px] rounded-lg px-4 py-2 text-sm font-medium transition-all",
                                actualReplyToReplyInput.trim() &&
                                  !isCommentSubmitting
                                  ? "bg-main-600 hover:bg-main-700 cursor-pointer text-white"
                                  : "cursor-not-allowed bg-gray-100 text-gray-400 opacity-50"
                              )}
                            >
                              <Typography
                                font="noto"
                                variant="body2M"
                                className={
                                  actualReplyToReplyInput.trim() &&
                                  !isCommentSubmitting
                                    ? "text-white"
                                    : "text-gray-400"
                                }
                              >
                                등록
                              </Typography>
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-sm text-gray-500">
              <Typography font="noto" variant="body2R">
                답글을 불러오는 중...
              </Typography>
            </div>
          )}

          {/* 답글 더보기 버튼 */}
          {shouldShowMoreButton && (
            <button
              onClick={onToggleReplies}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
            >
              <div className="flex -space-x-2">
                {replyThumbnails.map((reply, index) => (
                  <div
                    key={reply.id || index}
                    className="h-6 w-6 rounded-full border-2 border-white bg-gray-300"
                  />
                ))}
              </div>
              <Typography font="noto" variant="body2R">
                답글 {hiddenRepliesCount}개 더보기
              </Typography>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentItem;
