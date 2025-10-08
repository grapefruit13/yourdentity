"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IMAGE_URL } from "@/constants/shared/_image-url";
import { LINK_URL } from "@/constants/shared/_link-url";
import { cn } from "@/utils/shared/cn";

/**
 * @description 하단 네비게이션 바
 */
const BottomNavigation = () => {
  const pathname = usePathname();
  const isHomeActive = pathname?.startsWith(LINK_URL.HOME) === true;
  const isMissionActive = pathname?.startsWith(LINK_URL.MISSION) === true;
  const isCommunityActive = pathname?.startsWith(LINK_URL.COMMUNITY) === true;
  const isMyPageActive = pathname?.startsWith(LINK_URL.MY_PAGE) === true;

  return (
    <nav className="fixed right-0 bottom-0 z-50 flex h-23 w-full items-center justify-center gap-14 bg-slate-100 pt-3 pb-5">
      <Link href={LINK_URL.HOME}>
        <button className="flex flex-col items-center justify-center gap-1 hover:cursor-pointer">
          <Image
            src={
              isHomeActive
                ? IMAGE_URL.ICON.home.active.url
                : IMAGE_URL.ICON.home.inactive.url
            }
            alt={
              isHomeActive
                ? IMAGE_URL.ICON.home.active.alt
                : IMAGE_URL.ICON.home.inactive.alt
            }
            width={28}
            height={28}
          />
          <span
            className={cn(
              "text-xs leading-none font-semibold text-gray-400",
              isHomeActive && "text-primary-600"
            )}
          >
            홈
          </span>
        </button>
      </Link>
      <Link href={LINK_URL.MISSION}>
        <button className="flex flex-col items-center justify-center gap-1 hover:cursor-pointer">
          <Image
            src={
              isMissionActive
                ? IMAGE_URL.ICON.mission.active.url
                : IMAGE_URL.ICON.mission.inactive.url
            }
            alt={
              isMissionActive
                ? IMAGE_URL.ICON.mission.active.alt
                : IMAGE_URL.ICON.mission.inactive.alt
            }
            width={28}
            height={28}
          />
          <span
            className={cn(
              "text-xs leading-none font-semibold text-gray-400",
              isMissionActive && "text-primary-600"
            )}
          >
            미션
          </span>
        </button>
      </Link>
      <Link href={LINK_URL.COMMUNITY}>
        <button className="flex flex-col items-center justify-center gap-1 hover:cursor-pointer">
          <Image
            src={
              isCommunityActive
                ? IMAGE_URL.ICON.community.active.url
                : IMAGE_URL.ICON.community.inactive.url
            }
            alt={
              isCommunityActive
                ? IMAGE_URL.ICON.community.active.alt
                : IMAGE_URL.ICON.community.inactive.alt
            }
            width={28}
            height={28}
          />
          <span
            className={cn(
              "text-xs leading-none font-semibold text-gray-400",
              isCommunityActive && "text-primary-600"
            )}
          >
            커뮤니티
          </span>
        </button>
      </Link>
      <Link href={LINK_URL.MY_PAGE}>
        <button className="flex flex-col items-center justify-center gap-1 hover:cursor-pointer">
          <Image
            src={
              isMyPageActive
                ? IMAGE_URL.ICON.myPage.active.url
                : IMAGE_URL.ICON.myPage.inactive.url
            }
            alt={
              isMyPageActive
                ? IMAGE_URL.ICON.myPage.active.alt
                : IMAGE_URL.ICON.myPage.inactive.alt
            }
            width={28}
            height={28}
          />
          <span
            className={cn(
              "text-xs leading-none font-semibold text-gray-400",
              isMyPageActive && "text-primary-600"
            )}
          >
            마이
          </span>
        </button>
      </Link>
    </nav>
  );
};

export default BottomNavigation;
