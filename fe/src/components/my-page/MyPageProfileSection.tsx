"use client";

import { useRouter } from "next/navigation";
import { User, Settings } from "lucide-react";
import ButtonBase from "@/components/shared/base/button-base";
import { Typography } from "@/components/shared/typography";
import { Skeleton } from "@/components/ui/skeleton";
import { LINK_URL } from "@/constants/shared/_link-url";

interface MyPageProfileSectionProps {
  /** 프로필 이미지 URL (선택) */
  profileImageUrl?: string;
  /** 닉네임 */
  nickname?: string;
  /** 자기소개 */
  bio?: string;
  /** 인증 글 수 */
  postCount?: number;
  /** 활동 참여 수 */
  activityCount?: number;
  /** 포인트 */
  points?: number;
  /** 프로필 편집 버튼 클릭 핸들러 */
  onEditClick: () => void;
  /** 로딩 상태 */
  isLoading?: boolean;
}

/**
 * @description 마이페이지 프로필 섹션 컴포넌트
 * - 프로필 이미지, 닉네임, 자기소개
 * - 통계 정보 (인증 글, 활동 참여, 포인트)
 * - 프로필 편집 버튼 및 설정 버튼
 * - 로딩 중일 때 스켈레톤 표시
 */
const MyPageProfileSection = ({
  profileImageUrl,
  nickname,
  bio,
  postCount,
  activityCount,
  points,
  onEditClick,
  isLoading = false,
}: MyPageProfileSectionProps) => {
  const router = useRouter();

  const handleSettingsClick = () => {
    router.push(LINK_URL.SETTINGS);
  };

  // 로딩 중이거나 데이터가 없을 때 스켈레톤 표시
  if (isLoading || !nickname) {
    return (
      <div className="flex flex-col bg-white pt-7 pb-6">
        {/* 상단: 프로필 이미지 + 통계 정보 */}
        <div className="mb-3 flex items-center justify-between">
          {/* 프로필 이미지 스켈레톤 */}
          <Skeleton className="h-[75px] w-[75px] rounded-full" />

          {/* 통계 정보 스켈레톤 */}
          <div className="flex w-[280px] justify-between">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex flex-col items-center gap-1">
                <Skeleton className="h-6 w-8" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        </div>

        {/* 닉네임 스켈레톤 */}
        <Skeleton className="mb-2 h-6 w-24" />

        {/* 자기소개 스켈레톤 */}
        <Skeleton className="mb-[13px] h-4 w-full" />

        {/* 프로필 편집 버튼 및 설정 버튼 스켈레톤 */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 flex-1 rounded-lg" />
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-white pt-7 pb-6">
      {/* 상단: 프로필 이미지 + 통계 정보 */}
      <div className="mb-4 flex items-center justify-between">
        {/* 프로필 이미지 */}
        <div className="flex h-[75px] w-[75px] items-center justify-center overflow-hidden rounded-full bg-pink-100">
          {profileImageUrl ? (
            <img
              src={profileImageUrl}
              alt="프로필 이미지"
              className="h-full w-full object-cover"
            />
          ) : (
            <User className="h-9 w-9 text-pink-400" strokeWidth={1.5} />
          )}
        </div>

        {/* 통계 정보 */}
        <div className="flex w-[280px] justify-between">
          {/* 인증 글 */}
          <div className="flex flex-col items-center gap-1">
            <Typography
              font="noto"
              variant="heading2B"
              className="text-gray-900"
            >
              {postCount ?? 0}
            </Typography>
            <Typography font="noto" variant="body2R" className="text-gray-600">
              인증 글
            </Typography>
          </div>

          {/* 활동 참여 */}
          <div className="flex flex-col items-center gap-1">
            <Typography
              font="noto"
              variant="heading2B"
              className="text-gray-900"
            >
              {activityCount ?? 0}
            </Typography>
            <Typography font="noto" variant="body2R" className="text-gray-600">
              활동 참여
            </Typography>
          </div>

          {/* 포인트 */}
          <div className="flex flex-col items-center gap-1">
            <Typography
              font="noto"
              variant="heading2B"
              className="text-gray-900"
            >
              {points ?? 0}
            </Typography>
            <Typography font="noto" variant="body2R" className="text-gray-600">
              포인트
            </Typography>
          </div>
        </div>
      </div>

      {/* 닉네임 */}
      <Typography
        font="noto"
        variant="heading2B"
        className="mb-2 text-left text-gray-900"
      >
        {nickname ?? "-"}
      </Typography>

      {/* 자기소개 */}
      <Typography
        font="noto"
        variant="body2R"
        className="mb-[13px] text-left text-gray-600"
      >
        {bio ?? ""}
      </Typography>

      {/* 프로필 편집 버튼 및 설정 버튼 */}
      <div className="flex items-center gap-2">
        <ButtonBase
          onClick={onEditClick}
          className="h-10 flex-1 rounded-lg border border-gray-300 bg-white py-3 transition-colors hover:bg-gray-50"
        >
          <Typography font="noto" variant="body1M" className="text-gray-900">
            프로필 편집
          </Typography>
        </ButtonBase>

        <ButtonBase
          onClick={handleSettingsClick}
          className="h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white transition-colors hover:bg-gray-50"
          aria-label="설정"
        >
          <Settings className="h-5 w-5 text-gray-900" />
        </ButtonBase>
      </div>
    </div>
  );
};

export default MyPageProfileSection;
