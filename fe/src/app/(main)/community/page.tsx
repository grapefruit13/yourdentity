"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import FilterButtons from "@/components/community/FilterButtons";
import FloatingWriteButton from "@/components/community/FloatingWriteButton";
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

  // TEMP: 월별 필터링 로직
  const getMonthRange = (filter: string): number[] => {
    switch (filter) {
      case "10월~12월":
        return [10, 11, 12];
      case "1월~3월":
        return [1, 2, 3];
      case "4월~6월":
        return [4, 5, 6];
      case "7월~9월":
        return [7, 8, 9];
      default:
        return [];
    }
  };

  // 필터링된 포스트
  const filteredPosts = useMemo(() => {
    if (activeFilter === "전체") {
      return posts;
    }
    if (activeFilter === "참여중") {
      // TODO: 실제 API 연동 시 users/{userId}/commentedPosts, likedPosts, authoredPosts 조회
      // 현재는 임시로 빈 배열 반환
      return [];
    }

    const monthRange = getMonthRange(activeFilter);
    if (monthRange.length > 0) {
      return posts.filter((post) => {
        if (!post.createdAt) return false;
        // ISO 문자열에서 월 추출 (1-12)
        const createdDate = new Date(post.createdAt);
        const month = createdDate.getMonth() + 1; // 0-based → 1-based
        return monthRange.includes(month);
      });
    }

    return posts;
  }, [posts, activeFilter]);

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

  // 상위 3개와 나머지 포스트 분리
  const topPosts = filteredPosts.slice(0, 3);
  const remainingPosts = filteredPosts.slice(3);

  return (
    <div className="relative min-h-full bg-white">
      <div className="px-4 pt-4 pb-20">
        {/* 미션 프로그램 섹션 */}
        {/* <div className="mb-5">
          <div className="mb-5 flex items-center gap-4">
            <span className="text-lg font-bold text-gray-500">미션</span>
            <span className="text-lg font-bold text-black">프로그램</span>
          </div>
        </div> */}

        {/* 필터 버튼들 - 스티키 */}
        <div className="sticky top-0 z-40 mb-6 bg-white py-2">
          <FilterButtons
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* 전체 포스트가 없을 때 */}
        {filteredPosts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 text-4xl">📭</div>
            <p className="mb-2 text-base font-medium text-gray-900">
              아직 게시글이 없어요
            </p>
            <p className="text-sm text-gray-500">
              첫 번째 이야기를 공유해보세요!
            </p>
          </div>
        )}

        {/* 상위 3개 포스트 */}
        {topPosts.length > 0 && (
          <div className="mb-6">
            <PostFeed posts={topPosts} onPostClick={handlePostClick} />
          </div>
        )}

        {/* 유저 이미지 캐러셀 - 상위 3개 이후 표시 */}
        {topPosts.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">
              이런 후기도 있어요! 👀
            </h3>
            <UserImageCarousel images={userImages} />
          </div>
        )}

        {/* 나머지 포스트 */}
        {remainingPosts.length > 0 && (
          <div className="mb-6">
            <PostFeed posts={remainingPosts} onPostClick={handlePostClick} />
          </div>
        )}
      </div>

      {/* 플로팅 작성 버튼 */}
      <FloatingWriteButton />
    </div>
  );
};

export default Page;
