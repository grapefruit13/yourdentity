"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FilterButtons from "@/components/community/FilterButtons";
import PostFeed from "@/components/community/PostFeed";
import UserImageCarousel from "@/components/community/UserImageCarousel";
import { userImages } from "@/constants/community/sampleData";
import { useCommunityPosts } from "@/hooks/community/useCommunityPosts";
import { CommunityPost } from "@/types/community";

/**
 * @description 커뮤니티 페이지
 */
const Page = () => {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("전체");

  // 커뮤니티 포스트 데이터 관리
  const { posts, loading, error, refetch } = useCommunityPosts();

  const handlePostClick = (post: CommunityPost) => {
    router.push(`/community/${post.communityId}/post/${post.id}`);
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
    <div className="min-h-full bg-white">
      <div className="px-4 pt-4 pb-20">
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
