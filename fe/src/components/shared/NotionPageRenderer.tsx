"use client";

import { useMemo } from "react";
import type { ExtendedRecordMap } from "@/types/shared/notion-extended-record-map";
import type {
  NotionBlock,
  NotionCollection,
  NotionCollectionView,
  CollectionItemData,
} from "@/types/shared/notion-renderer";
import {
  getCollectionLayoutType,
  extractCollectionName,
  extractCollectionIcon,
  extractPageData,
} from "@/utils/shared/notion-renderer-helpers";
import { CollectionCarousel, CollectionGrid, CollectionBanner } from "./notion";

interface NotionPageRendererProps {
  recordMap: ExtendedRecordMap;
  className?: string;
}

/**
 * @description Notion 페이지를 렌더링하는 공통 컴포넌트
 * Collection 타입에 따라 적절한 레이아웃으로 렌더링
 */
export const NotionPageRenderer = ({
  recordMap,
  className = "",
}: NotionPageRendererProps) => {
  // 페이지 블록 찾기
  const pageBlock = useMemo(() => {
    if (!recordMap?.block) return undefined;
    return Object.values(recordMap.block).find(
      (block) => block?.value?.type === "page"
    ) as NotionBlock | undefined;
  }, [recordMap]);

  // recordMap 유효성 검증
  if (!recordMap?.block) {
    return (
      <div className={className}>
        <p className="text-center text-gray-500">
          페이지를 불러올 수 없습니다.
        </p>
      </div>
    );
  }

  const collectionBlockIds = pageBlock?.value?.content || [];

  /**
   * @description Collection 아이템 데이터 추출
   */
  const extractCollectionItems = (pageIds: string[]): CollectionItemData[] => {
    return pageIds
      .map((pageId) => {
        const page = recordMap.block[pageId] as unknown as
          | NotionBlock
          | undefined;
        return extractPageData(page);
      })
      .filter((item): item is CollectionItemData => item !== null);
  };

  /**
   * @description Collection 렌더링
   */
  const renderCollection = (blockId: string) => {
    const block = recordMap.block[blockId] as unknown as
      | NotionBlock
      | undefined;

    // Collection View 블록이 아니면 스킵
    if (!block || block.value.type !== "collection_view") {
      return null;
    }

    // Collection 데이터 가져오기
    const collectionId =
      block.value.collection_id || blockId.replace("-view", "");
    const collection = recordMap.collection?.[collectionId] as unknown as
      | NotionCollection
      | undefined;
    const viewId = block.value.content?.[0] || `${blockId}-view`;
    const collectionView = recordMap.collection_view?.[viewId] as unknown as
      | NotionCollectionView
      | undefined;

    // 필수 데이터 검증
    if (!collection || !collectionView) {
      return null;
    }

    // Collection 메타데이터 추출
    const collectionName = extractCollectionName(collection);
    const collectionIcon = extractCollectionIcon(collection);
    const pageIds = collectionView.value?.page_sort || [];

    // 페이지 ID가 없으면 스킵
    if (!Array.isArray(pageIds) || pageIds.length === 0) {
      return null;
    }

    // 아이템 데이터 추출
    const items = extractCollectionItems(pageIds);

    // 아이템이 없으면 스킵
    if (items.length === 0) {
      return null;
    }

    // 레이아웃 타입에 따라 렌더링
    const layoutType = getCollectionLayoutType(collectionIcon, collectionName);

    switch (layoutType) {
      case "carousel":
        return <CollectionCarousel key={blockId} items={items} />;
      case "grid":
        return <CollectionGrid key={blockId} items={items} />;
      case "banner":
        return <CollectionBanner key={blockId} items={items} />;
      default:
        return null;
    }
  };

  return (
    <div className={className}>{collectionBlockIds.map(renderCollection)}</div>
  );
};
