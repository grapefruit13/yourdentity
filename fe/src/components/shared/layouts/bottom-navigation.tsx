"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/shared/ui/icon";
import { BOTTOM_NAV_TABS } from "@/constants/shared/_bottom-nav-tabs";
import { cn } from "@/utils/shared/cn";

/**
 * @description 하단 네비게이션 바
 */
const BottomNavigation = () => {
  const pathname = usePathname();

  return (
    <nav className="pb-safe fixed bottom-0 left-1/2 z-50 flex w-full -translate-x-1/2 items-center justify-center gap-14 border-t border-gray-200 bg-white/90 pt-3 backdrop-blur-sm">
      {BOTTOM_NAV_TABS.map((tab) => {
        const isActive = pathname.startsWith(tab.href);

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
              className={cn(isActive ? "text-primary-600" : "text-gray-400")}
              aria-label={tab.label}
              role="img"
            />
            <span
              className={cn(
                "text-xs leading-none font-semibold text-gray-400",
                isActive && "text-primary-600"
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
