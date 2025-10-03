"use client";

import { ChevronRight, Settings } from "lucide-react";

/**
 * @description 프로필 정보 카드 컴포넌트
 */
const ProfileCard = () => {
  return (
    <div className="flex w-full items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
      {/* 프로필 아바타 */}
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
          <div className="h-8 w-8 rounded-full bg-gray-400"></div>
        </div>
        
        {/* 사용자 정보 */}
        <div className="flex flex-col">
          <span className="text-sm text-gray-500">티머</span>
          <span className="text-lg font-bold text-black">아이디최대몇글자에요</span>
        </div>
      </div>
      
      {/* 화살표 아이콘 */}
      <ChevronRight className="h-6 w-6 text-gray-400" />
    </div>
  );
};

export default ProfileCard;
