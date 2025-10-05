import Image from "next/image";
import Link from "next/link";
import { NBody2B, NLabel1M } from "@/components/shared/typography";
import { IMAGE_URL } from "@/constants/shared/_image-url";
import { LINK_URL } from "@/constants/shared/_link-url";

/**
 * @description 홈페이지 - 로그인 화면
 */
const HomePage = () => {
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
          <Link
            href={LINK_URL.KAKAO_LOGIN}
            className="bg-kakao flex w-full items-center justify-center gap-2 rounded-lg py-3"
          >
            <Image
              src={IMAGE_URL.ICON.logo.kakao.url}
              alt={IMAGE_URL.ICON.logo.kakao.alt}
              width={18}
              height={18}
            />
            <NBody2B>카카오로 시작하기</NBody2B>
          </Link>
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
            <NBody2B className="text-gray-900">이메일로 시작하기</NBody2B>
          </Link>
        </div>
        <div className="flex items-center justify-center gap-4">
          <Link href={LINK_URL.TERMS_OF_SERVICE}>
            <NLabel1M className="text-gray-400">이용약관</NLabel1M>
          </Link>
          <Link href={LINK_URL.PRIVACY_POLICY}>
            <NLabel1M className="text-gray-400">개인정보 처리방침</NLabel1M>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default HomePage;