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
