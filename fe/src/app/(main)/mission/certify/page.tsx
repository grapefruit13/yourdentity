"use client";

import { Suspense, useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useForm } from "react-hook-form";
import MissionCertificationStatusCard from "@/components/mission/mission-certification-status-card";
import ButtonBase from "@/components/shared/base/button-base";
import TextEditor from "@/components/shared/text-editor/index";
import { Typography } from "@/components/shared/typography";
import Modal from "@/components/shared/ui/modal";
import SubmitButton from "@/components/shared/ui/submit-button";
import {
  MAX_FILES,
  WRITE_MESSAGES,
  ERROR_MESSAGES,
} from "@/constants/community/_write-constants";
import { missionsKeys } from "@/constants/generated/query-keys";
import { IMAGE_URL } from "@/constants/shared/_image-url";
import { LINK_URL } from "@/constants/shared/_link-url";
import { MIN_POST_TEXT_LENGTH } from "@/constants/shared/_post-constants";
import { useRequireAuth } from "@/hooks/auth/useRequireAuth";
import {
  useGetMissionsById,
  usePostMissionsPostsById,
} from "@/hooks/generated/missions-hooks";
import useToggle from "@/hooks/shared/useToggle";
import { useTopBarStore } from "@/stores/shared/topbar-store";
import type { WriteFormValues } from "@/types/community/_write-types";
import {
  replaceEditorFileHrefWithUploadedUrls,
  replaceEditorImageSrcWithUploadedUrls,
} from "@/utils/community/editor-content";
import {
  dedupeFiles,
  rollbackUploadedFiles,
  isHandledError,
} from "@/utils/community/file-utils";
import { uploadFileQueue } from "@/utils/community/upload-utils";
import { getCurrentDateTime } from "@/utils/shared/date";
import {
  extractTextFromHtml,
  checkPostTextLength,
  hasImageInContent,
} from "@/utils/shared/text-editor";

/**
 * @description 미션 인증 페이지 콘텐츠 (useSearchParams 사용)
 */
const MissionCertifyPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [isAuthGuideOpen, setIsAuthGuideOpen] = useState(false);

  // 인증 체크: 로그인하지 않은 사용자는 로그인 페이지로 리다이렉트
  const { isReady, user } = useRequireAuth({
    redirectTo: LINK_URL.LOGIN,
  });

  // 쿼리 파라미터에서 미션 ID 가져오기
  const missionId = searchParams.get("missionId") || "";

  // 미션 상세 조회 API
  const { data: missionResponse, isError } = useGetMissionsById({
    request: { missionId },
    enabled: !!missionId,
  });

  const missionData = missionResponse?.mission;
  const selectedMissionName = missionData?.title || "";

  const { handleSubmit, setValue, getValues, watch, reset } =
    useForm<WriteFormValues>({
      defaultValues: { title: "", content: "", category: "한끗루틴" },
      mode: "onChange",
    });

  const {
    isOpen: isLeaveConfirmOpen,
    open: openLeaveConfirm,
    close: closeLeaveConfirm,
  } = useToggle();
  const {
    isOpen: isErrorModalOpen,
    open: openErrorModal,
    close: closeErrorModal,
  } = useToggle();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const allowLeaveCountRef = useRef(0);
  const setRightSlot = useTopBarStore((state) => state.setRightSlot);
  const setTitle = useTopBarStore((state) => state.setTitle);

  // 제출 시 일괄 업로드할 파일 큐 (a 태그 href 교체용)
  const [fileQueue, setFileQueue] = useState<
    Array<{ clientId: string; file: File }>
  >([]);
  // 제출 시 일괄 업로드할 이미지 큐 (clientId와 함께 보관)
  const [imageQueue, setImageQueue] = useState<
    Array<{ clientId: string; file: File }>
  >([]);

  // 미션 인증글 등록 API
  const { mutate: createMissionPost, isPending } = usePostMissionsPostsById();

  /**
   * 이미지 선택 시 clientId를 발급/등록하고 반환 (즉시 업로드는 하지 않음)
   */
  const registerImage = (file: File): string => {
    const clientId = crypto.randomUUID();
    setImageQueue((prev) => {
      if (prev.length >= MAX_FILES) {
        alert(`이미지는 최대 ${MAX_FILES}장까지 첨부할 수 있어요.`);
        return prev;
      }
      return [...prev, { clientId, file }];
    });
    return clientId;
  };

  /**
   * 단일 일반 파일 추가 (clientId 발급 후 큐에 등록)
   */
  const addAttachFile = (file: File): string => {
    const clientId = crypto.randomUUID();
    setFileQueue((prev) => {
      // 중복 체크
      const merged = dedupeFiles([...prev.map((item) => item.file), file]);
      if (merged.length > MAX_FILES) {
        alert(`파일은 최대 ${MAX_FILES}개까지 첨부할 수 있어요.`);
        return prev;
      }
      return [...prev, { clientId, file }];
    });
    return clientId;
  };

  /**
   * 이미지 업로드 및 검증
   * @returns 업로드된 이미지 경로와 URL 매핑
   */
  const handleImageUpload = async () => {
    const {
      byIdToPath: imgIdToPath,
      byIdToUrl: imgIdToUrl,
      failedCount: imageFailedCount,
    } = await uploadFileQueue(imageQueue, "이미지");

    // 이미지 업로드 실패 확인
    if (imageQueue.length > 0 && imageFailedCount > 0) {
      alert(WRITE_MESSAGES.IMAGE_UPLOAD_PARTIAL_FAILED(imageFailedCount));
      throw new Error(ERROR_MESSAGES.IMAGE_UPLOAD_FAILED);
    }

    // 이미지가 있는데 URL 매핑이 제대로 안 된 경우
    if (imageQueue.length > 0 && imgIdToUrl.size === 0) {
      alert(WRITE_MESSAGES.IMAGE_UPLOAD_FAILED);
      throw new Error(ERROR_MESSAGES.IMAGE_UPLOAD_FAILED);
    }

    return {
      imagePaths: Array.from(imgIdToPath.values()),
      imageUrlMap: imgIdToUrl,
    };
  };

  /**
   * 이미지 URL 교체 및 검증
   * @param content - 원본 콘텐츠 HTML
   * @param imageUrlMap - 이미지 URL 매핑
   * @returns URL이 교체된 콘텐츠 HTML
   */
  const handleImageUrlReplacement = (
    content: string,
    imageUrlMap: Map<string, string>
  ): string => {
    const contentWithUrls = replaceEditorImageSrcWithUploadedUrls(
      content,
      imageUrlMap
    );

    // 이미지가 있는데 src가 교체되지 않은 경우 확인
    if (imageQueue.length > 0) {
      const tempContainer = document.createElement("div");
      tempContainer.innerHTML = contentWithUrls;
      const imagesWithClientId = tempContainer.querySelectorAll(
        "img[data-client-id]"
      );
      if (imagesWithClientId.length > 0) {
        alert(WRITE_MESSAGES.IMAGE_URL_REPLACE_FAILED);
        throw new Error("IMAGE_URL_REPLACE_FAILED");
      }
    }

    return contentWithUrls;
  };

  /**
   * 파일 업로드 및 URL 교체
   * @param content - 콘텐츠 HTML
   * @returns 업로드된 파일 경로와 URL이 교체된 콘텐츠, 실패 시 null
   */
  const handleFileUpload = async (
    content: string
  ): Promise<{ filePaths: string[]; content: string } | null> => {
    const queueToUse = fileQueue;

    const {
      byIdToPath: fileIdToPath,
      byIdToUrl: fileIdToUrl,
      failedCount: fileFailedCount,
    } = await uploadFileQueue(queueToUse, "파일");

    if (queueToUse.length > 0 && fileFailedCount > 0) {
      alert(WRITE_MESSAGES.FILE_UPLOAD_FAILED);
      return null;
    }

    if (queueToUse.length > 0 && fileIdToUrl.size === 0) {
      alert(WRITE_MESSAGES.FILE_UPLOAD_FAILED);
      return null;
    }

    const uploadedFilePaths = Array.from(fileIdToPath.values());
    const contentWithUrls = replaceEditorFileHrefWithUploadedUrls(
      content,
      fileIdToUrl
    );

    setValue("content", contentWithUrls, {
      shouldDirty: true,
      shouldValidate: false,
    });

    return { filePaths: uploadedFilePaths, content: contentWithUrls };
  };

  /**
   * 미션 인증글 등록
   * @param title - 제목
   * @param content - 콘텐츠 HTML
   * @param media - 미디어 파일 경로 배열
   */
  const handleCreateMissionPost = (
    title: string,
    content: string,
    media: string[]
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      createMissionPost(
        {
          missionId,
          data: {
            title,
            content,
            media,
          },
        },
        {
          onSuccess: (res) => {
            const postId = res?.data?.postId;

            if (!postId) {
              reject(new Error(WRITE_MESSAGES.POST_RESPONSE_INVALID));
              return;
            }

            // 미션 관련 쿼리 무효화
            const queryKeysToInvalidate = [
              missionsKeys.getMissionsPosts({}),
              missionsKeys.getMissionsMe({}),
              missionsKeys.getMissionsStats,
            ];

            queryKeysToInvalidate.forEach((queryKey) => {
              queryClient.invalidateQueries({ queryKey });
            });

            resolve(postId);
          },
          onError: (err) => {
            reject(err);
          },
        }
      );
    });
  };

  /**
   * 제출 핸들러
   * - 제목/내용 유효성 검사 후 첨부 파일 업로드 → 미션 인증 게시글 등록까지 수행
   * - 실패 시 업로드된 파일들 롤백 삭제
   */
  const onSubmit = async () => {
    const currentTitle = getValues("title");
    const currentContent = getValues("content");
    let uploadedImagePaths: string[] = [];
    let uploadedFilePaths: string[] = [];

    try {
      // 1. 이미지 업로드 및 검증
      const { imagePaths, imageUrlMap } = await handleImageUpload();
      uploadedImagePaths = imagePaths;

      // 2. 이미지 URL 교체 및 검증
      const contentWithImageUrls = handleImageUrlReplacement(
        currentContent,
        imageUrlMap
      );

      // 3. 파일 업로드 및 URL 교체
      const fileUploadResult = await handleFileUpload(contentWithImageUrls);
      if (!fileUploadResult) {
        // 파일 업로드 실패 시 alert는 이미 표시되었으므로 여기서 종료
        return;
      }
      const { filePaths, content: contentWithFileUrls } = fileUploadResult;
      uploadedFilePaths = filePaths;

      // 4. 미션 인증글 등록
      const postId = await handleCreateMissionPost(
        currentTitle,
        contentWithFileUrls,
        uploadedImagePaths
      );

      // 5. 성공 후 처리 - 미션 홈으로 이동하면서 성공 정보 전달
      setImageQueue([]);
      setFileQueue([]);
      reset({
        title: "",
        content: "",
      });

      // 쿼리 파라미터로 성공 정보 전달
      const params = new URLSearchParams({
        success: "true",
        missionName: selectedMissionName,
        ...(postId && { postId }),
      });
      const targetUrl = `${LINK_URL.MISSION}?${params.toString()}`;

      // pushBlockState로 인한 히스토리 조작을 우회하기 위해 window.location.href 사용
      // (router.replace는 히스토리 조작과 충돌할 수 있음)
      window.location.href = targetUrl;
    } catch (error) {
      // 에러 발생 시 업로드된 파일들 롤백
      if (uploadedImagePaths.length > 0 || uploadedFilePaths.length > 0) {
        await rollbackUploadedFiles(uploadedImagePaths, uploadedFilePaths);
      }

      // 에러가 이미 처리된 경우 (alert 등)는 다시 처리하지 않음
      if (isHandledError(error)) {
        return;
      }

      setErrorMessage(
        "미션 인증글 작성에 실패했어요. 잠시 후 다시 시도해주세요."
      );
      openErrorModal();
    }
  };

  const hasTitle = watch("title").trim();
  const hasContent = extractTextFromHtml(watch("content") || "").length > 0;

  // 인증 조건 검사
  const content = watch("content") || "";
  const isTextLongEnough = checkPostTextLength(content, MIN_POST_TEXT_LENGTH);
  const hasImage = hasImageInContent(content);

  const isSubmitDisabled =
    isPending ||
    !missionId ||
    !hasTitle ||
    !hasContent ||
    !isTextLongEnough ||
    !hasImage;

  /**
   * 화면 렌더 시 topbar 타이틀 및 완료 버튼 설정
   */
  const submitButton = useMemo(
    () => (
      <SubmitButton
        disabled={isSubmitDisabled}
        onClick={handleSubmit(onSubmit)}
      />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isSubmitDisabled]
  );

  useEffect(() => {
    setTitle("인증하기");
    setRightSlot(submitButton);
  }, [setTitle, setRightSlot, submitButton]);

  // TopBar 뒤로가기 버튼 클릭 시 컨펌 모달 열기
  const setLeftSlot = useTopBarStore((state) => state.setLeftSlot);
  useEffect(() => {
    const handleBackClick = () => {
      openLeaveConfirm();
    };

    setLeftSlot(
      <button onClick={handleBackClick} className="hover:cursor-pointer">
        <Image
          src={IMAGE_URL.ICON.chevron.left.url}
          alt={IMAGE_URL.ICON.chevron.left.alt}
          width={24}
          height={24}
        />
      </button>
    );

    return () => {
      setLeftSlot(null);
    };
  }, [setLeftSlot, openLeaveConfirm]);

  // 뒤로가기(popstate) 인터셉트: 언제나 컨펌 모달 노출
  useEffect(() => {
    const pushBlockState = () => {
      try {
        history.pushState(null, "", window.location.href);
      } catch {}
    };

    const handlePopState = () => {
      if (allowLeaveCountRef.current > 0) {
        // 허용해야 하는 pop이 남아있으면 소모하고 그대로 진행
        allowLeaveCountRef.current -= 1;
        return;
      }
      openLeaveConfirm();
      // 네비게이션 취소를 위해 현재 히스토리로 다시 푸시
      pushBlockState();
    };

    // 최초 진입 시 한 단계 쌓아 두어 back을 가로챔
    pushBlockState();
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [openLeaveConfirm]);

  // 미션 조회 실패 시 에러 모달 표시
  useEffect(() => {
    if (isError) {
      setErrorMessage("미션 정보를 불러오는 데 실패했어요.");
      openErrorModal();
    }
  }, [isError, openErrorModal]);

  // 미션 ID가 없으면 미션 홈으로 리다이렉트
  useEffect(() => {
    if (!missionId) {
      router.push(LINK_URL.MISSION);
    }
  }, [missionId, router]);

  // Auth 초기화 대기 중이거나 미인증 사용자는 렌더링하지 않음
  // (useRequireAuth가 자동으로 리다이렉트 처리)
  if (!isReady || !user) {
    return null;
  }

  return (
    <form className="flex flex-col pt-12" onSubmit={handleSubmit(onSubmit)}>
      {/* 선택된 미션 정보 표시 */}
      <div className="flex flex-col gap-4 bg-gray-100 p-5 py-3">
        {selectedMissionName && (
          <div className="flex border-collapse flex-col gap-1 rounded-lg border border-gray-200 bg-white">
            {/* 미션 정보 */}
            <div className="flex w-full flex-col gap-1 px-4 py-2">
              <div className="flex w-full items-center gap-2 overflow-hidden">
                <span className="shrink-0 rounded-lg bg-purple-50 p-1">
                  <Typography
                    font="noto"
                    variant="body2M"
                    className="whitespace-nowrap text-purple-500"
                  >
                    미션
                  </Typography>
                </span>
                <Typography
                  font="noto"
                  variant="body2M"
                  className="line-clamp-1 min-w-0 flex-1 text-gray-950"
                >
                  {selectedMissionName}
                </Typography>
              </div>
              <Typography
                font="noto"
                variant="label2M"
                className="text-gray-400"
              >
                {getCurrentDateTime(" 작성 중")}
              </Typography>
            </div>
          </div>
        )}

        {/* 인증방법 */}
        <div className="border-main-300 bg-main-50 flex flex-col rounded-lg border px-5 py-4">
          <div className="flex items-center justify-between">
            <Typography font="noto" variant="label1M" className="text-gray-800">
              인증 방법
            </Typography>

            <ButtonBase
              className="size-8"
              onClick={() => setIsAuthGuideOpen((prev) => !prev)}
              aria-expanded={isAuthGuideOpen}
              aria-controls="auth-guide-content"
            >
              {isAuthGuideOpen ? (
                <ChevronUp size={16} className="text-gray-800" />
              ) : (
                <ChevronDown size={16} className="text-gray-800" />
              )}
            </ButtonBase>
          </div>
          {isAuthGuideOpen && (
            <p
              id="auth-guide-content"
              className="font-noto font-regular text-[13px] leading-normal whitespace-pre-line text-gray-950"
            >
              {missionData?.certificationMethod}
            </p>
          )}
        </div>
        <Typography font="noto" variant="label2R" className="text-gray-400">
          *작성 완료 시 나다움 포인트 지급 및 해당 인증글은 피드에 올라갑니다.
        </Typography>
        {/* 현재 완료된 인증 */}
        <div className="flex flex-col gap-2">
          <Typography font="noto" variant="label1M" className="text-gray-950">
            현재 완료된 인증
          </Typography>
          <div className="flex gap-2">
            <MissionCertificationStatusCard
              label={`${MIN_POST_TEXT_LENGTH}자 이상 작성`}
              isActive={isTextLongEnough}
              icon="pencil"
            />
            <MissionCertificationStatusCard
              label="사진 업로드"
              isActive={hasImage}
              icon="photo"
            />
          </div>
        </div>
      </div>

      {/* 텍스트 에디터 */}
      <TextEditor
        onImageUpload={registerImage}
        onFileUpload={addAttachFile}
        onTitleChange={(title) =>
          setValue("title", title, { shouldDirty: true, shouldValidate: true })
        }
        onContentChange={(content) =>
          setValue("content", content, {
            shouldDirty: true,
            shouldValidate: false,
          })
        }
      />

      {/* 뒤로가기 컨펌 모달 */}
      <Modal
        isOpen={isLeaveConfirmOpen}
        title="그만둘까요?"
        description="작성 중인 내용이 사라져요."
        cancelText="계속하기"
        confirmText="그만두기"
        onClose={closeLeaveConfirm}
        onConfirm={() => {
          closeLeaveConfirm();
          // 모달이 완전히 닫힌 후 라우팅 (커뮤니티 글 수정 페이지와 동일한 패턴)
          setTimeout(() => {
            router.replace(LINK_URL.MISSION);
          }, 0);
        }}
        variant="primary"
      />
      {/* 에러 모달 */}
      <Modal
        isOpen={isErrorModalOpen}
        title="오류가 발생했어요"
        description={errorMessage}
        confirmText="확인"
        onClose={closeErrorModal}
        onConfirm={closeErrorModal}
        variant="primary"
      />
    </form>
  );
};

/**
 * @description 미션 인증 페이지
 */
const Page = () => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white p-4 pt-12">
          <Typography font="noto" variant="body2R" className="text-gray-500">
            로딩 중...
          </Typography>
        </div>
      }
    >
      <MissionCertifyPageContent />
    </Suspense>
  );
};

export default Page;
