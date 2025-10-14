/**
 * @description Notion Block 타입
 */
export interface NotionBlock {
  value: {
    id: string;
    type: string;
    properties?: Record<string, string[][]>;
    content?: string[];
    collection_id?: string;
    [key: string]: unknown;
  };
}

/**
 * @description Notion Collection 타입
 */
export interface NotionCollection {
  value: {
    id: string;
    name?: string[][];
    icon?: string;
    [key: string]: unknown;
  };
}

/**
 * @description Notion Collection View 타입
 */
export interface NotionCollectionView {
  value: {
    id: string;
    page_sort?: string[];
    [key: string]: unknown;
  };
}

/**
 * @description Collection 레이아웃 타입
 */
export type CollectionLayoutType = "carousel" | "grid" | "banner" | "default";

/**
 * @description Collection 아이템 데이터
 */
export interface CollectionItemData {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
}
