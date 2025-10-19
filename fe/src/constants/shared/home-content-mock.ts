import { HomeContentData } from "@/types/shared/home-content";

/**
 * @description 홈 화면 Mock 데이터
 * 베이크 사이트(https://youthvoice.vake.io/views/I1SP0OP4M)의 구조를 기반으로 작성
 */
export const MOCK_HOME_CONTENT: HomeContentData = {
  pageTitle: "유스-잇 홈",
  lastUpdated: "2025-01-13T00:00:00Z",
  sections: [
    {
      id: "hero_banner",
      type: "hero_banner",
      title: "메인 배너",
      order: 1,
      isActive: true,
      items: [
        {
          id: "hero_1",
          type: "hero",
          imageUrl:
            "https://youthvoice.vake.io/files/G059CHCD9D/FHTB9TJD7/_________________________.png",
          linkType: "internal",
          linkUrl: "/routines",
          title: "한끗루틴",
          description: "작은 습관으로 성장하는 15일간의 여정",
          order: 1,
          isActive: true,
        },
      ],
    },
    {
      id: "activity_banners",
      type: "activity_banners",
      title: "활동 배너",
      order: 2,
      isActive: true,
      items: [
        {
          id: "activity_1",
          type: "half",
          imageUrl:
            "https://youthvoice.vake.io/files/G059CHCD9D/FOJRWWZ9X/frame_110.png",
          linkType: "internal",
          linkUrl: "/gatherings",
          title: "월간소모임",
          order: 1,
          isActive: true,
        },
        {
          id: "activity_2",
          type: "half",
          imageUrl:
            "https://youthvoice.vake.io/files/G059CHCD9D/F1HNK1GZE/frame_111.png",
          linkType: "internal",
          linkUrl: "/tmis",
          title: "TMI 프로젝트",
          order: 2,
          isActive: true,
        },
      ],
    },
    {
      id: "product_carousel",
      type: "product_carousel",
      title: "나다움 상품",
      order: 3,
      isActive: true,
      items: [
        {
          id: "product_1",
          type: "carousel_item",
          imageUrl:
            "https://youthvoice.vake.io/files/G059CHCD9D/FFESZKHEI/10_________________________3.png",
          linkType: "internal",
          linkUrl: "/products/CP:4BIT14N5D0W43",
          title: "나다움 상품 1",
          order: 1,
          isActive: true,
        },
        {
          id: "product_2",
          type: "carousel_item",
          imageUrl:
            "https://youthvoice.vake.io/files/G059CHCD9D/F4IN2M41G/10______________________________.png",
          linkType: "internal",
          linkUrl: "/products/CP:4BITHC4NB5HA7",
          title: "나다움 상품 2",
          order: 2,
          isActive: true,
        },
        {
          id: "product_3",
          type: "carousel_item",
          imageUrl:
            "https://youthvoice.vake.io/files/G059CHCD9D/FHGIP1CNE/10_________________________1.png",
          linkType: "internal",
          linkUrl: "/products/CP:4BINTRE3SRINP",
          title: "나다움 상품 3",
          order: 3,
          isActive: true,
        },
        {
          id: "product_4",
          type: "carousel_item",
          imageUrl:
            "https://youthvoice.vake.io/files/G059CHCD9D/FUIEU7GQH/10_________________________2.png",
          linkType: "internal",
          linkUrl: "/products/CP:4BISW96303AHL",
          title: "나다움 상품 4",
          order: 4,
          isActive: true,
        },
      ],
    },
    {
      id: "notice_banner",
      type: "notice_banner",
      title: "공지사항",
      order: 4,
      isActive: true,
      items: [
        {
          id: "notice_1",
          type: "full",
          imageUrl:
            "https://youthvoice.vake.io/files/G059CHCD9D/F8287LRO5/_________.png",
          linkType: "internal",
          linkUrl: "/announcements",
          title: "공지사항",
          order: 1,
          isActive: true,
        },
      ],
    },
    {
      id: "store_banner",
      type: "store_banner",
      title: "나다움 스토어",
      order: 5,
      isActive: true,
      items: [
        {
          id: "store_1",
          type: "full",
          imageUrl:
            "https://youthvoice.vake.io/files/G059CHCD9D/FD97Y733B/gift.png",
          linkType: "internal",
          linkUrl: "/products",
          title: "나다움 교환하기",
          order: 1,
          isActive: true,
        },
      ],
    },
    {
      id: "exhibition_banners",
      type: "exhibition_banners",
      title: "나다움 전시장",
      order: 6,
      isActive: true,
      items: [
        {
          id: "exhibition_1",
          type: "full",
          imageUrl:
            "https://youthvoice.vake.io/files/G059CHCD9D/FKL6PDLQF/tmi____.png",
          linkType: "internal",
          linkUrl: "/tmis",
          title: "TMI 프로젝트 전시장",
          order: 1,
          isActive: true,
        },
      ],
    },
  ],
};
