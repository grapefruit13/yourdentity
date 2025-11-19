/**
 * @description 미션 API 응답을 UI 컴포넌트 형식으로 변환하는 유틸리티
 */

import type {
  MissionListItem,
  MissionResponse,
} from "@/types/mission/mission-types";

/**
 * @description API 응답의 미션 데이터를 MissionListCard 형식으로 변환
 * @param mission - API 응답의 미션 데이터
 * @returns MissionListCard에 전달할 형식의 미션 데이터
 */
export const transformMissionToListItem = (
  mission: MissionResponse
): MissionListItem => {
  return {
    id: mission.id,
    title: mission.title,
    categories: mission.categories || [],
    thumbnailUrl: "/imgs/mockup.jpg", // 기본 썸네일 (API 응답에 없음)
    likeCount: mission.reactionCount,
    createdAt:
      mission.createdAt || mission.updatedAt || new Date().toISOString(),
    isLiked: false, // API 응답에 없음
  };
};

/**
 * @description API 응답의 미션 목록을 MissionListCard 형식으로 변환
 * @param missions - API 응답의 미션 배열
 * @returns MissionListCard에 전달할 형식의 미션 배열
 */
export const transformMissionsToListItems = (
  missions: MissionResponse[]
): MissionListItem[] => {
  return missions.map(transformMissionToListItem);
};
