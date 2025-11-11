import { useEffect, type RefObject } from "react";

/**
 * @description 외부 클릭 감지 훅
 * @param ref - 감지할 요소의 ref
 * @param handler - 외부 클릭 시 실행할 콜백
 * @param enabled - 훅 활성화 여부 (기본값: true)
 * @param event - 이벤트 타입 (기본값: "mousedown")
 */
export const useClickOutside = <T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>,
  handler: () => void,
  enabled = true,
  event: "mousedown" | "mouseup" | "click" = "mousedown"
) => {
  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    };

    document.addEventListener(event, handleClickOutside);
    return () => {
      document.removeEventListener(event, handleClickOutside);
    };
  }, [ref, handler, enabled, event]);
};
