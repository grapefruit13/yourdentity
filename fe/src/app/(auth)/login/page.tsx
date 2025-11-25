"use client";

import { Suspense, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import ButtonBase from "@/components/shared/base/button-base";
import { Typography } from "@/components/shared/typography";
import { IMAGE_URL } from "@/constants/shared/_image-url";
import { LINK_URL } from "@/constants/shared/_link-url";
import { useGetUsersMe } from "@/hooks/generated/users-hooks";
import { useFCM } from "@/hooks/shared/useFCM";
import { signInWithKakao } from "@/lib/auth";
import { setKakaoAccessToken } from "@/utils/auth/kakao-access-token";
import { debug } from "@/utils/shared/debugger";

/**
 * @description 로그인 페이지 콘텐츠 (useSearchParams 사용)
 */
const LoginPageContent = () => {
  // 로그인 페이지에서 서비스워커를 일시적으로 비활성화하여
  // OAuth 리다이렉트 후 컨텍스트 유지 문제 방지
  useEffect(() => {
    const disableServiceWorker = async () => {
      if ("serviceWorker" in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration && registration.active) {
            // 서비스워커 unregister
            const unregistered = await registration.unregister();
            if (unregistered) {
              debug.log("[Login] Service Worker unregistered for login page");
              // 서비스워커가 제거되었으므로 페이지를 새로고침하여
              // 서비스워커 없이 로드되도록 함
              // 단, 이미 새로고침된 경우는 무한 루프 방지
              const hasRefreshed = sessionStorage.getItem("sw_unregistered");
              if (!hasRefreshed) {
                sessionStorage.setItem("sw_unregistered", "true");
                window.location.reload();
              }
            }
          }
        } catch (error) {
          debug.error("[Login] Failed to unregister service worker:", error);
        }
      }
    };

    // 페이지 로드 시 서비스워커가 활성화되어 있는지 확인하고 비활성화
    disableServiceWorker();
  }, []);
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
  const registerFCMTokenSafely = async () => {
    try {
      await registerFCMToken();
    } catch (fcmError) {
      debug.error("FCM 토큰 저장 실패:", fcmError);
      // FCM 토큰 저장 실패해도 로그인은 계속 진행
    }
  };

  /**
   * @description 로그인 성공 후 라우팅 처리
   * @param hasNickname - 닉네임 존재 여부
   */
  const handlePostLoginRouting = (hasNickname: boolean) => {
    if (hasNickname) {
      // 닉네임이 있으면 next 파라미터가 있으면 해당 경로로, 없으면 홈으로
      router.replace(returnTo || LINK_URL.HOME);
    } else {
      // 온보딩이 필요한 경우 next 파라미터 무시하고 온보딩 페이지로
      router.replace(LINK_URL.MY_PAGE_EDIT);
    }
  };

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
