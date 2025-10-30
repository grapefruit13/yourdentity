/* eslint-disable @typescript-eslint/no-explicit-any */
import type * as Schema from "./api-schema";

/**
 * @description Swagger에서 자동 생성된 타입 정의
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

// 기본 응답 타입
export interface ApiResponse<T = any> {
  data: T;
  status: number;
}

// 페이지네이션 타입
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface User {
  uid?: string;
  name?: string;
  email?: string;
  profileImageUrl?: string;
  authType?: "email" | "sns";
  snsProvider?: "kakao" | "google";
  role?: "user" | "admin";
  onboardingCompleted?: boolean;
  phoneNumber?: string;
  phoneVerified?: boolean;
  birthYear?: number;
  rewardPoints?: number;
  level?: number;
  badges?: string[];
  points?: string;
  mainProfileId?: string;
  uploadQuotaBytes?: number;
  usedStorageBytes?: number;
  createdAt?: string;
  lastLogin?: string;
  nickname?: string;
  gender?: string;
  birthDate?: string;
  serviceTermsVersion?: string;
  privacyTermsVersion?: string;
  age14TermsAgreed?: boolean;
  pushTermsAgreed?: boolean;
  termsAgreedAt?: string;
  bio?: string;
  updatedAt?: string;
}

export interface Mission {
  missionId?: string;
  userId: string;
  title: string;
  description: string;
  status?: "pending" | "in_progress" | "completed" | "cancelled";
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ImageUpload {
  image: string;
}

export interface FileUpload {
  file: string;
}

export interface FileUploadResponse {
  status: number;
  data: {
    uploaded: number;
    failed: number;
    files: {
      success: boolean;
      data?: {
        fileUrl?: string;
        fileName?: string;
        originalFileName?: string;
        mimeType?: string;
        size?: number;
        bucket?: string;
        path?: string;
      };
    }[];
    errors: string[];
  };
}

export interface Image {
  url: string;
  order: number;
}

export interface ContentItem {
  type?: "text" | "image" | "video" | "embed" | "file";
  order?: number;
  content?: string;
  url?: string;
  width?: number;
  height?: number;
  blurHash?: string;
  thumbUrl?: string;
  videoSource?: "uploaded" | "youtube" | "vimeo";
  provider?: "youtube" | "vimeo" | "self";
  providerVideoId?: string;
  duration?: number;
  sizeBytes?: number;
  mimeType?: string;
  processingStatus?: "uploaded" | "processing" | "ready" | "failed";
  transcodedVariants?: {
    resolution?: string;
    bitrate?: number;
    url?: string;
  }[];
  fileName?: string;
}

export interface MediaItem {
  type?: "image" | "video" | "embed" | "file";
  url?: string;
  order?: number;
  width?: number;
  height?: number;
  blurHash?: string;
  thumbUrl?: string;
  videoSource?: "uploaded" | "youtube" | "vimeo";
  provider?: "youtube" | "vimeo" | "self";
  providerVideoId?: string;
  duration?: number;
  sizeBytes?: number;
  mimeType?: string;
  processingStatus?: "uploaded" | "processing" | "ready" | "failed";
  transcodedVariants?: {
    resolution?: string;
    bitrate?: number;
    url?: string;
  }[];
  fileName?: string;
}

export interface StandardResponse {
  status: number;
  data?: Record<string, any>;
}

export interface ErrorResponse {
  status: number;
  message: string;
  code?: string;
}

export interface PaginatedResponse {
  status: number;
  data: Record<string, any>[];
  pagination: {
    page?: number;
    size?: number;
    totalElements?: number;
    totalPages?: number;
    hasNext?: boolean;
    hasPrevious?: boolean;
  };
}

export interface CreatedResponse {
  status: number;
  data: Record<string, any>;
}

export interface RoutineListItem {
  id?: string;
  name?: string;
  description?: string;
  status?: "RECRUITING" | "IN_PROGRESS" | "COMPLETED";
  price?: number;
  currency?: string;
  stockCount?: number;
  soldCount?: number;
  viewCount?: number;
  buyable?: boolean;
  sellerId?: string;
  sellerName?: string;
  deadline?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RoutineDetail {
  id?: string;
  name?: string;
  description?: string;
  status?: "RECRUITING" | "IN_PROGRESS" | "COMPLETED";
  price?: number;
  currency?: string;
  stockCount?: number;
  soldCount?: number;
  viewCount?: number;
  buyable?: boolean;
  sellerId?: string;
  sellerName?: string;
  content?: Record<string, any>[];
  media?: Record<string, any>[];
  options?: Record<string, any>[];
  primaryDetails?: Record<string, any>[];
  variants?: Record<string, any>[];
  customFields?: Record<string, any>[];
  deadline?: string;
  createdAt?: string;
  updatedAt?: string;
  qna?: Schema.QnAItem[];
  communityPosts?: Schema.CommunityPost[];
}

export interface ApplicationResponse {
  applicationId?: string;
  type?: string;
  targetId?: string;
  userId?: string;
  status?: string;
  selectedVariant?: string;
  quantity?: number;
  customFieldsRequest?: Record<string, any>;
  activityNickname?: string;
  activityPhoneNumber?: string;
  region?: {
    city?: string;
    district?: string;
  };
  currentSituation?: string;
  applicationSource?: string;
  applicationMotivation?: string;
  canAttendEvents?: boolean;
  appliedAt?: string;
  targetName?: string;
  targetPrice?: number;
}

export interface Review {
  reviewId?: string;
  type?: "ROUTINE" | "GATHERING";
  targetId?: string;
  userId?: string;
  content?: string;
  images?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface QnAItem {
  id?: string;
  content?: Record<string, any>[];
  media?: Record<string, any>[];
  answerContent?: Record<string, any>[];
  answerMedia?: Record<string, any>[];
  answerUserId?: string;
  askedBy?: string;
  answeredBy?: string;
  askedAt?: string;
  answeredAt?: string;
  likesCount?: number;
  userId?: string;
}

export interface CommunityPostListItem {
  id?: string;
  type?: string;
  author?: string;
  title?: string;
  preview?: {
    description?: string;
    thumbnail?: {
      url?: string;
      blurHash?: string;
      width?: number;
      height?: number;
    };
  };
  mediaCount?: number;
  channel?: string;
  category?: string;
  tags?: string[];
  scheduledDate?: string;
  isLocked?: boolean;
  visibility?: string;
  likesCount?: number;
  commentsCount?: number;
  createdAt?: string;
  timeAgo?: string;
}

export interface CommunityPost {
  id?: string;
  type?: string;
  author?: string;
  title?: string;
  content?: Record<string, any>[];
  media?: Record<string, any>[];
  channel?: string;
  isLocked?: boolean;
  visibility?: string;
  likesCount?: number;
  commentsCount?: number;
  createdAt?: string;
  updatedAt?: string;
  communityId?: string;
  category?: string;
  scheduledDate?: string;
  rewardGiven?: boolean;
  reportsCount?: number;
  viewCount?: number;
  timeAgo?: string;
  communityPath?: string;
  community?: {
    id?: string;
    name?: string;
  };
  authorId?: string;
}

export interface Comment {
  commentId?: string;
  type?: "tmi" | "review" | "routine_cert" | "gathering" | "community_post";
  targetId?: string;
  userId?: string;
  content?: any[];
  images?: {
    url?: string;
    order?: number;
  }[];
  parentId?: string;
  depth?: number;
  isReply?: boolean;
  isLocked?: boolean;
  reportsCount?: number;
  deleted?: boolean;
  deletedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  id?: string;
  author?: string;
  parent_id?: string;
  vote_score?: number;
  up_vote_score?: number;
  replies_count?: number;
  created_at?: number;
  updated_at?: number;
  isMine?: boolean;
  hasVideo?: boolean;
  hasImage?: boolean;
  hasAuthorReply?: boolean;
  hasAuthorVote?: boolean;
  isOriginalAuthor?: boolean;
}

export interface GatheringListItem {
  id?: string;
  name?: string;
  description?: string;
  status?: "RECRUITING" | "IN_PROGRESS" | "COMPLETED";
  price?: number;
  currency?: string;
  stockCount?: number;
  soldCount?: number;
  viewCount?: number;
  buyable?: boolean;
  sellerId?: string;
  sellerName?: string;
  deadline?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GatheringDetail {
  id?: string;
  name?: string;
  description?: string;
  status?: "RECRUITING" | "IN_PROGRESS" | "COMPLETED";
  price?: number;
  currency?: string;
  stockCount?: number;
  soldCount?: number;
  viewCount?: number;
  buyable?: boolean;
  sellerId?: string;
  sellerName?: string;
  content?: Record<string, any>[];
  media?: Record<string, any>[];
  options?: Record<string, any>[];
  primaryDetails?: Record<string, any>[];
  variants?: Record<string, any>[];
  customFields?: Record<string, any>[];
  deadline?: string;
  createdAt?: string;
  updatedAt?: string;
  qna?: Schema.QnAItem[];
  communityPosts?: Schema.CommunityPost[];
}

export interface Community {
  id?: string;
  name?: string;
  interestTag?: string;
  type?: "interest" | "anonymous";
  createdAt?: string;
  createdBy?: string;
  linkedChat?: string;
  channel?: string;
  postType?: "ROUTINE_CERT" | "GATHERING_REVIEW" | "TMI";
  updatedAt?: string;
}

export interface Post {
  id?: string;
  type?: "ROUTINE_CERT" | "TMI" | "GATHERING_REVIEW";
  author?: string;
  communityPath?: string;
  title?: string;
  content?: Schema.ContentItem[];
  channel?: string;
  isLocked?: boolean;
  visibility?: "public" | "private" | "hidden";
  rewardGiven?: boolean;
  reactionsCount?: number;
  likesCount?: number;
  commentsCount?: number;
  reportsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ActivityResponse {
  activityId?: string;
  type?: "GATHERING_REVIEW" | "ROUTINE_CERT" | "TMI_REVIEW";
  userId?: string;
  title?: string;
  content?: string;
  images?: {
    url?: string;
    order?: number;
  }[];
  likesCount?: number;
  commentsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface LikeToggleResponse {
  routineId?: string;
  userId?: string;
  isLiked?: boolean;
  likesCount?: number;
}

export interface QnALikeToggleResponse {
  qnaId?: string;
  userId?: string;
  isLiked?: boolean;
  likesCount?: number;
}

export interface Announcement {
  id?: string;
  title?: string;
  author?: string;
  contentRich?: Record<string, any>[];
  pinned?: boolean;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
}

export interface AnnouncementListResponse {
  status?: number;
  data?: Schema.Announcement[];
}

export interface AnnouncementDetailResponse {
  status?: number;
  data?: Schema.Announcement;
}

export interface AnnouncementSyncResponse {
  status?: number;
  data?: Schema.Announcement;
}

export interface AnnouncementDeleteResponse {
  status?: number;
  data?: {
    id?: string;
    isDeleted?: boolean;
    updatedAt?: string;
  };
}

export interface FCMToken {
  token: string;
  deviceInfo?: string;
  deviceType?: "pwa" | "mobile" | "web";
}

export interface FCMTokenResponse {
  deviceId?: string;
  message?: string;
}

export interface FCMTokenListResponse {
  tokens?: {
    id?: string;
    token?: string;
    deviceType?: string;
    deviceInfo?: string;
    lastUsed?: string;
    createdAt?: string;
  }[];
}

export interface FCMDeleteResponse {
  message?: string;
}

export interface Program {
  id?: string;
  title?: string;
  programName?: string;
  description?: string;
  programType?: "ROUTINE" | "TMI" | "GATHERING";
  recruitmentStatus?: "모집 전" | "모집 중" | "모집 완료" | "모집 취소";
  programStatus?: "진행 전" | "진행 중" | "종료됨" | "진행 취소됨";
  startDate?: string;
  endDate?: string;
  recruitmentStartDate?: string;
  recruitmentEndDate?: string;
  targetAudience?: string;
  thumbnail?: {
    name?: string;
    url?: string;
    type?: string;
  }[];
  linkUrl?: string;
  isReviewRegistered?: boolean;
  isBannerRegistered?: boolean;
  participants?: {
    name?: string;
    id?: string;
  }[];
  notes?: string;
  faqRelation?: {
    relations?: {
      id?: string;
    }[];
    has_more?: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
  notionPageTitle?: string;
}

export interface ProgramDetail extends Schema.Program {
  pageContent?: {
    type?: string;
    id?: string;
    text?: string;
    richText?: Record<string, any>[];
    hasChildren?: boolean;
    checked?: boolean;
    icon?: Record<string, any>;
    url?: string;
    caption?: string;
  }[];
  faqList?: {
    id?: string;
    title?: string;
    category?: string[];
    content?: {
      type?: string;
      id?: string;
      text?: string;
    }[];
    createdAt?: string;
    updatedAt?: string;
  }[];
}

export interface ProgramListResponse {
  status?: number;
  data?: {
    message?: string;
    programs?: Schema.Program[];
    pagination?: {
      hasMore?: boolean;
      nextCursor?: string;
      totalCount?: number;
    };
  };
}

export interface ProgramDetailResponse {
  status?: number;
  data?: {
    message?: string;
    program?: Schema.ProgramDetail;
  };
}

export interface ProgramSearchResponse {
  status?: number;
  data?: {
    message?: string;
    programs?: Schema.Program[];
    pagination?: {
      hasMore?: boolean;
      nextCursor?: string;
      totalCount?: number;
    };
    searchTerm?: string;
  };
}

export interface Success {
  status: number;
  data?: any;
}

export interface Error {
  status: number;
  message: string;
}

export interface CommunityMember {
  id?: string;
  userId?: string;
  nickname?: string;
  avatar?: string;
  role?: "member" | "admin" | "moderator";
  status?: "active" | "inactive" | "banned";
  joinedAt?: string;
  lastActiveAt?: string;
}

export interface Report {
  id?: string;
  targetType: "post" | "comment";
  targetId: string;
  communityId?: string;
  reporterId?: string;
  reporterName?: string;
  reportReason: string;
  status?: "pending" | "reviewed" | "dismissed" | "resolved";
  reviewedBy?: string;
  reviewedAt?: string;
  memo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductListItem {
  id?: string;
  name?: string;
  description?: string;
  status?: string;
  price?: number;
  currency?: string;
  stockCount?: number;
  soldCount?: number;
  viewCount?: number;
  buyable?: boolean;
  sellerId?: string;
  sellerName?: string;
  createdAt?: number;
  updatedAt?: any;
}

export interface Product {
  id?: string;
  name?: string;
  description?: string;
  price?: number;
  originalPrice?: number;
  normalPrice?: number;
  currency?: string;
  additionalFees?: {
    type?: string;
    resourceId?: string;
    amount?: number;
  }[];
  content?: Schema.ContentItem[];
  media?: Schema.MediaItem[];
  options?: any[];
  productVariants?: any[];
  view_count_member?: number;
  soldCount?: number;
  soldAmount?: number;
  buyersCount?: number;
  status?: string;
  shippingRequired?: boolean;
  sellerId?: string;
  sellerName?: string;
  shippingFee?: number;
  customFields?: any[];
  completeMessage?: {
    title?: {
      ko?: string;
    };
    description?: Record<string, any>;
  };
  primaryDetails?: any[];
  repliesCount?: number;
  reviewsCount?: number;
  ratingsCount?: number;
  commentsCount?: number;
  avgRate?: number;
  deliveryType?: string;
  isDisplayed?: boolean;
  variantSkus?: any[];
  creditAmount?: number;
  buyable?: boolean;
  createdAt?: number;
  type?: string;
  likesCount?: number;
  view_count?: number;
  updatedAt?: string;
  viewCount?: number;
  qna?: Schema.QnAItem[];
}

export interface Purchase {
  id?: string;
  productId?: string;
  userId?: string;
  quantity?: number;
  totalPrice?: number;
  status?: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  createdAt?: string;
}

export interface TmiProjectListItem {
  id?: string;
  name?: string;
  description?: string;
  status?: "OPEN" | "CLOSED" | "COMPLETED";
  price?: number;
  currency?: string;
  stockCount?: number;
  soldCount?: number;
  viewCount?: number;
  buyable?: boolean;
  sellerId?: string;
  sellerName?: string;
  deadline?: {
    _seconds?: number;
    _nanoseconds?: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface TmiProject {
  id?: string;
  name?: string;
  description?: string;
  status?: "RECRUITING" | "IN_PROGRESS" | "COMPLETED";
  price?: number;
  currency?: string;
  stockCount?: number;
  soldCount?: number;
  viewCount?: number;
  buyable?: boolean;
  sellerId?: string;
  sellerName?: string;
  content?: Schema.ContentItem[];
  media?: Schema.MediaItem[];
  options?: Record<string, any>[];
  primaryDetails?: Record<string, any>[];
  variants?: Record<string, any>[];
  customFields?: Record<string, any>[];
  deadline?: string;
  createdAt?: string;
  updatedAt?: string;
  qna?: Schema.QnAItem[];
  communityPosts?: {
    id?: string;
    type?: string;
    author?: string;
    title?: string;
    content?: Schema.ContentItem[];
    media?: Schema.MediaItem[];
    channel?: string;
    isLocked?: boolean;
    visibility?: string;
    likesCount?: number;
    commentsCount?: number;
    createdAt?: string;
    updatedAt?: string;
    community?: {
      id?: string;
      name?: string;
    };
  }[];
}
