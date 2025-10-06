"use client";

import { useRouter } from "next/navigation";
import { Settings } from "lucide-react";
import ActionButtons from "@/components/my-page/ActionButtons";
import PointsCard from "@/components/my-page/PointsCard";
import ProfileCard from "@/components/my-page/ProfileCard";
import { NTitle5 } from "@/components/shared/typography";

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
        <NTitle5>나다움 공간</NTitle5>
        <button
          onClick={handleSettingsClick}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <Settings className="h-6 w-6 text-black" />
        </button>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="flex flex-col px-4 pb-6 gap-4">
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
