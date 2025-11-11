"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import ShareModal from "@/components/community/ShareModal";
import KebabMenu from "@/components/shared/kebab-menu";
import { Typography } from "@/components/shared/typography";
import Modal from "@/components/shared/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { POST_EDIT_CONSTANTS } from "@/constants/community/_write-constants";
import { communitiesKeys } from "@/constants/generated/query-keys";
import {
  useGetCommunitiesPostsByTwoIds,
  usePostCommunitiesPostsLikeByTwoIds,
  useDeleteCommunitiesPostsByTwoIds,
} from "@/hooks/generated/communities-hooks";
import { useTopBarStore } from "@/stores/shared/topbar-store";
import type * as Schema from "@/types/generated/api-schema";
import { cn } from "@/utils/shared/cn";
import { getTimeAgo } from "@/utils/shared/date";
import { debug } from "@/utils/shared/debugger";

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
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [currentOrigin, setCurrentOrigin] = useState<string>("");
  const setRightSlot = useTopBarStore((state) => state.setRightSlot);

  // 클라이언트 사이드에서만 origin 가져오기
  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentOrigin(window.location.origin);
    }
  }, []);

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
  const post = postData as Schema.CommunityPost;

  // 작성자 여부 확인 (API 응답에서 isAuthor 필드 사용)
  // TODO: CommunityPost 타입에 isAuthor 필드가 추가되면 타입 단언 제거
  const isAuthor =
    (post as Schema.CommunityPost & { isAuthor?: boolean })?.isAuthor ?? false;

  // 탑바 커스텀
  useEffect(() => {
    // 공유 클릭
    const handleShareClick = () => {
      setIsShareModalOpen(true);
    };

    // 수정 클릭
    const handleEditClick = () => {
      if (!postId || !communityId) return;
      router.push(`/community/post/${postId}/edit?communityId=${communityId}`);
    };

    // 삭제 클릭
    const handleDeleteClick = () => {
      setIsDeleteModalOpen(true);
    };

    setRightSlot(
      <KebabMenu
        onShare={handleShareClick}
        onEdit={isAuthor ? handleEditClick : undefined}
        onDelete={isAuthor ? handleDeleteClick : undefined}
      />
    );
  }, [setRightSlot, communityId, postId, router, isAuthor]);

  /**
   * 게시글 삭제 핸들러
   */
  const handleDeleteConfirm = async () => {
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
      queryClient.invalidateQueries({
        queryKey: communitiesKeys.getCommunitiesPosts({
          page: undefined,
          size: undefined,
          programType: undefined,
          programState: undefined,
        }),
      });

      // 성공 메시지 표시
      alert(POST_EDIT_CONSTANTS.DELETE_SUCCESS);

      // 커뮤니티 목록으로 이동
      router.replace("/community");
    } catch (error) {
      debug.error("게시글 삭제 실패:", error);
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  // 좋아요 상태 확인 (페이지 로드 시)
  useEffect(() => {
    if (postId) {
      // localStorage에서 좋아요 상태 확인
      const likedPosts = JSON.parse(localStorage.getItem("likedPosts") || "{}");
      setIsLiked(likedPosts[postId] || false);
    }
  }, [postId, postData]);

  // 삭제 mutation
  const { mutateAsync: deletePostAsync, isPending: isDeleting } =
    useDeleteCommunitiesPostsByTwoIds();

  // 좋아요 mutation
  const { mutateAsync: toggleLikeAsync } = usePostCommunitiesPostsLikeByTwoIds({
    onSuccess: (response) => {
      // API 응답 구조: { data: { isLiked, likesCount, ... } }
      const result = response.data;
      if (result) {
        const newIsLiked = result.isLiked || false;
        setIsLiked(newIsLiked);

        // localStorage에 좋아요 상태 저장
        if (postId) {
          const likedPosts = JSON.parse(
            localStorage.getItem("likedPosts") || "{}"
          );
          likedPosts[postId] = newIsLiked;
          localStorage.setItem("likedPosts", JSON.stringify(likedPosts));
        }
      }
      // 게시글 상세 정보 refetch
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
    },
  });

  // 좋아요 핸들러
  const handleLike = async () => {
    if (!communityId || !postId) return;
    try {
      await toggleLikeAsync({
        communityId,
        postId,
      });
    } catch (error) {
      debug.error("좋아요 실패:", error);
    }
  };

  // 로딩 중 - 스켈레톤 표시
  if (isLoading || !communityId) {
    return (
      <div className="min-h-screen bg-white">
        {/* 헤더 스켈레톤 */}
        <div className="sticky top-0 z-40 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3">
          <Skeleton className="h-6 w-16" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-5 w-5" />
          </div>
        </div>

        {/* 메인 콘텐츠 스켈레톤 */}
        <div className="px-4 py-6 pb-26">
          {/* 카테고리 스켈레톤 */}
          <Skeleton className="mb-2 h-4 w-20" />

          {/* 제목 스켈레톤 */}
          <Skeleton className="mb-4 h-9 w-3/4" />

          {/* 프로필 섹션 스켈레톤 */}
          <div className="mb-6 flex items-center">
            <Skeleton className="mr-3 h-8 w-8 rounded-full" />
            <div>
              <Skeleton className="mb-1 h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>

          {/* 내용 스켈레톤 */}
          <div className="mb-6 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  // 에러 처리 또는 communityId가 없는 경우
  if (error || !postData || !communityId) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="mb-4 text-gray-500">
            {error
              ? "포스트를 불러오는 중 오류가 발생했습니다."
              : !communityId
                ? "커뮤니티 정보를 찾을 수 없습니다."
                : "포스트를 찾을 수 없습니다."}
          </div>
          {error && (
            <div className="mb-4 text-sm text-gray-400">
              {error.message || "알 수 없는 오류"}
            </div>
          )}
          <button
            onClick={() => router.push("/community")}
            className="px-4 py-2 text-sm text-blue-600 underline hover:text-blue-800"
          >
            커뮤니티로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white pt-12">
      {/* 메인 콘텐츠 */}
      <div className="px-4 py-6 pb-32">
        {/* 활동 후기 헤더 */}
        <div className="mb-2 text-sm text-gray-500">
          {post?.category || "활동 후기"}
        </div>

        {/* 제목 */}
        <h1 className="mb-4 text-3xl font-bold text-gray-800">{post?.title}</h1>

        {/* 프로필 섹션 */}
        <div className="mb-6 flex items-center">
          <div className="mr-3 h-8 w-8 rounded-full bg-gray-300"></div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-gray-800">
                {post?.author || "익명"}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              {post?.createdAt && getTimeAgo(post.createdAt)}
            </div>
          </div>
        </div>

        {/* 내용 */}
        <div className="mb-6">
          {post?.content && (
            <div
              className={cn(
                "prose prose-sm prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2",
                "prose-img:max-w-full prose-img:h-auto prose-img:rounded-lg prose-img:block prose-img:mx-auto prose-img:max-h-[400px] prose-img:object-contain",
                "prose-a:text-blue-500 prose-a:underline prose-a:cursor-pointer prose-a:break-all",
                "w-full max-w-none overflow-x-hidden break-words whitespace-pre-wrap",
                "[&_span[data-attachment='file']]:inline-flex [&_span[data-attachment='file']]:items-center [&_span[data-attachment='file']]:gap-1 [&_span[data-attachment='file']]:select-none",
                "[&_span[data-heading='1']]:text-[22px] [&_span[data-heading='1']]:leading-snug [&_span[data-heading='1']]:font-bold",
                "[&_span[data-heading='2']]:text-[16px] [&_span[data-heading='2']]:leading-snug [&_span[data-heading='2']]:font-bold",
                "[&_span[data-heading='3']]:text-[16px] [&_span[data-heading='3']]:leading-snug [&_span[data-heading='3']]:font-medium",
                "[&_span[data-heading='4']]:text-[14px] [&_span[data-heading='4']]:leading-snug [&_span[data-heading='4']]:font-medium"
              )}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          )}
        </div>

        {/* 태그 섹션 */}
        {/* TODO: tags는 generated CommunityPost에 없으므로 추후 확장 타입으로 처리 필요 */}
      </div>

      {/* 하단 스티키 액션 바 (하단 네비게이션 위) */}
      <div className="fixed right-0 bottom-[77px] left-0 z-40 mx-auto flex h-[48px] w-full max-w-[470px] items-center justify-between border-t border-gray-100 bg-white px-4 py-3">
        <div className="flex items-center gap-6">
          <button
            onClick={handleLike}
            className={cn(
              "flex items-center gap-2 transition-opacity hover:opacity-80"
            )}
          >
            <svg
              className={cn(
                "h-5 w-5 transition-colors",
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
            <Typography
              font="noto"
              variant="body2R"
              className={cn(
                "transition-colors",
                isLiked ? "text-red-500" : "text-gray-600"
              )}
            >
              {post?.likesCount || 0}
            </Typography>
          </button>
          <button
            onClick={() =>
              router.push(
                `/community/post/${postId}/comments?communityId=${communityId}`
              )
            }
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <svg
              className="h-5 w-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <Typography font="noto" variant="body2R" className="text-gray-600">
              {post?.commentsCount || 0}
            </Typography>
          </button>
        </div>
      </div>

      {/* 공유 모달 */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        postTitle={post?.title}
        postUrl={`${currentOrigin}/community/post/${postId}${communityId ? `?communityId=${communityId}` : ""}`}
      />

      {/* 삭제 확인 모달 */}
      <Modal
        isOpen={isDeleteModalOpen}
        title="게시글을 삭제할까요?"
        description="삭제한 게시글은 복구할 수 없어요."
        cancelText="취소"
        confirmText={isDeleting ? "삭제 중..." : "삭제"}
        onClose={() => !isDeleting && setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        confirmDisabled={isDeleting}
        variant="danger"
      />
    </div>
  );
};

export default PostDetailPage;
