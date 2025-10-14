"use client";

import Link from "next/link";
import {
  HomeContentData,
  HomeSection,
  BannerItem,
} from "@/types/shared/home-content";

interface HomeContentProps {
  data: HomeContentData;
}

/**
 * @description 홈 컨텐츠 렌더링 컴포넌트
 */
export const HomeContent = ({ data }: HomeContentProps) => {
  // 섹션을 순서대로 정렬
  const sortedSections = [...data.sections]
    .filter((section) => section.isActive)
    .sort((a, b) => a.order - b.order);

  const renderBannerItem = (item: BannerItem) => {
    const ImageComponent = (
      <div className="overflow-hidden rounded-lg">
        <img
          src={item.imageUrl}
          alt={item.title || "배너 이미지"}
          className="h-auto w-full"
          loading="lazy"
        />
      </div>
    );

    // 링크가 없으면 이미지만 표시
    if (item.linkType === "none") {
      return <div key={item.id}>{ImageComponent}</div>;
    }

    // 내부 링크
    if (item.linkType === "internal") {
      return (
        <Link
          key={item.id}
          href={item.linkUrl}
          className="block transition-opacity hover:opacity-90"
        >
          {ImageComponent}
        </Link>
      );
    }

    // 외부 링크
    return (
      <a
        key={item.id}
        href={item.linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block transition-opacity hover:opacity-90"
      >
        {ImageComponent}
      </a>
    );
  };

  const renderSection = (section: HomeSection) => {
    const sortedItems = [...section.items]
      .filter((item) => item.isActive)
      .sort((a, b) => a.order - b.order);

    switch (section.type) {
      case "hero_banner":
        return (
          <section key={section.id} className="mb-4">
            {sortedItems.map((item) => renderBannerItem(item))}
          </section>
        );

      case "activity_banners":
        return (
          <section key={section.id} className="mb-4">
            <div className="grid grid-cols-2 gap-2">
              {sortedItems.map((item) => renderBannerItem(item))}
            </div>
          </section>
        );

      case "product_carousel":
        return (
          <section key={section.id} className="mb-4">
            <div className="overflow-x-auto">
              <div className="flex gap-3 pb-2">
                {sortedItems.map((item) => (
                  <div key={item.id} className="w-[280px] flex-shrink-0">
                    {renderBannerItem(item)}
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case "notice_banner":
      case "store_banner":
      case "exhibition_banners":
        return (
          <section key={section.id} className="mb-4">
            {sortedItems.map((item) => renderBannerItem(item))}
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[470px] px-4 py-4">
        {sortedSections.map(renderSection)}
      </div>
    </div>
  );
};
