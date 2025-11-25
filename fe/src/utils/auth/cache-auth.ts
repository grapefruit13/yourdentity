/**
 * @description iOS PWA 인증 상태 유지를 위한 cacheStorage 유틸리티
 *
 * iOS 14+에서 Safari와 PWA가 cacheStorage를 공유하므로,
 * 이를 활용하여 로그인 상태를 유지합니다.
 *
 * 참고:
 * - https://stackoverflow.com/questions/62669966/how-to-maintain-login-status-in-a-pwa-initially-loaded-via-safari-14-ios-14
 */

const CACHE_NAME = "auth-cache";
const AUTH_STATE_URL = "/api/auth-state"; // 가상 URL (실제 요청은 안 함)
const AUTH_REDIRECT_DATA_URL = "/api/auth-redirect-data"; // redirect 데이터 저장용

export interface CachedAuthState {
  uid: string;
  isRedirectPending: boolean;
  timestamp: number;
  redirectUrl?: string;
}

export interface CachedRedirectData {
  code?: string;
  error?: string;
  state?: string;
  timestamp: number;
  // hash 파라미터도 함께 저장
  hashParams?: {
    code?: string;
    error?: string;
    state?: string;
  };
}

/**
 * @description 인증 상태를 cacheStorage에 저장
 */
export const setCachedAuthState = async (
  state: CachedAuthState
): Promise<void> => {
  try {
    const cache = await caches.open(CACHE_NAME);

    // Response 객체로 저장
    const response = new Response(JSON.stringify(state), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "max-age=3600", // 1시간
      },
    });

    await cache.put(AUTH_STATE_URL, response);
  } catch (error) {
    console.error("cacheStorage에 인증 상태 저장 실패:", error);
  }
};

/**
 * @description cacheStorage에서 인증 상태 조회
 */
export const getCachedAuthState = async (): Promise<CachedAuthState | null> => {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match(AUTH_STATE_URL);

    if (!response) {
      return null;
    }

    const state = await response.json();

    // 1시간 이상 지난 캐시는 무시
    if (Date.now() - state.timestamp > 3600000) {
      await clearCachedAuthState();
      return null;
    }

    return state;
  } catch (error) {
    console.error("cacheStorage에서 인증 상태 조회 실패:", error);
    return null;
  }
};

/**
 * @description cacheStorage에서 인증 상태 삭제
 */
export const clearCachedAuthState = async (): Promise<void> => {
  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.delete(AUTH_STATE_URL);
  } catch (error) {
    console.error("cacheStorage에서 인증 상태 삭제 실패:", error);
  }
};

/**
 * @description redirect 대기 상태를 cacheStorage에 저장
 */
export const setRedirectPending = async (
  redirectUrl?: string
): Promise<void> => {
  await setCachedAuthState({
    uid: "",
    isRedirectPending: true,
    timestamp: Date.now(),
    redirectUrl,
  });
};

/**
 * @description redirect 대기 상태 확인
 */
export const isRedirectPending = async (): Promise<boolean> => {
  const state = await getCachedAuthState();
  return state?.isRedirectPending ?? false;
};

/**
 * @description redirect 후 쿼리스트링 데이터를 cacheStorage에 저장 (iOS PWA용)
 */
export const setCachedRedirectData = async (
  data: Omit<CachedRedirectData, "timestamp">
): Promise<void> => {
  try {
    const cache = await caches.open(CACHE_NAME);

    const redirectData: CachedRedirectData = {
      ...data,
      timestamp: Date.now(),
    };

    // Response 객체로 저장
    const response = new Response(JSON.stringify(redirectData), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "max-age=3600", // 1시간
      },
    });

    await cache.put(AUTH_REDIRECT_DATA_URL, response);
  } catch (error) {
    console.error("cacheStorage에 redirect 데이터 저장 실패:", error);
  }
};

/**
 * @description cacheStorage에서 redirect 데이터 조회 (iOS PWA용)
 */
export const getCachedRedirectData =
  async (): Promise<CachedRedirectData | null> => {
    try {
      const cache = await caches.open(CACHE_NAME);
      const response = await cache.match(AUTH_REDIRECT_DATA_URL);

      if (!response) {
        return null;
      }

      const data = await response.json();

      // 1시간 이상 지난 캐시는 무시
      if (Date.now() - data.timestamp > 3600000) {
        await clearCachedRedirectData();
        return null;
      }

      return data;
    } catch (error) {
      console.error("cacheStorage에서 redirect 데이터 조회 실패:", error);
      return null;
    }
  };

/**
 * @description cacheStorage에서 redirect 데이터 삭제
 */
export const clearCachedRedirectData = async (): Promise<void> => {
  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.delete(AUTH_REDIRECT_DATA_URL);
  } catch (error) {
    console.error("cacheStorage에서 redirect 데이터 삭제 실패:", error);
  }
};
