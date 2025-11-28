"use client";

import { useEffect, useRef } from "react";

interface CommunityInfiniteScrollTriggerProps {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  rootMargin?: string;
}

/**
 * @description 커뮤니티 페이지 무한 스크롤 트리거 컴포넌트
 * - IntersectionObserver를 사용하여 스크롤 감지
 */
const CommunityInfiniteScrollTrigger = ({
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  rootMargin = "120px",
}: CommunityInfiniteScrollTriggerProps) => {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          onLoadMore();
        }
      },
      {
        rootMargin,
      }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, onLoadMore, rootMargin]);

  return <div ref={loadMoreRef} aria-hidden="true" className="h-6 w-full" />;
};

export default CommunityInfiniteScrollTrigger;
