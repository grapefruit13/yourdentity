"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import FilterButtons from "@/components/community/FilterButtons";
import FloatingWriteButton from "@/components/community/FloatingWriteButton";
import PostFeed from "@/components/community/PostFeed";
import ProgramSelectBottomSheet from "@/components/community/ProgramSelectBottomSheet";
import AlarmButton from "@/components/shared/AlarmButton";
import { Typography } from "@/components/shared/typography";
import { useGetCommunitiesPosts } from "@/hooks/generated/communities-hooks";
import { CommunityPostListItem } from "@/types/generated/api-schema";

const COMMUNITY_POST_LIST_SIZE = 100;

/**
 * @description 커뮤니티 페이지
 */
const Page = () => {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("전체");
  const [isProgramSelectSheetOpen, setIsProgramSelectSheetOpen] =
    useState(false);

  // 커뮤니티 포스트 데이터 관리 - 실제 API 연동
  // 자동 생성된 hook 사용 (useGetCommunitiesPosts)
  const {
    data: responseData,
    isLoading,
    error,
    refetch,
  } = useGetCommunitiesPosts({
    request: {
      page: 0,
      size: COMMUNITY_POST_LIST_SIZE, // 일단 큰 값으로 설정 (페이지네이션은 향후 구현)
      programType: undefined, // TODO: 필터 적용
      programState: undefined, // TODO: 필터 적용
    },
    select: (data) => {
      if (!data?.posts || !Array.isArray(data.posts)) return [];
      return data.posts;
    },
    refetchOnWindowFocus: false, // 브라우저 탭 전환 시 refetch 방지
  });

  // 변환된 포스트 데이터
  const posts = responseData || [];

  // 초기 로딩만 감지 (데이터가 없고 로딩 중일 때만 true)
  // 데이터가 이미 있으면 브라우저 탭 전환 시에도 캐시된 데이터를 표시
  const isInitialLoading = isLoading && posts.length === 0;

  const handlePostClick = (post: CommunityPostListItem) => {
    // CommunityPostListItem을 Schema.CommunityPost로 확장하여 communityId 추출
    const postWithCommunity = post as CommunityPostListItem & {
      communityId?: string;
      communityPath?: string;
      community?: { id?: string };
    };

    // communityId 추출: communityId > community?.id > communityPath에서 추출
    const communityId =
      postWithCommunity.communityId ||
      postWithCommunity.community?.id ||
      (postWithCommunity.communityPath
        ? postWithCommunity.communityPath.replace("communities/", "")
        : "");

    const postId = post.id;
    if (postId && communityId) {
      // communityId를 쿼리 파라미터로 전달
      router.push(`/community/post/${postId}?communityId=${communityId}`);
    } else {
      alert("게시물 정보를 찾을 수 없습니다.");
    }
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
    // 초기 로딩 중이거나 데이터가 없을 때만 빈 배열 반환
    if (isInitialLoading || !posts.length) return [];

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
  }, [posts, activeFilter, isInitialLoading]);

  // 상위 3개와 나머지 포스트 분리 - useMemo로 메모이제이션하여 안정적인 참조 유지
  const topPosts = useMemo(() => filteredPosts.slice(0, 3), [filteredPosts]);
  const remainingPosts = useMemo(() => filteredPosts.slice(3), [filteredPosts]);

  // 에러 상태 처리
  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="p-4">
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="text-red-600">
              {error instanceof Error
                ? error.message
                : "포스트를 불러오는데 실패했습니다"}
            </div>
            <button
              onClick={() => refetch()}
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
    <div className="bg-whit relative min-h-full px-5">
      {/* 필터 버튼들 - 스티키 */}
      <div className="sticky top-0 z-40 mb-6 bg-white pt-2">
        <div className="flex h-12 items-center justify-between bg-white">
          <div className="flex items-center gap-4">
            <Typography font="noto" variant="title4" className="text-black">
              프로그램
            </Typography>
            {/* <Typography font="noto" variant="heading2B" className="text-black">미션</Typography> */}
          </div>
          <AlarmButton variant="inline" />
        </div>
        <FilterButtons
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
        />
      </div>

      {/* 전체 포스트가 없을 때 - 로딩 완료 후에만 표시 */}
      {!isInitialLoading && filteredPosts.length === 0 && (
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
      <div className="mb-6">
        <PostFeed
          posts={topPosts}
          onPostClick={handlePostClick}
          isLoading={isInitialLoading}
          skeletonCount={3}
        />
      </div>

      {/* {topPosts.length > 0 && (
          <UserImageCarouselSection images={userImages} />
        )} */}

      {/* 나머지 포스트 */}
      <div className="mb-6">
        <PostFeed
          posts={remainingPosts}
          onPostClick={handlePostClick}
          isLoading={isInitialLoading}
          skeletonCount={5}
        />
      </div>

      {/* 플로팅 작성 버튼 */}
      <FloatingWriteButton
        onOpenBottomSheet={() => setIsProgramSelectSheetOpen(true)}
      />

      {/* 프로그램 선택 바텀시트 */}
      <ProgramSelectBottomSheet
        isOpen={isProgramSelectSheetOpen}
        onClose={() => setIsProgramSelectSheetOpen(false)}
      />
    </div>
  );
};

export default Page;
