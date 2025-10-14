/**
 * @description Notion Property 매핑 상수
 * Notion API의 property 이름을 애플리케이션 데이터 키로 매핑
 */

export type PropertyType = "text" | "number" | "checkbox" | "tags" | "image";

export interface PropertyMapping {
  /** 애플리케이션에서 사용할 키 */
  key: keyof import("@/types/shared/notion").NotionPageData;
  /** Notion에서 사용하는 property 이름 */
  notionKey: string;
  /** Property 타입 */
  type: PropertyType;
  /** 기본값 (optional) */
  defaultValue?: unknown;
}

/**
 * @description Notion Property 매핑 설정
 * 새로운 필드를 추가하거나 Notion property 이름이 변경될 때 여기만 수정하면 됩니다.
 */
export const NOTION_PROPERTY_MAPPINGS: PropertyMapping[] = [
  {
    key: "title",
    notionKey: "title",
    type: "text",
    defaultValue: "",
  },
  {
    key: "description",
    notionKey: "루틴 설명",
    type: "text",
    defaultValue: "",
  },
  {
    key: "status",
    notionKey: "루틴상태",
    type: "text",
    defaultValue: "",
  },
  {
    key: "category",
    notionKey: "카테고리333",
    type: "text",
    defaultValue: "",
  },
  {
    key: "difficulty",
    notionKey: "난이도",
    type: "text",
    defaultValue: "",
  },
  {
    key: "duration",
    notionKey: "소요 시간",
    type: "number",
    defaultValue: 0,
  },
  {
    key: "currentParticipants",
    notionKey: "현재인원",
    type: "number",
    defaultValue: 0,
  },
  {
    key: "maxParticipants",
    notionKey: "모집인원",
    type: "number",
    defaultValue: 0,
  },
  {
    key: "startDate",
    notionKey: "활동시작일",
    type: "text",
    defaultValue: "",
  },
  {
    key: "endDate",
    notionKey: "활동종료일",
    type: "text",
    defaultValue: "",
  },
  {
    key: "applicationStartDate",
    notionKey: "신청시작일",
    type: "text",
    defaultValue: "",
  },
  {
    key: "applicationEndDate",
    notionKey: "신청종료일",
    type: "text",
    defaultValue: "",
  },
  {
    key: "tags",
    notionKey: "태그",
    type: "tags",
    defaultValue: [],
  },
  {
    key: "mainImage",
    notionKey: "대표 이미지",
    type: "image",
    defaultValue: "",
  },
  {
    key: "detailImage",
    notionKey: "상세 소개 이미지",
    type: "image",
    defaultValue: "",
  },
  {
    key: "allowDuplicate",
    notionKey: "중복참여여부",
    type: "checkbox",
    defaultValue: false,
  },
  {
    key: "adminNote",
    notionKey: "관리자 메모",
    type: "text",
    defaultValue: "",
  },
];
