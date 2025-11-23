"use client";

import { useEffect, useState, useMemo } from "react";
import { Heart } from "lucide-react";
import FilterBar from "@/components/mission/FilterBar";
import MissionFirstEnterMessage from "@/components/mission/MissionFirstEnterMessage";
import MissionListCard from "@/components/mission/MissionListCard";
import DualGroupFilterButtons, {
  type DualFilterState,
} from "@/components/shared/DualGroupFilterButtons";
import { Typography } from "@/components/shared/typography";
import {
  SINGLE_SELECT_FILTERS,
  DEFAULT_SINGLE_SELECT_FILTER_ID,
  LIKED_FILTER_ID,
} from "@/constants/mission/_filter-options";
import { MISSION_SORT_OPTIONS } from "@/constants/mission/_sort-options";
import {
  useGetMissions,
  useGetMissionsCategories,
  useGetMissionsMe,
} from "@/hooks/generated/missions-hooks";
import { useTopBarStore } from "@/stores/shared/topbar-store";
import type { TGETMissionsReq } from "@/types/generated/missions-types";
import type { SingleSelectFilterId } from "@/types/mission/filter-types";
import type {
  MissionListItem,
  MissionResponse,
} from "@/types/mission/mission-types";
import type { SortType } from "@/types/mission/sort-types";
import { transformMissionsToListItems } from "@/utils/mission/transform-mission";
import { cn } from "@/utils/shared/cn";

/**
 * @description 미션 목록 페이지
 */
const Page = () => {
  const setTitle = useTopBarStore((state) => state.setTitle);
  const setHideTopBar = useTopBarStore((state) => state.setHideTopBar);

  // 진행중인 미션 조회 API
  const { data: myMissionsResponse } = useGetMissionsMe({
    request: {},
  });

  // 진행중인 미션이 있으면 첫 진입이 아님
  const activeMissions = myMissionsResponse?.missions || [];
  const isFirstEnter = activeMissions.length === 0;

  useEffect(() => {
    setTitle("전체 미션 보기");
    setHideTopBar(isFirstEnter);
    return () => {
      setHideTopBar(false);
    };
  }, [setTitle, setHideTopBar, isFirstEnter]);

  const [filters, setFilters] = useState<
    DualFilterState<SingleSelectFilterId, string>
  >({
    leftSelect: DEFAULT_SINGLE_SELECT_FILTER_ID,
    rightSelect: null,
  });

  const [sortValue, setSortValue] = useState<SortType>("latest");
  const [excludeParticipated, setExcludeParticipated] = useState(false);

  // 카테고리 목록 조회 API
  const { data: categoriesResponse } = useGetMissionsCategories();
  // API 응답을 TFilterOption[] 형태로 변환
  const rightSelectFilters =
    categoriesResponse?.categories?.map((category) => ({
      id: category,
      label: category,
    })) ?? [];

  // API 요청 파라미터
  const apiRequestParams: TGETMissionsReq = {
    sortBy: sortValue,
    ...(filters.rightSelect && { category: filters.rightSelect }),
    ...(excludeParticipated && { excludeParticipated: true }),
  };

  // API 호출
  const {
    data: missionsResponse,
    isLoading,
    error,
  } = useGetMissions({
    request: apiRequestParams,
  });

  // API 응답을 MissionListCard 형식으로 변환
  const missions = useMemo((): MissionListItem[] => {
    if (!missionsResponse?.missions) {
      return [];
    }

    let filteredMissions = missionsResponse.missions as MissionResponse[];

    // "liked" 필터는 클라이언트 측 필터링 (API에 해당 필터가 없음)
    // TODO: 찜한 미션 필터링은 추후 API 지원 시 서버 측으로 이동
    if (filters.leftSelect === LIKED_FILTER_ID) {
      // 현재는 API 응답에 isLiked 정보가 없으므로 빈 배열 반환
      // 추후 API에서 찜한 미션 목록을 제공하면 해당 API 호출
      filteredMissions = [];
    }

    return transformMissionsToListItems(filteredMissions);
  }, [missionsResponse, filters.leftSelect]);

  const handleFiltersChange = (
    newFilters: DualFilterState<SingleSelectFilterId, string>
  ) => {
    setFilters(newFilters);
  };

  const handleSortChange = (value: SortType) => {
    setSortValue(value);
  };

  const handleExcludeChange = (checked: boolean) => {
    setExcludeParticipated(checked);
  };

  return (
    <div className={cn("flex flex-col px-5", isFirstEnter ? "pt-8" : "pt-12")}>
      {/* 미션 첫 진입일 때 */}
      {isFirstEnter && <MissionFirstEnterMessage />}
      <div
        className={cn(
          "sticky z-40 bg-white pt-7",
          isFirstEnter ? "top-0" : "top-12"
        )}
      >
        <DualGroupFilterButtons
          filters={filters}
          onFiltersChange={handleFiltersChange}
          leftOptions={SINGLE_SELECT_FILTERS}
          rightOptions={rightSelectFilters}
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
        {/* 최신순 + 참여한 미션 제외하기 */}
        <FilterBar
          sortOptions={MISSION_SORT_OPTIONS}
          sortValue={sortValue}
          onSortChange={handleSortChange}
          excludeChecked={excludeParticipated}
          onExcludeChange={handleExcludeChange}
        />
      </div>
      {/* 미션 목록 */}
      <div className="flex flex-col">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Typography font="noto" variant="body2R" className="text-gray-400">
              미션 목록을 불러오는 중...
            </Typography>
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center py-12">
            <Typography font="noto" variant="body2R" className="text-red-500">
              미션 목록을 불러오는 중 오류가 발생했습니다.
            </Typography>
          </div>
        )}
        {!isLoading && !error && missions.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <Typography font="noto" variant="body2R" className="text-gray-400">
              표시할 미션이 없습니다.
            </Typography>
          </div>
        )}
        {!isLoading &&
          !error &&
          missions.map((mission) => (
            <MissionListCard
              key={mission.id}
              id={mission.id}
              title={mission.title}
              categories={mission.categories}
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
