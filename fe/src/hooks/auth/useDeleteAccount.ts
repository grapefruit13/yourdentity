import { useMutation } from "@tanstack/react-query";
import { deleteUserAccount } from "@/lib/auth";
import { debug } from "@/utils/shared/debugger";

/**
 * @description 회원 탈퇴 훅
 * - 카카오 재인증
 * - 백엔드 API 호출 (카카오 연결 해제 + Firestore 가명처리)
 * - Firebase Auth 사용자 삭제
 */
export const useDeleteAccount = () => {
  return useMutation({
    mutationFn: async () => {
      await deleteUserAccount();
    },
    onSuccess: () => {
      debug.log("회원 탈퇴 성공");
    },
    onError: (error) => {
      debug.error("회원 탈퇴 실패:", error);
    },
  });
};
