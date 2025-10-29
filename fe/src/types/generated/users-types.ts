/**
 * @description Users 관련 타입 정의
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import type * as Schema from "./api-schema";

export interface TPATCHUsersMeOnboardingReq {
  data: {
    name?: string;
    nickname?: string;
    birthDate?: string;
    gender?: "MALE" | "FEMALE" | "null";
    phoneNumber?: string;
    terms?: {
      SERVICE?: boolean;
      PRIVACY?: boolean;
    };
  };
}

export type TPATCHUsersMeOnboardingRes = {
  onboardingCompleted?: boolean;
};

export interface TPOSTUsersReq {
  data: {
    name: string;
    email: string;
    password: string;
    profileImageUrl?: string;
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
    rewardPoints?: number;
    level?: number;
    badges?: string[];
    points?: string;
    mainProfileId?: string;
    onboardingCompleted?: boolean;
    uploadQuotaBytes?: number;
    usedStorageBytes?: number;
  };
}

export type TPUTUsersByIdRes = any;

export interface TDELETEUsersByIdReq {
  userId: string;
}

export type TDELETEUsersByIdRes = any;
