// 콘텐츠 아이템 타입 정의
export interface ContentItem {
  type: "text" | "image";
  order: number;
  content?: string; // text 타입일 때
  url?: string; // image 타입일 때
  width?: number; // image 타입일 때
  height?: number; // image 타입일 때
  blurHash?: string; // image 타입일 때
  mimeType?: string; // image 타입일 때
  processingStatus?: "ready" | "processing" | "failed"; // image 타입일 때
}

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
  pagination: "";
}

// 커뮤니티 게시글 상세 조회 응답 타입
export interface GETCommunityPostDetailRes {
  id: string;
  type: string;
  authorId: string;
  author: string;
  title: string;
  content: ContentItem[]; // 상세 조회 시 주요 게시글 내용
  preview: {
    description: string;
    thumbnail?: {
      url: string;
      blurHash: string;
      width: number;
      height: number;
      ratio: string;
    } | null;
    isVideo: boolean;
    hasImage: boolean;
    hasVideo: boolean;
  };
  mediaCount: number;
  channel: string;
  category?: string;
  tags: string[];
  scheduledDate?: string;
  isLocked: boolean;
  visibility: string;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  timeAgo: string;
  replies?: unknown[]; // 댓글 목록 (상세 조회 시 포함)
}
