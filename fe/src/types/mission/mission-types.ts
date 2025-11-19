/**
 * @description 미션 관련 타입 정의
 * TODO: 백엔드 schema 추가되면 삭제
 */

/**
 * @description API 응답의 미션 데이터 타입
 */
export type MissionResponse = {
  id: string;
  title: string;
  detailPageUrl: string | null;
  isRecruiting: boolean;
  isUnlimited: boolean;
  applicationDeadline: string | null;
  certificationDeadline: string | null;
  categories: string[];
  detailTags: string;
  targetAudience: string;
  notes: string;
  certificationMethod: string;
  reactionCount: number;
  faqRelation: {
    relations: Array<{ id: string }>;
    has_more: boolean;
  };
  isReviewRegistered: boolean;
  createdAt: string;
  updatedAt: string;
};

/**
 * @description UI 컴포넌트에 전달할 미션 목록 아이템 타입
 */
export type MissionListItem = {
  id: string;
  title: string;
  categories: string[];
  thumbnailUrl: string;
  likeCount: number;
  createdAt: string | Date;
  isLiked: boolean;
};
