import { IMAGE_URL } from "./_image-url";
import { LINK_URL } from "./_link-url";

const isDev = process.env.NODE_ENV === "development";

const MISSION_TAB = {
  key: "mission" as const,
  label: "미션",
  href: LINK_URL.MISSION,
  icon: IMAGE_URL.ICON.mission.url,
} as const;

export const BOTTOM_NAV_TABS = [
  {
    key: "home" as const,
    label: "홈",
    href: LINK_URL.HOME,
    icon: IMAGE_URL.ICON.home.url,
  },
  // 개발 환경에서만 미션 탭 표시
  ...(isDev ? [MISSION_TAB] : []),
  {
    key: "community" as const,
    label: "피드",
    href: LINK_URL.COMMUNITY,
    icon: IMAGE_URL.ICON.community.url,
  },
  {
    key: "myPage" as const,
    label: "마이",
    href: LINK_URL.MY_PAGE,
    icon: IMAGE_URL.ICON.myPage.url,
  },
];
