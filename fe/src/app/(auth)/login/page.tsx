"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import ButtonBase from "@/components/shared/base/button-base";
import { Typography } from "@/components/shared/typography";
import { IMAGE_URL } from "@/constants/shared/_image-url";
import { LINK_URL } from "@/constants/shared/_link-url";
import { useGetUsersMe } from "@/hooks/generated/users-hooks";
import { useFCM } from "@/hooks/shared/useFCM";
import { signInWithKakao, handleKakaoRedirectResult } from "@/lib/auth";
import { auth } from "@/lib/firebase";
import {
  getCachedRedirectData,
  setCachedRedirectData,
  clearCachedRedirectData,
} from "@/utils/auth/cache-auth";
import { setKakaoAccessToken } from "@/utils/auth/kakao-access-token";
import { debug } from "@/utils/shared/debugger";
import { isIOSDevice, isStandalone } from "@/utils/shared/device";

/**
 * @description 로그인 페이지 콘텐츠 (useSearchParams 사용)
 */
const LoginPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL 파라미터와 해시 확인하여 redirect 후 돌아왔는지 즉시 감지
  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window === "undefined") return false;

    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));

    const hasAuthParams =
      urlParams.has("code") ||
      urlParams.has("error") ||
      urlParams.has("state") ||
      hashParams.has("code") ||
      hashParams.has("error") ||
      hashParams.has("state");

    // redirect 후 돌아온 경우 로딩 상태로 시작
    return hasAuthParams;
  });

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
   * @description 카카오 redirect 결과 처리 (페이지 로드 시 즉시 호출)
   *
   * Firebase 공식 문서에 따르면, getRedirectResult는 페이지가 로드되자마자 즉시 호출해야 합니다.
   * onAuthStateChanged를 기다리면 안 되며, redirect 후 결과가 소비될 수 있습니다.
   *
   * 참고: https://firebase.google.com/docs/auth/web/redirect-best-practices
   */
  useEffect(() => {
    let isProcessing = false;

    const processRedirectResult = async () => {
      // 이미 처리 중이면 무시
      if (isProcessing) return;
      isProcessing = true;

      // redirect 후 돌아왔는지 확인 (URL 파라미터 체크)
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const hasAuthParams =
        urlParams.has("code") ||
        urlParams.has("error") ||
        urlParams.has("state") ||
        hashParams.has("code") ||
        hashParams.has("error") ||
        hashParams.has("state");

      // iOS PWA 플래그 확인
      const isPWAFlag = urlParams.get("isPWA") === "true";

      // iOS PWA에서 WebView로 열린 경우: 쿼리스트링을 캐시스토리지에 저장하고 창 닫기
      if (isPWAFlag && hasAuthParams) {
        debug.log("iOS PWA WebView에서 redirect 돌아옴 - 캐시스토리지에 저장");

        try {
          // 쿼리스트링 데이터를 캐시스토리지에 저장
          await setCachedRedirectData({
            code: urlParams.get("code") || hashParams.get("code") || undefined,
            error:
              urlParams.get("error") || hashParams.get("error") || undefined,
            state:
              urlParams.get("state") || hashParams.get("state") || undefined,
            hashParams: {
              code: hashParams.get("code") || undefined,
              error: hashParams.get("error") || undefined,
              state: hashParams.get("state") || undefined,
            },
          });

          debug.log("캐시스토리지 저장 완료, WebView 닫기 시도");

          // WebView 닫기
          window.close();

          // 만약 window.close()가 작동하지 않는 경우를 위한 안내 메시지
          setTimeout(() => {
            setIsLoading(false);
            setErrorMessage("창을 닫고 앱으로 돌아가주세요.");
          }, 1000);

          return;
        } catch (error) {
          debug.error("캐시스토리지 저장 실패:", error);
          setIsLoading(false);
          setErrorMessage("로그인 처리 중 오류가 발생했습니다.");
          return;
        }
      }

      // iOS PWA에서 캐시스토리지에 저장된 redirect 데이터가 있는지 확인
      if (!isPWAFlag && isIOSDevice() && isStandalone()) {
        const cachedData = await getCachedRedirectData();

        if (cachedData) {
          debug.log("캐시스토리지에서 redirect 데이터 발견:", cachedData);

          // 캐시 데이터를 URL로 복원 (handleKakaoRedirectResult가 읽을 수 있도록)
          const restoreParams = new URLSearchParams();
          if (cachedData.code) restoreParams.set("code", cachedData.code);
          if (cachedData.error) restoreParams.set("error", cachedData.error);
          if (cachedData.state) restoreParams.set("state", cachedData.state);

          // 원래 next 파라미터 유지
          const originalNext = searchParams.get("next");
          if (originalNext) {
            restoreParams.set("next", originalNext);
          }

          // URL을 복원 (history.replaceState로 실제 URL 변경)
          const restoredUrl = `${window.location.origin}${LINK_URL.LOGIN}?${restoreParams.toString()}`;
          window.history.replaceState(
            { ...window.history.state, as: restoredUrl, url: restoredUrl },
            "",
            restoredUrl
          );

          // 캐시 삭제
          await clearCachedRedirectData();

          debug.log("URL 복원 완료, redirect 처리 계속 진행");

          // URL이 복원되었으므로 hasAuthParams를 true로 설정
          // 하지만 실제로는 현재 루프에서 계속 진행
        }
      }

      // redirect로 돌아온 경우, auth 파라미터만 제거하여 깔끔한 URL 유지
      if (hasAuthParams && !isPWAFlag && typeof window !== "undefined") {
        const originalNext = urlParams.get("next") || searchParams.get("next");
        const cleanSearchParams = new URLSearchParams();
        if (originalNext) {
          cleanSearchParams.set("next", originalNext);
        }
        const cleanQuery = cleanSearchParams.toString();
        const cleanUrl = `${window.location.origin}${LINK_URL.LOGIN}${cleanQuery ? `?${cleanQuery}` : ""}`;

        // 현재 히스토리 엔트리를 교체하여 auth 파라미터 제거
        window.history.replaceState(
          { ...window.history.state, as: cleanUrl, url: cleanUrl },
          "",
          cleanUrl
        );
      }

      try {
        // 페이지 로드 시 즉시 getRedirectResult 호출 (Firebase 권장 방식)
        // iOS PWA에서는 cacheStorage를 통해 쿼리스트링 손실 문제를 해결
        const redirectResult = await handleKakaoRedirectResult();

        if (redirectResult) {
          const { kakaoAccessToken, isNewUser } = redirectResult;

          setIsLoading(true);
          debug.log("로그인 결과 처리 시작", { isNewUser });

          // 신규 회원 처리
          if (isNewUser) {
            if (!kakaoAccessToken) {
              debug.error("신규 회원인데 카카오 액세스 토큰이 없습니다.");
              setIsLoading(false);
              setErrorMessage(
                "카카오 로그인 권한이 필요합니다. 다시 시도해 주세요."
              );
              return;
            }

            setKakaoAccessToken(kakaoAccessToken);
            await registerFCMTokenSafely();
            setIsLoading(false);

            debug.log("신규 회원 처리 완료, 온보딩 페이지로 이동");
            router.replace(LINK_URL.MY_PAGE_EDIT);
            return;
          }

          // 기존 사용자 처리
          const { data: userData } = await refetchUserData();
          const hasNickname = !!userData?.nickname;
          await registerFCMTokenSafely();
          setIsLoading(false);

          debug.log("기존 사용자 처리 완료", { hasNickname });
          handlePostLoginRouting(hasNickname);
        } else {
          debug.log("redirectResult가 null - 일반 로그인 화면");
        }
      } catch (error) {
        debug.error("카카오 redirect 결과 처리 실패:", error);
        setIsLoading(false);
        setErrorMessage("카카오 로그인 처리에 실패했습니다.");
      } finally {
        isProcessing = false;
      }
    };

    // 페이지 로드 시 즉시 redirect 결과 확인
    processRedirectResult();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * @description 일반 인증 상태 관찰 (redirect 결과가 없을 때 사용)
   *
   * 이미 로그인된 사용자가 로그인 페이지에 접근한 경우를 처리합니다.
   * redirect 결과 처리는 위의 useEffect에서 먼저 처리되므로,
   * 여기서는 일반적인 인증 상태만 확인합니다.
   */
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    unsubscribe = onAuthStateChanged(auth, (user) => {
      // redirect 결과 처리는 위의 useEffect에서 처리하므로,
      // 여기서는 redirect 파라미터가 없고 이미 로그인된 경우만 처리
      if (!user) return;

      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));

      const hasAuthParams =
        urlParams.has("code") ||
        urlParams.has("error") ||
        urlParams.has("state") ||
        hashParams.has("code") ||
        hashParams.has("error") ||
        hashParams.has("state");

      // redirect 파라미터가 없고 이미 로그인된 사용자인 경우
      if (!hasAuthParams) {
        debug.log("이미 로그인된 사용자:", user.uid);
        try {
          refetchUserData()
            .then(({ data: userData }) => {
              const hasNickname = !!userData?.nickname;
              handlePostLoginRouting(hasNickname);
            })
            .catch((error) => {
              debug.error("사용자 정보 조회 실패:", error);
            });
        } catch (error) {
          debug.error("사용자 정보 조회 실패:", error);
        }
      }
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
   *
   * iOS PWA의 경우:
   * - isPWA 플래그가 없는 메인 PWA: WKWebView로 로그인 창을 열고 대기
   * - isPWA 플래그가 있는 WebView: 실제 로그인 수행, redirect 후 캐시스토리지에 저장
   */
  const handleKakaoLogin = async () => {
    // 현재 URL에 isPWA 플래그가 있는지 확인
    const urlParams = new URLSearchParams(window.location.search);
    const isPWAFlag = urlParams.get("isPWA") === "true";

    // iOS PWA에서 isPWA 플래그가 없는 경우: WKWebView로 로그인 페이지 열기
    if (isIOSDevice() && isStandalone() && !isPWAFlag) {
      debug.log("iOS PWA (메인) - WKWebView로 로그인 페이지 열기");

      // 현재 페이지의 next 파라미터 유지
      const currentNext = returnTo || "";
      const loginParams = new URLSearchParams();
      loginParams.set("isPWA", "true");
      if (currentNext) {
        loginParams.set("next", currentNext);
      }

      const loginUrl = `${window.location.origin}${LINK_URL.LOGIN}?${loginParams.toString()}`;

      // window.open으로 WKWebView 열기
      const windowRef = window.open(loginUrl, "_blank");

      // 팝업 차단 확인
      if (
        !windowRef ||
        windowRef.closed ||
        typeof windowRef.closed === "undefined"
      ) {
        debug.warn("팝업이 차단되었습니다. 일반 네비게이션으로 폴백");
        // 팝업 차단 시 일반 로그인 진행 (아래로 계속)
      } else {
        // WKWebView가 성공적으로 열린 경우
        debug.log("WKWebView로 로그인 페이지 열기 성공, 캐시 데이터 대기");

        // 주기적으로 캐시스토리지 확인
        const checkInterval = setInterval(async () => {
          const cachedData = await getCachedRedirectData();
          if (cachedData) {
            clearInterval(checkInterval);
            debug.log("캐시스토리지에서 로그인 데이터 수신, 처리 시작");

            // 캐시 데이터로 로그인 처리 (페이지 새로고침)
            window.location.reload();
          }
        }, 500); // 500ms마다 확인

        // 30초 후 타임아웃
        setTimeout(() => {
          clearInterval(checkInterval);
        }, 30000);

        return; // 함수 종료
      }
    }

    // WebView 내부 또는 일반 브라우저: 실제 로그인 수행
    debug.log("실제 카카오 로그인 수행", { isPWAFlag });

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
      debug.error("카카오 로그인 실패:", error);
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
