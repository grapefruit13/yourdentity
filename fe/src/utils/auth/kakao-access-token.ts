/**
 * @description 카카오 액세스 토큰 관리 유틸리티
 * 세션 스토리지를 사용하여 페이지 간 토큰 전달
 */
import { KAKAO_ACCESS_TOKEN_KEY } from "@/constants/auth/_kakao-token-key";
import { debug } from "@/utils/shared/debugger";

/**
 * 카카오 액세스 토큰 가져오기
 * @returns 카카오 액세스 토큰 또는 null
 */
export const getKakaoAccessToken = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return sessionStorage.getItem(KAKAO_ACCESS_TOKEN_KEY);
  } catch (error) {
    debug.error("카카오 액세스 토큰 가져오기 실패:", error);
    return null;
  }
};

/**
 * 카카오 액세스 토큰 저장
 * @param token - 저장할 카카오 액세스 토큰
 */
export const setKakaoAccessToken = (token: string): void => {
  if (typeof window === "undefined") {
    debug.warn("서버 사이드에서는 카카오 액세스 토큰을 저장할 수 없습니다.");
    return;
  }

  try {
    sessionStorage.setItem(KAKAO_ACCESS_TOKEN_KEY, token);
    debug.log("카카오 액세스 토큰 저장 완료");
  } catch (error) {
    debug.error("카카오 액세스 토큰 저장 실패:", error);
  }
};

/**
 * 카카오 액세스 토큰 삭제
 */
export const removeKakaoAccessToken = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    sessionStorage.removeItem(KAKAO_ACCESS_TOKEN_KEY);
    debug.log("카카오 액세스 토큰 삭제 완료");
  } catch (error) {
    debug.error("카카오 액세스 토큰 삭제 실패:", error);
  }
};

/**
 * 카카오 액세스 토큰이 존재하는지 확인
 * @returns 토큰 존재 여부
 */
export const hasKakaoAccessToken = (): boolean => {
  return getKakaoAccessToken() !== null;
};
