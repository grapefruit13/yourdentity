import { RoutineItem } from "@/types/shared/list-content";

/**
 * @description 한끗루틴 Mock 데이터
 */
export const MOCK_ROUTINES: RoutineItem[] = [
  {
    id: "routine_1",
    title: "10분 마음챙김 명상",
    description:
      "하루 중 10분간 마음을 진정시키고 현재에 집중하는 명상 루틴입니다.",
    thumbnailUrl:
      "https://youthvoice.vake.io/files/G059CHCD9D/F4WUBCKMQ/_______.png",
    detailImageUrl: "",
    status: "진행중",
    difficulty: "쉬움",
    duration: 10,
    currentParticipants: 18,
    maxParticipants: 25,
    startDate: "2025-08-10",
    endDate: "2025-09-10",
    createdAt: "2025-07-25",
    updatedAt: "2025-08-05",
    tags: ["명상", "건강", "자기계발"],
    isActive: true,
  },
  {
    id: "routine_2",
    title: "아침 스트레칭 루틴",
    description: "매일 아침 15분간 몸을 깨우는 가벼운 스트레칭 루틴",
    thumbnailUrl:
      "https://youthvoice.vake.io/files/G059CHCD9D/F4WUBCKMQ/_______.png",
    detailImageUrl: "",
    status: "모집중",
    difficulty: "쉬움",
    duration: 15,
    currentParticipants: 5,
    maxParticipants: 20,
    startDate: "2025-02-01",
    endDate: "2025-02-28",
    createdAt: "2025-01-15",
    updatedAt: "2025-01-20",
    tags: ["스트레칭", "건강", "아침루틴"],
    isActive: true,
  },
  {
    id: "routine_3",
    title: "독서 습관 만들기",
    description: "매일 30분씩 책을 읽으며 독서 습관을 형성하는 루틴",
    thumbnailUrl:
      "https://youthvoice.vake.io/files/G059CHCD9D/F4WUBCKMQ/_______.png",
    detailImageUrl: "",
    status: "진행중",
    difficulty: "보통",
    duration: 30,
    currentParticipants: 12,
    maxParticipants: 15,
    startDate: "2025-01-15",
    endDate: "2025-02-15",
    createdAt: "2025-01-10",
    updatedAt: "2025-01-12",
    tags: ["독서", "자기계발", "습관"],
    isActive: true,
  },
];
