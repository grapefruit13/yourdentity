"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import type { FormEvent, RefObject } from "react";
import { useQueryClient } from "@tanstack/react-query";
import CommentItem from "@/components/community/CommentItem";
import { CommentEmptyMessage } from "@/components/shared/comment-empty-message";
import { CommentInputForm } from "@/components/shared/comment-input-form";
import { CommentSkeleton } from "@/components/shared/comment-skeleton";
import Modal from "@/components/shared/ui/modal";
import { missionsKeys } from "@/constants/generated/query-keys";
import {
  COMMENT_DELETE_MODAL_TITLE,
  COMMENT_DELETE_MODAL_CONFIRM,
  COMMENT_DELETE_MODAL_CANCEL,
} from "@/constants/shared/_comment-constants";
import {
  useGetMissionsPostsCommentsById,
  usePostMissionsPostsCommentsById,
  usePutMissionsPostsCommentsByTwoIds,
  useDeleteMissionsPostsCommentsByTwoIds,
} from "@/hooks/generated/missions-hooks";
import { useGetUsersMe } from "@/hooks/generated/users-hooks";
import { useCommentFocus } from "@/hooks/shared/use-comment-focus";
import type { ReplyingToState } from "@/types/shared/comment";
import { getParentId, getCommentInputForItem } from "@/utils/shared/comment";
import { debug } from "@/utils/shared/debugger";

interface MissionCommentsSectionProps {
  postId: string;
  commentInputRef?: React.RefObject<HTMLTextAreaElement | null>;
  onFocusRequestRef?: React.RefObject<(() => void) | null>;
}

/**
 * @description 미션 인증글 댓글 섹션 컴포넌트
 * - 댓글 목록 표시 (API 연동)
 * - 댓글 작성 기능 (API 연동)
 * - 답글 기능
 */
const MissionCommentsSection = ({
  postId,
  commentInputRef,
  onFocusRequestRef,
}: MissionCommentsSectionProps) => {
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
    (commentInputRef as RefObject<HTMLTextAreaElement>) || bottomTextareaRef;

  // 외부에서 포커스 요청 시 답글 상태 초기화 및 포커스
  useCommentFocus({
    onFocusRequestRef,
    replyingTo,
    setReplyingTo,
    setCommentInput,
    inputRef,
  });

  // 현재 사용자 정보
  const { data: currentUserNickname = "" } = useGetUsersMe({
    select: (data) => data?.user?.nickname || "",
  });

  // 댓글 목록 조회 API
  const { data: commentsData, isLoading: isCommentsLoading } =
    useGetMissionsPostsCommentsById({
      request: {
        postId,
      },
      enabled: !!postId,
    });

  // 댓글 목록 (최신순 정렬)
  const comments = useMemo(() => {
    if (!commentsData?.comments) return [];

    return [...commentsData.comments].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA; // 최신순 (내림차순)
    });
  }, [commentsData?.comments]);

  // 미션 게시글 및 댓글 쿼리 무효화 헬퍼
  const invalidateCommentQueries = useCallback(() => {
    // 게시글 상세 정보 refetch (댓글 카운트 반영)
    queryClient.invalidateQueries({
      queryKey: missionsKeys.getMissionsPostsById({ postId }),
    });
    // 댓글 목록 refetch
    queryClient.invalidateQueries({
      queryKey: missionsKeys.getMissionsPostsCommentsById({ postId }),
    });
  }, [queryClient, postId]);

  // 댓글 작성 mutation
  const { mutateAsync: postCommentAsync, isPending: isPostCommentPending } =
    usePostMissionsPostsCommentsById({
      onSuccess: () => {
        invalidateCommentQueries();
        setCommentInput("");
        setReplyingTo(null);
      },
    });

  // 댓글 수정 mutation
  const { mutateAsync: putCommentAsync } = usePutMissionsPostsCommentsByTwoIds({
    onSuccess: () => {
      invalidateCommentQueries();
      setEditingCommentId(null);
      setEditingContent("");
    },
  });

  // 댓글 삭제 mutation
  const { mutateAsync: deleteCommentAsync } =
    useDeleteMissionsPostsCommentsByTwoIds({
      onSuccess: () => {
        invalidateCommentQueries();
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
      if (!contentToSubmit.trim() || !postId) return;

      try {
        const parentId = getParentIdMemoized(replyingTo);

        await postCommentAsync({
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
          postId,
          commentId,
          data: {
            content: editingContent.trim(),
          },
        });
      } catch (error) {
        debug.error("댓글 수정 실패:", error);
      }
    },
    [editingContent, postId, putCommentAsync]
  );

  // 댓글 삭제 확인
  const handleDeleteClick = useCallback((commentId: string) => {
    setDeleteTargetId(commentId);
    setIsDeleteModalOpen(true);
  }, []);

  // 댓글 삭제 실행
  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTargetId || !postId) return;

    try {
      await deleteCommentAsync({
        postId,
        commentId: deleteTargetId,
      });
    } catch (error) {
      debug.error("댓글 삭제 실패:", error);
    }
  }, [deleteTargetId, postId, deleteCommentAsync]);

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
                userName={currentUserNickname}
                isExpanded={expandedReplies.has(comment.id || "")}
                onToggleReplies={() => handleToggleReplies(comment.id || "")}
                onStartReply={handleStartReplyToRoot}
                onStartReplyToReply={handleStartReplyToReply}
                onStartEdit={handleStartEdit}
                onDelete={handleDeleteClick}
                onReport={() => {
                  // TODO: 신고 기능 구현
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
            userName={currentUserNickname}
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

export default MissionCommentsSection;
