"use client";

import { useState, useEffect, useRef, ChangeEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Camera, User } from "lucide-react";
import { useForm } from "react-hook-form";
import * as FilesApi from "@/api/generated/files-api";
import * as UsersApi from "@/api/generated/users-api";
import ProfileImageBottomSheet from "@/components/my-page/ProfileImageBottomSheet";
import UnsavedChangesModal from "@/components/my-page/UnsavedChangesModal";
import Input from "@/components/shared/input";
import { Typography } from "@/components/shared/typography";

import {
  MAX_PROFILE_IMAGE_SIZE_BYTES,
  MAX_NICKNAME_LENGTH,
  MAX_BIO_LENGTH,
  PROFILE_EDIT_MESSAGES,
  PROFILE_EDIT_PLACEHOLDERS,
  PROFILE_EDIT_LABELS,
} from "@/constants/my-page/_profile-edit-constants";
import { LINK_URL } from "@/constants/shared/_link-url";
import {
  useGetUsersMe,
  usePatchUsersMeOnboarding,
} from "@/hooks/generated/users-hooks";
import useToggle from "@/hooks/shared/useToggle";
import type { FileUploadResponse } from "@/types/generated/api-schema";
import type { ProfileEditFormValues } from "@/types/my-page/_profile-edit-types";
import { debug } from "@/utils/shared/debugger";

const ProfileEditPage = () => {
  const router = useRouter();

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const selectedFileRef = useRef<File | null>(null);

  const { data: userData } = useGetUsersMe();
  const { mutateAsync: patchOnboardingAsync } = usePatchUsersMeOnboarding();

  const actualUserData = userData?.data?.data;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { isDirty, isSubmitting },
  } = useForm<ProfileEditFormValues>({
    defaultValues: {
      profileImageUrl: actualUserData?.profileImageUrl ?? "",
      nickname: actualUserData?.nickname ?? "",
      bio: actualUserData?.bio ?? "",
    },
    mode: "onChange",
  });

  const profileImageUrl = watch("profileImageUrl");
  const nickname = watch("nickname");

  const {
    isOpen: isBottomSheetOpen,
    close: closeBottomSheet,
    open: openBottomSheet,
  } = useToggle();
  const [isUnsavedModalOpen, setIsUnsavedModalOpen] = useState(false);

  const isNicknameValid = nickname.trim().length > 0;
  const isCompleteEnabled = isDirty && isNicknameValid;

  /**
   * 파일 검증 (타입 및 크기 체크)
   */
  const validateImageFile = (file: File): boolean => {
    if (!file.type.startsWith("image/")) {
      alert(PROFILE_EDIT_MESSAGES.INVALID_IMAGE_FILE);
      return false;
    }

    if (file.size > MAX_PROFILE_IMAGE_SIZE_BYTES) {
      alert(PROFILE_EDIT_MESSAGES.IMAGE_SIZE_EXCEEDED);
      return false;
    }

    return true;
  };

  /**
   * 이미지 파일 업로드
   */
  const uploadImageFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const uploadResponse = await FilesApi.postFilesUploadMultiple(formData);
    // community/write 페이지 패턴과 동일하게 접근: res.data.data.files
    // AxiosResponse<Result<FileUploadResponse>> 구조:
    // - uploadResponse.data = Result<FileUploadResponse> = { data: FileUploadResponse, status: number }
    // - uploadResponse.data.data = FileUploadResponse = { status: number, data: { files: [...] } }
    // 실제 백엔드 응답 구조에 따라 res.data.data.files 또는 res.data.data.data.files로 접근
    const items =
      (
        uploadResponse as unknown as {
          data?: {
            data?: {
              files?: FileUploadResponse["data"]["files"];
              data?: { files?: FileUploadResponse["data"]["files"] };
            };
          };
        }
      )?.data?.data?.files ?? [];

    debug.log("이미지 업로드 응답:", {
      uploadResponse: uploadResponse.data,
      itemsLength: items.length,
      firstFile: items[0],
    });

    const firstFile = items[0];
    if (!firstFile?.success || !firstFile?.data?.fileUrl) {
      debug.error("이미지 업로드 응답 파싱 실패:", {
        items,
        firstFile,
        fullResponse: uploadResponse,
        responseData: uploadResponse.data,
      });
      throw new Error(PROFILE_EDIT_MESSAGES.IMAGE_URL_FETCH_FAILED);
    }

    return firstFile.data.fileUrl;
  };

  /**
   * 사용자 데이터 로드 시 초기 상태 설정
   * React Hook Form의 reset 메서드를 사용하여 초기값 설정
   * isDirty가 false인 경우(아직 편집하지 않은 경우)에만 리셋
   */
  useEffect(() => {
    if (!actualUserData || isDirty) return;

    reset({
      profileImageUrl: actualUserData.profileImageUrl ?? "",
      nickname: actualUserData.nickname ?? "",
      bio: actualUserData.bio ?? "",
    });
  }, [actualUserData, reset, isDirty]);

  /**
   * 브라우저 뒤로가기 시 변경사항 확인 모달 표시
   */
  useEffect(() => {
    const handlePopState = () => {
      if (isDirty) {
        window.history.pushState(null, "", window.location.href);
        setIsUnsavedModalOpen(true);
      }
    };

    if (!window.history.state?.profileEdit) {
      window.history.pushState({ profileEdit: true }, "", window.location.href);
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isDirty]);

  /**
   * 뒤로가기 버튼 클릭 핸들러
   * 변경사항이 있으면 확인 모달을 표시하고, 없으면 마이페이지로 이동
   */
  const handleBack = () => {
    if (isDirty) {
      setIsUnsavedModalOpen(true);
    } else {
      router.push(LINK_URL.MY_PAGE);
    }
  };

  /**
   * 프로필 편집 완료 핸들러
   * 닉네임 중복 체크 → 이미지 업로드 → 프로필 업데이트 순서로 진행
   */
  const onSubmit = async (data: ProfileEditFormValues) => {
    const trimmedNickname = data.nickname.trim();
    const initialNickname = actualUserData?.nickname ?? "";

    try {
      const isNicknameChanged = trimmedNickname !== initialNickname;
      if (isNicknameChanged) {
        const nicknameCheckResponse =
          await UsersApi.getUsersNicknameAvailability({
            nickname: trimmedNickname,
          });
        const isAvailable =
          nicknameCheckResponse.data?.data?.available ?? false;

        if (!isAvailable) {
          alert(PROFILE_EDIT_MESSAGES.NICKNAME_DUPLICATED);
          return;
        }
      }

      let finalImageUrl = data.profileImageUrl;
      const initialImageUrl = actualUserData?.profileImageUrl ?? "";
      const isImageChanged = data.profileImageUrl !== initialImageUrl;
      const isNewlySelectedImage = data.profileImageUrl.startsWith("data:");

      if (isImageChanged && isNewlySelectedImage && selectedFileRef.current) {
        try {
          finalImageUrl = await uploadImageFile(selectedFileRef.current);
        } catch (error) {
          debug.error("이미지 업로드 실패:", error);
          alert(PROFILE_EDIT_MESSAGES.IMAGE_UPLOAD_FAILED);
          return;
        }
      }

      await patchOnboardingAsync({
        data: {
          nickname: trimmedNickname,
          profileImageUrl: finalImageUrl || undefined,
          bio: data.bio.trim() || undefined,
        },
      });

      alert(PROFILE_EDIT_MESSAGES.PROFILE_UPDATE_SUCCESS);
      router.push(LINK_URL.MY_PAGE);
    } catch (error) {
      debug.error("프로필 업데이트 실패:", error);
      alert(PROFILE_EDIT_MESSAGES.PROFILE_UPDATE_FAILED);
    }
  };

  /**
   * 파일 선택 핸들러
   * 이미지 파일 검증 및 크기 체크 후 미리보기 생성
   */
  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!validateImageFile(file)) return;

    selectedFileRef.current = file;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      setValue("profileImageUrl", imageUrl, { shouldDirty: true });
    };
    reader.readAsDataURL(file);
  };

  /**
   * 카메라 선택 핸들러
   * 바텀시트 닫고 카메라 입력 트리거
   */
  const handleCameraSelect = () => {
    closeBottomSheet();
    cameraInputRef.current?.click();
  };

  /**
   * 갤러리 선택 핸들러
   * 바텀시트 닫고 갤러리 입력 트리거
   */
  const handleGallerySelect = () => {
    closeBottomSheet();
    galleryInputRef.current?.click();
  };

  /**
   * 변경사항 저장 확인 모달의 확인 버튼 핸들러
   * 변경사항을 저장하지 않고 마이페이지로 이동
   */
  const handleUnsavedConfirm = () => {
    setIsUnsavedModalOpen(false);
    router.push(LINK_URL.MY_PAGE);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50">
      <div className="fixed top-0 z-50 mx-auto flex h-12 w-full max-w-[470px] items-center justify-between border-b border-b-gray-200 bg-white px-5 py-3">
        <button
          onClick={handleBack}
          className="hover:cursor-pointer"
          aria-label={PROFILE_EDIT_LABELS.BACK_BUTTON}
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

        <Typography font="noto" variant="body1M" className="text-gray-900">
          {PROFILE_EDIT_LABELS.PAGE_TITLE}
        </Typography>

        <button
          onClick={handleSubmit(onSubmit)}
          disabled={!isCompleteEnabled || isSubmitting}
          className="disabled:cursor-not-allowed"
          aria-label={PROFILE_EDIT_LABELS.COMPLETE_BUTTON}
        >
          <Typography
            font="noto"
            variant="body1M"
            className={isCompleteEnabled ? "text-pink-600" : "text-gray-300"}
          >
            {PROFILE_EDIT_LABELS.COMPLETE_BUTTON}
          </Typography>
        </button>
      </div>

      {/* 메인 컨텐츠 */}
      <main className="mt-12 flex flex-col px-4 py-6">
        {/* 프로필 이미지 */}
        <div className="mb-6 flex justify-center">
          <button
            onClick={openBottomSheet}
            className="relative"
            aria-label={PROFILE_EDIT_LABELS.PROFILE_IMAGE_CHANGE}
          >
            <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-pink-100">
              {profileImageUrl ? (
                <Image
                  src={profileImageUrl}
                  alt={PROFILE_EDIT_LABELS.PROFILE_IMAGE_ALT}
                  className="h-full w-full object-cover"
                  fill
                />
              ) : (
                <User className="h-12 w-12 text-pink-400" strokeWidth={1.5} />
              )}
            </div>
            <div className="absolute right-0 bottom-0 flex h-7 w-7 items-center justify-center rounded-full bg-gray-700">
              <Camera className="h-4 w-4 text-white" />
            </div>
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-1">
            <Typography
              font="noto"
              variant="body2B"
              className="mb-2 text-gray-900"
            >
              {PROFILE_EDIT_LABELS.NICKNAME}
            </Typography>
            <Typography
              font="noto"
              variant="body2B"
              className="text-primary-600 mb-2"
            >
              *
            </Typography>
          </div>
          <Input
            {...register("nickname", {
              maxLength: MAX_NICKNAME_LENGTH,
            })}
            type="text"
            placeholder={PROFILE_EDIT_PLACEHOLDERS.NICKNAME}
          />
        </div>

        <div className="mb-6">
          <Typography
            font="noto"
            variant="body2B"
            className="mb-2 text-gray-900"
          >
            {PROFILE_EDIT_LABELS.BIO}
          </Typography>
          <textarea
            {...register("bio", {
              maxLength: MAX_BIO_LENGTH,
            })}
            className="h-32 w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-gray-900 transition-colors focus:border-pink-600 focus:outline-none"
            placeholder={PROFILE_EDIT_PLACEHOLDERS.BIO}
          />
        </div>
      </main>

      <ProfileImageBottomSheet
        isOpen={isBottomSheetOpen}
        onClose={closeBottomSheet}
        onSelectCamera={handleCameraSelect}
        onSelectGallery={handleGallerySelect}
      />

      <UnsavedChangesModal
        isOpen={isUnsavedModalOpen}
        onClose={() => setIsUnsavedModalOpen(false)}
        onConfirm={handleUnsavedConfirm}
      />

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="카메라로 사진 촬영"
      />
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
