"use client";

import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { getQueryClient } from "@/lib/query-client";

interface QueryProviderProps {
  children: React.ReactNode;
}

/**
 * React Query Provider
 *
 * Next.js 15 App Router에서 hydration 에러를 방지하기 위해 useState를 사용하여 클라이언트에서만 QueryClient를 생성
 *
 * 이 패턴은 TanStack Query 공식 문서에서 권장하는 방법입니다:
 * https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr
 */
export const QueryProvider = ({ children }: QueryProviderProps) => {
  // useState로 QueryClient 초기화
  // 이렇게 하면 컴포넌트 생명주기 동안 동일한 인스턴스가 유지되며
  // 서버/클라이언트 간 불일치가 발생하지 않습니다
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* 개발 환경에서만 DevTools 표시 */}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
};
