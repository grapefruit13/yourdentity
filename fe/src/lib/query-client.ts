import { QueryClient } from "@tanstack/react-query";

/**
 * QueryClient 인스턴스 생성 함수
 * Next.js 15 App Router에서 hydration 에러를 방지하기 위한 팩토리 패턴
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 캐시 시간: 5분
        staleTime: 5 * 60 * 1000,

        // 가비지 컬렉션 시간: 10분
        gcTime: 10 * 60 * 1000,

        // 재시도 횟수: 3회
        retry: 3,

        // 재시도 간격: 지수 백오프 (1초, 2초, 4초)
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

        // 네트워크 오류 시에만 재시도
        retryOnMount: true,

        // 윈도우 포커스 시 자동 갱신 비활성화 (PWA 특성 고려)
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
}

let browserQueryClient: QueryClient | undefined = undefined;

/**
 * QueryClient 인스턴스 반환
 * - 서버: 요청마다 새로운 인스턴스 생성
 * - 브라우저: 싱글톤 패턴으로 재사용
 *
 * 이 패턴은 Next.js 15 App Router에서 서버/클라이언트 간
 * hydration 불일치를 방지합니다.
 */
export function getQueryClient() {
  // 서버 환경: 항상 새로운 클라이언트 생성
  if (typeof window === "undefined") {
    return makeQueryClient();
  }

  // 브라우저 환경: 싱글톤 패턴
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }

  return browserQueryClient;
}
