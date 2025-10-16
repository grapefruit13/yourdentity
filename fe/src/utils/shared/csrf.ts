/**
 * @description CSRF 토큰 관리 유틸리티 (Double-submit cookie 패턴)
 */

const CSRF_TOKEN_KEY = "csrf_token";

/**
 * CSRF 토큰 생성
 */
export function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
}

/**
 * CSRF 토큰 가져오기 (없으면 생성)
 */
export function getCsrfToken(): string {
  if (typeof window === "undefined") {
    return "";
  }

  let token = sessionStorage.getItem(CSRF_TOKEN_KEY);

  if (!token) {
    token = generateCsrfToken();
    sessionStorage.setItem(CSRF_TOKEN_KEY, token);
  }

  return token;
}

/**
 * CSRF 토큰 삭제
 */
export function clearCsrfToken(): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(CSRF_TOKEN_KEY);
  }
}
