/**
 * @description 홈 화면 컨텐츠 타입 정의
 */

/** 배너 타입 */
export type BannerType = "hero" | "half" | "full" | "carousel_item";

/** 링크 타입 */
export type LinkType = "internal" | "external" | "none";

/** 배너 아이템 */
export interface BannerItem {
  /** 배너 ID */
  id: string;
  /** 배너 타입 */
  type: BannerType;
  /** 배너 이미지 URL */
  imageUrl: string;
  /** 링크 타입 */
  linkType: LinkType;
  /** 링크 URL (internal의 경우 상대 경로, external의 경우 절대 경로) */
  linkUrl: string;
  /** 배너 제목 (선택사항) */
  title?: string;
  /** 배너 설명 (선택사항) */
  description?: string;
  /** 정렬 순서 */
  order: number;
  /** 활성화 여부 */
  isActive: boolean;
}

/** 홈 섹션 타입 */
export type SectionType =
  | "hero_banner"
  | "activity_banners"
  | "product_carousel"
  | "notice_banner"
  | "store_banner"
  | "exhibition_banners";

/** 홈 섹션 */
export interface HomeSection {
  /** 섹션 ID */
  id: string;
  /** 섹션 타입 */
  type: SectionType;
  /** 섹션 제목 (선택사항) */
  title?: string;
  /** 섹션에 포함된 배너 아이템들 */
  items: BannerItem[];
  /** 정렬 순서 */
  order: number;
  /** 활성화 여부 */
  isActive: boolean;
}

/** 홈 컨텐츠 데이터 */
export interface HomeContentData {
  /** 페이지 제목 */
  pageTitle: string;
  /** 섹션 목록 */
  sections: HomeSection[];
  /** 마지막 업데이트 시간 */
  lastUpdated: string;
}
