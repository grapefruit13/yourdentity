/**
 * @description Notion 페이지 데이터 타입
 */
export interface NotionPageData {
  title: string;
  description: string;
  status: string;
  category: string;
  difficulty: string;
  duration: number;
  currentParticipants: number;
  maxParticipants: number;
  startDate: string;
  endDate: string;
  applicationStartDate: string;
  applicationEndDate: string;
  tags: string[];
  mainImage: string;
  detailImage: string;
  allowDuplicate: boolean;
  adminNote: string;
}

/**
 * @description Mock 데이터 (네트워크 실패시 기본값)
 */
export const MOCK_NOTION_PAGE_DATA: NotionPageData = {
  title: "10분 마음챙김 명상",
  description:
    "하루 중 10분간 마음을 진정시키고 현재에 집중하는 명상 루틴입니다. 스트레스 감소와 정신적 안정에 효과적입니다.",
  status: "활동중",
  category: "마음관리",
  difficulty: "쉬움",
  duration: 10,
  currentParticipants: 18,
  maxParticipants: 25,
  startDate: "2025-08-10",
  endDate: "2025-09-10",
  applicationStartDate: "2025-07-25",
  applicationEndDate: "2025-08-09",
  tags: ["명상", "건강", "자기계발"],
  mainImage:
    "https://www.notion.so/image/attachment%3A87d35aec-8b4f-48b6-a548-778558cc150d?table=block&id=24c57e70-513b-80b2-841b-e46788864276&cache=v2",
  detailImage:
    "https://www.notion.so/image/attachment%3A3a578cd2-1329-4528-89a1-142822536df2?table=block&id=24c57e70-513b-80b2-841b-e46788864276&cache=v2",
  allowDuplicate: true,
  adminNote: "초보자용 가이드 음성 추가 필요",
};
