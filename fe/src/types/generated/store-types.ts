/**
 * @description Store 관련 타입 정의
 * ⚠️ 이 파일은 자동 생성되므로 수정하지 마세요
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import type * as Schema from "./api-schema";

export interface TGETStoreProductsReq {
  onSale?: boolean;
  pageSize?: number;
  cursor?: string;
}

export type TGETStoreProductsRes = {
  message?: string;
  products?: Schema.ProductListItem[];
  pagination?: {
    hasMore?: boolean;
    nextCursor?: string;
    currentPageCount?: number;
  };
};

export interface TGETStoreProductsByIdReq {
  productId: string;
}

export type TGETStoreProductsByIdRes = {
  message?: string;
  product?: Schema.Product;
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

export interface TPOSTStorePurchasesReq {
  data: {
    productId: string;
    quantity?: number;
    recipientName?: string;
    recipientAddress?: string;
    recipientDetailAddress?: string;
  };
}

export type TPOSTStorePurchasesRes = {
  purchaseId?: string;
  userId?: string;
  productId?: string;
  quantity?: number;
  recipientName?: string;
  recipientAddress?: string;
  recipientDetailAddress?: string;
  orderDate?: string;
  deliveryCompleted?: boolean;
};

export interface TGETStorePurchasesReq {
  pageSize?: number;
  cursor?: string;
}

export type TGETStorePurchasesRes = {
  message?: string;
  purchases?: {
    purchaseId?: string;
    userId?: string;
    userNickname?: string;
    productId?: string;
    quantity?: number;
    recipientName?: string;
    recipientAddress?: string;
    recipientDetailAddress?: string;
    deliveryCompleted?: boolean;
    orderDate?: string;
    lastEditedTime?: string;
  }[];
  pagination?: {
    hasMore?: boolean;
    nextCursor?: string;
    currentPageCount?: number;
  };
};
