import { toast as sonnerToast } from "sonner";
import { CustomToast } from "@/components/shared/ui/custom-toast";

type ToastOptions = {
  duration?: number;
};

/**
 * @description 커스텀 토스트 메시지를 표시하는 유틸리티 함수
 * 모든 페이지에서 사용할 수 있는 공통 토스트 메시지
 *
 * @param message - 표시할 메시지
 * @param options - 토스트 옵션 (duration 등)
 *
 * @example
 * ```tsx
 * import { showToast } from "@/utils/shared/toast";
 *
 * showToast("미션을 그만뒀어요. 다음 미션을 진행할까요?", {
 *   duration: 2000,
 * });
 * ```
 */
export const showToast = (message: string, options?: ToastOptions) => {
  const DEFAULT_DURATION_MS = 2000;

  sonnerToast.custom(() => <CustomToast message={message} />, {
    duration: options?.duration ?? DEFAULT_DURATION_MS,
    position: "bottom-center",
    unstyled: true,
  });
};
