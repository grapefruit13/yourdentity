import { useMutation } from "@tanstack/react-query";
import { UserCredential } from "firebase/auth";
import { signInWithEmail } from "@/lib/auth";
import { TLoginRequest } from "@/types/auth/request";
import { ErrorResponse, Result } from "@/types/shared/response";

/**
 * @description 이메일 로그인 mutation 훅
 * @returns React Query mutation 객체
 */
export const useEmailLogin = () =>
  useMutation<Result<UserCredential>, ErrorResponse, TLoginRequest>({
    mutationFn: (request: TLoginRequest) =>
      signInWithEmail(request.email, request.password),
  });
