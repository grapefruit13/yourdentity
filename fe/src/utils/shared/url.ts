/**
 * URL이 Next.js Image 컴포넌트에서 사용 가능한 유효한 URL인지 검증
 * - 빈 값/공백/비문자열 → false
 * - 상대 경로(/로 시작) → true
 * - 절대 URL은 http/https만 허용
 */
export const isValidImageUrl = (url: string | null | undefined): boolean => {
  if (!url || typeof url !== "string") return false;

  const trimmed = url.trim();
  if (!trimmed) return false;

  if (trimmed.startsWith("/")) return true;

  try {
    const urlObj = new URL(trimmed);
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
};
