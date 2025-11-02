/**
 * @description Users 관련 타입 정의
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

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

export type TGETUsersMeRes = Schema.User;

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

export type TGETUsersRes = {
  users?: Schema.User[];
  count?: number;
};

export interface TGETUsersByIdReq {
  userId: string;
}

export type TGETUsersByIdRes = Schema.User;

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

export type TPUTUsersByIdRes = Schema.User;

export interface TDELETEUsersByIdReq {
  userId: string;
}

export type TDELETEUsersByIdRes = {
  userId?: string;
};
