/**
 * @description 공통 목록 아이템 타입 정의
 */

/** 목록 아이템 기본 인터페이스 */
export interface BaseListItem {
  /** 아이템 ID */
  id: string;
  /** 제목 */
  title: string;
  /** 설명 */
  description: string;
  /** 썸네일 이미지 URL */
  thumbnailUrl: string;
  /** 상세 이미지 URL */
  detailImageUrl?: string;
  /** 상태 */
  status: string;
  /** 생성일 */
  createdAt: string;
  /** 업데이트일 */
  updatedAt: string;
  /** 태그 */
  tags: string[];
  /** 활성화 여부 */
  isActive: boolean;
}

/** 루틴 아이템 */
export interface RoutineItem extends BaseListItem {
  /** 난이도 */
  difficulty: string;
  /** 소요 시간 (분) */
  duration: number;
  /** 현재 참여자 수 */
  currentParticipants: number;
  /** 최대 참여자 수 */
  maxParticipants: number;
  /** 시작일 */
  startDate: string;
  /** 종료일 */
  endDate: string;
}

/** 모임 아이템 */
export interface GatheringItem extends BaseListItem {
  /** 모임 날짜 */
  meetingDate: string;
  /** 모임 시간 */
  meetingTime: string;
  /** 장소 */
  location: string;
  /** 현재 참여자 수 */
  currentParticipants: number;
  /** 최대 참여자 수 */
  maxParticipants: number;
}

/** TMI 프로젝트 아이템 */
export interface TmiItem extends BaseListItem {
  /** 프로젝트 타입 */
  projectType: string;
  /** 제출 마감일 */
  deadline: string;
  /** 참여자 수 */
  participants: number;
}

/** 공지사항 아이템 */
export interface AnnouncementItem extends BaseListItem {
  /** 작성자 */
  author: string;
  /** 조회수 */
  views: number;
  /** 중요 공지 여부 */
  isPinned: boolean;
}

/** 상품 아이템 */
export interface ProductItem extends BaseListItem {
  /** 가격 (나다움 포인트) */
  price: number;
  /** 재고 */
  stock: number;
  /** 카테고리 */
  category: string;
}
