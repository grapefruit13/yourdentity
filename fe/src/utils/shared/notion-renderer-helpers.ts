import {
  COLLECTION_ICONS,
  COLLECTION_KEYWORDS,
} from "@/constants/shared/notion-renderer";
import type {
  CollectionItemData,
  CollectionLayoutType,
  NotionBlock,
  NotionCollection,
} from "@/types/shared/notion-renderer";

/**
 * @description Collection 레이아웃 타입 판별
 */
export const getCollectionLayoutType = (
  icon: string,
  name: string
): CollectionLayoutType => {
  // 캐러셀
  if (
    icon === COLLECTION_ICONS.CAROUSEL ||
    COLLECTION_KEYWORDS.CAROUSEL.some((keyword) => name.includes(keyword))
  ) {
    return "carousel";
  }

  // 2단 그리드
  if (
    icon === COLLECTION_ICONS.GRID ||
    COLLECTION_KEYWORDS.GRID.some((keyword) => name.includes(keyword))
  ) {
    return "grid";
  }

  // 단일 배너
  if (
    icon === COLLECTION_ICONS.BANNER ||
    COLLECTION_KEYWORDS.BANNER.some((keyword) => name.includes(keyword))
  ) {
    return "banner";
  }

  return "default";
};

/**
 * @description Collection 이름 추출
 */
export const extractCollectionName = (collection: NotionCollection): string => {
  return collection.value?.name?.[0]?.[0] || "";
};

/**
 * @description Collection 아이콘 추출
 */
export const extractCollectionIcon = (collection: NotionCollection): string => {
  return collection.value?.icon || "";
};

/**
 * @description Page 속성에서 데이터 추출
 */
export const extractPageData = (
  page: NotionBlock | undefined
): CollectionItemData | null => {
  if (!page?.value?.properties) {
    return null;
  }

  const { properties } = page.value;
  const title = properties.title?.[0]?.[0] || "";
  const imageUrl = properties.thumbnail?.[0]?.[0] || "";
  const linkUrl = properties.link?.[0]?.[0] || "#";

  // 이미지 URL이 없으면 null 반환
  if (!imageUrl) {
    return null;
  }

  return {
    id: page.value.id,
    title,
    imageUrl,
    linkUrl,
  };
};
