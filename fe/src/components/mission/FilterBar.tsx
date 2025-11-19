"use client";

import SortDropdown, {
  type SortOption,
} from "@/components/shared/SortDropdown";
import ExcludeParticipatedCheckbox from "./ExcludeParticipatedCheckbox";

interface FilterBarProps<T extends string = string> {
  sortOptions: SortOption<T>[];
  sortValue: T;
  onSortChange: (value: T) => void;
  excludeChecked: boolean;
  onExcludeChange: (checked: boolean) => void;
}

/**
 * @description 정렬 드롭다운과 체크박스 필터를 포함한 필터 바 컴포넌트
 */
const FilterBar = <T extends string = string>({
  sortOptions,
  sortValue,
  onSortChange,
  excludeChecked,
  onExcludeChange,
}: FilterBarProps<T>) => {
  return (
    <div className="flex items-center justify-between py-4">
      <SortDropdown
        options={sortOptions}
        value={sortValue}
        onChange={onSortChange}
      />
      <ExcludeParticipatedCheckbox
        checked={excludeChecked}
        onCheckedChange={onExcludeChange}
      />
    </div>
  );
};

export default FilterBar;
