import { ExtendedRecordMap } from "notion-types";

/**
 * @description 간단한 Notion 홈 페이지 Mock 데이터
 * 기본적인 구조만으로 테스트
 */
export const MOCK_NOTION_HOME_SIMPLE: ExtendedRecordMap = {
  block: {
    "page-1": {
      value: {
        id: "page-1",
        type: "page",
        properties: {
          title: [["유스-잇 홈"]],
        },
        content: ["hero-banner"],
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
