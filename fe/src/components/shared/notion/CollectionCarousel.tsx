import { COLLECTION_STYLES } from "@/constants/shared/notion-renderer";
import type { CollectionItemData } from "@/types/shared/notion-renderer";
import { CollectionItem } from "./CollectionItem";

interface CollectionCarouselProps {
  items: CollectionItemData[];
}

/**
 * @description 가로 스크롤 캐러셀 레이아웃
 * 상품 목록 등에 사용
 */
export const CollectionCarousel = ({ items }: CollectionCarouselProps) => {
  return (
    <div className={COLLECTION_STYLES.CAROUSEL}>
      <div className={COLLECTION_STYLES.CAROUSEL_INNER}>
        {items.map((item) => (
          <CollectionItem
            key={item.id}
            item={item}
            className={COLLECTION_STYLES.CAROUSEL_ITEM}
          />
        ))}
      </div>
    </div>
  );
};
