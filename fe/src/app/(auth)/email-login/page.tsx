"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ButtonBase from "@/components/shared/base/button-base";
import Input from "@/components/shared/input";
import { NBody1B, NBody2M, NLabel1M } from "@/components/shared/typography";
import { IMAGE_URL } from "@/constants/shared/_image-url";
import { LINK_URL } from "@/constants/shared/_link-url";
import useToggle from "@/hooks/shared/useToggle";
import { cn } from "@/utils/shared/cn";

/**
 * @description 이메일 로그인 페이지
 */
const EmailLoginPage = () => {
  const { isOpen, toggle } = useToggle();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const isLoginValidate = email && password;

  /**
   * @description 로그인 제출
   * @param e - 폼 이벤트
   */
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert("로그인 제출");
    // TODO: 메인 홈으로 이동. 현재는 미정.
    router.push(LINK_URL.MISSION);
  };

  return (
    <form
      className="flex h-full flex-col bg-white px-5 py-6"
      onSubmit={handleSubmit}
    >
      <div className="flex h-fit flex-col gap-6">
        <div className="flex flex-col gap-3">
          <NBody2M>아이디 (이메일)</NBody2M>
          <Input
            type="email"
            placeholder="이메일을 입력하세요"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-3">
          <NBody2M>비밀번호</NBody2M>
          <div className="relative">
            <Input
              type={isOpen ? "text" : "password"}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
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
      <ButtonBase
        type="submit"
        disabled={!isLoginValidate}
        className={cn(
          "bg-primary-600 mt-auto w-full rounded-lg py-2",
          !isLoginValidate && "opacity-50"
        )}
      >
        <NBody1B className="text-white">로그인</NBody1B>
      </ButtonBase>
    </form>
  );
};

export default EmailLoginPage;