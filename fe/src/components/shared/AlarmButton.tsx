"use client";

import { useRouter } from "next/navigation";
import { LINK_URL } from "@/constants/shared/_link-url";

/**
 * @description 알람 아이콘 버튼 컴포넌트
 * 추후 알람 히스토리 페이지로 이동하도록 구현되어 있습니다.
 */
const AlarmButton = () => {
  const router = useRouter();

  const handleNotificationClick = () => {
    router.push(LINK_URL.NOTIFICATIONS);
  };

  return (
    <button
      onClick={handleNotificationClick}
      className="hover:cursor-pointer"
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
};

export default AlarmButton;
