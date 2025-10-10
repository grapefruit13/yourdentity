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
    <nav className="fixed right-0 bottom-0 z-50 flex h-23 w-full items-center justify-center gap-14 bg-slate-100 pt-3 pb-5">
      {BOTTOM_NAV_TABS.map((tab) => {
        const isActive = pathname?.startsWith(tab.href) === true;
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
