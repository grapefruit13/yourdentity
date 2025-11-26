/**
 * 알림 타입을 한글로 매핑
 */
export const getNotificationTypeLabel = (type?: string): string => {
  if (!type) return "활동";

  const typeMap: Record<string, string> = {
    POST_LIKE: "활동",
    COMMENT_LIKE: "활동",
    COMMENT: "활동",
    ANNOUNCEMENT: "알림",
    announcement: "알림",
    general: "일반",
    ACTIVITY: "활동",
    activity: "활동",
  };

  return typeMap[type] || "활동";
};
