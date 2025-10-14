import { COLLECTION_STYLES } from "@/constants/shared/notion-renderer";
import type { CollectionItemData } from "@/types/shared/notion-renderer";
import { CollectionItem } from "./CollectionItem";

interface CollectionBannerProps {
  items: CollectionItemData[];
}

/**
 * @description 단일 배너 레이아웃
 * 공지사항, 프로모션 배너 등에 사용
 */
export const CollectionBanner = ({ items }: CollectionBannerProps) => {
  return (
    <div className={COLLECTION_STYLES.BANNER}>
      {items.map((item) => (
        <CollectionItem key={item.id} item={item} />
      ))}
    </div>
  );
};
