"use client";

import { useRouter } from "next/navigation";
import { CommunityPost } from "@/types/community";
import { cn } from "@/utils/shared/cn";
import { getTimeAgo } from "@/utils/shared/date";

interface PostFeedProps {
  posts: CommunityPost[];
  onPostClick?: (post: CommunityPost) => void;
}

const PostFeed = ({ posts, onPostClick }: PostFeedProps) => {
  const router = useRouter();

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "한끗루틴":
        return "bg-[#FFF2F9] text-[#FF2479]";
      case "TMI":
        return "bg-[#E8F2FF] text-[#2B7FFF]";
      case "내가 참여중인":
        return "bg-[#E8F2FF] text-[#2B7FFF]";
      case "월간 소모임":
        return "bg-[#FFEFF3] text-[#FF2479]";
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

              {/* 유저 정보 */}
              <div className="mb-3 flex items-center gap-2 text-xs text-gray-500">
                <span className="font-medium">{post.author.name}</span>
                <span>•</span>
                <span>{getTimeAgo(post.createdAt)}</span>
              </div>

              {/* 액션 아이콘들 */}
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
                    {post.stats.likes}
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
                    {post.stats.comments}
                  </span>
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

          {/* 점 3개 메뉴 - 썸네일 오른쪽과 정렬 */}
          <div className="absolute right-4 bottom-4">
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
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostFeed;
