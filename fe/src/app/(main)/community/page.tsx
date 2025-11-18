"use client";

import {
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
  type ChangeEvent,
} from "react";
import { useRouter } from "next/navigation";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import FloatingWriteButton from "@/components/community/FloatingWriteButton";
import PostFeed from "@/components/community/PostFeed";
import ProgramFilterBottomSheet, {
  type ProgramCategoryFilter,
  type ProgramSortOption,
  type ProgramStateFilter,
} from "@/components/community/ProgramFilterBottomSheet";
import ProgramSelectBottomSheet from "@/components/community/ProgramSelectBottomSheet";
import AlarmButton from "@/components/shared/AlarmButton";
import GrayCheckbox from "@/components/shared/GrayCheckbox";
import { Typography } from "@/components/shared/typography";
import Icon from "@/components/shared/ui/icon";
import { IMAGE_URL } from "@/constants/shared/_image-url";
import { useGetCommunitiesPosts } from "@/hooks/generated/communities-hooks";
import { useGetUsersMeParticipatingCommunities } from "@/hooks/generated/users-hooks";
import { CommunityPostListItem } from "@/types/generated/api-schema";
import { cn } from "@/utils/shared/cn";

const COMMUNITY_POST_LIST_SIZE = 100;

const PROGRAM_CATEGORY_TO_TYPE: Record<
  ProgramCategoryFilter,
  "ROUTINE" | "GATHERING" | "TMI"
> = {
  한끗루틴: "ROUTINE",
  월간소모임: "GATHERING",
  TMI: "TMI",
};

const PROGRAM_STATE_LABELS: Record<ProgramStateFilter, string> = {
  all: "전체",
  ongoing: "진행중",
  finished: "종료됨",
};

const PROGRAM_SORT_LABELS: Record<ProgramSortOption, string> = {
  latest: "최신순",
  popular: "인기순",
};

const CHIP_SCROLL_OFFSET = 200;

/**
 * @description 커뮤니티 페이지
 */
const Page = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");
  const [selectedSort, setSelectedSort] = useState<ProgramSortOption>("latest");
  const [selectedProgramState, setSelectedProgramState] =
    useState<ProgramStateFilter>("all");
  const [selectedCategories, setSelectedCategories] = useState<
    ProgramCategoryFilter[]
  >([]);
  const [onlyMyPrograms, setOnlyMyPrograms] = useState(false);
  const [isProgramSelectSheetOpen, setIsProgramSelectSheetOpen] =
    useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [hasFilterChanges, setHasFilterChanges] = useState(false);
  const chipScrollContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const isSearchingRef = useRef(false);
  const [showLeftGradient, setShowLeftGradient] = useState(false);
  const [showRightGradient, setShowRightGradient] = useState(false);

  const { data: participatingCommunities } =
    useGetUsersMeParticipatingCommunities();

  const participatingCommunityIdSet = useMemo(() => {
    const set = new Set<string>();
    if (!participatingCommunities) {
      return set;
    }

    const routineItems = participatingCommunities.routine?.items ?? [];
    const gatheringItems = participatingCommunities.gathering?.items ?? [];
    const tmiItems = participatingCommunities.tmi?.items ?? [];

    [...routineItems, ...gatheringItems, ...tmiItems].forEach((item) => {
      if (item?.id) {
        set.add(item.id);
      }
    });
    return set;
  }, [participatingCommunities]);

  const appliedProgramState =
    selectedProgramState === "all" ? undefined : selectedProgramState;

  const appliedProgramType =
    selectedCategories.length === 1
      ? PROGRAM_CATEGORY_TO_TYPE[selectedCategories[0]]
      : undefined;

  const {
    data: responseData,
    isLoading,
    error,
    refetch,
  } = useGetCommunitiesPosts({
    request: {
      page: 0,
      size: COMMUNITY_POST_LIST_SIZE, // 일단 큰 값으로 설정 (페이지네이션은 향후 구현)
      programType: appliedProgramType,
      programState: appliedProgramState,
    },
    select: (data) => {
      if (!data?.posts || !Array.isArray(data.posts)) return [];
      return data.posts;
    },
    refetchOnWindowFocus: false, // 브라우저 탭 전환 시 refetch 방지
  });

  // 변환된 포스트 데이터
  const posts = useMemo<CommunityPostListItem[]>(
    () => (responseData ?? []) as CommunityPostListItem[],
    [responseData]
  );

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

  const normalizedSearchKeyword = appliedSearchQuery.trim().toLowerCase();

  const handleSearch = useCallback(() => {
    if (isSearchingRef.current) return;
    isSearchingRef.current = true;
    setAppliedSearchQuery(searchQuery);
    // 다음 이벤트 루프에서 플래그 리셋
    setTimeout(() => {
      isSearchingRef.current = false;
    }, 0);
  }, [searchQuery]);

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
    // blur 이벤트는 약간의 지연 후 실행하여 엔터키로 인한 blur와 구분
    setTimeout(() => {
      if (
        !isSearchingRef.current &&
        document.activeElement !== searchInputRef.current
      ) {
        handleSearch();
      }
    }, 100);
  }, [handleSearch]);

  const extractCommunityId = useCallback((post: CommunityPostListItem) => {
    const postWithCommunity = post as CommunityPostListItem & {
      communityId?: string;
      communityPath?: string;
      community?: { id?: string };
    };

    return (
      postWithCommunity.communityId ||
      postWithCommunity.community?.id ||
      (postWithCommunity.communityPath
        ? postWithCommunity.communityPath.replace("communities/", "")
        : "")
    );
  }, []);

  const filterChips = useMemo(() => {
    const chips: {
      id: string;
      label: string;
      onRemove: () => void;
    }[] = [];

    // 정렬 옵션 (초기값이 아닌 경우만 추가)
    if (selectedSort !== "latest") {
      chips.push({
        id: `sort-${selectedSort}`,
        label: PROGRAM_SORT_LABELS[selectedSort],
        onRemove: () => setSelectedSort("latest"),
      });
    }

    // 프로그램 상태 (초기값이 아닌 경우만 추가)
    if (selectedProgramState !== "all") {
      chips.push({
        id: `state-${selectedProgramState}`,
        label: PROGRAM_STATE_LABELS[selectedProgramState],
        onRemove: () => setSelectedProgramState("all"),
      });
    }

    // 카테고리
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

    // 검색어
    if (normalizedSearchKeyword) {
      chips.push({
        id: "search",
        label: `검색: "${appliedSearchQuery.trim()}"`,
        onRemove: () => {
          setSearchQuery("");
          setAppliedSearchQuery("");
        },
      });
    }

    return chips;
  }, [
    normalizedSearchKeyword,
    appliedSearchQuery,
    selectedCategories,
    selectedProgramState,
    selectedSort,
  ]);

  const updateChipScrollIndicators = useCallback(() => {
    const scrollContainer = chipScrollContainerRef.current;
    if (!scrollContainer) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
    const isAtStart = scrollLeft <= 0;
    const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 1;

    setShowLeftGradient(!isAtStart);
    setShowRightGradient(!isAtEnd);
  }, []);

  useEffect(() => {
    const scrollContainer = chipScrollContainerRef.current;
    if (!scrollContainer) return;

    updateChipScrollIndicators();

    const handleScroll = () => updateChipScrollIndicators();
    const resizeObserver = new ResizeObserver(() => {
      updateChipScrollIndicators();
    });

    scrollContainer.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);
    resizeObserver.observe(scrollContainer);

    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      resizeObserver.disconnect();
    };
  }, [filterChips.length, updateChipScrollIndicators]);

  const handleScrollLeft = () => {
    chipScrollContainerRef.current?.scrollBy({
      left: -CHIP_SCROLL_OFFSET,
      behavior: "smooth",
    });
  };

  const handleScrollRight = () => {
    chipScrollContainerRef.current?.scrollBy({
      left: CHIP_SCROLL_OFFSET,
      behavior: "smooth",
    });
  };

  const handleSearchInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleFilterApply = ({
    sort,
    programState,
    categories,
  }: {
    sort: ProgramSortOption;
    programState: ProgramStateFilter;
    categories: ProgramCategoryFilter[];
  }) => {
    const hasChanges =
      sort !== "latest" || programState !== "all" || categories.length > 0;
    setSelectedSort(sort);
    setSelectedProgramState(programState);
    setSelectedCategories(categories);
    setHasFilterChanges(hasChanges);
    setIsFilterSheetOpen(false);
  };

  useEffect(() => {
    const hasChanges =
      selectedSort !== "latest" ||
      selectedProgramState !== "all" ||
      selectedCategories.length > 0 ||
      normalizedSearchKeyword.length > 0;
    setHasFilterChanges(hasChanges);
  }, [
    selectedSort,
    selectedProgramState,
    selectedCategories,
    normalizedSearchKeyword,
  ]);

  const filteredPosts = useMemo(() => {
    if (isInitialLoading || !posts.length) return [];

    let currentPosts = [...posts];

    if (onlyMyPrograms) {
      if (participatingCommunityIdSet.size === 0) {
        return [];
      }

      currentPosts = currentPosts.filter((post) => {
        const communityId = extractCommunityId(post);
        return communityId && participatingCommunityIdSet.has(communityId);
      });
    }

    if (selectedCategories.length > 0) {
      currentPosts = currentPosts.filter((post) => {
        const normalizedCategory = post.category?.replace(/\s/g, "");
        const normalizedTags = post.tags?.map((tag) => tag.replace(/\s/g, ""));
        return selectedCategories.some((category) => {
          const target = category.replace(/\s/g, "");
          if (normalizedCategory && normalizedCategory === target) {
            return true;
          }
          return normalizedTags?.some((tag) => tag === target);
        });
      });
    }

    if (normalizedSearchKeyword) {
      currentPosts = currentPosts.filter((post) => {
        const title = (post.title || "").toLowerCase();
        const description =
          (post.preview?.description || "").toLowerCase() || "";
        const tagMatch = post.tags?.some((tag) =>
          tag.toLowerCase().includes(normalizedSearchKeyword)
        );

        return (
          title.includes(normalizedSearchKeyword) ||
          description.includes(normalizedSearchKeyword) ||
          Boolean(tagMatch)
        );
      });
    }

    const sortByLatest = (
      a: CommunityPostListItem,
      b: CommunityPostListItem
    ) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    };

    const sortByPopularity = (
      a: CommunityPostListItem,
      b: CommunityPostListItem
    ) => {
      const likesDiff = (b.likesCount ?? 0) - (a.likesCount ?? 0);
      if (likesDiff !== 0) return likesDiff;
      const commentsDiff = (b.commentsCount ?? 0) - (a.commentsCount ?? 0);
      if (commentsDiff !== 0) return commentsDiff;
      return sortByLatest(a, b);
    };

    currentPosts.sort((a, b) =>
      selectedSort === "popular" ? sortByPopularity(a, b) : sortByLatest(a, b)
    );

    return currentPosts;
  }, [
    extractCommunityId,
    isInitialLoading,
    normalizedSearchKeyword,
    onlyMyPrograms,
    participatingCommunityIdSet,
    posts,
    selectedCategories,
    selectedSort,
  ]);

  const segmentedPosts = useMemo(() => {
    const top = filteredPosts.slice(0, 4);
    const rest = filteredPosts.slice(4);
    return { top, rest };
  }, [filteredPosts]);

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
    <div className="relative min-h-full bg-white">
      {/* 검색 & 필터 섹션 */}
      <div className="sticky top-0 z-40 border-b border-gray-100 bg-white px-5 pt-2">
        <div className="relative">
          <div className="flex h-12 items-center justify-between bg-white">
            <div className="flex items-center gap-4">
              <Typography font="noto" variant="title4" className="text-black">
                프로그램
              </Typography>
            </div>
            <AlarmButton variant="inline" />
          </div>

          {/* 검색 입력 */}
          <div className="mt-4 flex items-center gap-[10px]">
            <div className="my-3 flex h-[40px] flex-1 items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3">
              <input
                ref={searchInputRef}
                id="community-search-input"
                type="text"
                value={searchQuery}
                onChange={handleSearchInputChange}
                onKeyDown={handleSearchKeyDown}
                onBlur={handleSearchBlur}
                placeholder="관심있는 키워드를 검색해보세요."
                className="flex-1 bg-transparent text-sm text-gray-950 placeholder:text-gray-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSearch}
                aria-label="검색"
                className="flex items-center justify-center"
              >
                <Icon
                  src={IMAGE_URL.ICON.search.url}
                  aria-hidden="true"
                  className="text-gray-800"
                  width={20}
                  height={20}
                />
              </button>
            </div>
            <button
              type="button"
              onClick={() => setIsFilterSheetOpen(true)}
              className={cn(
                "flex size-10 items-center justify-center rounded-[6px] border border-gray-100 transition-colors",
                hasFilterChanges
                  ? "border-main-500 bg-main-50 text-main-500"
                  : "border-gray-200 text-gray-700"
              )}
            >
              <Icon
                src={IMAGE_URL.ICON.filter.url}
                aria-hidden="true"
                className={hasFilterChanges ? "text-main-500" : "text-gray-700"}
                width={20}
                height={20}
              />
            </button>
          </div>

          {/* 선택된 필터 칩 */}
          {filterChips.length > 0 && (
            <div className="relative mt-4">
              <div
                ref={chipScrollContainerRef}
                className="scrollbar-hide flex gap-2 overflow-x-auto pr-8"
              >
                {filterChips.map((chip) => (
                  <div
                    key={chip.id}
                    className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700"
                  >
                    <span>{chip.label}</span>
                    <button
                      type="button"
                      aria-label={`${chip.label} 필터 제거`}
                      onClick={chip.onRemove}
                      className="flex items-center justify-center rounded-full p-0.5 text-gray-500 hover:bg-gray-200"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>

              {showLeftGradient && (
                <div className="pointer-events-none absolute top-0 left-0 z-10 flex h-full items-center">
                  <div className="relative h-full w-16">
                    <div className="h-full w-full bg-gradient-to-r from-white via-white to-transparent" />
                    <button
                      type="button"
                      onClick={handleScrollLeft}
                      className="pointer-events-auto absolute top-1/2 -translate-y-1/2 rounded-full bg-white p-1 shadow"
                      aria-label="필터 칩 왼쪽으로 스크롤"
                    >
                      <ChevronLeft className="size-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              )}

              {showRightGradient && (
                <div className="pointer-events-none absolute top-0 right-0 z-10 flex h-full items-center">
                  <div className="relative h-full w-16">
                    <div className="h-full w-full bg-gradient-to-l from-white via-white to-transparent" />
                    <button
                      type="button"
                      onClick={handleScrollRight}
                      className="pointer-events-auto absolute top-1/2 right-0 -translate-y-1/2 rounded-full bg-white p-1 shadow"
                      aria-label="필터 칩 오른쪽으로 스크롤"
                    >
                      <ChevronRight className="size-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 참여중인 프로그램만 보기 */}
          <div className="flex items-center gap-2 py-2">
            <GrayCheckbox
              id="only-my-programs"
              checked={onlyMyPrograms}
              aria-label="내가 참여중인 프로그램 게시글만 보기"
              onCheckedChange={(checked) => setOnlyMyPrograms(checked)}
            />
            <Typography font="noto" variant="label1M" className="text-gray-500">
              내가 참여중인 프로그램만 보기
            </Typography>
          </div>
        </div>
      </div>

      <div className="px-5">
        {/* 전체 포스트가 없을 때 - 로딩 완료 후에만 표시 */}
        {!isInitialLoading &&
          segmentedPosts.top.length + segmentedPosts.rest.length === 0 && (
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

        {/* 상위 4개 포스트 */}
        <div className="mb-6">
          <PostFeed
            posts={segmentedPosts.top}
            onPostClick={handlePostClick}
            isLoading={isInitialLoading}
            skeletonCount={4}
          />
        </div>
        {/*
        {segmentedPosts.top.length > 0 && (
          <UserImageCarouselSection images={userImages} />
        )}
        */}

        {/* 나머지 포스트 */}
        <div className="mb-6">
          <PostFeed
            posts={segmentedPosts.rest}
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

        <ProgramFilterBottomSheet
          isOpen={isFilterSheetOpen}
          onClose={() => setIsFilterSheetOpen(false)}
          selectedSort={selectedSort}
          selectedProgramState={selectedProgramState}
          selectedCategories={selectedCategories}
          onApply={handleFilterApply}
        />
      </div>
    </div>
  );
};

export default Page;
