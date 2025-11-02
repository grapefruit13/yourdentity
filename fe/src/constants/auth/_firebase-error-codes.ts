/**
 * @description Firebase Auth 에러 코드 상수 정의
 */
export const FIREBASE_AUTH_ERROR_CODES = {
  // 네트워크 관련
  NETWORK_REQUEST_FAILED: "auth/network-request-failed",
  INTERNAL_ERROR: "auth/internal-error",
  TIMEOUT: "auth/timeout",

  // 사용자 취소/차단
  POPUP_CLOSED_BY_USER: "auth/popup-closed-by-user",
  CANCELLED_POPUP_REQUEST: "auth/cancelled-popup-request",
  POPUP_BLOCKED: "auth/popup-blocked",

  // 인증 관련
  ACCOUNT_EXISTS_WITH_DIFFERENT_CREDENTIAL:
    "auth/account-exists-with-different-credential",
  TOO_MANY_REQUESTS: "auth/too-many-requests",
} as const;

export type FirebaseAuthErrorCode =
  (typeof FIREBASE_AUTH_ERROR_CODES)[keyof typeof FIREBASE_AUTH_ERROR_CODES];
