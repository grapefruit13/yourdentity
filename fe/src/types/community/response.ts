import { CommunityPost } from "./index";

// TODO: be response 수정 예정
export interface GETCommunityListRes {
  pagination: {
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
    isFirst: boolean;
    isLast: boolean;
  };
}

// TODO: be response 수정 예정
export interface GETCommunityPostListRes {
  pagination: {
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
    isFirst: boolean;
    isLast: boolean;
  };
  posts: CommunityPost[];
}
