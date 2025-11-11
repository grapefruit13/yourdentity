"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Icon from "@/components/shared/ui/icon";
import { BOTTOM_NAV_TABS } from "@/constants/shared/_bottom-nav-tabs";
import { LINK_URL } from "@/constants/shared/_link-url";
import { useGetUsersMe } from "@/hooks/generated/users-hooks";
import { cn } from "@/utils/shared/cn";

/**
 * @description 하단 네비게이션 바
 */
const BottomNavigation = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { data: userData, isFetched } = useGetUsersMe({
    select: (data) => data?.user,
    staleTime: 5 * 60 * 1000,
  });
  const hasNickname = Boolean(userData?.nickname?.trim());
  const shouldBlockMyTab = isFetched && !hasNickname;

  return (
    <nav className="pb-safe fixed bottom-0 left-1/2 z-50 flex w-full max-w-[470px] -translate-x-1/2 items-center justify-center gap-14 border-t border-gray-200 bg-white/90 pt-3 backdrop-blur-sm">
      {BOTTOM_NAV_TABS.map((tab) => {
        const isActive = pathname.startsWith(tab.href);
        const isMyTab = tab.key === "myPage";
        const targetHref =
          isMyTab && shouldBlockMyTab ? LINK_URL.MY_PAGE_EDIT : tab.href;

        return (
          <Link
            key={tab.key}
            href={targetHref}
            className="flex flex-col items-center justify-center gap-1 hover:cursor-pointer"
            onClick={
              isMyTab && shouldBlockMyTab
                ? (event) => {
                    event.preventDefault();
                    router.replace(LINK_URL.MY_PAGE_EDIT);
                  }
                : undefined
            }
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
