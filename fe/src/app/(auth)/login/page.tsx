"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ButtonBase from "@/components/shared/base/button-base";
import { Typography } from "@/components/shared/typography";
import { IMAGE_URL } from "@/constants/shared/_image-url";
import { LINK_URL } from "@/constants/shared/_link-url";
import {
  useGetUsersMe,
  usePostUsersMeSyncKakaoProfile,
} from "@/hooks/generated/users-hooks";
import { useFCM } from "@/hooks/shared/useFCM";
import { signInWithKakao } from "@/lib/auth";
import { debug } from "@/utils/shared/debugger";

/**
 * @description 로그인 페이지 (카카오/이메일)
 */
const LoginPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { registerFCMToken } = useFCM();

  const { mutateAsync: syncMutateAsync } = usePostUsersMeSyncKakaoProfile({
    retry: 1, // 실패 시 1회 재시도
    retryDelay: 2000, // 재시도 간격: 2초
  });
  const { refetch: refetchUserData } = useGetUsersMe({
    enabled: false, // 자동 실행 비활성화
    select: (data) => {
      return data?.user;
    },
  });

  /**
   * @description 카카오 로그인
   * 흐름:
   * 1. 카카오 회원가입/로그인 진행
   * 2. 신규 회원인 경우:
   *    2-1. 카카오 프로필 동기화 API 호출
   *    2-2. FCM 토큰 등록 (실패해도 계속 진행)
   *    2-3. 온보딩 페이지로 이동
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

        // 2-1. 카카오 프로필 동기화 (비동기 완료 대기, React Query가 자동으로 1회 재시도)
        try {
          await syncMutateAsync({
            data: {
              accessToken: kakaoAccessToken,
            },
          });
          // 성공 시, 프로필 편집(온보딩)페이지로 이동
          debug.log("카카오 프로필 동기화 성공");
          router.replace(LINK_URL.MY_PAGE_EDIT);
        } catch (error) {
          // 모든 시도 실패 시 (React Query가 자동으로 1회 재시도한 후 실패)
          debug.error("카카오 프로필 동기화 실패:", error);
          setErrorMessage("카카오 프로필 동기화에 실패했습니다.");
          router.replace(LINK_URL.LOGIN);
        } finally {
          setIsLoading(false);
        }

        // 2-2. FCM 토큰 등록 (실패해도 계속 진행)
        try {
          await registerFCMToken();
        } catch (fcmError) {
          debug.error("FCM 토큰 저장 실패:", fcmError);
          // FCM 토큰 저장 실패해도 로그인은 계속 진행
        }
      }

      // 3. 기존 사용자 처리
      if (!isNewUser) {
        try {
          // 3-1. 사용자 정보 조회
          const { data: userData } = await refetchUserData();
          const hasNickname = !!userData?.nickname;

          // 3-2. FCM 토큰 등록 (실패해도 계속 진행)
          try {
            await registerFCMToken();
          } catch (fcmError) {
            debug.error("FCM 토큰 저장 실패:", fcmError);
            // FCM 토큰 저장 실패해도 로그인은 계속 진행
          }

          // 3-3. 닉네임 여부에 따라 라우팅
          setIsLoading(false);
          if (hasNickname) {
            router.replace(LINK_URL.HOME);
          } else {
            router.replace(LINK_URL.MY_PAGE_EDIT);
          }
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

          {/* <Link
            href={LINK_URL.EMAIL_LOGIN}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white py-3"
          >
            <Image
              src={IMAGE_URL.ICON.login.email.url}
              alt={IMAGE_URL.ICON.login.email.alt}
              width={18}
              height={18}
            />
            <Typography font="noto" variant="body2B" className="text-gray-900">
              이메일로 시작하기
            </Typography>
          </Link> */}
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

export default LoginPage;
