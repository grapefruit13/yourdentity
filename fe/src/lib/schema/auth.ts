import { z } from "zod";
import { EMAIL_REGEX, PASSWORD_REGEX } from "@/constants/auth/_auth-regex";
import { AUTH_MESSAGE } from "@/constants/auth/_message";

/**
 * @description 로그인 폼 validation 스키마
 */
export const loginFormSchema = z.object({
  email: z
    .string()
    .min(1, "이메일을 입력해주세요")
    .regex(EMAIL_REGEX, "올바른 이메일 형식을 입력해주세요"),
  password: z
    .string()
    .min(1, AUTH_MESSAGE.LOGIN.PASSWORD.MIN)
    .regex(PASSWORD_REGEX, AUTH_MESSAGE.LOGIN.PASSWORD.REGEX),
});
