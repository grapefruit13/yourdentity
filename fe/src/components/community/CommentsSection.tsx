"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import type { FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import CommentItem from "@/components/community/CommentItem";
import { Typography } from "@/components/shared/typography";
import Modal from "@/components/shared/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { commentsKeys } from "@/constants/generated/query-keys";
import { communitiesKeys } from "@/constants/generated/query-keys";
import {
  useGetCommentsCommunitiesPostsByTwoIds,
  usePostCommentsCommunitiesPostsByTwoIds,
  usePutCommentsById,
  useDeleteCommentsById,
} from "@/hooks/generated/comments-hooks";
import { useGetUsersMe } from "@/hooks/generated/users-hooks";
import { cn } from "@/utils/shared/cn";
import { debug } from "@/utils/shared/debugger";

interface CommentsSectionProps {
  postId: string;
  communityId: string;
  commentInputRef?: React.RefObject<HTMLTextAreaElement | null>;
  onFocusRequestRef?: React.RefObject<(() => void) | null>;
}

/**
 * @description 댓글 섹션 컴포넌트
 * - 댓글 목록 표시
 * - 댓글 작성/수정/삭제 기능
 * - 답글 기능
 */
const CommentsSection = ({
  postId,
  communityId,
  commentInputRef,
  onFocusRequestRef,
}: CommentsSectionProps) => {
  const queryClient = useQueryClient();

  const [commentInput, setCommentInput] = useState("");
  const [replyingTo, setReplyingTo] = useState<{
    commentId: string;
    author: string;
    isReply?: boolean;
  } | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(
    new Set()
  );
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const bottomTextareaRef = useRef<HTMLTextAreaElement>(null);

  // commentInputRef가 전달되면 그것을 사용, 없으면 내부 ref 사용
  const inputRef =
    (commentInputRef as React.RefObject<HTMLTextAreaElement>) ||
    bottomTextareaRef;

  // 외부에서 포커스 요청 시 답글 상태 초기화 및 포커스
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
  }, [onFocusRequestRef, replyingTo?.isReply]);

  // 현재 사용자 정보
  const { data: userData } = useGetUsersMe({
    select: (data) => data?.user,
  });
  const currentUserNickname = userData?.nickname || "";

  // 댓글 데이터 가져오기
  const { data: commentsData, isLoading: isCommentsLoading } =
    useGetCommentsCommunitiesPostsByTwoIds({
      request: {
        communityId: communityId || "",
        postId,
      },
      enabled: !!postId && !!communityId,
    });

  const comments = commentsData?.comments || [];

  // 댓글 작성 mutation
  const { mutateAsync: postCommentAsync } =
    usePostCommentsCommunitiesPostsByTwoIds({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: commentsKeys.getCommentsCommunitiesPostsByTwoIds({
            communityId: communityId || "",
            postId,
          }),
        });
        queryClient.invalidateQueries({
          queryKey: communitiesKeys.getCommunitiesPostsByTwoIds({
            communityId: communityId || "",
            postId,
          }),
        });
        queryClient.invalidateQueries({
          queryKey: communitiesKeys.getCommunitiesPosts({
            page: undefined,
            size: undefined,
            programType: undefined,
            programState: undefined,
          }),
        });
        setCommentInput("");
        setReplyingTo(null);
      },
    });

  // 댓글 수정 mutation
  const { mutateAsync: putCommentAsync } = usePutCommentsById({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: commentsKeys.getCommentsCommunitiesPostsByTwoIds({
          communityId: communityId || "",
          postId,
        }),
      });
      setEditingCommentId(null);
      setEditingContent("");
    },
  });

  // 댓글 삭제 mutation
  const { mutateAsync: deleteCommentAsync } = useDeleteCommentsById({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: commentsKeys.getCommentsCommunitiesPostsByTwoIds({
          communityId: communityId || "",
          postId,
        }),
      });
      setIsDeleteModalOpen(false);
      setDeleteTargetId(null);
    },
  });

  // parentId 계산 로직 (메모이제이션)
  const getParentId = useCallback(
    (replyingToState: typeof replyingTo) => {
      if (!replyingToState) return undefined;

      if (replyingToState.isReply && replyingToState.commentId) {
        const parentComment = comments.find((comment) =>
          comment.replies?.some(
            (r) => (r.id || r.commentId) === replyingToState.commentId
          )
        );
        return parentComment?.id;
      }

      if (replyingToState.commentId) {
        return replyingToState.commentId;
      }

      return undefined;
    },
    [comments]
  );

  // 댓글 제출 핸들러
  const handleCommentSubmit = useCallback(
    async (e: FormEvent, customContent?: string) => {
      e.preventDefault();
      const contentToSubmit = customContent ?? commentInput;
      if (!contentToSubmit.trim() || !communityId || !postId) return;

      try {
        const parentId = getParentId(replyingTo);

        await postCommentAsync({
          communityId,
          postId,
          data: {
            content: contentToSubmit.trim(),
            parentId,
          },
        });
      } catch (error) {
        debug.error("댓글 작성 실패:", error);
      }
    },
    [
      commentInput,
      communityId,
      postId,
      replyingTo,
      getParentId,
      postCommentAsync,
    ]
  );

  // 원댓글에 답글 작성 시작
  const handleStartReplyToRoot = useCallback(
    (commentId: string, author: string) => {
      setEditingCommentId(null);
      setReplyingTo({ commentId, author, isReply: false });
      setCommentInput("");
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 0);
    },
    [inputRef]
  );

  // 답글에 답글 작성 시작
  const handleStartReplyToReply = useCallback(
    (commentId: string, author: string) => {
      setEditingCommentId(null);
      setReplyingTo({ commentId, author, isReply: true });
      setCommentInput("");
    },
    []
  );

  // 답글 작성 취소
  const handleCancelReply = useCallback(() => {
    setReplyingTo(null);
    setCommentInput("");
  }, []);

  // 댓글 수정 시작
  const handleStartEdit = useCallback((commentId: string, content: string) => {
    setReplyingTo(null);
    setCommentInput("");
    setEditingCommentId(commentId);
    setEditingContent(content);
  }, []);

  // 댓글 수정 취소
  const handleCancelEdit = useCallback(() => {
    setEditingCommentId(null);
    setEditingContent("");
    setReplyingTo(null);
  }, []);

  // 댓글 수정 제출
  const handleEditSubmit = useCallback(
    async (commentId: string) => {
      if (!editingContent.trim()) return;

      try {
        await putCommentAsync({
          commentId,
          data: {
            content: editingContent.trim(),
          },
        });
      } catch (error) {
        debug.error("댓글 수정 실패:", error);
      }
    },
    [editingContent, putCommentAsync]
  );

  // 댓글 삭제 확인
  const handleDeleteClick = useCallback((commentId: string) => {
    setDeleteTargetId(commentId);
    setIsDeleteModalOpen(true);
  }, []);

  // 댓글 삭제 실행
  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTargetId) return;

    try {
      await deleteCommentAsync({
        commentId: deleteTargetId,
      });
    } catch (error) {
      debug.error("댓글 삭제 실패:", error);
    }
  }, [deleteTargetId, deleteCommentAsync]);

  // 답글 더보기 토글
  const handleToggleReplies = useCallback((commentId: string) => {
    setExpandedReplies((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
  }, []);

  // 메뉴 토글 핸들러
  const handleMenuToggle = useCallback((menuId: string | null) => {
    setOpenMenuId((prev) => (prev === menuId ? null : menuId));
  }, []);

  // 댓글 입력값 계산 (메모이제이션)
  const getCommentInputForItem = useCallback(
    (commentId: string) => {
      const isReplyingToThisComment =
        replyingTo?.commentId === commentId && !replyingTo?.isReply;
      const isReplyingToThisCommentReply =
        replyingTo?.isReply &&
        comments
          .find((c) => c.id === commentId)
          ?.replies?.some(
            (r) => (r.id || r.commentId) === replyingTo.commentId
          );

      return isReplyingToThisComment || isReplyingToThisCommentReply
        ? commentInput
        : "";
    },
    [replyingTo, commentInput, comments]
  );

  // 로딩 중
  if (isCommentsLoading) {
    return (
      <div className="px-4 py-6">
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={`comment-skeleton-${index}`} className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="mt-1 h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 댓글 목록 */}
      <div className="border-t border-gray-200 py-6">
        {comments.length > 0 ? (
          <div className="space-y-4 px-4">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUserNickname={currentUserNickname}
                isExpanded={expandedReplies.has(comment.id || "")}
                onToggleReplies={() => handleToggleReplies(comment.id || "")}
                onStartReply={handleStartReplyToRoot}
                onStartReplyToReply={handleStartReplyToReply}
                onStartEdit={handleStartEdit}
                onDelete={handleDeleteClick}
                onReport={(commentId) => {
                  console.log("신고:", commentId);
                  alert("구현 예정 기능입니다");
                }}
                editingCommentId={editingCommentId}
                editingContent={editingContent}
                onEditContentChange={setEditingContent}
                onCancelEdit={handleCancelEdit}
                onEditSubmit={handleEditSubmit}
                replyingTo={replyingTo}
                onCancelReply={handleCancelReply}
                onCommentSubmit={handleCommentSubmit}
                commentInput={getCommentInputForItem(comment.id || "")}
                onCommentInputChange={setCommentInput}
                openMenuId={openMenuId}
                onMenuToggle={handleMenuToggle}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-12">
            <Typography font="noto" variant="body2R" className="text-gray-500">
              댓글을 남겨보세요.
            </Typography>
          </div>
        )}

        {/* 하단 댓글 작성칸 */}
        {!editingCommentId && (
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
                  {currentUserNickname || "익명"}
                </Typography>
                {replyingTo && !replyingTo.isReply && (
                  <Typography
                    font="noto"
                    variant="body2R"
                    className="text-gray-500"
                  >
                    <span className="text-main-500">@{replyingTo.author}</span>
                    에게 답글
                  </Typography>
                )}
              </div>
              {replyingTo && !replyingTo.isReply && (
                <button
                  type="button"
                  onClick={handleCancelReply}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  <Typography font="noto" variant="body2R">
                    취소
                  </Typography>
                </button>
              )}
            </div>
            <form onSubmit={handleCommentSubmit} className="relative">
              <textarea
                ref={inputRef}
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder={
                  replyingTo && !replyingTo.isReply
                    ? `${replyingTo.author}에게 답글 남기기`
                    : "서로 배려하는 댓글을 남겨요:)"
                }
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
                    !commentInput.trim() || replyingTo?.isReply === true
                  }
                  className={cn(
                    "h-[40px] rounded-lg px-4 py-2 text-sm font-medium transition-all",
                    commentInput.trim() && !replyingTo?.isReply
                      ? "bg-main-600 hover:bg-main-700 cursor-pointer text-white"
                      : "cursor-not-allowed bg-gray-100 text-gray-400 opacity-50"
                  )}
                >
                  <Typography
                    font="noto"
                    variant="body2M"
                    className={
                      commentInput.trim() && !replyingTo?.isReply
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

      {/* 삭제 확인 모달 */}
      <Modal
        isOpen={isDeleteModalOpen}
        title="댓글을 삭제할까요?"
        confirmText="삭제"
        cancelText="취소"
        onConfirm={handleDeleteConfirm}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteTargetId(null);
        }}
        variant="danger"
      />
    </>
  );
};

export default CommentsSection;
