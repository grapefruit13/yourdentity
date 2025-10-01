"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { IMAGE_URL } from "@/constants/shared/_image-url";

const TITLE_MAP: Array<{ prefix: string; label: string }> = [
  { prefix: "/mission", label: "미션" },
  { prefix: "/community", label: "커뮤니티" },
  { prefix: "/my-page", label: "마이" },
];

/**
 * @description 상단 고정바
 */
const TopBar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const currentTitle =
    TITLE_MAP.find((item) => pathname?.startsWith(item.prefix))?.label ?? "";

  const handleClick = () => {
    router.back();
  };

  return (
    <div className="sticky top-0 left-0 flex h-12 w-full items-center justify-center bg-slate-100">
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
      <span>{currentTitle}</span>
    </div>
  );
};

export default TopBar;
