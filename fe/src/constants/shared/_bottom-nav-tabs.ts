import { IMAGE_URL } from "./_image-url";
import { LINK_URL } from "./_link-url";

export const BOTTOM_NAV_TABS = [
  {
    key: "home" as const,
    label: "홈",
    href: LINK_URL.HOME,
    icon: IMAGE_URL.ICON.home.url,
  },
  // MVP 범위에서 제외
  // {
  //   key: "mission" as const,
  //   label: "미션",
  //   href: LINK_URL.MISSION,
  //   icon: IMAGE_URL.ICON.mission.url,
  // },
  {
    key: "community" as const,
    label: "커뮤니티",
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
