"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import FilterBar from "@/components/mission/FilterBar";
import MissionFirstEnterMessage from "@/components/mission/MissionFirstEnterMessage";
import MissionListCard from "@/components/mission/MissionListCard";
import DualGroupFilterButtons, {
  type DualFilterState,
} from "@/components/shared/DualGroupFilterButtons";
import {
  SINGLE_SELECT_FILTERS,
  RIGHT_SELECT_FILTERS,
  DEFAULT_SINGLE_SELECT_FILTER_ID,
  LIKED_FILTER_ID,
} from "@/constants/mission/_filter-options";
import { MOCK_MISSIONS } from "@/constants/mission/_mock-missions";
import { MISSION_SORT_OPTIONS } from "@/constants/mission/_sort-options";
import { useTopBarStore } from "@/stores/shared/topbar-store";
import type {
  SingleSelectFilterId,
  MultiSelectFilterId,
} from "@/types/mission/filter-types";
import type { SortType } from "@/types/mission/sort-types";
import { cn } from "@/utils/shared/cn";

// TODO: 실 api res로 수정
const isFirstEnter = true;

/**
 * @description 미션 목록 페이지
 */
const Page = () => {
  const setTitle = useTopBarStore((state) => state.setTitle);
  const setHideTopBar = useTopBarStore((state) => state.setHideTopBar);

  useEffect(() => {
    setTitle("전체 미션 보기");
    setHideTopBar(isFirstEnter);
    return () => {
      setHideTopBar(false);
    };
  }, [setTitle, setHideTopBar]);

  const [filters, setFilters] = useState<
    DualFilterState<SingleSelectFilterId, MultiSelectFilterId>
  >({
    leftSelect: DEFAULT_SINGLE_SELECT_FILTER_ID,
    rightSelect: null,
  });

  const [sortValue, setSortValue] = useState<SortType>("latest");
  const [excludeParticipated, setExcludeParticipated] = useState(false);

  const handleFiltersChange = (
    newFilters: DualFilterState<SingleSelectFilterId, MultiSelectFilterId>
  ) => {
    setFilters(newFilters);
    // TODO: 필터 변경 시 미션 목록 필터링 로직 구현
  };

  const handleSortChange = (value: SortType) => {
    setSortValue(value);
    // TODO: 정렬 변경 시 미션 목록 정렬 로직 구현
  };

  const handleExcludeChange = (checked: boolean) => {
    setExcludeParticipated(checked);
    // TODO: 참여한 미션 제외 로직 구현
  };

  return (
    <div className={cn("flex flex-col px-5", isFirstEnter ? "pt-8" : "pt-12")}>
      {/* 미션 첫 진입일 때 */}
      {isFirstEnter && <MissionFirstEnterMessage />}
      <div className="sticky top-0 z-40 bg-white pt-7">
        <DualGroupFilterButtons
          filters={filters}
          onFiltersChange={handleFiltersChange}
          leftOptions={SINGLE_SELECT_FILTERS}
          rightOptions={RIGHT_SELECT_FILTERS}
          defaultLeftFilterId={DEFAULT_SINGLE_SELECT_FILTER_ID}
          renderCustomIcon={(optionId, isActive) => {
            if (optionId === LIKED_FILTER_ID) {
              return (
                <Heart
                  className={cn(
                    "size-4",
                    isActive ? "fill-main-500 text-main-500" : "text-gray-500"
                  )}
                />
              );
            }
            return undefined;
          }}
        />
      </div>
      {/* 최신순 + 참여한 미션 제외하기 */}
      <FilterBar
        sortOptions={MISSION_SORT_OPTIONS}
        sortValue={sortValue}
        onSortChange={handleSortChange}
        excludeChecked={excludeParticipated}
        onExcludeChange={handleExcludeChange}
      />
      {/* 미션 목록 */}
      <div className="flex flex-col">
        {/* TODO: 실 api res 로 수정 */}
        {MOCK_MISSIONS.map((mission) => (
          <MissionListCard
            key={mission.id}
            id={mission.id}
            title={mission.title}
            category={mission.category}
            thumbnailUrl={mission.thumbnailUrl}
            likeCount={mission.likeCount}
            createdAt={mission.createdAt}
            isLiked={mission.isLiked}
          />
        ))}
      </div>
    </div>
  );
};

export default Page;
