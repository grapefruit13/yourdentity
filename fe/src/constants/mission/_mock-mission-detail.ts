/**
 * @description 미션 상세 목 데이터
 */

export interface MockMissionDetail {
  id: string;
  title: string;
  thumbnailUrl: string;
  iconUrl?: string;
  applicationPeriod: string;
  certificationDeadline: string;
  targetAudience: string[];
  description: string;
  deadline: Date;
  isLiked: boolean;
}

/**
 * @description 미션 상세 목 데이터
 * @param missionId 미션 ID
 * @returns 미션 상세 데이터
 * TODO: 실제 API 연동 후 제거
 */
export const getMockMissionDetail = (missionId: string): MockMissionDetail => {
  // 인증 마감 시간: 현재 시간 + 5시간 30분
  const deadline = new Date();
  deadline.setHours(deadline.getHours() + 5);
  deadline.setMinutes(deadline.getMinutes() + 30);

  return {
    id: missionId,
    title: "건강한 아침 러닝 30분 하기",
    thumbnailUrl: "/imgs/mockup.jpg",
    iconUrl: undefined,
    applicationPeriod: "무제한",
    certificationDeadline: "매일 새벽 4시 59분",
    targetAudience: [
      "학교 밖 청소년, 자퇴 경험이 있는 청(소)년",
      "학교 밖을 고민하는 청소년 (14~24세 사이)",
    ],
    description: "건강한 아침 러닝 30분 하기",
    deadline,
    isLiked: false,
  };
};
