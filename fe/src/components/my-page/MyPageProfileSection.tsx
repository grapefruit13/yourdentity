"use client";

import { User } from "lucide-react";
import ButtonBase from "@/components/shared/base/button-base";
import { Typography } from "@/components/shared/typography";

interface MyPageProfileSectionProps {
  /** 프로필 이미지 URL (선택) */
  profileImageUrl?: string;
  /** 닉네임 */
  nickname: string;
  /** 자기소개 */
  bio: string;
  /** 인증 글 수 */
  postCount: number;
  /** 활동 참여 수 */
  activityCount: number;
  /** 포인트 */
  points: number;
  /** 프로필 편집 버튼 클릭 핸들러 */
  onEditClick: () => void;
}

/**
 * @description 마이페이지 프로필 섹션 컴포넌트
 * - 프로필 이미지, 닉네임, 자기소개
 * - 통계 정보 (인증 글, 활동 참여, 포인트)
 * - 프로필 편집 버튼
 */
const MyPageProfileSection = ({
  profileImageUrl,
  nickname,
  bio,
  postCount,
  activityCount,
  points,
  onEditClick,
}: MyPageProfileSectionProps) => {
  return (
    <div className="flex flex-col bg-white px-4 pt-3 pb-4">
      {/* 상단: 프로필 이미지 + 통계 정보 */}
      <div className="mb-3 flex items-center justify-between">
        {/* 프로필 이미지 */}
        <div className="flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-full bg-pink-100">
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
        <div className="flex gap-10">
          {/* 인증 글 */}
          <div className="flex flex-col items-center gap-1">
            <Typography
              font="noto"
              variant="heading2B"
              className="text-gray-900"
            >
              {postCount}
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
              {activityCount}
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
              {points}
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
        className="mb-1 text-left text-gray-900"
      >
        {nickname}
      </Typography>

      {/* 자기소개 */}
      <Typography
        font="noto"
        variant="body2R"
        className="mb-3 text-left text-gray-600"
      >
        {bio}
      </Typography>

      {/* 프로필 편집 버튼 */}
      <ButtonBase
        onClick={onEditClick}
        className="w-full rounded-lg border border-gray-300 bg-white py-3 transition-colors hover:bg-gray-50"
      >
        <Typography font="noto" variant="body1M" className="text-gray-900">
          프로필 편집
        </Typography>
      </ButtonBase>
    </div>
  );
};

export default MyPageProfileSection;
