"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { IMAGE_URL } from "@/constants/shared/_image-url";
import { LINK_URL } from "@/constants/shared/_link-url";
import { getCurrentUser } from "@/lib/auth";
import { cn } from "@/utils/shared/cn";

interface FloatingWriteButtonProps {
  /** 바텀시트 열기 핸들러 */
  onOpenBottomSheet?: () => void;
}

/**
 * @description 커뮤니티 글 작성 플로팅 버튼
 * BottomNavigation 위에 고정되어 스크롤해도 보이는 버튼
 */
const FloatingWriteButton = ({
  onOpenBottomSheet,
}: FloatingWriteButtonProps) => {
  const router = useRouter();

  const handleClick = () => {
    const user = getCurrentUser();
    if (!user) {
      router.push(LINK_URL.LOGIN);
      return;
    }

    // 바텀시트 열기 핸들러가 있으면 바텀시트 열기, 없으면 바로 작성 페이지로 이동
    if (onOpenBottomSheet) {
      onOpenBottomSheet();
    } else {
      router.push("/community/write");
    }
  };

  return (
    <div className="pointer-events-none fixed bottom-[97px] left-1/2 z-50 w-full max-w-[470px] -translate-x-1/2 px-5">
      <button
        onClick={handleClick}
        className={cn(
          "pointer-events-auto ml-auto flex items-center gap-[6px] rounded-full bg-[#FF2479] px-5 py-3 shadow-lg transition-all hover:bg-[#E01F6B] active:scale-95"
        )}
        aria-label="글 작성하기"
        tabIndex={0}
      >
        <Image
          src={IMAGE_URL.ICON.penLine.url}
          alt={IMAGE_URL.ICON.penLine.alt}
          width={16}
          height={16}
          className="h-4 w-4"
        />
        <span className="text-sm font-medium text-white">작성하기</span>
      </button>
    </div>
  );
};

export default FloatingWriteButton;
