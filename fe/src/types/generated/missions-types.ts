/**
 * @description Missions 관련 타입 정의
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

import type * as Schema from "./api-schema";

export interface TGETMissionsReq {
  sortBy?: "latest" | "popular";
  category?: string;
  excludeParticipated?: boolean;
}

export type TGETMissionsRes = {
  missions?: Schema.Mission[];
  totalCount?: number;
};

export interface TGETMissionsByIdReq {
  missionId: string;
}

export type TGETMissionsByIdRes = {
  mission?: Schema.Mission;
};

export interface TPOSTMissionsApplyByIdReq {
  missionId: string;
}

export type TPOSTMissionsApplyByIdRes = {
  missionId?: string;
  status?: string;
};

export interface TPOSTMissionsPostsByIdReq {
  missionId: string;
  data: {
    title?: string;
    content?: string;
    media?: string[];
    postType?: string;
  };
}

export type TPOSTMissionsPostsByIdRes = {
  missionId?: string;
  postId?: string;
  status?: string;
};

export type TGETMissionsCategoriesRes = {
  categories?: string[];
};

export interface TGETMissionsMeReq {
  limit?: number;
}

export type TGETMissionsMeRes = {
  missions?: {
    id?: string;
    missionNotionPageId?: string;
    missionTitle?: string;
    startedAt?: string;
  }[];
};
