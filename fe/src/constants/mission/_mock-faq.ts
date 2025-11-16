/**
 * @description 미션 FAQ 목 데이터
 */

export interface MockFaqItem {
  question: string;
  answer: string;
}

/**
 * @description 미션 FAQ 목 데이터
 * TODO: 실제 API 연동 후 제거
 */
export const MOCK_FAQ_ITEMS: MockFaqItem[] = [
  {
    question: "한곳 루틴, 누가 참여할 수 있나요?",
    answer:
      "학교 밖 청소년, 자퇴 경험이 있는 청(소)년, 그리고 학교 밖을 고민하는 청소년(14~24세 사이)이 참여할 수 있습니다.",
  },
  {
    question: "루틴 인증은 꼭 정해진 시간에 해야 하나요?",
    answer:
      "네, 루틴 인증은 정해진 시간 내에 완료해야 합니다. 인증 마감 시간은 각 루틴마다 다르며, 상세 페이지에서 확인할 수 있습니다.",
  },
  {
    question: "루틴을 중도에 포기할 수 있나요?",
    answer:
      "네, 언제든지 루틴을 포기할 수 있습니다. 다만 포기한 루틴은 다시 참여할 수 없으니 신중하게 결정해주세요.",
  },
];
