import { CommunityPost } from "@/types/community";

/**
 * @description 커뮤니티 샘플 데이터
 * 향후 API 연동 시 이 데이터를 API 응답으로 대체
 */
export const samplePosts: CommunityPost[] = [
  {
    id: "1",
    title: "오늘 하늘이 이뻤어요!",
    author: {
      name: "유어123",
      badge: "한끗",
      avatar: undefined,
    },
    date: "1시간전",
    content: `두줄까지 미리보기로 보이게!!! 구름이 뭉게뭉게 있어서 하늘이 이뻐요! 일상 인증 사진 공유합니다 일상 인증 사진 공유합니다 일상 인증 사진 공유합니다 일상 인증 사진 공유합니다 일상 인증 사진 공유합니다`,
    category: "TMI",
    tags: ["TMI"],
    stats: {
      likes: 12,
      comments: 3,
    },
    thumbnail: "/imgs/mockup.jpg",
  },
  {
    id: "2",
    title: "오늘 하늘이 이뻤어요!",
    author: {
      name: "유어123",
      badge: "한끗",
      avatar: undefined,
    },
    date: "1시간전",
    content: `두줄까지 미리보기로 보이게!!! 구름이 뭉게뭉게 있어서 하늘이 이뻐요! 일상 인증 사진 공유합니다 일상 인증 사진 공유합니다 일상 인증 사진 공유합니다 일상 인증 사진 공유합니다 일상 인증 사진 공유합니다`,
    category: "한끗 루틴",
    tags: ["한끗 루틴"],
    stats: {
      likes: 8,
      comments: 1,
    },
    thumbnail: "/imgs/mockup.jpg",
  },
  {
    id: "3",
    title: "오늘 하늘이 이뻤어요!",
    author: {
      name: "유어123",
      badge: "한끗",
      avatar: undefined,
    },
    date: "1시간전",
    content: `두줄까지 미리보기로 보이게!!! 구름이 뭉게뭉게 있어서 하늘이 이뻐요! 일상 인증 사진 공유합니다 일상 인증 사진 공유합니다 일상 인증 사진 공유합니다 일상 인증 사진 공유합니다 일상 인증 사진 공유합니다`,
    category: "월간 소모임",
    tags: ["월간 소모임"],
    stats: {
      likes: 15,
      comments: 7,
    },
    thumbnail: "/imgs/mockup.jpg",
  },
];

// 유저 이미지 샘플 데이터
export const userImages = [
  {
    id: "1",
    image: "/imgs/mockup.jpg",
    user: "유어123",
  },
  {
    id: "2", 
    image: "/imgs/mockup.jpg",
    user: "유어456",
  },
  {
    id: "3",
    image: "/imgs/mockup.jpg", 
    user: "유어789",
  },
  {
    id: "4",
    image: "/imgs/mockup.jpg",
    user: "유어101",
  },
];
