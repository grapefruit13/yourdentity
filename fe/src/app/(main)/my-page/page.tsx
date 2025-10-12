"use client";

import { useRouter } from "next/navigation";
import ActionButtons from "@/components/my-page/ActionButtons";
import PointsCard from "@/components/my-page/PointsCard";
import ProfileCard from "@/components/my-page/ProfileCard";
import ButtonBase from "@/components/shared/base/button-base";
import { Typography } from "@/components/shared/typography";

/**
 * @description 마이 페이지
 */
const Page = () => {
  const router = useRouter();

  // FIXME: 로그인 페이지 접근 위해 만든 임시 핸들러. 추후 삭제 예정
  const handleLoginClick = () => {
    router.push("/login");
  };

  return (
    <div className="flex min-h-full w-full flex-col bg-gray-50">
      {/* 메인 컨텐츠 */}
      <main className="flex flex-col gap-4 px-4 py-6">
        {/* 프로필 카드 */}
        <ProfileCard />

        {/* 포인트 카드 */}
        <PointsCard points={200} />

        {/* 액션 버튼들 */}
        <ActionButtons />
        {/* FIXME: 로그인 페이지 접근 위해 임시로 만든 버튼. 추후 삭제 예정. */}
        <ButtonBase
          onClick={handleLoginClick}
          className="bg-primary-600 rounded-lg py-2"
        >
          <Typography font="noto" variant="body1B" className="text-white">
            로그인
          </Typography>
        </ButtonBase>
      </main>
    </div>
  );
};

export default Page;
