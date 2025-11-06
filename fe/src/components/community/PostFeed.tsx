"use client";

import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/shared/cn";
import { getTimeAgo } from "@/utils/shared/date";
import { CommunityPost } from "@/types/community";

interface PostFeedProps {
  posts: CommunityPost[];
  onPostClick?: (post: CommunityPost) => void;
  isLoading?: boolean;
  skeletonCount?: number;
}

const PostFeed = ({
  posts,
  onPostClick,
  isLoading = false,
  skeletonCount = 3,
}: PostFeedProps) => {
  const router = useRouter();

  const getCategoryColor = (category: string) => {
    switch (category) {
      // CHECK: 카테고리 구분을 코드 구분으로 안하고 있어 띄어쓰기 주의가 필요... (한끗루틴, 한끗 루틴)
      case "한끗 루틴":
      case "한끗루틴":
      case "월간 소모임":
      case "TMI":
        return "bg-main-50 text-main-500";
      // TODO: '내가 참여중인' 이라는 카테고리는 카테고리 데이터로 판별하는게 아니라서 별도로 처리가 필요함
      //       post 아이템의 community.id로 어느 커뮤니티에 대한 글인지는 파악 가능하나, 클라이언트 수준에서 비교 확인할지 api 구성에서 필터링 조건으로 포함해야할지 고민이 필요함
      // case "내가 참여중인":
      //   return "bg-[#E8F2FF] text-[#2B7FFF]";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const handlePostClick = (post: CommunityPost) => {
    if (onPostClick) {
      onPostClick(post);
    } else {
      router.push(`/community/${post.communityId}/post/${post.id}`);
    }
  };

  // 로딩 중일 때 스켈레톤 표시
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <div
            key={`skeleton-${index}`}
            className="relative rounded-lg bg-white p-4 shadow-sm"
          >
            <div className="flex gap-3">
              {/* 텍스트 컨텐츠 영역 */}
              <div className="min-w-0 flex-1">
                {/* 카테고리 태그 스켈레톤 */}
                <div className="mb-2">
                  <Skeleton className="h-6 w-20" />
                </div>

                {/* 제목 스켈레톤 */}
                <div className="mb-2">
                  <Skeleton className="h-6 w-3/4" />
                </div>

                {/* 설명 스켈레톤 (2줄) */}
                <div className="mb-3 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>

                {/* 유저 정보 및 액션 아이콘들 스켈레톤 - 좌우 배치 */}
                <div className="mb-3 flex items-center justify-between">
                  {/* 작성자/시간 스켈레톤 (왼쪽) */}
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-1" />
                    <Skeleton className="h-3 w-12" />
                  </div>

                  {/* 액션 아이콘들 스켈레톤 (오른쪽) */}
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                </div>
              </div>

              {/* 썸네일 이미지 스켈레톤 */}
              <div className="mt-2 flex-shrink-0">
                <Skeleton className="h-20 w-20 rounded-lg" />
              </div>
            </div>

            {/* 점 3개 메뉴 스켈레톤 */}
            <div className="absolute right-4 bottom-4">
              <Skeleton className="h-4 w-4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div
          key={post.id}
          className="relative cursor-pointer rounded-lg bg-white p-4 shadow-sm transition-colors hover:bg-gray-50"
          onClick={() => handlePostClick(post)}
        >
          <div className="flex gap-3">
            {/* 텍스트 컨텐츠 */}
            <div className="min-w-0 flex-1">
              {/* 카테고리 태그 */}
              <div className="mb-2">
                <span
                  className={cn(
                    "inline-block rounded px-2 py-1 text-xs font-medium",
                    getCategoryColor(post.category)
                  )}
                >
                  {post.category}
                </span>
              </div>

              {/* 제목 */}
              <h3 className="mb-2 line-clamp-1 text-lg font-semibold text-gray-900">
                {post.title}
              </h3>

              {/* 설명 (2줄 미리보기) */}
              <p className="mb-3 line-clamp-2 text-sm text-gray-600">
                {post.content}
              </p>

              {/* 유저 정보 및 액션 아이콘들 - 좌우 배치 */}
              <div className="mb-3 flex items-center justify-between text-xs text-gray-500">
                {/* 작성자/시간 (왼쪽) */}
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {post.author || "(알 수 없는 사용자)"}
                  </span>
                  <span>•</span>
                  <span>{getTimeAgo(post.createdAt)}</span>
                </div>

                {/* 액션 아이콘들 (오른쪽) */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <svg
                      className="h-4 w-4 text-gray-400"
                      fill="none"
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
                    <span className="text-xs text-gray-400">
                      {post.likesCount}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg
                      className="h-4 w-4 text-gray-400"
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
                    <span className="text-xs text-gray-400">
                      {post.commentsCount}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 썸네일 이미지 */}
            {post.thumbnail && (
              <div className="mt-2 flex-shrink-0">
                <div className="h-20 w-20 overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={post.thumbnail}
                    alt={post.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostFeed;
