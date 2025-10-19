import { COLLECTION_STYLES } from "@/constants/shared/notion-renderer";
import type { CollectionItemData } from "@/types/shared/notion-renderer";
import { CollectionItem } from "./CollectionItem";

interface CollectionGridProps {
  items: CollectionItemData[];
}

/**
 * @description 2단 그리드 레이아웃
 * 활동 배너 등에 사용
 */
export const CollectionGrid = ({ items }: CollectionGridProps) => {
  return (
    <div className={COLLECTION_STYLES.GRID}>
      {items.map((item) => (
        <CollectionItem key={item.id} item={item} />
      ))}
    </div>
  );
};
