"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import type { FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import CommentItem from "@/components/community/CommentItem";
import { CommentEmptyMessage } from "@/components/shared/comment-empty-message";
import { CommentInputForm } from "@/components/shared/comment-input-form";
import { CommentSkeleton } from "@/components/shared/comment-skeleton";
import Modal from "@/components/shared/ui/modal";
import { commentsKeys } from "@/constants/generated/query-keys";
import { communitiesKeys } from "@/constants/generated/query-keys";
import {
  COMMENT_DELETE_MODAL_TITLE,
  COMMENT_DELETE_MODAL_CONFIRM,
  COMMENT_DELETE_MODAL_CANCEL,
} from "@/constants/shared/_comment-constants";
import {
  useGetCommentsCommunitiesPostsByTwoIds,
  usePostCommentsCommunitiesPostsByTwoIds,
  usePutCommentsById,
  useDeleteCommentsById,
} from "@/hooks/generated/comments-hooks";
import { useGetUsersMe } from "@/hooks/generated/users-hooks";
import { useCommentFocus } from "@/hooks/shared/use-comment-focus";
import type { ReplyingToState } from "@/types/shared/comment";
import { getParentId, getCommentInputForItem } from "@/utils/shared/comment";
import { debug } from "@/utils/shared/debugger";

interface CommentsSectionProps {
  postId: string;
  communityId: string;
  postType?: string;
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
  postType,
  commentInputRef,
  onFocusRequestRef,
}: CommentsSectionProps) => {
  const queryClient = useQueryClient();

  const [commentInput, setCommentInput] = useState("");
  const [replyingTo, setReplyingTo] = useState<ReplyingToState>(null);
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
  useCommentFocus({
    onFocusRequestRef,
    replyingTo,
    setReplyingTo,
    setCommentInput,
    inputRef,
  });

  // 현재 사용자 정보
  const { data: userData } = useGetUsersMe({
    select: (data) => data?.user,
  });

  // TMI 타입 게시글인 경우 실명 사용, 아니면 닉네임 사용
  const isTMIPost = postType === "TMI" || postType === "TMI_CERT";
  const currentUserDisplayName = isTMIPost
    ? userData?.name || ""
    : userData?.nickname || "";
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
  const { mutateAsync: postCommentAsync, isPending: isPostCommentPending } =
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
  const getParentIdMemoized = useCallback(
    (replyingToState: ReplyingToState) =>
      getParentId(replyingToState, comments),
    [comments]
  );

  // 댓글 제출 핸들러
  const handleCommentSubmit = useCallback(
    async (e: FormEvent, customContent?: string) => {
      e.preventDefault();
      if (isPostCommentPending) return;
      const contentToSubmit = customContent ?? commentInput;
      if (!contentToSubmit.trim() || !communityId || !postId) return;

      try {
        const parentId = getParentIdMemoized(replyingTo);

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
      getParentIdMemoized,
      postCommentAsync,
      isPostCommentPending,
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
  const getCommentInputForItemMemoized = useCallback(
    (commentId: string) =>
      getCommentInputForItem(commentId, replyingTo, commentInput, comments),
    [replyingTo, commentInput, comments]
  );

  // 로딩 중
  if (isCommentsLoading) {
    return <CommentSkeleton />;
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
                currentUserDisplayName={currentUserDisplayName}
                isExpanded={expandedReplies.has(comment.id || "")}
                onToggleReplies={() => handleToggleReplies(comment.id || "")}
                onStartReply={handleStartReplyToRoot}
                onStartReplyToReply={handleStartReplyToReply}
                onStartEdit={handleStartEdit}
                onDelete={handleDeleteClick}
                onReport={(commentId) => {
                  debug.log("신고:", commentId);
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
                commentInput={getCommentInputForItemMemoized(comment.id || "")}
                onCommentInputChange={setCommentInput}
                openMenuId={openMenuId}
                onMenuToggle={handleMenuToggle}
                isCommentSubmitting={isPostCommentPending}
              />
            ))}
          </div>
        ) : (
          <CommentEmptyMessage />
        )}

        {/* 하단 댓글 작성칸 */}
        {!editingCommentId && (
          <CommentInputForm
            commentInput={commentInput}
            onCommentInputChange={setCommentInput}
            onCommentSubmit={handleCommentSubmit}
            replyingTo={replyingTo}
            onCancelReply={handleCancelReply}
            currentUserDisplayName={currentUserDisplayName}
            inputRef={inputRef}
            isSubmitting={isPostCommentPending}
          />
        )}
      </div>

      {/* 삭제 확인 모달 */}
      <Modal
        isOpen={isDeleteModalOpen}
        title={COMMENT_DELETE_MODAL_TITLE}
        confirmText={COMMENT_DELETE_MODAL_CONFIRM}
        cancelText={COMMENT_DELETE_MODAL_CANCEL}
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
