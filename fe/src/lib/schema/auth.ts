import { z } from "zod";
import { EMAIL_REGEX, PASSWORD_REGEX } from "@/constants/auth/_auth-regex";

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
    .min(1, "비밀번호를 입력해주세요")
    .regex(
      PASSWORD_REGEX,
      "비밀번호는 문자, 숫자를 포함하여 6자 이상이어야 합니다"
    ),
});
