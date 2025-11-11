/**
 * @description 활동 신청 폼 데이터 타입
 */
export interface ActivityApplicationFormData {
  canAttendEvents: boolean;
  nickname: string;
  phoneNumber: string;
  region: {
    city: string;
    district: string;
  } | null;
  currentSituation: string;
  applicationSource: string;
  applicationMotivation: string;
  customMotivation: string;
  agreedToTerms: boolean;
}

/**
 * @description 활동 신청 단계 타입
 */
export type ActivityApplicationStep =
  | "schedule-confirm"
  | "nickname"
  | "phone"
  | "region"
  | "situation"
  | "source"
  | "motivation"
  | "review"
  | "terms"
  | "complete";
