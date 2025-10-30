"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Camera, User } from "lucide-react";
import ProfileImageBottomSheet from "@/components/my-page/ProfileImageBottomSheet";
import UnsavedChangesModal from "@/components/my-page/UnsavedChangesModal";
import { Typography } from "@/components/shared/typography";

/**
 * @description 프로필 편집 페이지
 * - 프로필 이미지, 닉네임, 자기소개 수정
 * - 변경사항 있을 때만 완료 버튼 활성화
 * - 변경사항 있는 상태에서 뒤로가기 시 확인 모달
 */
const ProfileEditPage = () => {
  const router = useRouter();

  // Ref for file inputs
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // FIXME: 실제로는 API에서 가져와야 함
  const [initialData] = useState({
    profileImageUrl: "",
    nickname: "한꽃땅",
    bio: "자기소개입니다",
  });

  const [profileImageUrl, setProfileImageUrl] = useState(
    initialData.profileImageUrl
  );
  const [nickname, setNickname] = useState(initialData.nickname);
  const [bio, setBio] = useState(initialData.bio);

  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [isUnsavedModalOpen, setIsUnsavedModalOpen] = useState(false);

  // 변경사항 확인
  const hasChanges =
    profileImageUrl !== initialData.profileImageUrl ||
    nickname !== initialData.nickname ||
    bio !== initialData.bio;

  // 완료 버튼 활성화 여부
  const isCompleteEnabled = hasChanges && nickname.trim() !== "";

  // 뒤로가기 핸들러
  const handleBack = () => {
    if (hasChanges) {
      setIsUnsavedModalOpen(true);
    } else {
      router.push("/my-page");
    }
  };

  // 완료 버튼 핸들러
  const handleComplete = () => {
    if (!isCompleteEnabled) return;

    // FIXME: 실제로는 API 호출해서 저장
    console.log("프로필 저장:", {
      profileImageUrl,
      nickname,
      bio,
    });

    router.push("/my-page");
  };

  // 파일 선택 처리 핸들러
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 이미지 파일인지 확인
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 선택할 수 있습니다.");
      return;
    }

    // 파일 크기 체크 (예: 5MB 제한)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert("파일 크기는 5MB 이하여야 합니다.");
      return;
    }

    // FileReader로 이미지 미리보기 URL 생성
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      setProfileImageUrl(imageUrl);
    };
    reader.readAsDataURL(file);

    // FIXME: 실제로는 여기서 서버에 업로드하거나 FormData에 저장
    console.log("선택된 파일:", file.name, file.size, file.type);
  };

  // 프로필 이미지 변경 핸들러
  const handleImageClick = () => {
    setIsBottomSheetOpen(true);
  };

  // 카메라 선택 핸들러
  const handleCameraSelect = () => {
    setIsBottomSheetOpen(false);
    // 카메라 입력 트리거
    cameraInputRef.current?.click();
  };

  // 갤러리 선택 핸들러
  const handleGallerySelect = () => {
    setIsBottomSheetOpen(false);
    // 갤러리 입력 트리거
    galleryInputRef.current?.click();
  };

  // 변경사항 저장 확인 모달 - 확인 버튼
  const handleUnsavedConfirm = () => {
    setIsUnsavedModalOpen(false);
    router.push("/my-page");
  };

  // 브라우저 뒤로가기 대응
  useEffect(() => {
    const handlePopState = () => {
      if (hasChanges) {
        // 뒤로가기를 막기 위해 다시 앞으로 이동
        window.history.pushState(null, "", window.location.href);
        setIsUnsavedModalOpen(true);
      }
    };

    // history에 현재 상태 추가 (최초 1회만)
    if (!window.history.state?.profileEdit) {
      window.history.pushState({ profileEdit: true }, "", window.location.href);
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [hasChanges]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50">
      {/* 커스텀 Top Bar */}
      <div className="fixed top-0 z-50 mx-auto flex h-12 w-full max-w-[470px] items-center justify-between border-b border-b-gray-200 bg-white px-5 py-3">
        {/* 뒤로가기 버튼 */}
        <button
          onClick={handleBack}
          className="hover:cursor-pointer"
          aria-label="뒤로가기"
        >
          <svg
            className="h-5 w-5 text-gray-900"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* 제목 */}
        <Typography font="noto" variant="body1M" className="text-gray-900">
          프로필 편집
        </Typography>

        {/* 완료 버튼 */}
        <button
          onClick={handleComplete}
          disabled={!isCompleteEnabled}
          className="disabled:cursor-not-allowed"
          aria-label="완료"
        >
          <Typography
            font="noto"
            variant="body1M"
            className={isCompleteEnabled ? "text-pink-600" : "text-gray-300"}
          >
            완료
          </Typography>
        </button>
      </div>

      {/* 메인 컨텐츠 */}
      <main className="mt-12 flex flex-col px-4 py-6">
        {/* 프로필 이미지 */}
        <div className="mb-6 flex justify-center">
          <button
            onClick={handleImageClick}
            className="relative"
            aria-label="프로필 이미지 변경"
          >
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-pink-100">
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt="프로필 이미지"
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-12 w-12 text-pink-400" strokeWidth={1.5} />
              )}
            </div>
            {/* 카메라 아이콘 */}
            <div className="absolute right-0 bottom-0 flex h-7 w-7 items-center justify-center rounded-full bg-gray-700">
              <Camera className="h-4 w-4 text-white" />
            </div>
          </button>
        </div>

        {/* 닉네임 입력 */}
        <div className="mb-6">
          <Typography
            font="noto"
            variant="body2M"
            className="mb-2 text-gray-900"
          >
            닉네임
          </Typography>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 transition-colors focus:border-pink-600 focus:outline-none"
            placeholder="닉네임을 입력하세요"
            maxLength={20}
          />
        </div>

        {/* 자기소개 입력 */}
        <div className="mb-6">
          <Typography
            font="noto"
            variant="body2M"
            className="mb-2 text-gray-900"
          >
            자기소개
          </Typography>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="h-32 w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-gray-900 transition-colors focus:border-pink-600 focus:outline-none"
            placeholder="자기소개를 입력하세요"
            maxLength={150}
          />
        </div>
      </main>

      {/* 프로필 이미지 선택 바텀시트 */}
      <ProfileImageBottomSheet
        isOpen={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
        onSelectCamera={handleCameraSelect}
        onSelectGallery={handleGallerySelect}
      />

      {/* 변경사항 저장 확인 모달 */}
      <UnsavedChangesModal
        isOpen={isUnsavedModalOpen}
        onClose={() => setIsUnsavedModalOpen(false)}
        onConfirm={handleUnsavedConfirm}
      />

      {/* 숨겨진 파일 입력 요소들 */}
      {/* 카메라 촬영용 */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="카메라로 사진 촬영"
      />
      {/* 갤러리 선택용 */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="갤러리에서 사진 선택"
      />
    </div>
  );
};

export default ProfileEditPage;
