"use client";

import { useState, useRef, useEffect } from "react";
import type { FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
  isExpanded?: boolean;
  onToggleReplies: () => void;
  onStartReply: (commentId: string, author: string) => void;
  onStartReplyToReply?: (commentId: string, author: string) => void;
  onStartEdit: (commentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  editingCommentId: string | null;
  editingContent: string;
  onEditContentChange: (content: string) => void;
  onCancelEdit: () => void;
  onEditSubmit: (commentId: string) => void;
  replyingTo: { commentId: string; author: string; isReply?: boolean } | null;
  onCancelReply: () => void;
  onCommentSubmit: (e: FormEvent) => void;
  commentInput: string;
  onCommentInputChange: (value: string) => void;
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
  isExpanded = false,
  onToggleReplies,
  onStartReply,
  onStartReplyToReply,
  onStartEdit,
  onDelete,
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
}: CommentItemProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  // 답글별 좋아요 상태 관리 (답글 ID -> { isLiked, likesCount })
  const [replyLikes, setReplyLikes] = useState<
    Record<string, { isLiked: boolean; likesCount: number }>
  >({});
  const menuRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const commentId = comment.id || "";
  const isRootComment = !comment.parentId;
  // replies가 배열인지 확인하고 유효한 답글만 필터링
  const rawReplies = comment.replies;
  const replies = Array.isArray(rawReplies)
    ? rawReplies.filter((reply) => reply && (reply.id || reply.commentId))
    : [];
  const repliesCount = comment.repliesCount ?? replies.length; // repliesCount가 없으면 replies 길이 사용
  const visibleReplies = isExpanded ? replies : replies.slice(0, 1);
  const hiddenRepliesCount = Math.max(0, repliesCount - 1);
  const shouldShowMoreButton = repliesCount >= 2 && !isExpanded;

  const isOwnComment = comment.author === currentUserNickname;
  const isEditing = editingCommentId === commentId;
  const isReplying =
    replyingTo?.commentId === commentId && !replyingTo?.isReply;

  // 좋아요 mutation
  const { mutateAsync: likeCommentAsync } = usePostCommentsLikeById({
    onSuccess: (response, variables) => {
      const result = response.data;
      const commentId = variables.commentId;

      if (result && commentId) {
        // 답글인지 확인 (replies 배열에 있는지)
        const isReply = replies.some(
          (reply) => (reply.id || reply.commentId) === commentId
        );

        if (isReply) {
          // 답글 좋아요 상태 업데이트
          setReplyLikes((prev) => ({
            ...prev,
            [commentId]: {
              isLiked: result.isLiked || false,
              likesCount: result.likesCount || 0,
            },
          }));
        } else if (commentId === comment.id) {
          // 원댓글 좋아요 상태 업데이트
          setIsLiked(result.isLiked || false);
        }
      }

      // 댓글 목록 refetch (모든 관련 쿼리 무효화)
      queryClient.invalidateQueries({
        queryKey: ["comments", "getCommentsCommunitiesPostsByTwoIds"],
      });
    },
  });

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  // 좋아요 핸들러
  const handleLike = async () => {
    if (!commentId) return;
    try {
      await likeCommentAsync({ commentId });
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("좋아요 실패:", error);
    }
  };

  // 메뉴 아이템 클릭 핸들러
  const handleMenuAction = (action: "edit" | "delete" | "report") => {
    setIsMenuOpen(false);
    if (action === "edit" && comment.content) {
      onStartEdit(commentId, comment.content);
    } else if (action === "delete") {
      onDelete(commentId);
    }
    // 신고는 추후 구현
  };

  // 답글 작성 핸들러
  const handleReplySubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isReplying && commentInput.trim()) {
      onCommentSubmit(e);
    }
  };

  // 답글 작성자 프로필 썸네일 추출 (랜덤 2개)
  const getReplyThumbnails = () => {
    if (replies.length === 0) return [];
    if (replies.length === 1) return [replies[0]];
    // 2개 이상이면 랜덤으로 2개 선택
    const shuffled = [...replies].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 2);
  };

  const replyThumbnails = getReplyThumbnails();

  return (
    <div className="space-y-3">
      {/* 메인 댓글 */}
      <div className="flex gap-3">
        {/* 프로필 이미지 */}
        <div className="h-8 w-8 flex-shrink-0 rounded-full bg-gray-300"></div>

        <div className="flex-1">
          {/* 댓글 헤더 */}
          <div className="mb-1 flex items-center gap-2">
            <Typography font="noto" variant="body2M" className="text-gray-800">
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
                >
                  <Typography font="noto" variant="body2R">
                    답글 쓰기
                  </Typography>
                </button>
                <button
                  onClick={handleLike}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
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

              {/* 메뉴 버튼 */}
              <div className="relative mt-1 flex justify-end" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-1 text-gray-600 hover:text-gray-800"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                    />
                  </svg>
                </button>

                {/* 드롭다운 메뉴 */}
                {isMenuOpen && (
                  <div className="absolute top-8 right-0 z-10 w-24 rounded-lg border border-gray-200 bg-white shadow-lg">
                    <div className="py-1">
                      {isOwnComment ? (
                        <>
                          <button
                            onClick={() => handleMenuAction("edit")}
                            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Typography font="noto" variant="body2R">
                              수정
                            </Typography>
                          </button>
                          <button
                            onClick={() => handleMenuAction("delete")}
                            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Typography font="noto" variant="body2R">
                              삭제
                            </Typography>
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleMenuAction("report")}
                          className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Typography font="noto" variant="body2R">
                            신고
                          </Typography>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* 답글 작성 입력칸 - 원댓글에 대한 답글은 하단 입력창에만 표시되므로 CommentItem 내부에서는 표시하지 않음 */}
          {/* 원댓글에 대한 답글은 하단 입력창에서 처리되므로 여기서는 답글에 대한 답글만 처리 */}
        </div>
      </div>

      {/* 답글 목록 */}
      {isRootComment && (replies.length > 0 || repliesCount > 0) && (
        <div className="ml-11 space-y-3">
          {visibleReplies.length > 0 ? (
            visibleReplies.map((reply) => {
              const replyId = reply.id || reply.commentId || "";
              const replyAuthor = reply.author || "익명";
              // 답글에 대한 답글 입력창 표시 여부
              // 원댓글에 대한 답글 입력창(isReplying)이 활성화되어 있을 때는 답글 목록 안에 입력창이 나타나지 않도록
              const isReplyingToThisReply =
                replyingTo?.commentId === replyId &&
                replyingTo?.isReply === true &&
                !isReplying; // 원댓글에 대한 답글 입력창이 활성화되어 있지 않을 때만

              return (
                <div key={replyId} className="flex gap-3">
                  <div className="h-8 w-8 flex-shrink-0 rounded-full bg-gray-300"></div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <Typography
                        font="noto"
                        variant="body2M"
                        className="text-gray-800"
                      >
                        @ {comment.author || "익명"} {replyAuthor}
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
                    {reply.content && (
                      <div
                        className="prose prose-sm mb-2 max-w-none text-sm text-gray-700 [&_img]:block [&_img]:h-auto [&_img]:max-h-[300px] [&_img]:w-auto [&_img]:max-w-full [&_img]:object-contain"
                        dangerouslySetInnerHTML={{ __html: reply.content }}
                      />
                    )}
                    <div className="flex items-center gap-4">
                      {/* 답글에 대한 답글 쓰기 */}
                      {onStartReplyToReply && (
                        <button
                          onClick={() => {
                            onStartReplyToReply(replyId, replyAuthor);
                          }}
                          className="text-sm text-gray-600 transition-opacity hover:text-gray-800 hover:opacity-80"
                        >
                          <Typography font="noto" variant="body2R">
                            답글 쓰기
                          </Typography>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (replyId) {
                            likeCommentAsync({ commentId: replyId });
                          }
                        }}
                        className="flex items-center gap-1 text-sm transition-opacity hover:opacity-80"
                      >
                        {(() => {
                          const replyLikeState = replyLikes[replyId];
                          const replyIsLiked = replyLikeState?.isLiked ?? false;
                          const replyLikesCount =
                            replyLikeState?.likesCount ?? reply.likesCount ?? 0;

                          return (
                            <>
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
                                  replyIsLiked
                                    ? "text-red-500"
                                    : "text-gray-600"
                                )}
                              >
                                {replyLikesCount}
                              </Typography>
                            </>
                          );
                        })()}
                      </button>
                    </div>
                    {/* 답글에 대한 답글 입력창 - isReply가 true이고 해당 답글 ID와 일치할 때만 표시 */}
                    {isReplyingToThisReply && (
                      <div className="mt-3 space-y-2">
                        <div className="mb-2 flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-gray-300"></div>
                          <Typography
                            font="noto"
                            variant="body2M"
                            className="text-gray-800"
                          >
                            @ {replyingTo?.author} {currentUserNickname}
                          </Typography>
                        </div>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (commentInput.trim()) {
                              onCommentSubmit(e);
                            }
                          }}
                          className="relative"
                        >
                          <textarea
                            value={commentInput}
                            onChange={(e) =>
                              onCommentInputChange(e.target.value)
                            }
                            placeholder="서로 배려하는 댓글을 남겨요:)"
                            className="focus:ring-main-400 w-full resize-none rounded-lg border border-gray-200 p-3 pr-20 pb-12 text-sm focus:ring-2 focus:outline-none"
                            rows={
                              commentInput.trim()
                                ? Math.min(
                                    commentInput.split("\n").length + 1,
                                    5
                                  )
                                : 1
                            }
                          />
                          <div className="absolute right-2 bottom-2 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={onCancelReply}
                              className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                            >
                              <Typography font="noto" variant="body2R">
                                취소
                              </Typography>
                            </button>
                            <button
                              type="submit"
                              disabled={!commentInput.trim()}
                              className={cn(
                                "h-[40px] rounded-lg px-4 py-2 text-sm font-medium transition-all",
                                commentInput.trim()
                                  ? "bg-main-600 hover:bg-main-700 cursor-pointer text-white"
                                  : "cursor-not-allowed bg-gray-100 text-gray-400 opacity-50"
                              )}
                            >
                              <Typography
                                font="noto"
                                variant="body2M"
                                className={
                                  commentInput.trim()
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
            // replies 배열이 비어있지만 repliesCount가 있는 경우 (로딩 중이거나 데이터 구조 문제)
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
