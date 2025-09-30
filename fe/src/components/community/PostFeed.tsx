"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/utils/shared/cn";
import { CommunityPost } from "@/types/community";

interface PostFeedProps {
  posts: CommunityPost[];
  onPostClick?: (post: CommunityPost) => void;
}

const PostFeed: React.FC<PostFeedProps> = ({ posts, onPostClick }) => {
  const router = useRouter();

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "TMI":
        return "bg-pink-100 text-pink-600";
      case "한끗 루틴":
        return "bg-pink-100 text-pink-600";
      case "월간 소모임":
        return "bg-green-100 text-green-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const handlePostClick = (post: CommunityPost) => {
    if (onPostClick) {
      onPostClick(post);
    } else {
      router.push(`/community/${post.id}`);
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
            <div className="flex-1 min-w-0">
              {/* 카테고리 태그 */}
              <div className="mb-2">
                <span
                  className={cn(
                    "inline-block rounded-full px-2 py-1 text-xs font-medium",
                    getCategoryColor(post.category)
                  )}
                >
                  {post.category}
                </span>
              </div>

              {/* 제목 */}
              <h3 className="mb-2 text-lg font-semibold text-gray-900 line-clamp-1">
                {post.title}
              </h3>

              {/* 설명 (2줄 미리보기) */}
              <p className="mb-3 text-sm text-gray-600 line-clamp-2">
                {post.content}
              </p>

              {/* 유저 정보 */}
              <div className="mb-3 flex items-center gap-2 text-xs text-gray-500">
                <span className="font-medium">{post.author.name}</span>
                <span>•</span>
                <span>{post.date}</span>
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
                  <span className="text-xs text-gray-400">{post.stats.likes}</span>
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
                  <span className="text-xs text-gray-400">{post.stats.comments}</span>
                </div>
              </div>
            </div>

            {/* 썸네일 이미지 */}
            {post.thumbnail && (
              <div className="flex-shrink-0">
                <div className="h-20 w-20 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={post.thumbnail}
                    alt={post.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 더보기 메뉴 */}
          <div className="absolute top-4 right-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                // TODO: 더보기 메뉴 구현
              }}
              className="p-1 text-gray-400 hover:text-gray-600"
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
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostFeed;
