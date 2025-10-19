import { z } from "zod";
import { loginFormSchema } from "@/lib/schema/auth";

/**
 * @description 로그인 폼 데이터 타입
 */
export type TLoginForm = z.infer<typeof loginFormSchema>;
