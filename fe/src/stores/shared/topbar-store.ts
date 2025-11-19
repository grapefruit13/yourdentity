import type { ReactNode } from "react";
import { create } from "zustand";

type TopBarStore = {
  isScrolled: boolean;
  setIsScrolled: (isScrolled: boolean) => void;
  title: string | null;
  setTitle: (title: string | null) => void;
  leftSlot: ReactNode | null;
  setLeftSlot: (leftSlot: ReactNode | null) => void;
  rightSlot: ReactNode | null;
  setRightSlot: (rightSlot: ReactNode | null) => void;
  /**
   * @description TopBar 숨김 여부
   * 주요 정적 경로(예: /mission, /my-page)는 레이아웃에서 pathname 기반으로 처리합니다.
   * 이 스토어는 동적 조건이 필요한 경우에만 사용하세요 (예: /mission/list의 isFirstEnter 조건).
   */
  hideTopBar: boolean;
  setHideTopBar: (hideTopBar: boolean) => void;
  reset: () => void;
};

/**
 * @description TopBar 상태 관리 스토어
 */
export const useTopBarStore = create<TopBarStore>((set) => ({
  isScrolled: false,
  setIsScrolled: (isScrolled) => set({ isScrolled }),
  title: null,
  setTitle: (title) => set({ title }),
  leftSlot: null,
  setLeftSlot: (leftSlot) => set({ leftSlot }),
  rightSlot: null,
  setRightSlot: (rightSlot) => set({ rightSlot }),
  hideTopBar: false,
  setHideTopBar: (hideTopBar) => set({ hideTopBar }),
  reset: () =>
    set({ title: null, leftSlot: null, rightSlot: null, hideTopBar: false }),
}));
