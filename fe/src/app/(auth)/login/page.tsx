"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ButtonBase from "@/components/shared/base/button-base";
import { Typography } from "@/components/shared/typography";
import { IMAGE_URL } from "@/constants/shared/_image-url";
import { LINK_URL } from "@/constants/shared/_link-url";
import { signInWithKakao } from "@/lib/auth";
import { debug } from "@/utils/shared/debugger";

/**
 * @description 로그인 페이지 (카카오/이메일)
 */
const LoginPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * @description 카카오 로그인
   */
  const handleKakaoLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await signInWithKakao();
      router.replace(LINK_URL.HOME);
    } catch (error) {
      debug.error("카카오 로그인에 실패했어요. 다시 시도해 주세요.", error);
      setErrorMessage("카카오 로그인에 실패했어요. 다시 시도해 주세요.");
      setIsLoading(false);
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

          <Link
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
          </Link>
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
