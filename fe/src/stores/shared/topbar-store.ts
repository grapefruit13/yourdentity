import { create } from "zustand";

type TopBarStore = {
  isScrolled: boolean;
  setIsScrolled: (isScrolled: boolean) => void;
};

/**
 * @description TopBar 상태 관리 스토어
 * 홈 페이지 스크롤 상태를 전역으로 관리
 */
export const useTopBarStore = create<TopBarStore>((set) => ({
  isScrolled: false,
  setIsScrolled: (isScrolled) => set({ isScrolled }),
}));
