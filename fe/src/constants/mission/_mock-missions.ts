/**
 * @description 미션 목록 목 데이터
 */

export interface MockMission {
  id: string;
  title: string;
  category: string;
  thumbnailUrl: string;
  likeCount: number;
  createdAt: string | Date;
  isLiked?: boolean;
}

/**
 * @description 미션 목록 목 데이터
 */
export const MOCK_MISSIONS: MockMission[] = [
  {
    id: "1",
    title: "주말 자전거 타기 1시간 하기",
    category: "자기 만족",
    thumbnailUrl: "/imgs/mockup.jpg",
    likeCount: 999,
    createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1시간 전
  },
  {
    id: "2",
    title: "산책하며 자연 감상하기 2시간 동안 진행하기",
    category: "자기 만족",
    thumbnailUrl: "/imgs/mockup.jpg",
    likeCount: 999,
    createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1시간 전
  },
  {
    id: "3",
    title: "친구와 함께 요리하기 3시간 동안 다양한 메뉴 만들기",
    category: "자기 만족",
    thumbnailUrl: "/imgs/mockup.jpg",
    likeCount: 999,
    createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1시간 전
  },
  {
    id: "4",
    title: "도서관에서 독서하기 4시간 동안 새로운 책 탐색하기",
    category: "자기 만족",
    thumbnailUrl: "/imgs/mockup.jpg",
    likeCount: 999,
    createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1시간 전
  },
  {
    id: "5",
    title: "영화관에서 영화 감상하기 2시간 반 동안 최고의 영화 보기",
    category: "자기 만족",
    thumbnailUrl: "/imgs/mockup.jpg",
    likeCount: 999,
    createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1시간 전
  },
  {
    id: "6",
    title: "아침 일찍 공원에서 요가하기 30분 동안 명상과 함께",
    category: "자기 탐색",
    thumbnailUrl: "/imgs/mockup.jpg",
    likeCount: 756,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2시간 전
  },
  {
    id: "7",
    title: "카페에서 새로운 언어 공부하기 1시간 반 동안 집중하기",
    category: "자기 탐색",
    thumbnailUrl: "/imgs/mockup.jpg",
    likeCount: 432,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3시간 전
  },
  {
    id: "8",
    title: "박물관 방문하며 역사 공부하기 3시간 동안 전시 관람",
    category: "자기 탐색",
    thumbnailUrl: "/imgs/mockup.jpg",
    likeCount: 623,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4시간 전
  },
  {
    id: "9",
    title: "운동장에서 축구하기 2시간 동안 친구들과 함께",
    category: "자기 만족",
    thumbnailUrl: "/imgs/mockup.jpg",
    likeCount: 889,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5시간 전
  },
  {
    id: "10",
    title: "그림 그리기 취미 시작하기 2시간 동안 수채화 배우기",
    category: "자기 탐색",
    thumbnailUrl: "/imgs/mockup.jpg",
    likeCount: 567,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6시간 전
  },
  {
    id: "11",
    title: "봉사활동 참여하기 4시간 동안 지역 커뮤니티 도우기",
    category: "자기 만족",
    thumbnailUrl: "/imgs/mockup.jpg",
    likeCount: 1123,
    createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000), // 7시간 전
  },
  {
    id: "12",
    title: "악기 연주 배우기 1시간 반 동안 기타 레슨 받기",
    category: "자기 탐색",
    thumbnailUrl: "/imgs/mockup.jpg",
    likeCount: 445,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8시간 전
  },
  {
    id: "13",
    title: "등산하며 자연 속에서 힐링하기 5시간 동안 산 정상까지",
    category: "자기 만족",
    thumbnailUrl: "/imgs/mockup.jpg",
    likeCount: 987,
    createdAt: new Date(Date.now() - 9 * 60 * 60 * 1000), // 9시간 전
  },
  {
    id: "14",
    title: "온라인 강의 듣기 2시간 동안 새로운 스킬 배우기",
    category: "자기 탐색",
    thumbnailUrl: "/imgs/mockup.jpg",
    likeCount: 678,
    createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000), // 10시간 전
  },
  {
    id: "15",
    title: "맛집 탐방하며 새로운 음식 도전하기 3시간 동안 식도락",
    category: "자기 만족",
    thumbnailUrl: "/imgs/mockup.jpg",
    likeCount: 1234,
    createdAt: new Date(Date.now() - 11 * 60 * 60 * 1000), // 11시간 전
  },
  {
    id: "16",
    title: "일기 쓰기 습관 만들기 30분 동안 오늘 하루 정리하기",
    category: "자기 탐색",
    thumbnailUrl: "/imgs/mockup.jpg",
    likeCount: 334,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12시간 전
  },
  {
    id: "17",
    title: "수영장에서 수영하기 1시간 동안 전신 운동하기",
    category: "자기 만족",
    thumbnailUrl: "/imgs/mockup.jpg",
    likeCount: 556,
    createdAt: new Date(Date.now() - 13 * 60 * 60 * 1000), // 13시간 전
  },
  {
    id: "18",
    title: "전시회 관람하며 예술 작품 감상하기 2시간 반 동안",
    category: "자기 탐색",
    thumbnailUrl: "/imgs/mockup.jpg",
    likeCount: 789,
    createdAt: new Date(Date.now() - 14 * 60 * 60 * 1000), // 14시간 전
  },
  {
    id: "19",
    title: "가족과 함께 보드게임하기 2시간 동안 즐거운 시간 보내기",
    category: "자기 만족",
    thumbnailUrl: "/imgs/mockup.jpg",
    likeCount: 445,
    createdAt: new Date(Date.now() - 15 * 60 * 60 * 1000), // 15시간 전
  },
  {
    id: "20",
    title: "새로운 취미 찾기 위해 다양한 체험하기 4시간 동안 탐색",
    category: "자기 탐색",
    thumbnailUrl: "/imgs/mockup.jpg",
    likeCount: 667,
    createdAt: new Date(Date.now() - 16 * 60 * 60 * 1000), // 16시간 전
  },
];
