/**
 * @description Notion Collection 레이아웃 식별자
 */
export const COLLECTION_ICONS = {
  CAROUSEL: "🎠",
  GRID: "📋",
  BANNER: "🎯",
} as const;

/**
 * @description Collection 레이아웃 키워드
 */
export const COLLECTION_KEYWORDS = {
  CAROUSEL: ["상품", "캐러셀", "carousel"],
  GRID: ["활동", "2단", "그리드"],
  BANNER: ["배너", "banner"],
} as const;

/**
 * @description Collection 레이아웃 클래스
 */
export const COLLECTION_STYLES = {
  CAROUSEL: "mb-4 overflow-x-auto",
  CAROUSEL_INNER: "flex gap-3 pb-2",
  CAROUSEL_ITEM: "w-[280px] flex-shrink-0",
  GRID: "mb-4 grid grid-cols-2 gap-2",
  BANNER: "mb-4",
  LINK: "block transition-opacity hover:opacity-90",
  IMAGE_WRAPPER: "overflow-hidden rounded-lg",
  IMAGE: "h-auto w-full",
} as const;
