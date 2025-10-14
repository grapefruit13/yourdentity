import { TmiItem } from "@/types/shared/list-content";

/**
 * @description TMI 프로젝트 Mock 데이터
 */
export const MOCK_TMIS: TmiItem[] = [
  {
    id: "tmi_1",
    title: "나의 2025년 목표 공유하기",
    description: "2025년 나의 목표와 계획을 공유하는 프로젝트",
    thumbnailUrl:
      "https://youthvoice.vake.io/files/G059CHCD9D/F1HNK1GZE/frame_111.png",
    detailImageUrl: "",
    status: "진행중",
    projectType: "목표 공유",
    deadline: "2025-02-28",
    participants: 45,
    createdAt: "2025-01-01",
    updatedAt: "2025-01-15",
    tags: ["목표", "2025", "공유"],
    isActive: true,
  },
  {
    id: "tmi_2",
    title: "나만의 습관 만들기 챌린지",
    description: "21일간 나만의 습관을 만들고 과정을 공유하는 프로젝트",
    thumbnailUrl:
      "https://youthvoice.vake.io/files/G059CHCD9D/F1HNK1GZE/frame_111.png",
    detailImageUrl: "",
    status: "모집중",
    projectType: "챌린지",
    deadline: "2025-02-15",
    participants: 23,
    createdAt: "2025-01-10",
    updatedAt: "2025-01-20",
    tags: ["습관", "챌린지", "21일"],
    isActive: true,
  },
];
