import { GatheringItem } from "@/types/shared/list-content";

/**
 * @description 월간소모임 Mock 데이터
 */
export const MOCK_GATHERINGS: GatheringItem[] = [
  {
    id: "gathering_1",
    title: "2월 독서 모임",
    description: "이달의 책을 함께 읽고 이야기를 나누는 독서 모임",
    thumbnailUrl:
      "https://youthvoice.vake.io/files/G059CHCD9D/FOJRWWZ9X/frame_110.png",
    detailImageUrl: "",
    status: "모집중",
    meetingDate: "2025-02-15",
    meetingTime: "14:00",
    location: "온라인 (Zoom)",
    currentParticipants: 8,
    maxParticipants: 15,
    createdAt: "2025-01-20",
    updatedAt: "2025-01-25",
    tags: ["독서", "소통", "온라인"],
    isActive: true,
  },
  {
    id: "gathering_2",
    title: "1월 요가 모임",
    description: "함께 요가를 하며 건강한 몸과 마음을 만드는 모임",
    thumbnailUrl:
      "https://youthvoice.vake.io/files/G059CHCD9D/FOJRWWZ9X/frame_110.png",
    detailImageUrl: "",
    status: "완료",
    meetingDate: "2025-01-20",
    meetingTime: "10:00",
    location: "오프라인 (서울)",
    currentParticipants: 10,
    maxParticipants: 10,
    createdAt: "2024-12-25",
    updatedAt: "2025-01-21",
    tags: ["요가", "건강", "오프라인"],
    isActive: true,
  },
];
