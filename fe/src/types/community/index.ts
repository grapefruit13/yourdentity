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
  title: string;
  author: Author;
  date: string;
  content: string;
  category: string;
  tags: string[];
  stats: PostStats;
  thumbnail?: string;
}

export interface UserImage {
  id: string;
  image: string;
  user: string;
}