import { ExtendedRecordMap } from "notion-types";

/**
 * @description Notion 홈 페이지 Mock 데이터
 * 기존 HomeContent와 유사한 구조로 Notion 형식으로 변환
 */
export const MOCK_NOTION_HOME: ExtendedRecordMap = {
  block: {
    // 페이지 블록
    "page-1": {
      value: {
        id: "page-1",
        type: "page",
        properties: {
          title: [["유스-잇 홈"]],
        },
        content: [
          "hero-banner",
          "activity-banners",
          "product-carousel",
          "notice-banner",
          "store-banner",
          "exhibition-banner",
        ],
        format: {},
        parent_id: "",
        parent_table: "block",
        alive: true,
        created_time: 1705123200000,
        last_edited_time: 1705123200000,
        created_by_table: "notion_user",
        created_by_id: "user-1",
        last_edited_by_table: "notion_user",
        last_edited_by_id: "user-1",
        space_id: "space-1",
      },
    },

    // 히어로 배너 섹션
    "hero-banner": {
      value: {
        id: "hero-banner",
        type: "collection_view",
        properties: {
          title: [["메인 배너 🎯"]],
        },
        content: ["hero-banner-view"],
        format: {},
        parent_id: "page-1",
        parent_table: "block",
        alive: true,
        created_time: 1705123200000,
        last_edited_time: 1705123200000,
        created_by_table: "notion_user",
        created_by_id: "user-1",
        last_edited_by_table: "notion_user",
        last_edited_by_id: "user-1",
        space_id: "space-1",
      },
    },

    // 활동 배너 섹션 (2단 그리드)
    "activity-banners": {
      value: {
        id: "activity-banners",
        type: "collection_view",
        properties: {
          title: [["활동 배너 📋"]],
        },
        content: ["activity-banners-view"],
        format: {},
        parent_id: "page-1",
        parent_table: "block",
        alive: true,
        created_time: 1705123200000,
        last_edited_time: 1705123200000,
        created_by_table: "notion_user",
        created_by_id: "user-1",
        last_edited_by_table: "notion_user",
        last_edited_by_id: "user-1",
        space_id: "space-1",
      },
    },

    // 상품 캐러셀 섹션
    "product-carousel": {
      value: {
        id: "product-carousel",
        type: "collection_view",
        properties: {
          title: [["나다움 상품 🎠"]],
        },
        content: ["product-carousel-view"],
        format: {},
        parent_id: "page-1",
        parent_table: "block",
        alive: true,
        created_time: 1705123200000,
        last_edited_time: 1705123200000,
        created_by_table: "notion_user",
        created_by_id: "user-1",
        last_edited_by_table: "notion_user",
        last_edited_by_id: "user-1",
        space_id: "space-1",
      },
    },

    // 공지사항 배너
    "notice-banner": {
      value: {
        id: "notice-banner",
        type: "collection_view",
        properties: {
          title: [["공지사항 🎯"]],
        },
        content: ["notice-banner-view"],
        format: {},
        parent_id: "page-1",
        parent_table: "block",
        alive: true,
        created_time: 1705123200000,
        last_edited_time: 1705123200000,
        created_by_table: "notion_user",
        created_by_id: "user-1",
        last_edited_by_table: "notion_user",
        last_edited_by_id: "user-1",
        space_id: "space-1",
      },
    },

    // 스토어 배너
    "store-banner": {
      value: {
        id: "store-banner",
        type: "collection_view",
        properties: {
          title: [["나다움 스토어 🎯"]],
        },
        content: ["store-banner-view"],
        format: {},
        parent_id: "page-1",
        parent_table: "block",
        alive: true,
        created_time: 1705123200000,
        last_edited_time: 1705123200000,
        created_by_table: "notion_user",
        created_by_id: "user-1",
        last_edited_by_table: "notion_user",
        last_edited_by_id: "user-1",
        space_id: "space-1",
      },
    },

    // 전시 배너
    "exhibition-banner": {
      value: {
        id: "exhibition-banner",
        type: "collection_view",
        properties: {
          title: [["TMI 프로젝트 전시장 🎯"]],
        },
        content: ["exhibition-banner-view"],
        format: {},
        parent_id: "page-1",
        parent_table: "block",
        alive: true,
        created_time: 1705123200000,
        last_edited_time: 1705123200000,
        created_by_table: "notion_user",
        created_by_id: "user-1",
        last_edited_by_table: "notion_user",
        last_edited_by_id: "user-1",
        space_id: "space-1",
      },
    },

    // 히어로 배너 아이템
    "hero-item-1": {
      value: {
        id: "hero-item-1",
        type: "page",
        properties: {
          title: [["한끗루틴"]],
          thumbnail: [
            [
              "https://youthvoice.vake.io/files/G059CHCD9D/FHTB9TJD7/_________________________.png",
            ],
          ],
          link: [["/routines"]],
        },
        content: [],
        format: {},
        parent_id: "hero-banner",
        parent_table: "block",
        alive: true,
        created_time: 1705123200000,
        last_edited_time: 1705123200000,
        created_by_table: "notion_user",
        created_by_id: "user-1",
        last_edited_by_table: "notion_user",
        last_edited_by_id: "user-1",
        space_id: "space-1",
      },
    },

    // 활동 배너 아이템들
    "activity-item-1": {
      value: {
        id: "activity-item-1",
        type: "page",
        properties: {
          title: [["월간소모임"]],
          thumbnail: [
            [
              "https://youthvoice.vake.io/files/G059CHCD9D/FOJRWWZ9X/frame_110.png",
            ],
          ],
          link: [["/gatherings"]],
        },
        content: [],
        format: {},
        parent_id: "activity-banners",
        parent_table: "block",
        alive: true,
        created_time: 1705123200000,
        last_edited_time: 1705123200000,
        created_by_table: "notion_user",
        created_by_id: "user-1",
        last_edited_by_table: "notion_user",
        last_edited_by_id: "user-1",
        space_id: "space-1",
      },
    },

    "activity-item-2": {
      value: {
        id: "activity-item-2",
        type: "page",
        properties: {
          title: [["TMI 프로젝트"]],
          thumbnail: [
            [
              "https://youthvoice.vake.io/files/G059CHCD9D/F1HNK1GZE/frame_111.png",
            ],
          ],
          link: [["/tmis"]],
        },
        content: [],
        format: {},
        parent_id: "activity-banners",
        parent_table: "block",
        alive: true,
        created_time: 1705123200000,
        last_edited_time: 1705123200000,
        created_by_table: "notion_user",
        created_by_id: "user-1",
        last_edited_by_table: "notion_user",
        last_edited_by_id: "user-1",
        space_id: "space-1",
      },
    },

    // 상품 캐러셀 아이템들
    "product-item-1": {
      value: {
        id: "product-item-1",
        type: "page",
        properties: {
          title: [["나다움 상품 1"]],
          thumbnail: [
            [
              "https://youthvoice.vake.io/files/G059CHCD9D/FFESZKHEI/10_________________________3.png",
            ],
          ],
          link: [["/products/CP:4BIT14N5D0W43"]],
        },
        content: [],
        format: {},
        parent_id: "product-carousel",
        parent_table: "block",
        alive: true,
        created_time: 1705123200000,
        last_edited_time: 1705123200000,
        created_by_table: "notion_user",
        created_by_id: "user-1",
        last_edited_by_table: "notion_user",
        last_edited_by_id: "user-1",
        space_id: "space-1",
      },
    },

    "product-item-2": {
      value: {
        id: "product-item-2",
        type: "page",
        properties: {
          title: [["나다움 상품 2"]],
          thumbnail: [
            [
              "https://youthvoice.vake.io/files/G059CHCD9D/F4IN2M41G/10______________________________.png",
            ],
          ],
          link: [["/products/CP:4BITHC4NB5HA7"]],
        },
        content: [],
        format: {},
        parent_id: "product-carousel",
        parent_table: "block",
        alive: true,
        created_time: 1705123200000,
        last_edited_time: 1705123200000,
        created_by_table: "notion_user",
        created_by_id: "user-1",
        last_edited_by_table: "notion_user",
        last_edited_by_id: "user-1",
        space_id: "space-1",
      },
    },

    "product-item-3": {
      value: {
        id: "product-item-3",
        type: "page",
        properties: {
          title: [["나다움 상품 3"]],
          thumbnail: [
            [
              "https://youthvoice.vake.io/files/G059CHCD9D/FHGIP1CNE/10_________________________1.png",
            ],
          ],
          link: [["/products/CP:4BINTRE3SRINP"]],
        },
        content: [],
        format: {},
        parent_id: "product-carousel",
        parent_table: "block",
        alive: true,
        created_time: 1705123200000,
        last_edited_time: 1705123200000,
        created_by_table: "notion_user",
        created_by_id: "user-1",
        last_edited_by_table: "notion_user",
        last_edited_by_id: "user-1",
        space_id: "space-1",
      },
    },

    "product-item-4": {
      value: {
        id: "product-item-4",
        type: "page",
        properties: {
          title: [["나다움 상품 4"]],
          thumbnail: [
            [
              "https://youthvoice.vake.io/files/G059CHCD9D/FUIEU7GQH/10_________________________2.png",
            ],
          ],
          link: [["/products/CP:4BISW96303AHL"]],
        },
        content: [],
        format: {},
        parent_id: "product-carousel",
        parent_table: "block",
        alive: true,
        created_time: 1705123200000,
        last_edited_time: 1705123200000,
        created_by_table: "notion_user",
        created_by_id: "user-1",
        last_edited_by_table: "notion_user",
        last_edited_by_id: "user-1",
        space_id: "space-1",
      },
    },

    // 공지사항 배너 아이템
    "notice-item-1": {
      value: {
        id: "notice-item-1",
        type: "page",
        properties: {
          title: [["공지사항"]],
          thumbnail: [
            [
              "https://youthvoice.vake.io/files/G059CHCD9D/F8287LRO5/_________.png",
            ],
          ],
          link: [["/announcements"]],
        },
        content: [],
        format: {},
        parent_id: "notice-banner",
        parent_table: "block",
        alive: true,
        created_time: 1705123200000,
        last_edited_time: 1705123200000,
        created_by_table: "notion_user",
        created_by_id: "user-1",
        last_edited_by_table: "notion_user",
        last_edited_by_id: "user-1",
        space_id: "space-1",
      },
    },

    // 스토어 배너 아이템
    "store-item-1": {
      value: {
        id: "store-item-1",
        type: "page",
        properties: {
          title: [["나다움 교환하기"]],
          thumbnail: [
            ["https://youthvoice.vake.io/files/G059CHCD9D/FD97Y733B/gift.png"],
          ],
          link: [["/products"]],
        },
        content: [],
        format: {},
        parent_id: "store-banner",
        parent_table: "block",
        alive: true,
        created_time: 1705123200000,
        last_edited_time: 1705123200000,
        created_by_table: "notion_user",
        created_by_id: "user-1",
        last_edited_by_table: "notion_user",
        last_edited_by_id: "user-1",
        space_id: "space-1",
      },
    },

    // 전시 배너 아이템
    "exhibition-item-1": {
      value: {
        id: "exhibition-item-1",
        type: "page",
        properties: {
          title: [["TMI 프로젝트 전시장"]],
          thumbnail: [
            [
              "https://youthvoice.vake.io/files/G059CHCD9D/FKL6PDLQF/tmi____.png",
            ],
          ],
          link: [["/tmis"]],
        },
        content: [],
        format: {},
        parent_id: "exhibition-banner",
        parent_table: "block",
        alive: true,
        created_time: 1705123200000,
        last_edited_time: 1705123200000,
        created_by_table: "notion_user",
        created_by_id: "user-1",
        last_edited_by_table: "notion_user",
        last_edited_by_id: "user-1",
        space_id: "space-1",
      },
    },
  },

  collection: {
    "hero-banner": {
      value: {
        id: "hero-banner",
        name: [["메인 배너 🎯"]],
        icon: "🎯",
        parent_id: "page-1",
        parent_table: "block",
        alive: true,
        schema: {
          title: { name: "title", type: "title" },
          thumbnail: { name: "thumbnail", type: "file" },
          link: { name: "link", type: "url" },
        },
        created_time: 1705123200000,
        last_edited_time: 1705123200000,
        created_by_table: "notion_user",
        created_by_id: "user-1",
        last_edited_by_table: "notion_user",
        last_edited_by_id: "user-1",
        space_id: "space-1",
      },
    },

    "activity-banners": {
      value: {
        id: "activity-banners",
        name: [["활동 배너 📋"]],
        icon: "📋",
        parent_id: "page-1",
        parent_table: "block",
        alive: true,
        schema: {
          title: { name: "title", type: "title" },
          thumbnail: { name: "thumbnail", type: "file" },
          link: { name: "link", type: "url" },
        },
        created_time: 1705123200000,
        last_edited_time: 1705123200000,
        created_by_table: "notion_user",
        created_by_id: "user-1",
        last_edited_by_table: "notion_user",
        last_edited_by_id: "user-1",
        space_id: "space-1",
      },
    },

    "product-carousel": {
      value: {
        id: "product-carousel",
        name: [["나다움 상품 🎠"]],
        icon: "🎠",
        parent_id: "page-1",
        parent_table: "block",
        alive: true,
        schema: {
          title: { name: "title", type: "title" },
          thumbnail: { name: "thumbnail", type: "file" },
          link: { name: "link", type: "url" },
        },
        created_time: 1705123200000,
        last_edited_time: 1705123200000,
        created_by_table: "notion_user",
        created_by_id: "user-1",
        last_edited_by_table: "notion_user",
        last_edited_by_id: "user-1",
        space_id: "space-1",
      },
    },

    "notice-banner": {
      value: {
        id: "notice-banner",
        name: [["공지사항 🎯"]],
        icon: "🎯",
        parent_id: "page-1",
        parent_table: "block",
        alive: true,
        schema: {
          title: { name: "title", type: "title" },
          thumbnail: { name: "thumbnail", type: "file" },
          link: { name: "link", type: "url" },
        },
        created_time: 1705123200000,
        last_edited_time: 1705123200000,
        created_by_table: "notion_user",
        created_by_id: "user-1",
        last_edited_by_table: "notion_user",
        last_edited_by_id: "user-1",
        space_id: "space-1",
      },
    },

    "store-banner": {
      value: {
        id: "store-banner",
        name: [["나다움 스토어 🎯"]],
        icon: "🎯",
        parent_id: "page-1",
        parent_table: "block",
        alive: true,
        schema: {
          title: { name: "title", type: "title" },
          thumbnail: { name: "thumbnail", type: "file" },
          link: { name: "link", type: "url" },
        },
        created_time: 1705123200000,
        last_edited_time: 1705123200000,
        created_by_table: "notion_user",
        created_by_id: "user-1",
        last_edited_by_table: "notion_user",
        last_edited_by_id: "user-1",
        space_id: "space-1",
      },
    },

    "exhibition-banner": {
      value: {
        id: "exhibition-banner",
        name: [["TMI 프로젝트 전시장 🎯"]],
        icon: "🎯",
        parent_id: "page-1",
        parent_table: "block",
        alive: true,
        schema: {
          title: { name: "title", type: "title" },
          thumbnail: { name: "thumbnail", type: "file" },
          link: { name: "link", type: "url" },
        },
        created_time: 1705123200000,
        last_edited_time: 1705123200000,
        created_by_table: "notion_user",
        created_by_id: "user-1",
        last_edited_by_table: "notion_user",
        last_edited_by_id: "user-1",
        space_id: "space-1",
      },
    },
  },

  collection_view: {
    "hero-banner-view": {
      value: {
        id: "hero-banner-view",
        type: "table",
        name: "Default",
        parent_id: "hero-banner",
        parent_table: "collection",
        alive: true,
        page_sort: ["hero-item-1"],
        query: {},
        format: {},
        created_time: 1705123200000,
        last_edited_time: 1705123200000,
        created_by_table: "notion_user",
        created_by_id: "user-1",
        last_edited_by_table: "notion_user",
        last_edited_by_id: "user-1",
        space_id: "space-1",
      },
    },

    "activity-banners-view": {
      value: {
        id: "activity-banners-view",
        type: "table",
        name: "Default",
        parent_id: "activity-banners",
        parent_table: "collection",
        alive: true,
        page_sort: ["activity-item-1", "activity-item-2"],
        query: {},
        format: {},
        created_time: 1705123200000,
        last_edited_time: 1705123200000,
        created_by_table: "notion_user",
        created_by_id: "user-1",
        last_edited_by_table: "notion_user",
        last_edited_by_id: "user-1",
        space_id: "space-1",
      },
    },

    "product-carousel-view": {
      value: {
        id: "product-carousel-view",
        type: "table",
        name: "Default",
        parent_id: "product-carousel",
        parent_table: "collection",
        alive: true,
        page_sort: [
          "product-item-1",
          "product-item-2",
          "product-item-3",
          "product-item-4",
        ],
        query: {},
        format: {},
        created_time: 1705123200000,
        last_edited_time: 1705123200000,
        created_by_table: "notion_user",
        created_by_id: "user-1",
        last_edited_by_table: "notion_user",
        last_edited_by_id: "user-1",
        space_id: "space-1",
      },
    },

    "notice-banner-view": {
      value: {
        id: "notice-banner-view",
        type: "table",
        name: "Default",
        parent_id: "notice-banner",
        parent_table: "collection",
        alive: true,
        page_sort: ["notice-item-1"],
        query: {},
        format: {},
        created_time: 1705123200000,
        last_edited_time: 1705123200000,
        created_by_table: "notion_user",
        created_by_id: "user-1",
        last_edited_by_table: "notion_user",
        last_edited_by_id: "user-1",
        space_id: "space-1",
      },
    },

    "store-banner-view": {
      value: {
        id: "store-banner-view",
        type: "table",
        name: "Default",
        parent_id: "store-banner",
        parent_table: "collection",
        alive: true,
        page_sort: ["store-item-1"],
        query: {},
        format: {},
        created_time: 1705123200000,
        last_edited_time: 1705123200000,
        created_by_table: "notion_user",
        created_by_id: "user-1",
        last_edited_by_table: "notion_user",
        last_edited_by_id: "user-1",
        space_id: "space-1",
      },
    },

    "exhibition-banner-view": {
      value: {
        id: "exhibition-banner-view",
        type: "table",
        name: "Default",
        parent_id: "exhibition-banner",
        parent_table: "collection",
        alive: true,
        page_sort: ["exhibition-item-1"],
        query: {},
        format: {},
        created_time: 1705123200000,
        last_edited_time: 1705123200000,
        created_by_table: "notion_user",
        created_by_id: "user-1",
        last_edited_by_table: "notion_user",
        last_edited_by_id: "user-1",
        space_id: "space-1",
      },
    },
  },

  notion_user: {
    "user-1": {
      value: {
        id: "user-1",
        given_name: "Admin",
        family_name: "User",
        email: "admin@example.com",
        profile_photo: "",
        onboarding_completed: true,
        mobile_onboarding_completed: true,
        created_time: 1705123200000,
        last_edited_time: 1705123200000,
        created_by_table: "notion_user",
        created_by_id: "user-1",
        last_edited_by_table: "notion_user",
        last_edited_by_id: "user-1",
        space_id: "space-1",
      },
    },
  },

  space: {
    "space-1": {
      value: {
        id: "space-1",
        name: "유스-잇",
        domain: "youth-identity",
        created_time: 1705123200000,
        last_edited_time: 1705123200000,
        created_by_table: "notion_user",
        created_by_id: "user-1",
        last_edited_by_table: "notion_user",
        last_edited_by_id: "user-1",
      },
    },
  },

  preview_images: {},
  signed_urls: {},
};
