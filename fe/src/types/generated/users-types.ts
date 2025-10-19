/**
 * @description Users 관련 타입 정의
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import type * as Schema from "./api-schema";

export interface TPOSTUsersProvisionReq {
  data: {
    email?: string;
    name?: string;
    profileImageUrl?: string;
    birthYear?: number;
    authType?: "email" | "sns";
    snsProvider?: "kakao" | "google";
  };
}

export type TPOSTUsersProvisionRes = any;

export interface TPOSTUsersReq {
  data: {
    name: string;
    email: string;
    password: string;
    profileImageUrl?: string;
    birthYear?: number;
    authType?: "email" | "sns";
    snsProvider?: "kakao" | "google";
  };
}

export type TPOSTUsersRes = any;

export type TGETUsersRes = any;

export interface TGETUsersByIdReq {
  userId: string;
}

export type TGETUsersByIdRes = any;

export interface TPUTUsersByIdReq {
  userId: string;
  data: {
    name?: string;
    profileImageUrl?: string;
    birthYear?: number;
    rewardPoints?: number;
    level?: number;
    badges?: string[];
    points?: string;
    mainProfileId?: string;
    onBoardingComplete?: boolean;
    uploadQuotaBytes?: number;
    usedStorageBytes?: number;
  };
}

export type TPUTUsersByIdRes = any;

export interface TDELETEUsersByIdReq {
  userId: string;
}

export type TDELETEUsersByIdRes = any;
