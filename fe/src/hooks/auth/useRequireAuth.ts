"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { LINK_URL } from "@/constants/shared/_link-url";
import { auth } from "@/lib/firebase";

interface UseRequireAuthOptions {
  /** 리다이렉트할 경로 (기본: /login) */
  redirectTo?: string;
  /** 로그인 후 돌아올 경로 (기본: 현재 경로 + 쿼리 파라미터) */
  returnTo?: string;
}

/**
 * @description 인증이 필요한 페이지에서 사용하는 훅
 * 로그인하지 않은 사용자를 자동으로 로그인 페이지로 리다이렉트합니다.
 * @returns user : 현재 사용자, isReady: Auth 초기화 완료 여부
 */
export const useRequireAuth = (options: UseRequireAuthOptions = {}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { redirectTo = LINK_URL.LOGIN, returnTo } = options;
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsReady(true);

      // 로그인하지 않은 사용자는 로그인 페이지로 리다이렉트
      // 중복 리다이렉트 방지
      if (!currentUser && !hasRedirectedRef.current) {
        hasRedirectedRef.current = true;

        // returnTo가 명시되지 않았으면 현재 경로 + 쿼리 파라미터 사용
        const currentPathWithQuery = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
        const nextPath = returnTo ?? currentPathWithQuery;
        const redirectUrl = `${redirectTo}?next=${encodeURIComponent(nextPath)}`;

        // /login 경로로 이동할 때는 서비스워커를 우회하기 위해 window.location 사용
        if (
          redirectTo === LINK_URL.LOGIN ||
          redirectTo.startsWith(LINK_URL.LOGIN)
        ) {
          window.location.href = redirectUrl;
        } else {
          router.replace(redirectUrl);
        }
      }
    });

    return () => unsubscribe();
  }, [redirectTo, returnTo, router, pathname, searchParams]);

  return { user, isReady };
};
