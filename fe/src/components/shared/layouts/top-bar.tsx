"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { IMAGE_URL } from "@/constants/shared/_image-url";
import { TOPBAR_TITLE_MAP } from "@/constants/shared/_topbar-title-map";
import { Typography } from "../typography";

/**
 * @description 상단 고정바
 */
const TopBar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const currentTitle =
    TOPBAR_TITLE_MAP.find((item) => pathname?.startsWith(item.prefix))?.label ??
    "";

  const handleClick = () => {
    router.back();
  };

  return (
    <div className="sticky top-0 left-0 flex h-12 w-full items-center justify-center border-b border-b-gray-200 bg-white px-5 py-3">
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
      <Typography font="noto" variant="body1M">
        {currentTitle}
      </Typography>
    </div>
  );
};

export default TopBar;
