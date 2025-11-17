"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import type { FormEvent } from "react";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import CommentItem from "@/components/community/CommentItem";
import { Typography } from "@/components/shared/typography";
import Modal from "@/components/shared/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { commentsKeys } from "@/constants/generated/query-keys";
import { communitiesKeys } from "@/constants/generated/query-keys";
import { IMAGE_URL } from "@/constants/shared/_image-url";
import {
  useGetCommentsCommunitiesPostsByTwoIds,
  usePostCommentsCommunitiesPostsByTwoIds,
  usePutCommentsById,
  useDeleteCommentsById,
} from "@/hooks/generated/comments-hooks";
import { useGetUsersMe } from "@/hooks/generated/users-hooks";
import { useTopBarStore } from "@/stores/shared/topbar-store";
import { cn } from "@/utils/shared/cn";
import { debug } from "@/utils/shared/debugger";

/**
 * @description 댓글 화면 페이지
 */
const CommentsPage = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const postId = params.id as string;
  const communityId = searchParams.get("communityId") || "";

  const [commentInput, setCommentInput] = useState("");
  const [replyingTo, setReplyingTo] = useState<{
    commentId: string;
    author: string;
    isReply?: boolean; // 답글에 대한 답글인지 구분
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
  const setTitle = useTopBarStore((state) => state.setTitle);
  const setLeftSlot = useTopBarStore((state) => state.setLeftSlot);
  const setRightSlot = useTopBarStore((state) => state.setRightSlot);
  const resetTopBar = useTopBarStore((state) => state.reset);

  // 현재 사용자 정보
  const { data: userData } = useGetUsersMe({
    select: (data) => data?.user,
  });
  const currentUserNickname = userData?.nickname || "";

  // 뒤로가기 핸들러
  const handleBack = useCallback(() => {
    // 게시글 상세 페이지로 명시적으로 이동
    router.push(`/community/post/${postId}?communityId=${communityId}`);
  }, [router, postId, communityId]);

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

  // 전체 댓글 개수 계산 (원댓글 + 답글)
  const totalCommentsCount = useMemo(() => {
    return comments.reduce((total, comment) => {
      const repliesCount = comment.repliesCount ?? comment.replies?.length ?? 0;
      return total + 1 + repliesCount; // 원댓글 1개 + 답글 개수
    }, 0);
  }, [comments]);

  // TopBar 초기 설정 (마운트 시 한 번만)
  useEffect(() => {
    // 커스텀 뒤로가기 버튼 설정
    const backButton = (
      <button
        onClick={handleBack}
        className="hover:cursor-pointer"
        aria-label="뒤로가기"
      >
        <Image
          src={IMAGE_URL.ICON.chevron.left.url}
          alt={IMAGE_URL.ICON.chevron.left.alt}
          width={24}
          height={24}
        />
      </button>
    );
    setLeftSlot(backButton);

    // 게시글 관련 컨텍스트 메뉴 숨기기
    setRightSlot(null);

    return () => {
      resetTopBar();
    };
  }, [handleBack, setLeftSlot, setRightSlot, resetTopBar]);

  // TopBar 제목 업데이트 (댓글 개수 변경 시)
  useEffect(() => {
    setTitle(`댓글 ${totalCommentsCount}`);
  }, [totalCommentsCount, setTitle]);

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
        // 게시글 상세 정보도 refetch (댓글 카운트 반영)
        queryClient.invalidateQueries({
          queryKey: communitiesKeys.getCommunitiesPostsByTwoIds({
            communityId: communityId || "",
            postId,
          }),
        });
        // 게시글 목록도 refetch (목록에서도 카운트 반영)
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

  // 댓글 제출 핸들러
  const handleCommentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !communityId || !postId) return;

    try {
      let parentId: string | undefined;

      if (replyingTo?.isReply && replyingTo.commentId) {
        // 답글에 대한 답글: 원댓글의 id를 parentId로 사용
        const parentComment = comments.find((comment) =>
          comment.replies?.some(
            (r) => (r.id || r.commentId) === replyingTo.commentId
          )
        );
        parentId = parentComment?.id;
      } else if (replyingTo?.commentId) {
        // 원댓글에 대한 답글
        parentId = replyingTo.commentId;
      }

      await postCommentAsync({
        communityId,
        postId,
        data: {
          content: commentInput.trim(),
          parentId,
        },
      });
    } catch (error) {
      debug.error("댓글 작성 실패:", error);
    }
  };

  // 원댓글에 답글 작성 시작 (하단 입력창에 포커스만)
  const handleStartReplyToRoot = (commentId: string, author: string) => {
    setEditingCommentId(null);
    setReplyingTo({ commentId, author, isReply: false });
    setCommentInput("");
    // 하단 입력창에 포커스
    setTimeout(() => {
      bottomTextareaRef.current?.focus();
    }, 0);
  };

  // 답글에 답글 작성 시작 (해당 답글 아래에 입력창 표시)
  const handleStartReplyToReply = (commentId: string, author: string) => {
    setEditingCommentId(null);
    setReplyingTo({ commentId, author, isReply: true });
    setCommentInput("");
  };

  // 답글 작성 취소
  const handleCancelReply = () => {
    setReplyingTo(null);
    setCommentInput("");
  };

  // 댓글 수정 시작
  const handleStartEdit = (commentId: string, content: string) => {
    setReplyingTo(null);
    setCommentInput("");
    setEditingCommentId(commentId);
    setEditingContent(content);
  };

  // 댓글 수정 취소
  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingContent("");
    setReplyingTo(null);
  };

  // 댓글 수정 제출
  const handleEditSubmit = async (commentId: string) => {
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
  };

  // 댓글 삭제 확인
  const handleDeleteClick = (commentId: string) => {
    setDeleteTargetId(commentId);
    setIsDeleteModalOpen(true);
  };

  // 댓글 삭제 실행
  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;

    try {
      await deleteCommentAsync({
        commentId: deleteTargetId,
      });
    } catch (error) {
      debug.error("댓글 삭제 실패:", error);
    }
  };

  // 답글 더보기 토글
  const handleToggleReplies = (commentId: string) => {
    setExpandedReplies((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
  };

  // 메뉴 토글 핸들러 (한 번에 하나의 메뉴만 열리도록 제어)
  const handleMenuToggle = (menuId: string | null) => {
    setOpenMenuId((prev) => (prev === menuId ? null : menuId));
  };

  // 로딩 중
  if (isCommentsLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="sticky top-0 z-40 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3">
          <Skeleton className="h-6 w-16" />
        </div>
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-12">
      {/* 댓글 목록 */}
      <div className="px-4 py-6">
        {comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUserNickname={currentUserNickname}
                isExpanded={expandedReplies.has(comment.id || "")}
                onToggleReplies={() => handleToggleReplies(comment.id || "")}
                onStartReply={(commentId, author) =>
                  handleStartReplyToRoot(commentId, author)
                }
                onStartReplyToReply={handleStartReplyToReply}
                onStartEdit={(commentId, content) =>
                  handleStartEdit(commentId, content)
                }
                onDelete={(commentId) => handleDeleteClick(commentId)}
                onReport={(commentId) => {
                  // TODO: 신고 기능 구현
                  console.log("신고:", commentId);
                  alert("구현 예정 기능입니다");
                }}
                editingCommentId={editingCommentId}
                editingContent={editingContent}
                onEditContentChange={setEditingContent}
                onCancelEdit={handleCancelEdit}
                onEditSubmit={(commentId) => handleEditSubmit(commentId)}
                replyingTo={replyingTo}
                onCancelReply={handleCancelReply}
                onCommentSubmit={handleCommentSubmit}
                commentInput={
                  // 원댓글에 대한 답글인 경우
                  (replyingTo?.commentId === comment.id &&
                    !replyingTo?.isReply) ||
                  // 답글에 대한 답글인 경우
                  (replyingTo?.isReply &&
                    comment.replies?.some(
                      (r) => (r.id || r.commentId) === replyingTo.commentId
                    ))
                    ? commentInput
                    : ""
                }
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

        {/* 하단 댓글 작성칸 - 원댓글에 대한 답글일 때만 표시 (답글에 대한 답글일 때는 숨김) */}
        {!editingCommentId && (!replyingTo || !replyingTo.isReply) && (
          <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-[470px] -translate-x-1/2 border-t border-gray-100 bg-white px-4 py-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-gray-300"></div>
                <Typography
                  font="noto"
                  variant="body2M"
                  className="text-gray-800"
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
                ref={bottomTextareaRef}
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder={
                  replyingTo && !replyingTo.isReply
                    ? `${replyingTo.author}에게 답글 남기기`
                    : "서로 배려하는 댓글을 남겨요:)"
                }
                className="focus:ring-main-400 w-full resize-none rounded-lg border border-gray-200 p-3 pr-20 pb-12 text-sm focus:ring-2 focus:outline-none"
                rows={
                  commentInput.trim()
                    ? Math.min(commentInput.split("\n").length + 1, 5)
                    : 1
                }
              />
              <div className="absolute right-2 bottom-3 flex items-center gap-2">
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
                      commentInput.trim() ? "text-white" : "text-gray-400"
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
    </div>
  );
};

export default CommentsPage;
