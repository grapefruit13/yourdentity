"use client";

import { useMemo, type ReactNode } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Settings } from "lucide-react";
import { IMAGE_URL } from "@/constants/shared/_image-url";
import { LINK_URL } from "@/constants/shared/_link-url";
import { TOPBAR_TITLE_MAP } from "@/constants/shared/_topbar-title-map";
import { useTopBarStore } from "@/stores/shared/topbar-store";
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
  const currentTitle =
    title ||
    TOPBAR_TITLE_MAP.find((item) => pathname?.startsWith(item.prefix))?.label ||
    "\n";

  const handleClick = () => {
    router.back();
  };

  const handleNotificationClick = () => {
    // TODO: 알림 페이지로 이동 또는 알림 모달 표시
    // router.push("/notifications");
  };

  const handleSettingsClick = () => {
    router.push("/settings");
  };

  // 홈 페이지 체크
  const isHomePage = pathname === LINK_URL.HOME;

  const isCommunityPage = pathname === LINK_URL.COMMUNITY;
  const isMyPage = pathname?.startsWith(LINK_URL.MY_PAGE);
  const showBackButton = !isCommunityPage && !isMyPage && !isHomePage;
  const showAlarmButton = isHomePage || isCommunityPage;

  const alarmButtonEl = useMemo(() => {
    return (
      <button
        onClick={handleNotificationClick}
        className="absolute right-4 p-2 hover:cursor-pointer"
        aria-label="알림"
      >
        <svg
          className="h-6 w-6 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      </button>
    );
  }, [handleNotificationClick]);

  const rightSlotEl = useMemo(() => {
    if (showAlarmButton) return alarmButtonEl;
    if (rightSlot) return <div className="absolute right-4">{rightSlot}</div>;
    return null;
  }, [showAlarmButton, alarmButtonEl, rightSlot]);

  return (
    <div
      className={
        "fixed top-0 z-50 mx-auto flex h-12 w-full max-w-[470px] items-center justify-center border-b px-5 py-3 transition-all duration-500 ease-out " +
        (isHomePage && !isScrolled
          ? "border-b-transparent bg-transparent"
          : "border-b-gray-200 bg-white shadow-sm")
      }
    >
      {/* Left Slot (홈 페이지 로고 등): leftSlot 지정사항이 없을 때 기본 Back Button 표시 */}
      {leftSlot || !showBackButton ? (
        <div className="absolute left-4">{leftSlot}</div>
      ) : (
        <button
          onClick={handleClick}
          className="absolute left-4 hover:cursor-pointer"
        >
          <Image
            src={IMAGE_URL.ICON.chevron.left.url}
            alt={IMAGE_URL.ICON.chevron.left.alt}
            width={20}
            height={20}
          />
        </button>
      )}

      {/* Title */}
      <Typography font="noto" variant="body1M">
        {currentTitle}
      </Typography>

      {/* Right Slot */}
      {rightSlotEl}

      {/* 마이페이지 설정 버튼 */}
      {isMyPage && (
        <button
          onClick={handleSettingsClick}
          className="absolute right-4 rounded-full p-2 transition-colors hover:bg-gray-100"
          aria-label="설정"
        >
          <Settings className="h-6 w-6 text-black" />
        </button>
      )}
    </div>
  );
};

export default TopBar;
