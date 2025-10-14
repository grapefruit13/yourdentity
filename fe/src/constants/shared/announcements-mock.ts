import { AnnouncementItem } from "@/types/shared/list-content";

/**
 * @description 공지사항 Mock 데이터
 */
export const MOCK_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: "announcement_1",
    title: "🍀 유스-잇 커뮤니티 안내",
    description: "유스-잇 커뮤니티 이용 가이드 및 규칙 안내",
    thumbnailUrl:
      "https://youthvoice.vake.io/files/G059CHCD9D/F8287LRO5/_________.png",
    detailImageUrl: "",
    status: "게시중",
    author: "운영팀",
    views: 1523,
    isPinned: true,
    createdAt: "2024-12-01",
    updatedAt: "2025-01-10",
    tags: ["공지", "가이드"],
    isActive: true,
  },
  {
    id: "announcement_2",
    title: "11월, 12월 한끗루틴 끗짱을 모집합니다!",
    description:
      "한끗루틴 리더를 모집합니다. 함께 성장할 분들의 많은 참여 부탁드립니다.",
    thumbnailUrl:
      "https://youthvoice.vake.io/files/G059CHCD9D/F8287LRO5/_________.png",
    detailImageUrl: "",
    status: "게시중",
    author: "운영팀",
    views: 892,
    isPinned: true,
    createdAt: "2024-10-25",
    updatedAt: "2024-10-25",
    tags: ["모집", "한끗루틴"],
    isActive: true,
  },
  {
    id: "announcement_3",
    title: "유스-잇 리워드 <나다움> 안내",
    description: "나다움 포인트 적립 및 사용 방법 안내",
    thumbnailUrl:
      "https://youthvoice.vake.io/files/G059CHCD9D/F8287LRO5/_________.png",
    detailImageUrl: "",
    status: "게시중",
    author: "운영팀",
    views: 2145,
    isPinned: false,
    createdAt: "2024-11-15",
    updatedAt: "2024-12-01",
    tags: ["리워드", "나다움"],
    isActive: true,
  },
];
