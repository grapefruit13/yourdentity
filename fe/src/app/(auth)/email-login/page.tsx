"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import ButtonBase from "@/components/shared/base/button-base";
import Input from "@/components/shared/input";
import { Typography } from "@/components/shared/typography";
import AlertDialog from "@/components/shared/ui/dialog";
import { AUTH_MESSAGE } from "@/constants/auth/_message";
import { IMAGE_URL } from "@/constants/shared/_image-url";
import { LINK_URL } from "@/constants/shared/_link-url";
import { useEmailLogin } from "@/hooks/auth/useEmailLogin";
import useToggle from "@/hooks/shared/useToggle";
import { loginFormSchema } from "@/lib/schema/auth";
import { TLoginForm } from "@/types/auth/form";
import { ErrorResponse } from "@/types/shared/response";
import { cn } from "@/utils/shared/cn";
import { debug } from "@/utils/shared/debugger";

/**
 * @description 이메일 로그인 페이지
 */
const EmailLoginPage = () => {
  const router = useRouter();
  const { isOpen, toggle } = useToggle();
  const { isOpen: isAlertDialogOpen, toggle: toggleAlertDialog } = useToggle();
  const [alertMessage, setAlertMessage] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setError,
  } = useForm<TLoginForm>({
    mode: "onChange",
    resolver: zodResolver(loginFormSchema),
  });

  const { mutate: loginMutate, isPending: isLoginPending } = useEmailLogin();
  /**
   * @description 로그인 제출
   * @param data - 폼 데이터
   */
  const onSubmit = (data: TLoginForm) => {
    loginMutate(
      {
        email: data.email,
        password: data.password,
      },
      {
        onSuccess: (result) => {
          debug.log("로그인 성공:", result); // 성공: Result 형태 { data, status }
          router.push(LINK_URL.MISSION);
        },
        onError: (error) => {
          debug.error("로그인 실패:", error);
          const message =
            (error as ErrorResponse).message ??
            AUTH_MESSAGE.LOGIN.INVALID_CREDENTIALS;
          setError("email", { message });
          setError("password", { message });
          setAlertMessage(message);
          toggleAlertDialog();
        },
      }
    );
  };

  const isLoginEnabled = isValid && !isLoginPending;

  return (
    <form
      className="flex h-full flex-col bg-white px-5 py-6"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="flex h-fit flex-col gap-6">
        <div className="flex flex-col gap-3">
          <Typography font="noto" variant="body2M">
            {AUTH_MESSAGE.LOGIN.EMAIL.LABEL}
          </Typography>
          <div className="flex flex-col gap-1">
            <Input
              {...register("email")}
              type="email"
              placeholder={AUTH_MESSAGE.LOGIN.EMAIL.PLACEHOLDER}
              className={cn(
                "font-noto rounded-md border px-3 py-2 text-base leading-1.5 font-normal shadow-xs",
                errors.email ? "border-red-500" : "border-gray-200"
              )}
            />
            {errors.email && (
              <Typography
                font="noto"
                variant="label1R"
                className="text-red-500"
              >
                {errors.email.message}
              </Typography>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <Typography font="noto" variant="body2M">
            {AUTH_MESSAGE.LOGIN.PASSWORD.LABEL}
          </Typography>
          <div className="flex flex-col gap-1">
            <div className="relative">
              <Input
                {...register("password")}
                type={isOpen ? "text" : "password"}
                placeholder={AUTH_MESSAGE.LOGIN.PASSWORD.PLACEHOLDER}
                className={cn(
                  "font-noto w-full rounded-md border px-3 py-2 pr-10 text-base leading-1.5 font-normal shadow-xs",
                  errors.password ? "border-red-500" : "border-gray-200"
                )}
              />
              <ButtonBase type="button" onClick={toggle}>
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
            {errors.password && (
              <Typography
                font="noto"
                variant="label1R"
                className="text-red-500"
              >
                {errors.password.message}
              </Typography>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center gap-4 pt-10">
        <Link href={LINK_URL.FIND_PASSWORD}>
          <Typography font="noto" variant="label1M" className="text-gray-400">
            비밀번호 찾기
          </Typography>
        </Link>
        <Link href={LINK_URL.EMAIL_SIGNUP}>
          <Typography font="noto" variant="label1M" className="text-gray-400">
            이메일 회원가입
          </Typography>
        </Link>
      </div>
      <ButtonBase
        type="submit"
        disabled={!isLoginEnabled}
        className={cn(
          "bg-primary-600 mt-auto w-full rounded-lg py-2 hover:cursor-pointer",
          !isLoginEnabled && "opacity-50"
        )}
      >
        <Typography font="noto" variant="body1B" className="text-white">
          {isLoginPending
            ? AUTH_MESSAGE.LOGIN.LOADING
            : AUTH_MESSAGE.LOGIN.BUTTON}
        </Typography>
      </ButtonBase>
      {isAlertDialogOpen && (
        <AlertDialog
          isOpen={isAlertDialogOpen}
          title={AUTH_MESSAGE.LOGIN.TITLE_FAILURE}
          description={alertMessage}
        >
          <div className="flex gap-3 pt-2">
            <ButtonBase
              type="button"
              className="bg-primary-600 flex-1 rounded-lg px-4 py-2 active:opacity-70"
              onClick={toggleAlertDialog}
            >
              <Typography
                font="noto"
                variant="body2M"
                className="text-neutral-50"
              >
                확인
              </Typography>
            </ButtonBase>
          </div>
        </AlertDialog>
      )}
    </form>
  );
};

export default EmailLoginPage;
