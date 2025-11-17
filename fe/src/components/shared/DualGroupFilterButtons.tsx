"use client";

import { ReactNode } from "react";
import FilterButton from "./FilterButton";

export interface DualFilterState<TLeftId, TRightId> {
  leftSelect: TLeftId;
  rightSelect: TRightId | null;
}

interface DualGroupFilterButtonsProps<
  TLeftId extends string,
  TRightId extends string,
> {
  filters: DualFilterState<TLeftId, TRightId>;
  onFiltersChange: (filters: DualFilterState<TLeftId, TRightId>) => void;
  /**
   * @description 왼쪽 그룹 필터 옵션
   */
  leftOptions: Array<{ id: TLeftId | string; label: string }>;
  /**
   * @description 오른쪽 그룹 필터 옵션
   */
  rightOptions: Array<{ id: TRightId | string; label: string }>;
  /**
   * @description 왼쪽 그룹의 기본 필터 ID (이미 선택된 필터를 다시 클릭할 때 사용)
   */
  defaultLeftFilterId: TLeftId;
  /**
   * @description 커스텀 아이콘 렌더링 함수 (옵션)
   */
  renderCustomIcon?: (
    optionId: TLeftId | TRightId | string,
    isActive: boolean
  ) => ReactNode;
}

/**
 * @description 두 그룹으로 나뉜 필터 버튼 컴포넌트
 * - 왼쪽 그룹: 단일 선택
 * - 오른쪽 그룹: 단일 선택 (한 개만 선택 가능)
 */
const DualGroupFilterButtons = <
  TLeftId extends string,
  TRightId extends string,
>({
  filters,
  onFiltersChange,
  leftOptions,
  rightOptions,
  defaultLeftFilterId,
  renderCustomIcon,
}: DualGroupFilterButtonsProps<TLeftId, TRightId>) => {
  const handleLeftSelectChange = (filterId: TLeftId) => {
    // 기본 필터가 이미 선택된 상태에서 다시 클릭하면 아무 일도 하지 않음
    if (
      filterId === defaultLeftFilterId &&
      filters.leftSelect === defaultLeftFilterId
    ) {
      return;
    }

    // 이미 선택된 필터를 다시 클릭하면 기본값으로 변경
    const newFilterId =
      filters.leftSelect === filterId ? defaultLeftFilterId : filterId;

    onFiltersChange({
      ...filters,
      leftSelect: newFilterId,
    });
  };

  const handleRightSelectChange = (filterId: TRightId) => {
    const isSelected = filters.rightSelect === filterId;

    if (isSelected) {
      // 이미 선택된 경우 선택 해제
      onFiltersChange({
        ...filters,
        rightSelect: null,
      });
    } else {
      // 선택되지 않은 경우 선택
      onFiltersChange({
        ...filters,
        rightSelect: filterId,
      });
    }
  };

  return (
    <div className="scrollbar-hide w-[calc(100%+2.5rem)] overflow-x-auto overflow-y-hidden pb-7">
      <div className="flex items-center gap-2">
        {/* 왼쪽 그룹 필터 */}
        <div className="flex flex-shrink-0 gap-2">
          {leftOptions.map((option) => {
            const isActive = filters.leftSelect === option.id;

            return (
              <FilterButton
                key={String(option.id)}
                label={option.label}
                customIcon={renderCustomIcon?.(option.id, isActive)}
                isActive={isActive}
                onClick={() => handleLeftSelectChange(option.id as TLeftId)}
              />
            );
          })}
        </div>

        {/* Divider */}
        <div
          className="h-6 w-px flex-shrink-0 bg-gray-200"
          aria-hidden="true"
        />

        {/* 오른쪽 그룹 필터 */}
        <div className="flex flex-shrink-0 gap-2 pr-8">
          {rightOptions.map((option) => {
            const isSelected = filters.rightSelect === option.id;

            return (
              <FilterButton
                key={String(option.id)}
                label={option.label}
                customIcon={renderCustomIcon?.(option.id, isSelected)}
                isActive={isSelected}
                onClick={() => handleRightSelectChange(option.id as TRightId)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DualGroupFilterButtons;
