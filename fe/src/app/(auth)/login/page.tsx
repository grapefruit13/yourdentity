"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { User } from "firebase/auth";
import ButtonBase from "@/components/shared/base/button-base";
import { Typography } from "@/components/shared/typography";
import { IMAGE_URL } from "@/constants/shared/_image-url";
import { LINK_URL } from "@/constants/shared/_link-url";
import { useGetUsersMe } from "@/hooks/generated/users-hooks";
import { useFCM } from "@/hooks/shared/useFCM";
import {
  signInWithKakao,
  handleKakaoRedirectResult,
  onAuthStateChange,
} from "@/lib/auth";
import { setKakaoAccessToken } from "@/utils/auth/kakao-access-token";
import { debug } from "@/utils/shared/debugger";
import { isIOSDevice, isStandalone } from "@/utils/shared/device";

/**
 * @description 로그인 페이지 콘텐츠 (useSearchParams 사용)
 */
const LoginPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { registerFCMToken } = useFCM();

  // 로그인 후 돌아갈 경로 (next 쿼리 파라미터)
  const rawNext = searchParams.get("next") || null;
  // /community/write로 가는 것은 막고 /community로 변경
  // (글쓰기는 바텀시트에서 카테고리를 선택하고 가야 함)
  const returnTo = rawNext?.startsWith(LINK_URL.COMMUNITY_WRITE)
    ? LINK_URL.COMMUNITY
    : rawNext;

  const { refetch: refetchUserData } = useGetUsersMe({
    enabled: false, // 자동 실행 비활성화
    select: (data) => {
      return data?.user;
    },
  });

  /**
   * @description FCM 토큰 등록 (실패해도 로그인은 계속 진행)
   */
  const registerFCMTokenSafely = useCallback(async () => {
    try {
      await registerFCMToken();
    } catch (fcmError) {
      debug.error("FCM 토큰 저장 실패:", fcmError);
      // FCM 토큰 저장 실패해도 로그인은 계속 진행
    }
  }, [registerFCMToken]);

  /**
   * @description 로그인 성공 후 라우팅 처리
   * @param hasNickname - 닉네임 존재 여부
   */
  const handlePostLoginRouting = useCallback(
    (hasNickname: boolean) => {
      if (hasNickname) {
        // 닉네임이 있으면 next 파라미터가 있으면 해당 경로로, 없으면 홈으로
        router.replace(returnTo || LINK_URL.HOME);
      } else {
        // 온보딩이 필요한 경우 next 파라미터 무시하고 온보딩 페이지로
        router.replace(LINK_URL.MY_PAGE_EDIT);
      }
    },
    [router, returnTo]
  );

  /**
   * @description iOS PWA 환경에서 /login 페이지를 외부 링크처럼 열기
   */
  useEffect(() => {
    const isIOSPWA = isIOSDevice() && isStandalone();

    // iOS PWA 환경이고, 이미 외부 링크로 열린 것이 아닌 경우
    if (isIOSPWA && typeof window !== "undefined" && !window.opener) {
      const currentUrl = window.location.href;
      debug.log(
        "iOS PWA 환경: /login 페이지를 외부 링크처럼 열기:",
        currentUrl
      );

      // 현재 페이지를 외부 링크처럼 열기 (target="_blank" 효과)
      const newWindow = window.open(
        currentUrl,
        "_blank",
        "noopener,noreferrer"
      );
      // if (newWindow) {
      //   // 새 창이 열리면 현재 창은 닫기
      //   window.close();
      // }
    }
  }, []);

  /**
   * @description 카카오 redirect 결과 처리 및 인증 상태 변경 감지
   * iOS PWA 환경에서는 onAuthStateChanged를 사용하여 인증 상태 변경을 감지
   */
  useEffect(() => {
    const isIOSPWA = isIOSDevice() && isStandalone();
    let hasProcessedAuth = false; // 중복 처리 방지

    // redirect 후 돌아왔을 때 기존 창으로 돌아온 것처럼 처리
    if (isIOSPWA && typeof window !== "undefined") {
      // 새 창에서 열렸는지 확인 (window.opener가 있으면 새 창)
      if (window.opener) {
        debug.log("새 창에서 열림, 기존 창으로 결과 전달 후 창 닫기");
        // 새 창인 경우 기존 창으로 결과를 전달하고 창을 닫음
        // 하지만 iOS PWA에서는 window.opener가 제대로 작동하지 않을 수 있음
        try {
          window.opener.postMessage(
            { type: "FIREBASE_AUTH_REDIRECT", url: window.location.href },
            window.location.origin
          );
          window.close();
          return;
        } catch (error) {
          debug.warn("기존 창으로 메시지 전달 실패:", error);
          // 실패하면 계속 진행
        }
      }

      const redirectFrom = searchParams.get("_redirect_from");
      const historyState = window.history.state;

      if (redirectFrom || historyState?.redirectFrom) {
        const originalUrl = redirectFrom || historyState.redirectFrom;
        debug.log("redirect 후 돌아옴, history 교체:", originalUrl);

        // history entry를 교체하여 기존 페이지로 돌아온 것처럼 보이게 함
        // 이렇게 하면 뒤로가기 시 이전 페이지로 돌아가지 않음
        window.history.replaceState(
          { ...historyState, redirectFrom: undefined },
          "",
          originalUrl
        );

        // URL에서 _redirect_from 파라미터 제거
        if (redirectFrom) {
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete("_redirect_from");
          window.history.replaceState(
            window.history.state,
            "",
            newUrl.toString()
          );
        }
      } else {
        // redirectFrom이 없지만 Firebase Auth redirect로 돌아온 경우
        // URL에 Firebase Auth 관련 파라미터가 있는지 확인
        const hasAuthParams =
          searchParams.has("apiKey") ||
          searchParams.has("code") ||
          searchParams.has("state");

        if (hasAuthParams) {
          debug.log("Firebase Auth redirect로 돌아옴, history 정리");
          // 현재 URL을 history에 저장하여 뒤로가기 시 이전 페이지로 돌아가지 않도록 함
          window.history.replaceState(
            { ...window.history.state, isAuthRedirect: true },
            "",
            window.location.href
          );
        }
      }
    }

    const processRedirectResult = async () => {
      if (hasProcessedAuth) return;

      try {
        const result = await handleKakaoRedirectResult();
        if (!result) {
          // redirect 결과가 없음 (일반적인 경우)
          return;
        }

        hasProcessedAuth = true;
        setIsLoading(true);
        const { kakaoAccessToken, isNewUser } = result;

        // 신규 회원 처리
        if (isNewUser) {
          if (!kakaoAccessToken) {
            debug.error("신규 회원인데 카카오 액세스 토큰이 없습니다.");
            setIsLoading(false);
            setErrorMessage(
              "카카오 로그인 권한이 필요합니다. 다시 시도해 주세요."
            );
            hasProcessedAuth = false;
            return;
          }

          setKakaoAccessToken(kakaoAccessToken);
          await registerFCMTokenSafely();
          setIsLoading(false);
          router.replace(LINK_URL.MY_PAGE_EDIT);
          return;
        }

        // 기존 사용자 처리
        try {
          const { data: userData } = await refetchUserData();
          const hasNickname = !!userData?.nickname;
          await registerFCMTokenSafely();
          setIsLoading(false);
          handlePostLoginRouting(hasNickname);
        } catch (error) {
          debug.error("사용자 정보 조회 실패:", error);
          setIsLoading(false);
          setErrorMessage("사용자 정보 조회에 실패했습니다.");
          hasProcessedAuth = false;
        }
      } catch (error) {
        debug.error("카카오 redirect 결과 처리 실패:", error);
        setIsLoading(false);
        setErrorMessage("카카오 로그인에 실패했어요. 다시 시도해 주세요.");
        hasProcessedAuth = false;
      }
    };

    const processAuthStateChange = async (user: User | null) => {
      if (hasProcessedAuth || !user) return;

      // getRedirectResult가 이미 처리했을 수 있으므로 잠시 대기
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 다시 확인: getRedirectResult가 처리했는지 확인
      if (hasProcessedAuth) return;

      try {
        hasProcessedAuth = true;
        setIsLoading(true);
        debug.log(
          "인증 상태 변경 감지 (iOS PWA), 사용자 정보 조회 중...",
          user.uid
        );

        // 사용자 정보 조회하여 신규/기존 회원 판단
        const { data: userData } = await refetchUserData();
        const isNewUser = !userData?.nickname;

        if (isNewUser) {
          // 신규 회원인데 kakaoAccessToken이 없음
          // 이 경우는 온보딩 페이지에서 처리하도록 함
          debug.warn(
            "신규 회원이지만 카카오 액세스 토큰이 없습니다. 온보딩 페이지로 이동합니다."
          );
          await registerFCMTokenSafely();
          setIsLoading(false);
          router.replace(LINK_URL.MY_PAGE_EDIT);
          return;
        }

        // 기존 사용자 처리
        const hasNickname = !!userData?.nickname;
        await registerFCMTokenSafely();
        setIsLoading(false);
        handlePostLoginRouting(hasNickname);
      } catch (error) {
        debug.error("인증 상태 변경 처리 실패:", error);
        setIsLoading(false);
        setErrorMessage("사용자 정보 조회에 실패했습니다.");
        hasProcessedAuth = false;
      }
    };

    // iOS PWA 환경에서는 onAuthStateChanged로 인증 상태 변경 감지
    if (isIOSPWA) {
      const unsubscribe = onAuthStateChange((user) => {
        if (user) {
          debug.log("인증 상태 변경 감지 (iOS PWA):", user.uid);
          processAuthStateChange(user);
        }
      });

      // 초기 로드 시 redirect 결과 처리 시도
      processRedirectResult();

      return () => unsubscribe();
    } else {
      // 일반 환경에서는 redirect 결과만 처리
      processRedirectResult();
    }
  }, [router, refetchUserData, registerFCMTokenSafely, handlePostLoginRouting]);

  /**
   * @description 카카오 로그인
   * 흐름:
   * 1. 카카오 회원가입/로그인 진행
   * 2. 신규 회원인 경우:
   *    2-1. 카카오 액세스 토큰을 sessionStorage에 저장
   *    2-2. FCM 토큰 등록 (실패해도 계속 진행)
   *    2-3. 온보딩 페이지로 이동 (온보딩 페이지에서 syncKakaoProfile 호출)
   * 3. 기존 사용자인 경우:
   *    3-1. 사용자 정보 조회
   *    3-2. FCM 토큰 등록 (실패해도 계속 진행)
   *    3-3. 닉네임 여부에 따라 온보딩 페이지 또는 홈으로 이동
   */
  const handleKakaoLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // 1. 카카오 로그인
      const { kakaoAccessToken, isNewUser } = await signInWithKakao();

      // 2. 신규 회원 처리
      if (isNewUser) {
        // 2-0. 신규 회원인데 토큰이 없는 경우 (권한 미동의, 프로바이더 오류 등)
        if (!kakaoAccessToken) {
          debug.error("신규 회원인데 카카오 액세스 토큰이 없습니다.");
          setIsLoading(false);
          setErrorMessage(
            "카카오 로그인 권한이 필요합니다. 다시 시도해 주세요."
          );
          return;
        }

        // 2-1. 카카오 액세스 토큰을 sessionStorage에 저장 (온보딩 페이지에서 사용)
        setKakaoAccessToken(kakaoAccessToken);

        // 2-2. FCM 토큰 등록 (실패해도 계속 진행)
        await registerFCMTokenSafely();

        // 2-3. 신규 회원은 항상 온보딩 페이지로 (next 파라미터 무시)
        setIsLoading(false);
        router.replace(LINK_URL.MY_PAGE_EDIT);
      }

      // 3. 기존 사용자 처리
      if (!isNewUser) {
        try {
          // 3-1. 사용자 정보 조회
          const { data: userData } = await refetchUserData();
          const hasNickname = !!userData?.nickname;

          // 3-2. FCM 토큰 등록 (실패해도 계속 진행)
          await registerFCMTokenSafely();

          // 3-3. 닉네임 여부에 따라 라우팅
          setIsLoading(false);
          handlePostLoginRouting(hasNickname);
        } catch (error) {
          debug.error("사용자 정보 조회 실패:", error);
          setIsLoading(false);
          setErrorMessage("사용자 정보 조회에 실패했습니다.");
        }
      }
    } catch (error) {
      debug.error("카카오 로그인(handleKakaoLogin) 실패:", error);
      setIsLoading(false);
      setErrorMessage("카카오 로그인에 실패했어요. 다시 시도해 주세요.");
    }
  };

  return (
    <main className="relative flex h-screen flex-col items-center justify-center bg-white px-4 pb-8">
      <div className="relative top-1/4 aspect-[210/80] w-[60vw] max-w-[280px] min-w-[160px]">
        <Image
          src={IMAGE_URL.ICON.logo.youthVoice.url}
          alt={IMAGE_URL.ICON.logo.youthVoice.alt}
          fill
          sizes="(min-width: 768px) 30vw, 60vw"
          className="object-contain"
        />
      </div>
      <div className="mt-auto flex w-full flex-col gap-19">
        <div className="flex w-full flex-col gap-3">
          <ButtonBase
            onClick={handleKakaoLogin}
            disabled={isLoading}
            className="bg-kakao flex w-full items-center justify-center gap-2 rounded-lg py-3 disabled:opacity-60"
          >
            <Image
              src={IMAGE_URL.ICON.logo.kakao.url}
              alt={IMAGE_URL.ICON.logo.kakao.alt}
              width={18}
              height={18}
            />
            <Typography font="noto" variant="body2B">
              {isLoading ? "카카오로 접속 중..." : "카카오로 시작하기"}
            </Typography>
          </ButtonBase>
        </div>
        {errorMessage && (
          <div className="mt-3 text-center">
            <Typography font="noto" variant="label1M" className="text-red-500">
              {errorMessage}
            </Typography>
          </div>
        )}
        <div className="flex items-center justify-center gap-4">
          <Link href={LINK_URL.TERMS_OF_SERVICE}>
            <Typography font="noto" variant="label1M" className="text-gray-400">
              이용약관
            </Typography>
          </Link>
          <Link href={LINK_URL.PRIVACY_POLICY}>
            <Typography font="noto" variant="label1M" className="text-gray-400">
              개인정보 처리방침
            </Typography>
          </Link>
        </div>
      </div>
    </main>
  );
};

/**
 * @description 로그인 페이지 (Suspense로 감싸기)
 */
const LoginPage = () => {
  return (
    <Suspense>
      <LoginPageContent />
    </Suspense>
  );
};

export default LoginPage;
