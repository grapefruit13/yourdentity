"use client";

import { useEffect, useCallback, useRef, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Heart, MessageCircleMore } from "lucide-react";
import CommentsSection from "@/components/community/CommentsSection";
import KebabMenu from "@/components/shared/kebab-menu";
import { PostContent } from "@/components/shared/post-content";
import { PostDetailError } from "@/components/shared/post-detail-error";
import { PostDetailSkeleton } from "@/components/shared/post-detail-skeleton";
import { PostProfileSection } from "@/components/shared/post-profile-section";
import { Typography } from "@/components/shared/typography";
import Modal from "@/components/shared/ui/modal";
import { POST_EDIT_CONSTANTS } from "@/constants/community/_write-constants";
import { communitiesKeys } from "@/constants/generated/query-keys";
import { LINK_URL } from "@/constants/shared/_link-url";
import {
  useGetCommunitiesPostsByTwoIds,
  usePostCommunitiesPostsLikeByTwoIds,
  useDeleteCommunitiesPostsByTwoIds,
} from "@/hooks/generated/communities-hooks";
import useToggle from "@/hooks/shared/useToggle";
import { useTopBarStore } from "@/stores/shared/topbar-store";
import type * as Schema from "@/types/generated/api-schema";
import { cn } from "@/utils/shared/cn";
import { debug } from "@/utils/shared/debugger";
import { sharePost } from "@/utils/shared/post-share";

/**
 * @description 게시글 상세 페이지
 */
const PostDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL에서 postId와 communityId를 추출
  const postId = params.id as string;
  const communityId = searchParams.get("communityId") || "";

  const queryClient = useQueryClient();
  const {
    isOpen: isDeleteModalOpen,
    open: openDeleteModal,
    close: closeDeleteModal,
  } = useToggle();
  const {
    isOpen: isDeleteSuccessModalOpen,
    open: openDeleteSuccessModal,
    close: closeDeleteSuccessModal,
  } = useToggle();
  const setRightSlot = useTopBarStore((state) => state.setRightSlot);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const focusCommentInputRef = useRef<(() => void) | null>(null);

  // API 연동 - useGetCommunitiesPostsByTwoIds 사용 (communityId와 postId 모두 필요)
  const {
    data: postData,
    isLoading,
    error,
  } = useGetCommunitiesPostsByTwoIds({
    request: {
      communityId: communityId || "",
      postId,
    },
    enabled: !!postId && !!communityId, // communityId가 있을 때만 요청
  });

  // postData를 Schema.CommunityPost 타입으로 변환
  const post = postData as Schema.CommunityPost & { isLiked?: boolean };
  const postQueryKey = useMemo(
    () =>
      communitiesKeys.getCommunitiesPostsByTwoIds({
        communityId: communityId || "",
        postId,
      }),
    [communityId, postId]
  );
  const postsListQueryKey = useMemo(
    () =>
      communitiesKeys.getCommunitiesPosts({
        page: undefined,
        size: undefined,
        programType: undefined,
        programState: undefined,
      }),
    []
  );
  const isLiked = post?.isLiked ?? false;

  // 작성자 여부 확인 (API 응답에서 isAuthor 필드 사용)
  // TODO: CommunityPost 타입에 isAuthor 필드가 추가되면 타입 단언 제거
  const isAuthor =
    (post as Schema.CommunityPost & { isAuthor?: boolean })?.isAuthor ?? false;

  // 공유하기 기능
  const handleShare = useCallback(async () => {
    if (!post) return;

    const contentString = post.content as unknown as string | undefined;
    await sharePost({
      title: post.title,
      content: contentString,
      postId,
      sharePath: LINK_URL.COMMUNITY_POST,
      queryParams: communityId ? `?communityId=${communityId}` : "",
      defaultTitle: "게시글",
    });
  }, [post, postId, communityId]);

  // 수정 클릭 핸들러
  const handleEditClick = useCallback(() => {
    if (!postId || !communityId) return;
    router.push(
      `${LINK_URL.COMMUNITY_POST}/${postId}/edit?communityId=${communityId}`
    );
  }, [postId, communityId, router]);

  // 삭제 클릭 핸들러
  const handleDeleteClick = useCallback(() => {
    openDeleteModal();
  }, [openDeleteModal]);

  // 탑바 커스텀
  useEffect(() => {
    setRightSlot(
      <KebabMenu
        onShare={handleShare}
        onEdit={isAuthor ? handleEditClick : undefined}
        onDelete={isAuthor ? handleDeleteClick : undefined}
      />
    );
  }, [setRightSlot, isAuthor, handleShare, handleEditClick, handleDeleteClick]);

  // 삭제 mutation
  const { mutateAsync: deletePostAsync, isPending: isDeleting } =
    useDeleteCommunitiesPostsByTwoIds();

  /**
   * 게시글 삭제 핸들러
   */
  const handleDeleteConfirm = useCallback(async () => {
    if (!postId || !communityId) return;

    try {
      await deletePostAsync({
        communityId,
        postId,
      });

      // 쿼리 무효화 (목록 및 상세 조회)
      queryClient.invalidateQueries({
        queryKey: communitiesKeys.getCommunitiesPostsByTwoIds({
          communityId,
          postId,
        }),
      });
      // 커뮤니티 목록 조회 쿼리 무효화 (generated 쿼리 키 사용)
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return (
            Array.isArray(queryKey) &&
            queryKey.length > 0 &&
            queryKey[0] === "communities" &&
            queryKey[1] === "getCommunitiesPosts"
          );
        },
      });

      // 삭제 확인 모달 닫기
      closeDeleteModal();

      // 성공 모달 표시
      openDeleteSuccessModal();
    } catch (error) {
      debug.error("게시글 삭제 실패:", error);
      closeDeleteModal();
    }
  }, [
    postId,
    communityId,
    deletePostAsync,
    queryClient,
    closeDeleteModal,
    openDeleteSuccessModal,
  ]);

  /**
   * 삭제 성공 모달 확인 핸들러
   */
  const handleDeleteSuccessConfirm = useCallback(() => {
    closeDeleteSuccessModal();

    // 커뮤니티 목록 조회 쿼리 무효화 (generated 쿼리 키 사용)
    queryClient.invalidateQueries({
      predicate: (query) => {
        const queryKey = query.queryKey;
        return (
          Array.isArray(queryKey) &&
          queryKey.length > 0 &&
          queryKey[0] === "communities" &&
          queryKey[1] === "getCommunitiesPosts"
        );
      },
    });

    // 커뮤니티 목록으로 이동
    router.replace(LINK_URL.COMMUNITY);
  }, [closeDeleteSuccessModal, queryClient, router]);

  // 좋아요 mutation
  const { mutateAsync: toggleLikeAsync, isPending: isToggleLikePending } =
    usePostCommunitiesPostsLikeByTwoIds({
      onSuccess: (response) => {
        // API 응답 구조: { data: { isLiked, likesCount, ... } }
        const result = response.data;
        if (result) {
          queryClient.setQueryData<Schema.CommunityPost | undefined>(
            postQueryKey,
            (prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                likesCount:
                  typeof result.likesCount === "number"
                    ? result.likesCount
                    : prev.likesCount,
                isLiked:
                  typeof result.isLiked === "boolean"
                    ? result.isLiked
                    : prev.isLiked,
              };
            }
          );
        }
        // 게시글 상세 정보 refetch
        queryClient.invalidateQueries({
          queryKey: postQueryKey,
        });
        // 게시글 목록도 refetch (목록에서도 카운트 반영)
        queryClient.invalidateQueries({
          queryKey: postsListQueryKey,
        });
      },
    });

  // 좋아요 핸들러
  const handleLike = async () => {
    if (!communityId || !postId || isToggleLikePending) return;
    try {
      await toggleLikeAsync({
        communityId,
        postId,
      });
    } catch (error) {
      debug.error("좋아요 실패:", error);
    }
  };

  // 댓글 버튼 클릭 핸들러 - 입력창으로 스크롤 및 포커스
  const handleCommentClick = useCallback(() => {
    // CommentsSection의 포커스 핸들러가 있으면 사용 (답글 상태 초기화 포함)
    if (focusCommentInputRef.current) {
      focusCommentInputRef.current();
    } else {
      // 없으면 기본 동작
      setTimeout(() => {
        commentInputRef.current?.focus();
        commentInputRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    }
  }, []);

  // 로딩 중 - 스켈레톤 표시
  if (isLoading || !communityId) {
    return <PostDetailSkeleton headerButtonCount={3} showCategory={true} />;
  }

  // 에러 처리 또는 communityId가 없는 경우
  if (error || !postData || !communityId) {
    const errorMessage = error
      ? "포스트를 불러오는 중 오류가 발생했습니다."
      : !communityId
        ? "커뮤니티 정보를 찾을 수 없습니다."
        : "포스트를 찾을 수 없습니다.";

    return (
      <PostDetailError
        error={error || undefined}
        notFoundMessage={errorMessage}
        backButtonText="커뮤니티로 돌아가기"
      />
    );
  }

  return (
    <div className="bg-white pt-12">
      {/* 메인 콘텐츠 */}
      <div className="px-5 py-5">
        <Typography
          as="h1"
          font="noto"
          variant="body2R"
          className="mb-1 text-gray-500"
        >
          {post?.category || "활동 후기"}
        </Typography>
        {/* 제목 */}
        <Typography
          as="h2"
          font="noto"
          variant="heading1M"
          className="mb-4 text-gray-950"
        >
          {post?.title}
        </Typography>

        {/* 프로필 섹션 */}
        <PostProfileSection
          profileImageUrl={post?.profileImageUrl}
          author={post?.author}
          createdAt={post?.createdAt}
          viewCount={post?.viewCount}
        />

        {/* 내용 */}
        <div className="py-8">
          {post?.content && <PostContent content={post.content} />}
        </div>

        {/* 태그 섹션 */}
        {/* TODO: tags는 generated CommunityPost에 없으므로 추후 확장 타입으로 처리 필요 */}
      </div>
      {/* 좋아요/댓글 액션 바 */}
      <div className="flex items-center gap-6 border-t border-gray-200 p-4">
        <button
          onClick={handleLike}
          className={cn(
            "flex items-center gap-2 transition-opacity hover:opacity-80"
          )}
        >
          <Heart
            className={cn(
              "h-5 w-5 transition-colors",
              isLiked ? "fill-main-500 text-main-500" : "text-gray-600"
            )}
          />
          <Typography
            font="noto"
            variant="body2R"
            className={cn(
              "transition-colors",
              isLiked ? "text-main-500" : "text-gray-600"
            )}
          >
            {post?.likesCount || 0}
          </Typography>
        </button>
        <button
          onClick={handleCommentClick}
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <MessageCircleMore className="h-5 w-5 text-gray-600" />
          <Typography font="noto" variant="body2R" className="text-gray-600">
            {post?.commentsCount || 0}
          </Typography>
        </button>
      </div>
      {/* 댓글 섹션 */}
      {postId && communityId && (
        <CommentsSection
          postId={postId}
          communityId={communityId}
          postType={post?.type}
          commentInputRef={commentInputRef}
          onFocusRequestRef={focusCommentInputRef}
        />
      )}

      {/* 삭제 확인 모달 */}
      <Modal
        isOpen={isDeleteModalOpen}
        title="게시글을 삭제할까요?"
        description="삭제한 게시글은 복구할 수 없어요."
        cancelText="취소"
        confirmText={isDeleting ? "삭제 중..." : "삭제"}
        onClose={() => !isDeleting && closeDeleteModal()}
        onConfirm={handleDeleteConfirm}
        confirmDisabled={isDeleting}
        variant="danger"
      />

      {/* 삭제 성공 모달 */}
      <Modal
        isOpen={isDeleteSuccessModalOpen}
        title="게시글이 삭제되었어요"
        description={POST_EDIT_CONSTANTS.DELETE_SUCCESS}
        confirmText="확인"
        onClose={handleDeleteSuccessConfirm}
        onConfirm={handleDeleteSuccessConfirm}
        variant="primary"
      />
    </div>
  );
};

export default PostDetailPage;
