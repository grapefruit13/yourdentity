"use client";

import { useMemo, type ReactNode } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { IMAGE_URL } from "@/constants/shared/_image-url";
import { LINK_URL } from "@/constants/shared/_link-url";
import { TOPBAR_TITLE_MAP } from "@/constants/shared/_topbar-title-map";
import { useTopBarStore } from "@/stores/shared/topbar-store";
import AlarmButton from "../AlarmButton";
import { Typography } from "../typography";

/**
 * @description 상단 고정바
 */
type TopBarProps = {
  title?: string;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
};

const TopBar = ({ title, leftSlot, rightSlot }: TopBarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const isScrolled = useTopBarStore((state) => state.isScrolled);
  const storeTitle = useTopBarStore((state) => state.title);
  const storeLeftSlot = useTopBarStore((state) => state.leftSlot);
  const storeRightSlot = useTopBarStore((state) => state.rightSlot);

  const currentTitle =
    title ||
    storeTitle ||
    TOPBAR_TITLE_MAP.find((item) => pathname?.startsWith(item.prefix))?.label ||
    "\n";

  const handleClick = () => {
    // 커뮤니티 상세 페이지에서 작성 페이지로 돌아가지 않도록 커뮤니티 목록으로 리다이렉트
    if (pathname?.startsWith("/community/post/")) {
      router.replace(LINK_URL.COMMUNITY);
    } else {
      router.back();
    }
  };

  // 홈 페이지 체크
  const isHomePage = pathname === LINK_URL.HOME;

  const isCommunityPage = pathname === LINK_URL.COMMUNITY;
  const isMyPage = pathname === LINK_URL.MY_PAGE;
  const showBackButton = !isCommunityPage && !isMyPage && !isHomePage;
  const showAlarmButton = isHomePage;

  const alarmButtonEl = useMemo(() => {
    return <AlarmButton variant="topbar" />;
  }, []);

  const rightSlotEl = useMemo(() => {
    if (showAlarmButton) return alarmButtonEl;
    if (rightSlot) return <div className="absolute right-4">{rightSlot}</div>;
    if (storeRightSlot)
      return <div className="absolute right-4">{storeRightSlot}</div>;
    return <div className="size-6"></div>;
  }, [showAlarmButton, alarmButtonEl, rightSlot, storeRightSlot]);

  return (
    <div
      className={
        "fixed top-0 z-50 mx-auto flex h-12 w-full max-w-[470px] items-center justify-between border-b px-5 py-3 transition-all duration-500 ease-out " +
        (isHomePage && !isScrolled
          ? "border-b-transparent bg-transparent"
          : "border-b-gray-200 bg-white shadow-sm")
      }
    >
      {/* Left Slot (홈 페이지 로고 등): leftSlot 지정사항이 없을 때 기본 Back Button 표시 */}
      {leftSlot || storeLeftSlot || !showBackButton ? (
        <div>{leftSlot || storeLeftSlot}</div>
      ) : (
        <button onClick={handleClick} className="hover:cursor-pointer">
          <Image
            src={IMAGE_URL.ICON.chevron.left.url}
            alt={IMAGE_URL.ICON.chevron.left.alt}
            width={24}
            height={24}
          />
        </button>
      )}

      {/* Title */}
      <Typography
        font="noto"
        variant="body1M"
        className="max-w-[285px] overflow-hidden text-ellipsis whitespace-nowrap"
      >
        {currentTitle}
      </Typography>

      {/* Right Slot */}
      {rightSlotEl}
    </div>
  );
};

export default TopBar;
