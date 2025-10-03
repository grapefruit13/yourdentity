"use client";

import Image from "next/image";
import Link from "next/link";
import ButtonBase from "@/components/shared/base/button-base";
import InputBase from "@/components/shared/base/input-base";
import { NBody1B, NBody2M, NLabel1M } from "@/components/shared/typography";
import { IMAGE_URL } from "@/constants/shared/_image-url";
import { LINK_URL } from "@/constants/shared/_link-url";
import useToggle from "@/hooks/shared/useToggle";

/**
 * @description 이메일 로그인 페이지
 */
const EmailLoginPage = () => {
  const { isOpen, toggle } = useToggle();

  return (
    <div className="flex h-full flex-col bg-white px-5 py-6">
      <div className="flex h-fit flex-col gap-6">
        <div className="flex flex-col gap-3">
          <NBody2M>아이디 (이메일)</NBody2M>
          <InputBase
            type="email"
            placeholder="이메일을 입력하세요"
            className="font-noto rounded-md border border-gray-200 px-3 py-2 text-base leading-1.5 font-normal shadow-xs"
          />
        </div>
        <div className="flex flex-col gap-3">
          <NBody2M>비밀번호</NBody2M>
          <div className="relative">
            <InputBase
              type={isOpen ? "text" : "password"}
              placeholder="비밀번호를 입력하세요"
              className="font-noto w-full rounded-md border border-gray-200 px-3 py-2 pr-10 text-base leading-1.5 font-normal shadow-xs"
            />
            <ButtonBase type={"button"} onClick={toggle}>
              <Image
                src={
                  isOpen
                    ? IMAGE_URL.ICON.eye.on.url
                    : IMAGE_URL.ICON.eye.off.url
                }
                alt={
                  isOpen
                    ? IMAGE_URL.ICON.eye.on.alt
                    : IMAGE_URL.ICON.eye.off.alt
                }
                width={20}
                height={20}
                className="absolute top-1/2 right-3 -translate-y-1/2"
              />
            </ButtonBase>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center gap-4 pt-10">
        <Link href={LINK_URL.FIND_PASSWORD}>
          <NLabel1M className="text-gray-400">비밀번호 찾기</NLabel1M>
        </Link>
        <Link href={LINK_URL.EMAIL_SIGNUP}>
          <NLabel1M className="text-gray-400">이메일 회원가입</NLabel1M>
        </Link>
      </div>
      <ButtonBase className="bg-primary-600 mt-auto w-full rounded-lg py-2 opacity-70">
        <NBody1B className="text-white">로그인</NBody1B>
      </ButtonBase>
    </div>
  );
};

export default EmailLoginPage;
