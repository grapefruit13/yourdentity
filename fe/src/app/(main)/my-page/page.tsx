"use client";

import { useRouter } from "next/navigation";
import { Settings } from "lucide-react";
import ActionButtons from "@/components/my-page/ActionButtons";
import PointsCard from "@/components/my-page/PointsCard";
import ProfileCard from "@/components/my-page/ProfileCard";
import { Typography } from "@/components/shared/typography";

/**
 * @description 마이 페이지
 */
const Page = () => {
  const router = useRouter();

  const handleSettingsClick = () => {
    router.push("/settings");
  };

  return (
    <div className="flex h-full w-full flex-col bg-gray-50">
      {/* 헤더 */}
      <header className="flex w-full items-center justify-between p-4 pb-6">
        <Typography font="noto" variant="title5">
          나다움 공간
        </Typography>
        <button
          onClick={handleSettingsClick}
          className="rounded-full p-2 transition-colors hover:bg-gray-100"
        >
          <Settings className="h-6 w-6 text-black" />
        </button>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="flex flex-col gap-4 px-4 pb-6">
        {/* 프로필 카드 */}
        <ProfileCard />

        {/* 포인트 카드 */}
        <PointsCard points={200} />

        {/* 액션 버튼들 */}
        <ActionButtons />
      </main>
    </div>
  );
};

export default Page;
