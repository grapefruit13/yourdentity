"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCommunityPosts } from "@/hooks/community/useCommunityPosts";
import { CommunityPost } from "@/types/community";
import FilterButtons from "@/components/community/FilterButtons";
import UserImageCarousel from "@/components/community/UserImageCarousel";
import PostFeed from "@/components/community/PostFeed";
import { userImages } from "@/constants/community/sampleData";

/**
 * @description 커뮤니티 페이지
 */
const Page = () => {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("전체");

  // 커뮤니티 포스트 데이터 관리
  const { posts, loading, error, refetch } = useCommunityPosts();

  const handlePostClick = (post: CommunityPost) => {
    router.push(`/community/${post.id}`);
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  // 필터링된 포스트
  const filteredPosts =
    activeFilter === "전체"
      ? posts
      : posts.filter((post) => post.category === activeFilter);

  // Early Return 패턴으로 조건부 렌더링 처리
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="p-4">
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">포스트를 불러오는 중...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="p-4">
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="text-red-600">{error}</div>
            <button
              onClick={refetch}
              className="mt-2 text-sm text-red-600 underline hover:text-red-800"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white">
      {/* 헤더 */}
      <div className="relative flex items-center justify-center px-4 py-4">
        <h1 className="text-xl font-bold text-black">커뮤니티</h1>
        <button className="absolute right-4 p-2">
          <svg
            className="h-6 w-6 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </button>
      </div>

      <div className="px-4 pb-20">
        {/* 미션 프로그램 섹션 */}
        <div className="mb-5">
          <div className="mb-5 flex items-center gap-4">
            <span className="text-lg font-bold text-gray-500">미션</span>
            <span className="text-lg font-bold text-black">프로그램</span>
          </div>
          <h2 className="text-2xl font-bold text-black">유스들의 후기</h2>
        </div>

        {/* 유저 이미지 캐러셀 */}
        <div className="mb-2">
          <UserImageCarousel images={userImages} />
        </div>

        {/* 필터 버튼들 - 스티키 */}
        <div className="sticky top-0 z-40 mb-6 bg-white py-2">
          <FilterButtons
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* 포스트 피드 */}
        <div className="mb-6">
          {filteredPosts.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              해당 카테고리에 포스트가 없습니다.
            </div>
          ) : (
            <PostFeed posts={filteredPosts} onPostClick={handlePostClick} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
