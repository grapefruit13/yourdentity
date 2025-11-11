"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import ShareModal from "@/components/community/ShareModal";
import { Typography } from "@/components/shared/typography";
import { Skeleton } from "@/components/ui/skeleton";
import { communitiesKeys } from "@/constants/generated/query-keys";
import {
  useGetCommunitiesPostsByTwoIds,
  usePostCommunitiesPostsLikeByTwoIds,
} from "@/hooks/generated/communities-hooks";
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  // 좋아요 상태 확인 (페이지 로드 시)
  useEffect(() => {
    if (postId) {
      // localStorage에서 좋아요 상태 확인
      const likedPosts = JSON.parse(localStorage.getItem("likedPosts") || "{}");
      setIsLiked(likedPosts[postId] || false);
    }
  }, [postId, postData]);

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
          filter: undefined,
        }),
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

  // 뒤로가기 핸들러
  const handleBack = () => {
    router.back();
  };

  // 메뉴 아이템 클릭 핸들러
  const handleMenuAction = (action: string) => {
    debug.log(`${action} 클릭됨`);
    setIsMenuOpen(false);

    // 향후 각 액션에 따른 로직 구현
    switch (action) {
      case "수정":
        // 수정 로직
        break;
      case "상단 고정":
        // 상단 고정 로직
        break;
      case "삭제":
        // 삭제 로직
        break;
      case "신고":
        // 신고 로직
        break;
      case "게시글 복사":
        // 복사 로직
        break;
      case "게시글 이동":
        // 이동 로직
        break;
    }
  };

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
    <div className="bg-white">
      {/* 헤더 */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="text-sm font-medium">뒤로</span>
        </button>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsShareModalOpen(true)}
            className={cn(
              "p-1 text-gray-600 transition-colors hover:text-gray-800"
            )}
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
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
              />
            </svg>
          </button>
          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={cn(
              "p-1 text-gray-600 transition-colors hover:text-gray-800"
            )}
          >
            <svg
              className={cn(
                "h-5 w-5 transition-colors",
                isBookmarked
                  ? "fill-yellow-500 text-yellow-500"
                  : "text-gray-600"
              )}
              fill={isBookmarked ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          </button>

          {/* 점 3개 메뉴 */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={cn(
                "p-1 text-gray-600 transition-colors hover:text-gray-800"
              )}
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
              <div
                className={cn(
                  "absolute top-8 right-0 z-10 w-32 rounded-lg border border-gray-200 bg-white shadow-lg"
                )}
              >
                <div className="py-1">
                  <button
                    onClick={() => handleMenuAction("수정")}
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleMenuAction("상단 고정")}
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    상단 고정
                  </button>
                  <button
                    onClick={() => handleMenuAction("삭제")}
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    삭제
                  </button>
                  <button
                    onClick={() => handleMenuAction("신고")}
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    신고
                  </button>
                  <button
                    onClick={() => handleMenuAction("게시글 복사")}
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    게시글 복사
                  </button>
                  <button
                    onClick={() => handleMenuAction("게시글 이동")}
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    게시글 이동
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

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
        postUrl={`https://youthvoice.vake.io/sharing/${post?.id || "1"}`}
      />
    </div>
  );
};

export default PostDetailPage;
