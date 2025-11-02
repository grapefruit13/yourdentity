/**
 * @description 커뮤니티 관련 타입 정의
 */

export interface Author {
  name: string;
  badge: string;
  avatar?: string;
}

export interface PostStats {
  likes: number;
  comments: number;
}

export interface CommunityPost {
  id: string;
  communityId: string;
  title: string;
  author: Author;
  content: string;
  category: string;
  tags: string[];
  stats: PostStats;
  thumbnail?: string;
  createdAt: string; // ISO 8601 문자열, getTimeAgo()로 표시용 문자열 생성
}

export interface UserImage {
  id: string;
  image: string;
  user: string;
}
