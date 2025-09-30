"use client";

import React, { useState } from "react";
import UserImageCarousel from "../components/UserImageCarousel";
import FilterButtons from "../components/FilterButtons";
import PostFeed from "../components/PostFeed";
import { useCommunityPosts } from "../lib/useCommunityPosts";
import { CommunityPost } from "../types";
import { userImages } from "../constants/sampleData";

/**
 * @description 커뮤니티 페이지
 */
const CommunityPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState("전체");

  // 커뮤니티 포스트 데이터 관리
  const { posts, loading, error, refetch } = useCommunityPosts();

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  // 필터링된 포스트
  const filteredPosts = activeFilter === "전체" 
    ? posts 
    : posts.filter(post => post.category === activeFilter);

  // Early Return 패턴으로 조건부 렌더링 처리
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
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
      <div className="min-h-screen bg-gray-50">
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
    <div className="min-h-screen bg-gray-50">
      <div className="p-4">
        {/* 헤더 섹션 */}
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-4 text-sm">
            <span className="text-gray-500">미션</span>
            <span className="text-black">프로그램</span>
          </div>
          <h1 className="text-2xl font-bold text-black">유스들의 후기</h1>
        </div>

        {/* 유저 이미지 캐러셀 */}
        <div className="mb-6">
          <UserImageCarousel images={userImages} />
        </div>

        {/* 필터 버튼들 */}
        <div className="mb-6">
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
            <PostFeed posts={filteredPosts} />
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;
