"use client";

import { useRouter } from "next/navigation";
import AlarmButton from "@/components/shared/AlarmButton";
import { Typography } from "@/components/shared/typography";
import { LINK_URL } from "@/constants/shared/_link-url";

type CommunityTab = "program" | "mission";

interface CommunityTabsProps {
  /** 현재 활성화된 탭 */
  activeTab: CommunityTab;
}

/**
 * @description 커뮤니티 상단 프로그램/미션 탭 공통 컴포넌트
 * - 프로그램 탭: /community
 * - 미션 탭: /community/mission
 */
export const CommunityTabs = ({ activeTab }: CommunityTabsProps) => {
  const router = useRouter();

  const handleProgramClick = () => {
    router.push(LINK_URL.COMMUNITY);
  };

  const handleMissionClick = () => {
    router.push(LINK_URL.COMMUNITY_MISSION);
  };

  const isProgramActive = activeTab === "program";
  const isMissionActive = activeTab === "mission";

  return (
    <div className="flex h-12 items-center justify-between bg-white">
      <div className="flex items-center gap-4">
        <button
          type="button"
          className={isProgramActive ? "pb-1 text-black" : "pb-1 text-gray-400"}
          onClick={handleProgramClick}
        >
          <Typography font="noto" variant="title4">
            프로그램
          </Typography>
        </button>
        <button
          type="button"
          className={isMissionActive ? "pb-1 text-black" : "pb-1 text-gray-400"}
          onClick={handleMissionClick}
        >
          <Typography font="noto" variant="title4">
            미션
          </Typography>
        </button>
      </div>
      <AlarmButton />
    </div>
  );
};

export default CommunityTabs;
