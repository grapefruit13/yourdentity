/**
 * @description Users 관련 타입 정의
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import type * as Schema from "./api-schema";

export interface TPATCHUsersMeOnboardingReq {
  data: {
    nickname: string;
    profileImageUrl?: string;
    bio?: string;
  };
}

export type TPATCHUsersMeOnboardingRes = {
  onboardingCompleted?: boolean;
};

export type TGETUsersMeRes = any;

export interface TGETUsersNicknameAvailabilityReq {
  nickname: string;
}

export type TGETUsersNicknameAvailabilityRes = {
  available?: boolean;
};

export interface TPOSTUsersMeSyncKakaoProfileReq {
  data: {
    accessToken: string;
  };
}

export type TPOSTUsersMeSyncKakaoProfileRes = {
  success?: boolean;
};

export type TGETUsersRes = any;

export interface TGETUsersByIdReq {
  userId: string;
}

export type TGETUsersByIdRes = any;

export interface TPUTUsersByIdReq {
  userId: string;
  data: {
    email?: string;
    nickname?: string;
    name?: string;
    birthDate?: string;
    gender?: "MALE" | "FEMALE";
    phoneNumber?: string;
    profileImageUrl?: string;
    bio?: string;
    authType?: string;
    snsProvider?: string;
    onboardingCompleted?: boolean;
    serviceTermsVersion?: string;
    privacyTermsVersion?: string;
    age14TermsAgreed?: boolean;
    pushTermsAgreed?: boolean;
  };
}

export type TPUTUsersByIdRes = any;

export interface TDELETEUsersByIdReq {
  userId: string;
}

export type TDELETEUsersByIdRes = any;
