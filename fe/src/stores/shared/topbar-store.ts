import type { ReactNode } from "react";
import { create } from "zustand";

type TopBarStore = {
  isScrolled: boolean;
  setIsScrolled: (isScrolled: boolean) => void;
  title: string | null;
  setTitle: (title: string | null) => void;
  rightSlot: ReactNode | null;
  setRightSlot: (rightSlot: ReactNode | null) => void;
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
  rightSlot: null,
  setRightSlot: (rightSlot) => set({ rightSlot }),
  reset: () => set({ title: null, rightSlot: null }),
}));
