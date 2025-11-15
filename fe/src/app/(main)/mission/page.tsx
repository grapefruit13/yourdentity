"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, Info, Loader, Target } from "lucide-react";
import { MissionCertificationCard } from "@/components/mission/mission-certification-card";
import ButtonBase from "@/components/shared/base/button-base";
import { Typography } from "@/components/shared/typography";
import { Button } from "@/components/shared/ui/button";
import { ProgressGauge } from "@/components/shared/ui/progress-gauge";
import { LINK_URL } from "@/constants/shared/_link-url";

/**
 * @description 미션 페이지
 */
// TODO: 진행하고 있는 미션 유무에 따라 문구랑 카드 내용 바뀜
const Page = () => {
  const router = useRouter();

  return (
    <div className="h-full min-h-screen bg-gray-200">
      <div className="p-5">
        <Typography
          font="noto"
          variant="heading2B"
          className="pb-4 text-gray-950"
        >
          오늘의 미션을 시작해 볼까요?
        </Typography>
        <div className="mt-4 mb-1 flex w-full flex-col items-center justify-center rounded-lg bg-white py-6">
          <Loader className="mb-2 h-6 w-6 text-gray-400" />
          <Typography
            font="noto"
            variant="body1B"
            className="text-center text-gray-950"
          >
            진행 중인 미션이 없어요. <br />
            미션을 시작해 보세요!
          </Typography>
        </div>

        <Button
          variant="default"
          size="default"
          className="w-full rounded-lg"
          onClick={() => router.push(LINK_URL.MISSION_LIST)}
        >
          <Typography font="noto" variant="body3B" className="text-white">
            미션 보러가기
          </Typography>
          <ChevronRight className="h-4 w-4 text-white" />
        </Button>
      </div>

      {/* 흰화면 */}
      <div className="h-full rounded-2xl bg-white px-5 py-6">
        {/* 미션 진척 현황 */}
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-gray-400" />
          <Typography font="noto" variant="heading3B" className="text-gray-950">
            미션 진척 현황
          </Typography>
        </div>
        <div className="mt-3 grid grid-cols-[1.2fr_1fr] grid-rows-2 gap-2">
          {/* 왼쪽 큰 패널: 행 2개 병합 */}
          <div className="row-span-2 flex flex-col items-center justify-center rounded-lg border border-gray-200 py-2">
            {/* 왼쪽 패널 내용 */}
            <Typography font="noto" variant="label1R" className="text-gray-950">
              오늘의 미션 인증 현황
            </Typography>
            <ProgressGauge total={3} completed={3} />
          </div>

          {/* 오른쪽 위 패널 */}
          <div className="rounded-lg border border-gray-200 bg-gray-100 px-3 py-2">
            {/* 오른쪽 위 패널 내용 */}
            <div className="flex items-center gap-1">
              <Typography
                font="noto"
                variant="label1R"
                className="text-gray-950"
              >
                연속 미션일
              </Typography>
              <Info className="size-3 text-gray-400" />
            </div>
            <div className="flex items-center gap-1">
              <Typography
                font="noto"
                variant="heading1B"
                className="text-gray-600"
              >
                999
              </Typography>
              <Typography
                font="noto"
                variant="label2R"
                className="text-gray-400"
              >
                일
              </Typography>
            </div>
          </div>

          {/* 오른쪽 아래 패널 */}
          <div className="rounded-lg border border-gray-200 bg-gray-100 px-3 py-2">
            {/* 오른쪽 아래 패널 내용 */}
            <div className="flex items-center gap-1">
              <Typography
                font="noto"
                variant="label1R"
                className="text-gray-950"
              >
                진행 미션 수
              </Typography>
              <Info className="size-3 text-gray-400" />
            </div>
            <div className="flex items-center gap-1">
              <Typography
                font="noto"
                variant="heading1B"
                className="text-gray-600"
              >
                999
              </Typography>
              <Typography
                font="noto"
                variant="label2R"
                className="text-gray-400"
              >
                개
              </Typography>
            </div>
          </div>
        </div>
        {/* 친구들이 인증한 미션이에요 */}
        <div className="mt-9 mb-5 flex w-full items-center justify-between">
          <Typography font="noto" variant="heading3B" className="text-gray-950">
            친구들이 인증한 미션이에요
          </Typography>
          <ButtonBase
            className="flex items-center justify-center gap-1"
            onClick={() => router.push(LINK_URL.COMMUNITY)}
          >
            <Typography font="noto" variant="body3R" className="text-gray-400">
              더 보기
            </Typography>
            <ChevronRight className="size-3 text-gray-400" />
          </ButtonBase>
        </div>
        {/* 후기 슬라이딩 */}
        <div className="scrollbar-hide -mx-5 flex gap-3 overflow-x-auto overflow-y-hidden px-5">
          {/* TODO: 카드 클릭 시 미션 인증이 올라간 피드 상세로 이동 */}
          <MissionCertificationCard
            title="오늘 하늘이 이뻤어요!"
            thumbnailText="두줄까지 미리보기로 보이게!! 구름이 뭉게뭉게 있어서 하늘이 이뻐요! 두줄까지 미리보기로 보이게!! 구름이 뭉게뭉게 있어서 하늘이 이뻐요!"
            thumbnailImageUrl="/imgs/mockup3.jpg"
            tagName="건강한 아침 러닝 30분 하기"
            postId="1"
          />
          <MissionCertificationCard
            title="오늘 하늘이 이뻤어요!"
            thumbnailText="두줄까지 미리보기로 보이게!! 구름이 뭉게뭉게 있어서 하늘이 이뻐요! 두줄까지 미리보기로 보이게!! 구름이 뭉게뭉게 있어서 하늘이 이뻐요!"
            thumbnailImageUrl="/imgs/mockup3.jpg"
            tagName="건강한 아침 러닝 30분 하기"
            postId="1"
          />
        </div>
      </div>
    </div>
  );
};

export default Page;
