"use client";

import { QueryClient } from "@tanstack/react-query";

/**
 * React Query 클라이언트 설정
 * 네트워크 요청 최적화를 위한 캐싱 및 재시도 정책 설정
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 캐시 시간: 5분 (5 * 60 * 1000ms)
      staleTime: 5 * 60 * 1000,

      // 백그라운드에서 데이터 갱신 시간: 10분
      gcTime: 10 * 60 * 1000,

      // 재시도 횟수: 3회
      retry: 3,

      // 재시도 간격: 지수 백오프 (1초, 2초, 4초)
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // 네트워크 오류 시에만 재시도
      retryOnMount: true,

      // 윈도우 포커스 시 자동 갱신
      refetchOnWindowFocus: false,

      // 네트워크 재연결 시 자동 갱신
      refetchOnReconnect: true,

      // 컴포넌트 마운트 시 자동 갱신
      refetchOnMount: true,
    },
    mutations: {
      // 뮤테이션 재시도 횟수: 1회
      retry: 1,

      // 뮤테이션 재시도 간격: 1초
      retryDelay: 1000,
    },
  },
});
