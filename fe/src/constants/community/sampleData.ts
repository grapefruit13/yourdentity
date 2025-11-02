import { CommunityPost } from "@/types/community";

/**
 * @description 커뮤니티 샘플 데이터
 * 향후 API 연동 시 이 데이터를 API 응답으로 대체
 */
export const samplePosts: CommunityPost[] = [
  {
    id: "AMrsQRg9tBY0ZGJMbKG2",
    communityId: "CP:ABC123DEF456",
    title: "오늘 하늘이 이뻤어요!",
    author: {
      name: "유어123",
      badge: "한끗",
      avatar: undefined,
    },
    content: `두줄까지 미리보기로 보이게!!! 구름이 뭉게뭉게 있어서 하늘이 이뻐요! 일상 인증 사진 공유합니다 일상 인증 사진 공유합니다 일상 인증 사진 공유합니다 일상 인증 사진 공유합니다 일상 인증 사진 공유합니다`,
    category: "TMI",
    tags: ["TMI"],
    stats: {
      likes: 12,
      comments: 12,
    },
    thumbnail: "/imgs/mockup.jpg",
    createdAt: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(), // 14시간 전
  },
  {
    id: "jpb8WjP7poOmI07Z7tU8",
    communityId: "CP:ABC123DEF456",
    title: "오늘 하늘이 이뻤어요!",
    author: {
      name: "유어456",
      badge: "한끗",
      avatar: undefined,
    },
    content: `두줄까지 미리보기로 보이게!!! 구름이 뭉게뭉게 있어서 하늘이 이뻐요! 일상 인증 사진 공유합니다 일상 인증 사진 공유합니다 일상 인증 사진 공유합니다 일상 인증 사진 공유합니다 일상 인증 사진 공유합니다`,
    category: "한끗루틴",
    tags: ["한끗루틴"],
    stats: {
      likes: 12,
      comments: 12,
    },
    thumbnail: "/imgs/mockup.jpg",
    createdAt: "2024-10-15T06:00:00.000Z", // 10월 15일
  },
  {
    id: "45Sb6iETW1lNgyHBVS75",
    communityId: "CP:ABC123DEF456",
    title: "오늘 하늘이 이뻤어요!",
    author: {
      name: "유어789",
      badge: "한끗",
      avatar: undefined,
    },
    content: `두줄까지 미리보기로 보이게!!! 구름이 뭉게뭉게 있어서 하늘이 이뻐요! 일상 인증 사진 공유합니다 일상 인증 사진 공유합니다 일상 인증 사진 공유합니다 일상 인증 사진 공유합니다 일상 인증 사진 공유합니다`,
    category: "한끗루틴",
    tags: ["한끗루틴"],
    stats: {
      likes: 12,
      comments: 12,
    },
    thumbnail: "/imgs/mockup.jpg",
    createdAt: "2024-12-20T06:00:00.000Z", // 12월 20일
  },
  {
    id: "xK92JfL3mP5nQ8rY7wT4",
    communityId: "CP:ABC123DEF456",
    title: "이런 후기도 있어요!",
    author: {
      name: "유어101",
      badge: "내가 참여중인!",
      avatar: undefined,
    },
    content: `두줄까지 미리보기로 보이게!!! 구름이 뭉게뭉게 있어서 하늘이 이뻐요! 일상 인증 사진 공유합니다`,
    category: "내가 참여중인",
    tags: ["내가 참여중인"],
    stats: {
      likes: 12,
      comments: 12,
    },
    thumbnail: "/imgs/mockup2.jpg",
    createdAt: "2025-01-10T06:00:00.000Z", // 1월 10일
  },
  {
    id: "zB8c4vN6hT2jK5lM9pQ7",
    communityId: "CP:ABC123DEF456",
    title: "오늘 하늘이 이뻤어요!",
    author: {
      name: "유어202",
      badge: "한끗",
      avatar: undefined,
    },
    content: `두줄까지 미리보기로 보이게!!! 구름이 뭉게뭉게 있어서 하늘이 이뻐요! 일상 인증 사진 공유합니다 일상 인증 사진 공유합니다 일상 인증 사진 공유합니다 일상 인증 사진 공유합니다 일상 인증 사진 공유합니다`,
    category: "월간 소모임",
    tags: ["월간 소모임"],
    stats: {
      likes: 12,
      comments: 12,
    },
    thumbnail: "/imgs/mockup3.jpg",
    createdAt: "2025-02-05T06:00:00.000Z", // 2월 5일
  },
  {
    id: "mN5pQ8rY3jK7wT9xL2cB",
    communityId: "CP:ABC123DEF456",
    title: "오늘 하늘이 이뻤어요!",
    author: {
      name: "유어303",
      badge: "한끗",
      avatar: undefined,
    },
    content: `두줄까지 미리보기로 보이게!!! 구름이 뭉게뭉게 있어서 하늘이 이뻐요! 일상 인증 사진 공유합니다 일상 인증 사진 공유합니다 일상 인증 사진 공유합니다 일상 인증 사진 공유합니다 일상 인증 사진 공유합니다`,
    category: "TMI",
    tags: ["TMI"],
    stats: {
      likes: 8,
      comments: 5,
    },
    thumbnail: "/imgs/mockup4.jpg",
    createdAt: "2025-03-18T06:00:00.000Z", // 3월 18일
  },
  {
    id: "aP7rQ9sY4kK8xT0zM3dC",
    communityId: "CP:ABC123DEF456",
    title: "봄꽃 구경 다녀왔어요!",
    author: {
      name: "유어404",
      badge: "한끗",
      avatar: undefined,
    },
    content: `벚꽃이 너무 예뻐요! 봄이 왔어요 일상 인증 사진 공유합니다 일상 인증 사진 공유합니다`,
    category: "한끗루틴",
    tags: ["한끗루틴"],
    stats: {
      likes: 15,
      comments: 8,
    },
    thumbnail: "/imgs/mockup.jpg",
    createdAt: "2025-04-22T06:00:00.000Z", // 4월 22일
  },
  {
    id: "bQ8sR0tY5lL9yU1zN4eD",
    communityId: "CP:ABC123DEF456",
    title: "가정의 달이에요!",
    author: {
      name: "유어505",
      badge: "한끗",
      avatar: undefined,
    },
    content: `가족과 함께한 시간들 공유합니다 일상 인증 사진 공유합니다 일상 인증 사진 공유합니다`,
    category: "월간 소모임",
    tags: ["월간 소모임"],
    stats: {
      likes: 20,
      comments: 10,
    },
    thumbnail: "/imgs/mockup2.jpg",
    createdAt: "2025-05-08T06:00:00.000Z", // 5월 8일
  },
  {
    id: "cR9tS1uY6mM0zV2xO5fE",
    communityId: "CP:ABC123DEF456",
    title: "여름이 다가와요!",
    author: {
      name: "유어606",
      badge: "한끗",
      avatar: undefined,
    },
    content: `더워지기 시작했어요 일상 인증 사진 공유합니다 일상 인증 사진 공유합니다`,
    category: "TMI",
    tags: ["TMI"],
    stats: {
      likes: 10,
      comments: 4,
    },
    thumbnail: "/imgs/mockup3.jpg",
    createdAt: "2025-06-15T06:00:00.000Z", // 6월 15일
  },
  {
    id: "dS0tU2vY7nN1xW3yP6gF",
    communityId: "CP:ABC123DEF456",
    title: "여름휴가 준비중!",
    author: {
      name: "유어707",
      badge: "한끗",
      avatar: undefined,
    },
    content: `바다 가고 싶어요 일상 인증 사진 공유합니다 일상 인증 사진 공유합니다`,
    category: "한끗루틴",
    tags: ["한끗루틴"],
    stats: {
      likes: 18,
      comments: 9,
    },
    thumbnail: "/imgs/mockup4.jpg",
    createdAt: "2025-07-20T06:00:00.000Z", // 7월 20일
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
    image: "/imgs/mockup2.jpg",
    user: "유어456",
  },
  {
    id: "3",
    image: "/imgs/mockup3.jpg",
    user: "유어789",
  },
  {
    id: "4",
    image: "/imgs/mockup4.jpg",
    user: "유어101",
  },
];
