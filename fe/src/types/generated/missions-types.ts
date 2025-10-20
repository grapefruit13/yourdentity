/**
 * @description Missions 관련 타입 정의
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import type * as Schema from "./api-schema";

export interface TPOSTUsersMissionsByIdReq {
  userId: string;
  data: {
    missionId: string;
    status?: "ONGOING" | "COMPLETED" | "EXPIRED" | "RETRY";
  };
}

export type TPOSTUsersMissionsByIdRes = any;

export interface TGETUsersMissionsByIdReq {
  userId: string;
  status?: "ONGOING" | "COMPLETED" | "EXPIRED" | "RETRY";
}

export type TGETUsersMissionsByIdRes = any;

export interface TGETUsersMissionsByTwoIdsReq {
  userId: string;
  missionId: string;
}

export type TGETUsersMissionsByTwoIdsRes = any;

export interface TPUTUsersMissionsByTwoIdsReq {
  userId: string;
  missionId: string;
  data: {
    status?: "ONGOING" | "COMPLETED" | "EXPIRED" | "RETRY";
    certified?: boolean;
    review?: string;
  };
}

export type TPUTUsersMissionsByTwoIdsRes = any;

export interface TDELETEUsersMissionsByTwoIdsReq {
  userId: string;
  missionId: string;
}

export type TDELETEUsersMissionsByTwoIdsRes = any;
