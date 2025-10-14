import Image from "next/image";
import Link from "next/link";
import { COLLECTION_STYLES } from "@/constants/shared/notion-renderer";
import type { CollectionItemData } from "@/types/shared/notion-renderer";

interface CollectionItemProps {
  item: CollectionItemData;
  className?: string;
}

/**
 * @description Collection 아이템 컴포넌트
 * 이미지와 링크를 포함한 개별 아이템 렌더링
 */
export const CollectionItem = ({ item, className }: CollectionItemProps) => {
  return (
    <div className={className}>
      <Link href={item.linkUrl} className={COLLECTION_STYLES.LINK}>
        <div className={COLLECTION_STYLES.IMAGE_WRAPPER}>
          <Image
            src={item.imageUrl}
            alt={item.title}
            className={COLLECTION_STYLES.IMAGE}
            width={280}
            height={280}
            loading="lazy"
            unoptimized
          />
        </div>
      </Link>
    </div>
  );
};
