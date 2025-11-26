/**
 * @description 텍스트 에디터 관련 상수 정의
 */

/**
 * 현재 날짜를 MM/DD 형식으로 반환
 */
export const getTodayPrefix = (): string => {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${month}/${day} `;
};

export const TEXT_EDITOR = {
  PLACEHOLDER: {
    TITLE: "제목을 입력하세요",
    CONTENT: "내용을 입력하세요",
  },
  getTitlePlaceholder: (): string => {
    return `${getTodayPrefix()}제목을 입력하세요`;
  },
  COLOR_PALETTE: [
    { name: "빨강", value: "#FB2C36" },
    { name: "초록", value: "#008000" },
    { name: "파랑", value: "#0000FF" },
    { name: "노랑", value: "#FFA500" },
    { name: "분홍", value: "#EE82EE" },
    { name: "회색", value: "#D0D1D2" },
    { name: "검정", value: "#030712" },
  ],
  DEFAULT_COLOR: "#000000",
  DEFAULT_ALIGN: "justifyLeft" as const,
  DEFAULT_MIN_HEIGHT: 300,
  HEADING_CLASS_MAP: {
    1: "text-[22px] leading-snug font-bold",
    2: "text-[16px] leading-snug font-bold",
    3: "text-[16px] leading-snug font-medium",
    4: "text-[14px] leading-snug font-medium",
  } as Record<1 | 2 | 3 | 4, string>,
} as const;
