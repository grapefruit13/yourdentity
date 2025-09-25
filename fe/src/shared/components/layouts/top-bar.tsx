"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { IMAGE_URL } from "@/shared/constants/_image-url";

const TITLE_MAP: Array<{ prefix: string; label: string }> = [
  { prefix: "/community", label: "커뮤니티" },
  { prefix: "/my-page", label: "마이" },
];

/**
 * @description 상단 고정바
 */
const TopBar = () => {
  const pathname = usePathname();
  const currentTitle =
    TITLE_MAP.find((item) => pathname?.startsWith(item.prefix))?.label ?? "";
  return (
    <div className="sticky top-0 left-0 flex h-12 w-full items-center justify-center bg-slate-100">
      <Image
        src={IMAGE_URL.ICON.chevron.left.url}
        alt={IMAGE_URL.ICON.chevron.left.alt}
        width={20}
        height={20}
        className="absolute left-4"
      />
      <span>{currentTitle}</span>
    </div>
  );
};

export default TopBar;
