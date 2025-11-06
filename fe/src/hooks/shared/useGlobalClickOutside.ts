import { useEffect, useRef } from "react";
import type { RefObject } from "react";

type TargetHandler = {
  ref: RefObject<HTMLElement | null>;
  onOutside: () => void;
};

/**
 * 문서 전역에 단일 이벤트 리스너를 붙여, 여러 대상 엘리먼트에 대한 "바깥 클릭"을 처리합니다.
 * enabled가 true일 때만 리스너가 활성화됩니다.
 */
export function useGlobalClickOutside(
  enabled: boolean,
  targets: TargetHandler[],
  event: "mousedown" | "mouseup" | "click" = "mousedown"
) {
  const targetsRef = useRef<TargetHandler[]>(targets);

  // 최신 targets를 보관
  useEffect(() => {
    targetsRef.current = targets;
  }, [targets]);

  useEffect(() => {
    if (!enabled) return;

    const handler = (e: MouseEvent) => {
      const node = e.target as Node;
      const list = targetsRef.current;
      for (let i = 0; i < list.length; i += 1) {
        const { ref, onOutside } = list[i];
        const el = ref.current;
        if (el && !el.contains(node)) {
          onOutside();
        }
      }
    };

    document.addEventListener(event, handler);
    return () => {
      document.removeEventListener(event, handler);
    };
  }, [enabled, event]);
}
