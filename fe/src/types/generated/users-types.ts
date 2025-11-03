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
  status?: "pending" | "active" | "suspended";
};

export type TGETUsersMeRes = { user?: Schema.User };

export type TGETUsersMeMyPageRes = {
  activityParticipationCount?: number;
  certificationPosts?: number;
  rewardPoints?: number;
  name?: string;
  profileImageUrl?: string;
  bio?: string;
};

export interface TGETUsersMePostsReq {
  page?: number;
  size?: number;
}

export type TGETUsersMePostsRes = {
  posts?: {
    id?: string;
    author?: string;
    title?: string;
    type?: string;
    channel?: string;
    category?: string;
    scheduledDate?: string;
    visibility?: string;
    isLocked?: boolean;
    rewardGiven?: boolean;
    likesCount?: number;
    commentsCount?: number;
    reportsCount?: number;
    viewCount?: number;
    createdAt?: string;
    updatedAt?: string;
    community?: {
      id?: string;
      name?: string;
    };
    timeAgo?: string;
    communityPath?: string;
    preview?: {
      description?: string;
      thumbnail?: {
        url?: string;
        width?: number;
        height?: number;
        blurHash?: string;
      };
    };
  }[];
  pagination?: {
    pageNumber?: number;
    pageSize?: number;
    totalElements?: number;
    totalPages?: number;
    hasNext?: boolean;
    hasPrevious?: boolean;
    isFirst?: boolean;
    isLast?: boolean;
  };
};

export interface TGETUsersMeLikedPostsReq {
  page?: number;
  size?: number;
}

export type TGETUsersMeLikedPostsRes = {
  posts?: {
    id?: string;
    author?: string;
    title?: string;
    type?: string;
    channel?: string;
    category?: string;
    scheduledDate?: string;
    visibility?: string;
    isLocked?: boolean;
    rewardGiven?: boolean;
    likesCount?: number;
    commentsCount?: number;
    reportsCount?: number;
    viewCount?: number;
    createdAt?: string;
    updatedAt?: string;
    community?: {
      id?: string;
      name?: string;
    };
    timeAgo?: string;
    communityPath?: string;
    preview?: {
      description?: string;
      thumbnail?: {
        url?: string;
        width?: number;
        height?: number;
        blurHash?: string;
      };
    };
  }[];
  pagination?: {
    pageNumber?: number;
    pageSize?: number;
    totalElements?: number;
    totalPages?: number;
    hasNext?: boolean;
    hasPrevious?: boolean;
    isFirst?: boolean;
    isLast?: boolean;
  };
};

export interface TGETUsersMeCommentedPostsReq {
  page?: number;
  size?: number;
}

export type TGETUsersMeCommentedPostsRes = {
  posts?: {
    id?: string;
    author?: string;
    title?: string;
    type?: string;
    channel?: string;
    category?: string;
    scheduledDate?: string;
    visibility?: string;
    isLocked?: boolean;
    rewardGiven?: boolean;
    likesCount?: number;
    commentsCount?: number;
    reportsCount?: number;
    viewCount?: number;
    createdAt?: string;
    updatedAt?: string;
    community?: {
      id?: string;
      name?: string;
    };
    timeAgo?: string;
    communityPath?: string;
    preview?: {
      description?: string;
      thumbnail?: {
        url?: string;
        width?: number;
        height?: number;
        blurHash?: string;
      };
    };
  }[];
  pagination?: {
    pageNumber?: number;
    pageSize?: number;
    totalElements?: number;
    totalPages?: number;
    hasNext?: boolean;
    hasPrevious?: boolean;
    isFirst?: boolean;
    isLast?: boolean;
  };
};

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

export type TGETUsersByIdRes = { user?: Schema.User };

export interface TPUTUsersByIdReq {
  userId: string;
  data: {
    email?: string;
    nickname?: string;
    name?: string;
    birthDate?: string;
    gender?: "male" | "female";
    phoneNumber?: string;
    profileImageUrl?: string;
    bio?: string;
    rewards?: number;
    authType?: string;
    snsProvider?: string;
    status?: "pending" | "active" | "suspended";
    serviceTermsVersion?: string;
    privacyTermsVersion?: string;
    age14TermsAgreed?: boolean;
    pushTermsAgreed?: boolean;
  };
}

export type TPUTUsersByIdRes = { user?: Schema.User };

export interface TDELETEUsersByIdReq {
  userId: string;
}

export type TDELETEUsersByIdRes = {
  userId?: string;
};
