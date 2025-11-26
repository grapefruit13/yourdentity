"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  Suspense,
  useCallback,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CommunityTabs from "@/components/community/community-tabs";
import { CommunitySearchBar } from "@/components/community/CommunitySearchBar";
import FilterChipsSection from "@/components/community/FilterChipsSection";
import { MyCertificationToggle } from "@/components/community/MyCertificationToggle";
import MissionFeed from "@/components/mission/MissionFeed";
import MissionPostsFilterBottomSheet, {
  type MissionPostsSortOption,
} from "@/components/mission/MissionPostsFilterBottomSheet";
import { MISSION_POSTS_SORT_LABELS } from "@/constants/mission/_mission-posts-constants";
import { DEFAULT_MISSION_POSTS_PAGE_SIZE } from "@/constants/mission/_mission-posts-infinite";
import { LINK_URL } from "@/constants/shared/_link-url";
import { useGetUsersMe } from "@/hooks/generated/users-hooks";
import { useInfiniteMissionPosts } from "@/hooks/mission/useInfiniteMissionPosts";
import { useTopBarStore } from "@/stores/shared/topbar-store";

/**
 * @description 미션 인증글 목록 페이지
 */
const MissionCommunityPageContent = () => {
  const setHideTopBar = useTopBarStore((state) => state.setHideTopBar);
  useEffect(() => {
    setHideTopBar(true);
    return () => {
      setHideTopBar(false);
    };
  }, [setHideTopBar]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: userMe } = useGetUsersMe();

  const getInitialSearchQuery = () => searchParams.get("search") || "";
  const getInitialAppliedSearchQuery = () => searchParams.get("search") || "";

  const getInitialSort = (): MissionPostsSortOption => {
    const sort = searchParams.get("sort");
    return sort === "popular" ? "popular" : "latest";
  };
  const getInitialCategories = () => {
    const categories = searchParams.get("categories");
    if (!categories) return [];
    return categories.split(",").filter((category) => category.trim().length);
  };

  const [searchQuery, setSearchQuery] = useState(getInitialSearchQuery);
  const [appliedSearchQuery, setAppliedSearchQuery] = useState(
    getInitialAppliedSearchQuery
  );
  const [selectedSort, setSelectedSort] =
    useState<MissionPostsSortOption>(getInitialSort);
  const [selectedCategories, setSelectedCategories] =
    useState<string[]>(getInitialCategories);
  const [onlyMyMissions, setOnlyMyMissions] = useState(false);
  const [hasFilterChanges, setHasFilterChanges] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const isSearchingRef = useRef(false);

  const appliedSortParam =
    selectedSort === "popular" ? ("popular" as const) : undefined;

  const {
    data: missionPostsPages,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteMissionPosts({
    pageSize: DEFAULT_MISSION_POSTS_PAGE_SIZE,
    ...(appliedSortParam ? { sort: appliedSortParam } : {}),
    ...(selectedCategories.length > 0
      ? { categories: selectedCategories.join(",") }
      : {}),
    ...(onlyMyMissions && userMe?.user?.id ? { userId: userMe.user.id } : {}),
  });

  const missionPosts = useMemo(() => {
    if (!missionPostsPages?.pages) return [];
    return missionPostsPages.pages.flatMap((page) => page.posts ?? []);
  }, [missionPostsPages]);

  const isInitialLoading = isLoading && missionPosts.length === 0;

  const updateQueryParams = useCallback(
    (next: {
      search?: string;
      sort?: MissionPostsSortOption;
      categories?: string[];
    }) => {
      const params = new URLSearchParams();

      if (next.search && next.search.trim().length > 0) {
        params.set("search", next.search.trim());
      }

      if (next.sort && next.sort !== "latest") {
        params.set("sort", next.sort);
      }

      if (next.categories && next.categories.length > 0) {
        params.set("categories", next.categories.join(","));
      }

      const newQueryString = params.toString();
      const currentQueryString = searchParams.toString();

      if (newQueryString !== currentQueryString) {
        const newUrl = newQueryString
          ? `${LINK_URL.COMMUNITY_MISSION}?${newQueryString}`
          : LINK_URL.COMMUNITY_MISSION;
        router.replace(newUrl, { scroll: false });
      }
    },
    [router, searchParams]
  );

  useEffect(() => {
    const hasChanges =
      selectedSort !== "latest" ||
      selectedCategories.length > 0 ||
      onlyMyMissions;
    setHasFilterChanges(hasChanges);
  }, [selectedSort, selectedCategories.length, onlyMyMissions]);

  const normalizedSearchKeyword = appliedSearchQuery.trim().toLowerCase();

  const filterChips = useMemo(() => {
    const chips: {
      id: string;
      label: string;
      onRemove: () => void;
    }[] = [];

    if (selectedSort !== "latest") {
      chips.push({
        id: `sort-${selectedSort}`,
        label: MISSION_POSTS_SORT_LABELS[selectedSort],
        onRemove: () => setSelectedSort("latest"),
      });
    }

    selectedCategories.forEach((category) => {
      chips.push({
        id: `category-${category}`,
        label: category,
        onRemove: () =>
          setSelectedCategories((prev) =>
            prev.filter((item) => item !== category)
          ),
      });
    });

    return chips;
  }, [selectedCategories, selectedSort]);

  const handleFilterApply = ({
    sort,
    categories,
  }: {
    sort: MissionPostsSortOption;
    categories: string[];
  }) => {
    const hasChanges = sort !== "latest" || categories.length > 0;
    setSelectedSort(sort);
    setSelectedCategories(categories);
    setHasFilterChanges(hasChanges);
    setIsFilterSheetOpen(false);

    updateQueryParams({
      search: appliedSearchQuery,
      sort,
      categories,
    });
  };

  const handleSearch = useCallback(() => {
    if (isSearchingRef.current) return;
    isSearchingRef.current = true;
    setAppliedSearchQuery(searchQuery);
    setTimeout(() => {
      isSearchingRef.current = false;
    }, 0);

    updateQueryParams({
      search: searchQuery,
      sort: appliedSortParam ?? "latest",
      categories: selectedCategories,
    });
  }, [searchQuery, appliedSortParam, selectedCategories, updateQueryParams]);

  const handleSearchKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault();
        searchInputRef.current?.blur();
        handleSearch();
      }
    },
    [handleSearch]
  );

  const handleSearchBlur = useCallback(() => {
    setTimeout(() => {
      if (
        !isSearchingRef.current &&
        document.activeElement !== searchInputRef.current
      ) {
        handleSearch();
      }
    }, 100);
  }, [handleSearch]);

  const handleSearchInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchQuery(event.target.value);
  };

  const filteredMissionPosts = useMemo(() => {
    if (!normalizedSearchKeyword) {
      return missionPosts;
    }

    return missionPosts.filter((post) => {
      const title = (post?.title ?? "").toLowerCase();
      const missionTitle = (post?.missionTitle ?? "").toLowerCase();
      const description = (post?.preview?.description ?? "").toLowerCase();

      return (
        title.includes(normalizedSearchKeyword) ||
        missionTitle.includes(normalizedSearchKeyword) ||
        description.includes(normalizedSearchKeyword)
      );
    });
  }, [missionPosts, normalizedSearchKeyword]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        rootMargin: "120px",
      }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="p-4">
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="text-red-600">
              {error instanceof Error
                ? error.message
                : "미션 인증글을 불러오는데 실패했습니다"}
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
    <div className="relative min-h-full bg-white">
      {/* 필터 헤더 영역 */}
      <div className="sticky top-0 z-40 border-gray-100 bg-white px-5">
        <div className="relative">
          <CommunityTabs activeTab="mission" />
          <CommunitySearchBar
            inputRef={searchInputRef}
            value={searchQuery}
            onChange={handleSearchInputChange}
            onKeyDown={handleSearchKeyDown}
            onBlur={handleSearchBlur}
            onSearchClick={handleSearch}
            hasFilterChanges={hasFilterChanges}
            onFilterClick={() => setIsFilterSheetOpen(true)}
          />
          {/* 내가 인증한 미션만 보기 토글 (로그인 사용자에게만 표시) */}
          {userMe?.user?.id && (
            <MyCertificationToggle
              id="only-my-missions"
              checked={onlyMyMissions}
              label="내가 인증한 미션만 보기"
              onChange={(checked) => setOnlyMyMissions(checked)}
            />
          )}
          {/* 선택된 필터 칩 */}
          <FilterChipsSection chips={filterChips} />
        </div>
      </div>

      {/* 리스트 영역 */}
      <div className="px-5 pb-32">
        {!isInitialLoading && filteredMissionPosts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 text-4xl">📭</div>
            <p className="mb-2 text-base font-medium text-gray-900">
              아직 미션 인증글이 없어요
            </p>
            <p className="text-sm text-gray-500">
              첫 번째 인증글을 남겨보세요!
            </p>
          </div>
        )}

        <MissionFeed
          posts={filteredMissionPosts}
          onPostClick={(post) => {
            if (!post?.id) return;
            router.push(`${LINK_URL.COMMUNITY_MISSION}/${post.id}`);
          }}
          isLoading={isInitialLoading}
          skeletonCount={4}
        />

        <div ref={loadMoreRef} aria-hidden="true" className="h-6 w-full" />

        {isFetchingNextPage && (
          <div
            role="status"
            aria-live="polite"
            className="flex items-center justify-center pb-6 text-sm text-gray-500"
          >
            인증글을 더 불러오는 중이에요...
          </div>
        )}

        {!hasNextPage && missionPosts.length > 0 && (
          <div className="pb-6 text-center text-xs text-gray-400">
            모든 인증글을 확인했어요
          </div>
        )}

        <MissionPostsFilterBottomSheet
          isOpen={isFilterSheetOpen}
          onClose={() => setIsFilterSheetOpen(false)}
          selectedSort={selectedSort}
          selectedCategories={selectedCategories}
          onApply={handleFilterApply}
        />
      </div>
    </div>
  );
};

const Page = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white">
          <div className="p-4">
            <div className="animate-pulse space-y-4">
              <div className="h-12 rounded bg-gray-200" />
              <div className="h-40 rounded bg-gray-200" />
            </div>
          </div>
        </div>
      }
    >
      <MissionCommunityPageContent />
    </Suspense>
  );
};

export default Page;
