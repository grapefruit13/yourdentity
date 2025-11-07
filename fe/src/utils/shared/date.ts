/**
 * 시간 차이를 계산하여 문자열로 반환
 * 24시간 이내: "~시간 전", "~분 전" 등
 * 24시간 이상: "MM월 DD일" 형식
 *
 * @param date - ISO 8601 문자열 또는 Date 객체
 * @returns 시간 차이 문자열
 */
export const getTimeAgo = (date: string | Date): string => {
  const targetDate = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor(
    (now.getTime() - targetDate.getTime()) / 1000
  );

  // 24시간 이내
  if (diffInSeconds < 60) {
    return "방금 전";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}분 전`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}시간 전`;
  }

  // 24시간 이상: "MM월 DD일" 형식
  const month = targetDate.getMonth() + 1;
  const day = targetDate.getDate();
  return `${month}월 ${day}일`;
};

/**
 * ISO 8601 문자열을 "YYYY년 MM월 DD일" 형식으로 변환
 */
export const formatDate = (date: string | Date): string => {
  const targetDate = typeof date === "string" ? new Date(date) : date;
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth() + 1;
  const day = targetDate.getDate();
  return `${year}년 ${month}월 ${day}일`;
};

/**
 * 날짜를 "MM.DD.요일" 형식으로 변환
 * @param dateString - ISO 8601 문자열 또는 Date 객체
 * @returns "MM.DD.요일" 형식의 문자열
 */
export const formatDateWithDay = (dateString?: string | Date): string => {
  if (!dateString) return "";
  const date =
    typeof dateString === "string" ? new Date(dateString) : dateString;
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
  const dayName = dayNames[date.getDay()];
  return `${month}.${day}.${dayName}요일`;
};

/**
 * 날짜 범위를 "MM.DD ~ MM.DD" 형식으로 변환
 * @param startDate - 시작 날짜 (ISO 8601 문자열 또는 Date 객체)
 * @param endDate - 종료 날짜 (ISO 8601 문자열 또는 Date 객체)
 * @returns "MM.DD ~ MM.DD" 형식의 문자열
 */
export const formatDateRange = (
  startDate?: string | Date,
  endDate?: string | Date
): string => {
  if (!startDate || !endDate) return "";
  const start = typeof startDate === "string" ? new Date(startDate) : startDate;
  const end = typeof endDate === "string" ? new Date(endDate) : endDate;
  const startMonth = String(start.getMonth() + 1).padStart(2, "0");
  const startDay = String(start.getDate()).padStart(2, "0");
  const endMonth = String(end.getMonth() + 1).padStart(2, "0");
  const endDay = String(end.getDate()).padStart(2, "0");
  return `${startMonth}.${startDay} ~ ${endMonth}.${endDay}`;
};
