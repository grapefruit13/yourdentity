/**
 * @description Store 관련 타입 정의
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import type * as Schema from "./api-schema";

export interface TGETStoreProductsReq {
  page?: number;
  size?: number;
}

export type TGETStoreProductsRes = {
  products?: Schema.ProductListItem[];
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

export interface TGETStoreProductsByIdReq {
  productId: string;
}

export type TGETStoreProductsByIdRes = {
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
};

export interface TPOSTStorePurchaseReq {
  data: {
    productId: string;
    quantity?: number;
    selectedVariant?: string;
    customFieldsRequest?: Record<string, any>;
  };
}

export type TPOSTStorePurchaseRes = Schema.Purchase;

export interface TPOSTStoreProductsLikeByIdReq {
  productId: string;
}

export type TPOSTStoreProductsLikeByIdRes = {
  productId?: string;
  userId?: string;
  isLiked?: boolean;
  likesCount?: number;
};

export interface TPOSTStoreProductsQnaByIdReq {
  productId: string;
  data: {
    content: any[];
  };
}

export type TPOSTStoreProductsQnaByIdRes = {
  qnaId?: string;
  productId?: string;
  userId?: string;
  content?: Record<string, any>[];
  media?: {
    url?: string;
    type?: "image" | "video";
    order?: number;
    width?: number;
    height?: number;
    blurHash?: string;
    thumbUrl?: string;
    videoSource?: string;
    provider?: string;
    duration?: number;
    sizeBytes?: number;
    mimeType?: string;
    processingStatus?: string;
  }[];
  answerContent?: any[];
  answerMedia?: any[];
  likesCount?: number;
  createdAt?: string;
};

export interface TPUTStoreProductsQnaByTwoIdsReq {
  productId: string;
  qnaId: string;
  data: {
    content: any[];
  };
}

export type TPUTStoreProductsQnaByTwoIdsRes = Record<string, any>;

export interface TPOSTStoreQnaLikeByIdReq {
  qnaId: string;
}

export type TPOSTStoreQnaLikeByIdRes = {
  qnaId?: string;
  userId?: string;
  isLiked?: boolean;
  likesCount?: number;
};

export interface TDELETEStoreQnaByIdReq {
  qnaId: string;
}
