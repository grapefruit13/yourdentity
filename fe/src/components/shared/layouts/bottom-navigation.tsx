"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IMAGE_URL } from "@/constants/shared/_image-url";
import { cn } from "@/utils/shared/cn";

/**
 * @description 하단 네비게이션 바
 */
const BottomNavigation = () => {
  const pathname = usePathname();
  const isMissionActive = pathname?.startsWith("/mission") === true;
  const isCommunityActive = pathname?.startsWith("/community") === true;
  const isMyPageActive = pathname?.startsWith("/my-page") === true;

  return (
    <nav className="pb-safe fixed right-0 bottom-0 left-0 z-50 flex w-full items-center justify-center gap-14 border-t border-gray-200 bg-white/90 pt-3 backdrop-blur-sm">
      <Link href="/mission">
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
              isMissionActive && "text-[#FF006C]"
            )}
          >
            미션
          </span>
        </button>
      </Link>
      <Link href="/community">
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
              isCommunityActive && "text-[#FF006C]"
            )}
          >
            커뮤니티
          </span>
        </button>
      </Link>
      <Link href="/my-page">
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
              isMyPageActive && "text-[#FF006C]"
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
