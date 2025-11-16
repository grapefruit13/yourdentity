/**
 * @description 미션 후기 목 데이터
 */

export interface MockReviewItem {
  imageUrl: string;
  imageAlt: string;
  title: string;
  content: string;
}

/**
 * @description 미션 후기 목 데이터
 * TODO: 실제 API 연동 후 제거
 */
export const MOCK_REVIEW_ITEMS: MockReviewItem[] = [
  {
    imageUrl: "/imgs/mockup2.jpg",
    imageAlt: "미션 후기",
    title: "아침 러닝 30분하니까 상쾌해요! 아침 러닝 30분하니까 상쾌해요!",
    content:
      "매일 늦잠 자다가 처음 러닝을 시작했는데 기분도 좋고 하루를 상쾌하게 시작할 수 있어 좋아요! 다들 해보세요!",
  },
  {
    imageUrl: "/imgs/mockup2.jpg",
    imageAlt: "미션 후기",
    title: "아침 러닝 30분하니까 상쾌해요! 아침 러닝 30분하니까 상쾌해요!",
    content:
      "매일 늦잠 자다가 처음 러닝을 시작했는데 기분도 좋고 하루를 상쾌하게 시작할 수 있어 좋아요! 다들 해보세요!",
  },
  {
    imageUrl: "/imgs/mockup2.jpg",
    imageAlt: "미션 후기",
    title: "아침 러닝 30분하니까 상쾌해요! 아침 러닝 30분하니까 상쾌해요!",
    content:
      "매일 늦잠 자다가 처음 러닝을 시작했는데 기분도 좋고 하루를 상쾌하게 시작할 수 있어 좋아요! 다들 해보세요!",
  },
];
