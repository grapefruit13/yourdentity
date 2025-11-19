"use client";

import { useState, useEffect, useRef, ChangeEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Camera, User } from "lucide-react";
import { useForm } from "react-hook-form";
import * as FilesApi from "@/api/generated/files-api";
import { deleteFilesById } from "@/api/generated/files-api";
import * as UsersApi from "@/api/generated/users-api";
import ProfileImageBottomSheet from "@/components/my-page/ProfileImageBottomSheet";
import UnsavedChangesModal from "@/components/my-page/UnsavedChangesModal";
import Input from "@/components/shared/input";
import Textarea from "@/components/shared/textarea";
import { Typography } from "@/components/shared/typography";
import { usersKeys } from "@/constants/generated/query-keys";
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

/**
 * @description 프로필 편집 페이지(온보딩)
 */
const ProfileEditPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const selectedFileRef = useRef<File | null>(null);

  const { data: userData } = useGetUsersMe({
    select: (data) => {
      return data?.user;
    },
  });
  const { mutateAsync: patchOnboardingAsync } = usePatchUsersMeOnboarding();

  const actualUserData = userData;

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
  const isDataLoaded = !!actualUserData;

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
   * @returns { fileUrl, filePath } - 업로드된 이미지의 URL과 경로
   */
  const uploadImageFile = async (
    file: File
  ): Promise<{
    fileUrl: string;
    filePath: string;
  }> => {
    const formData = new FormData();
    formData.append("file", file);

    const uploadResponse = await FilesApi.postFilesUploadMultiple(formData);
    // axios interceptor가 response.data.data를 response.data로 변환하므로
    // uploadResponse.data가 바로 FileUploadResponse["data"] 형태입니다
    // 따라서 uploadResponse.data.files로 접근해야 합니다
    // community/write 페이지와 동일한 패턴 사용
    const items =
      (uploadResponse.data as unknown as FileUploadResponse["data"])?.files ??
      [];

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

    // fileUrl과 path 모두 반환 (삭제 시 path 필요)
    const fileUrl = firstFile.data.fileUrl;
    const filePath = firstFile.data.path ?? firstFile.data.fileName ?? fileUrl;

    return { fileUrl, filePath };
  };

  /**
   * 사용자 데이터 로드 시 초기 상태 설정
   * 레이스 컨디션 방지: 데이터가 로드되기 전에는 입력을 막고,
   * 데이터 로드 후 초기값 설정
   */
  useEffect(() => {
    if (!actualUserData) return;

    reset({
      profileImageUrl: actualUserData.profileImageUrl ?? "",
      nickname: actualUserData.nickname ?? "",
      bio: actualUserData.bio ?? "",
    });
  }, [actualUserData, reset]);

  /**
   * 브라우저 뒤로가기 시 변경사항 확인 모달 표시
   * 닉네임이 비어있으면 이동을 막음
   */
  useEffect(() => {
    const handlePopState = () => {
      const trimmedNickname = nickname.trim();
      const initialNickname = actualUserData?.nickname ?? "";
      const isNicknameEmpty = trimmedNickname.length === 0;
      const isInitialNicknameEmpty = initialNickname.length === 0;

      // 닉네임이 비어있고 초기 닉네임도 비어있는 경우 (신규 가입자/온보딩 미완료 사용자)
      if (isNicknameEmpty && isInitialNicknameEmpty) {
        window.history.pushState(null, "", window.location.href);
        alert(PROFILE_EDIT_MESSAGES.NICKNAME_REQUIRED);
        return;
      }

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
  }, [isDirty, nickname, actualUserData?.nickname]);

  /**
   * 뒤로가기 버튼 클릭 핸들러
   * 닉네임이 비어있으면 이동을 막고, 변경사항이 있으면 확인 모달을 표시하고, 없으면 마이페이지로 이동
   */
  const handleBack = () => {
    const trimmedNickname = nickname.trim();
    const initialNickname = actualUserData?.nickname ?? "";
    const isNicknameEmpty = trimmedNickname.length === 0;
    const isInitialNicknameEmpty = initialNickname.length === 0;

    // 닉네임이 비어있고 초기 닉네임도 비어있는 경우 (신규 가입자/온보딩 미완료 사용자)
    if (isNicknameEmpty && isInitialNicknameEmpty) {
      alert(PROFILE_EDIT_MESSAGES.NICKNAME_REQUIRED);
      return;
    }

    if (isDirty) {
      setIsUnsavedModalOpen(true);
    } else {
      router.push(LINK_URL.MY_PAGE);
    }
  };

  /**
   * 닉네임 중복 체크
   */
  const checkNicknameAvailability = async (
    nickname: string
  ): Promise<boolean> => {
    const response = await UsersApi.getUsersNicknameAvailability({
      nickname,
    });
    return response.data?.available ?? false;
  };

  /**
   * 새로 선택한 이미지 업로드 처리
   */
  const handleImageUploadIfNeeded = async (
    currentImageUrl: string
  ): Promise<{ fileUrl: string; filePath: string | null }> => {
    const initialImageUrl = actualUserData?.profileImageUrl ?? "";
    const isImageChanged = currentImageUrl !== initialImageUrl;
    const isNewlySelectedImage = currentImageUrl.startsWith("data:");

    if (!isImageChanged || !isNewlySelectedImage || !selectedFileRef.current) {
      return { fileUrl: currentImageUrl, filePath: null };
    }

    try {
      const uploadResult = await uploadImageFile(selectedFileRef.current);
      return { fileUrl: uploadResult.fileUrl, filePath: uploadResult.filePath };
    } catch (error) {
      debug.error("이미지 업로드 실패:", error);
      // 사용자 알림 없이 메시지를 포함한 오류만 던지기
      throw new Error(PROFILE_EDIT_MESSAGES.IMAGE_UPLOAD_FAILED);
    }
  };

  /**
   * 업로드한 이미지 롤백 삭제
   */
  const rollbackUploadedImage = async (filePath: string | null) => {
    if (!filePath) return;

    try {
      await deleteFilesById({ filePath });
      debug.log("업로드한 이미지 삭제 완료:", filePath);
    } catch (deleteError) {
      debug.error("업로드한 이미지 삭제 실패:", deleteError);
    }
  };

  /**
   * 사용자 관련 쿼리 캐시 무효화
   */
  const invalidateUserQueries = () => {
    queryClient.invalidateQueries({
      queryKey: usersKeys.getUsersMe,
    });
    queryClient.invalidateQueries({
      queryKey: usersKeys.getUsersMeMyPage,
    });
    queryClient.invalidateQueries({
      predicate: (query) => {
        return (
          Array.isArray(query.queryKey) &&
          query.queryKey[0] === "users" &&
          (query.queryKey[1] === "getUsersMePosts" ||
            query.queryKey[1] === "getUsersMeLikedPosts" ||
            query.queryKey[1] === "getUsersMeCommentedPosts")
        );
      },
    });
  };

  /**
   * 프로필 편집 완료 핸들러
   * 닉네임 중복 체크 → 이미지 업로드 → 프로필 업데이트 순서로 진행
   */
  const onSubmit = async (data: ProfileEditFormValues) => {
    const trimmedNickname = data.nickname.trim();
    const initialNickname = actualUserData?.nickname ?? "";
    let uploadedImagePath: string | null = null;

    try {
      // 닉네임 중복 체크
      const isNicknameChanged = trimmedNickname !== initialNickname;
      if (isNicknameChanged) {
        const isAvailable = await checkNicknameAvailability(trimmedNickname);
        if (!isAvailable) {
          alert(PROFILE_EDIT_MESSAGES.NICKNAME_DUPLICATED);
          return;
        }
      }

      // 이미지 업로드 처리
      const { fileUrl: finalImageUrl, filePath } =
        await handleImageUploadIfNeeded(data.profileImageUrl);
      uploadedImagePath = filePath;

      // 프로필 업데이트
      await patchOnboardingAsync(
        {
          data: {
            nickname: trimmedNickname,
            profileImageUrl: finalImageUrl || undefined,
            bio: data.bio.trim() || undefined,
          },
        },
        {
          onSuccess: () => {
            invalidateUserQueries();
            alert(PROFILE_EDIT_MESSAGES.PROFILE_UPDATE_SUCCESS);
            router.push(LINK_URL.MY_PAGE);
          },
        }
      );
    } catch (error) {
      debug.error("프로필 업데이트 실패:", error);
      alert(PROFILE_EDIT_MESSAGES.PROFILE_UPDATE_FAILED);
      await rollbackUploadedImage(uploadedImagePath);
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
    <div className="flex min-h-screen w-full flex-col bg-white">
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
            disabled={!isDataLoaded}
            className="relative disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={PROFILE_EDIT_LABELS.PROFILE_IMAGE_CHANGE}
          >
            <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-pink-100">
              {profileImageUrl ? (
                <Image
                  src={profileImageUrl}
                  alt={PROFILE_EDIT_LABELS.PROFILE_IMAGE_ALT}
                  className="h-full w-full object-cover"
                  fill
                  unoptimized={profileImageUrl.startsWith("data:")}
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
              className="text-main-600 mb-2"
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
            disabled={!isDataLoaded}
          />
        </div>

        <div className="mb-6 flex flex-col gap-1">
          <Typography
            font="noto"
            variant="body2B"
            className="mb-2 text-gray-900"
          >
            {PROFILE_EDIT_LABELS.BIO}
          </Typography>
          <Textarea
            {...register("bio", {
              maxLength: MAX_BIO_LENGTH,
            })}
            placeholder={PROFILE_EDIT_PLACEHOLDERS.BIO}
            disabled={!isDataLoaded}
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
