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
