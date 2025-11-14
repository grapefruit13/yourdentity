"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/shared/ui/icon";
import { BOTTOM_NAV_TABS } from "@/constants/shared/_bottom-nav-tabs";
import { LINK_URL } from "@/constants/shared/_link-url";
import { cn } from "@/utils/shared/cn";

/**
 * @description 하단 네비게이션 바
 */
const BottomNavigation = () => {
  const pathname = usePathname();

  // 최상단 뎁스 경로 목록
  const topLevelPaths = [
    LINK_URL.HOME,
    LINK_URL.COMMUNITY,
    LINK_URL.MY_PAGE,
  ] as const;

  // 현재 경로가 최상단 뎁스 경로 중 하나와 정확히 일치하는지 확인
  const shouldShow = topLevelPaths.some((path) => pathname === path);

  // 최상단 뎁스 경로가 아니면 렌더링하지 않음
  if (!shouldShow) {
    return null;
  }

  return (
    <nav className="pb-safe fixed bottom-0 left-1/2 z-50 flex w-full max-w-[470px] -translate-x-1/2 items-center justify-center gap-14 border-t border-gray-200 bg-white/90 pt-3 backdrop-blur-sm">
      {BOTTOM_NAV_TABS.map((tab) => {
        const isActive = pathname === tab.href;

        return (
          <Link
            key={tab.key}
            href={tab.href}
            className="flex flex-col items-center justify-center gap-1 hover:cursor-pointer"
          >
            <Icon
              src={tab.icon}
              width={28}
              height={28}
              className={cn(isActive ? "text-main-600" : "text-gray-400")}
              aria-label={tab.label}
              role="img"
            />
            <span
              className={cn(
                "text-xs leading-none font-semibold text-gray-400",
                isActive && "text-main-600"
              )}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNavigation;
