/**
 * @description 홈 컨텐츠 Notion Property 매핑 상수
 * Notion 데이터베이스의 property를 HomeContentData로 변환하기 위한 매핑
 */

export type HomeContentPropertyType =
  | "text"
  | "select"
  | "number"
  | "checkbox"
  | "url"
  | "image";

export interface HomeContentPropertyMapping {
  /** 애플리케이션에서 사용할 키 */
  key: string;
  /** Notion에서 사용하는 property 이름 */
  notionKey: string;
  /** Property 타입 */
  type: HomeContentPropertyType;
  /** 기본값 (optional) */
  defaultValue?: unknown;
}

/**
 * @description Notion Property 매핑 설정 (홈 컨텐츠용)
 */
export const HOME_CONTENT_PROPERTY_MAPPINGS: HomeContentPropertyMapping[] = [
  // 섹션 정보
  {
    key: "sectionId",
    notionKey: "섹션ID",
    type: "text",
    defaultValue: "",
  },
  {
    key: "sectionType",
    notionKey: "섹션타입",
    type: "select",
    defaultValue: "",
  },
  {
    key: "sectionTitle",
    notionKey: "섹션제목",
    type: "text",
    defaultValue: "",
  },
  {
    key: "sectionOrder",
    notionKey: "섹션순서",
    type: "number",
    defaultValue: 0,
  },
  {
    key: "sectionActive",
    notionKey: "섹션활성화",
    type: "checkbox",
    defaultValue: true,
  },

  // 배너 아이템 정보
  {
    key: "bannerId",
    notionKey: "배너ID",
    type: "text",
    defaultValue: "",
  },
  {
    key: "bannerType",
    notionKey: "배너타입",
    type: "select",
    defaultValue: "full",
  },
  {
    key: "imageUrl",
    notionKey: "이미지",
    type: "image",
    defaultValue: "",
  },
  {
    key: "linkType",
    notionKey: "링크타입",
    type: "select",
    defaultValue: "internal",
  },
  {
    key: "linkUrl",
    notionKey: "링크URL",
    type: "text",
    defaultValue: "",
  },
  {
    key: "title",
    notionKey: "title",
    type: "text",
    defaultValue: "",
  },
  {
    key: "description",
    notionKey: "설명",
    type: "text",
    defaultValue: "",
  },
  {
    key: "order",
    notionKey: "순서",
    type: "number",
    defaultValue: 0,
  },
  {
    key: "isActive",
    notionKey: "활성화",
    type: "checkbox",
    defaultValue: true,
  },
];

/**
 * @description Notion 섹션 타입 매핑
 */
export const SECTION_TYPE_MAPPING: Record<string, string> = {
  hero_banner: "메인배너",
  activity_banners: "활동배너",
  product_carousel: "상품캐러셀",
  notice_banner: "공지배너",
  store_banner: "스토어배너",
  exhibition_banners: "전시장배너",
};

/**
 * @description Notion 배너 타입 매핑
 */
export const BANNER_TYPE_MAPPING: Record<string, string> = {
  hero: "히어로",
  half: "절반",
  full: "전체",
  carousel_item: "캐러셀아이템",
};

/**
 * @description Notion 링크 타입 매핑
 */
export const LINK_TYPE_MAPPING: Record<string, string> = {
  internal: "내부링크",
  external: "외부링크",
  none: "없음",
};
