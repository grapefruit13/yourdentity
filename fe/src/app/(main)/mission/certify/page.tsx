"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { MIN_CERTIFICATION_TEXT_LENGTH } from "@/constants/mission/_certify-constants";
import { MOCK_MISSIONS } from "@/constants/mission/_mock-missions";
import { LINK_URL } from "@/constants/shared/_link-url";
import { useRequireAuth } from "@/hooks/auth/useRequireAuth";
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
import { extractTextFromHtml } from "@/utils/shared/text-editor";

/**
 * @description 미션 인증 페이지 콘텐츠 (useSearchParams 사용)
 */
const MissionCertifyPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPending = false;
  const [isAuthGuideOpen, setIsAuthGuideOpen] = useState(false);

  // 인증 체크: 로그인하지 않은 사용자는 로그인 페이지로 리다이렉트
  const { isReady, user } = useRequireAuth({
    redirectTo: LINK_URL.LOGIN,
  });

  // 쿼리 파라미터에서 미션 ID 가져오기
  const missionId = searchParams.get("missionId") || "";

  // 미션 ID로 미션 정보 찾기
  const selectedMission = MOCK_MISSIONS.find(
    (mission) => mission.id === missionId
  );
  const selectedMissionName = selectedMission?.title || "";

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
   * 제출 핸들러
   * - 제목/내용 유효성 검사 후 첨부 파일 업로드 → 미션 인증 게시글 등록까지 수행
   * - 실패 시 업로드된 파일들 롤백 삭제
   */
  const onSubmit = async (values: WriteFormValues) => {
    const currentContent = getValues("content");
    let uploadedImagePaths: string[] = [];
    let uploadedFilePaths: string[] = [];

    try {
      // 1. 이미지 업로드 및 검증
      const { imagePaths, imageUrlMap } = await handleImageUpload();
      uploadedImagePaths = imagePaths;

      // 2. 이미지 URL 교체 및 검증
      const contentWithUrls = handleImageUrlReplacement(
        currentContent,
        imageUrlMap
      );

      // 3. 파일 업로드 및 URL 교체
      const fileUploadResult = await handleFileUpload(contentWithUrls);
      if (!fileUploadResult) {
        // 파일 업로드 실패 시 alert는 이미 표시되었으므로 여기서 종료
        return;
      }
      const { filePaths } = fileUploadResult;
      uploadedFilePaths = filePaths;

      // 4. 성공 후 처리
      alert("미션 인증이 완료되었습니다. (API 연동 대기 중)");
      setImageQueue([]);
      setFileQueue([]);
      reset({
        title: "",
        content: "",
      });
      router.replace("/mission");
    } catch (error) {
      // 에러 발생 시 업로드된 파일들 롤백
      if (uploadedImagePaths.length > 0 || uploadedFilePaths.length > 0) {
        await rollbackUploadedFiles(uploadedImagePaths, uploadedFilePaths);
      }

      // 에러가 이미 처리된 경우 (alert 등)는 다시 alert하지 않음
      if (isHandledError(error)) {
        return;
      }

      alert(WRITE_MESSAGES.POST_CREATE_FAILED);
    }
  };

  const hasTitle = watch("title").trim();
  const hasContent = extractTextFromHtml(watch("content") || "").length > 0;

  // 인증 조건 검사
  const content = watch("content") || "";
  const contentText = extractTextFromHtml(content);
  const isTextLongEnough = contentText.length >= MIN_CERTIFICATION_TEXT_LENGTH;

  // 이미지 첨부 여부 확인 (content HTML에 img 태그가 있는지 확인)
  const hasImage = (() => {
    if (!content) return false;
    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = content;
    const images = tempContainer.querySelectorAll("img");
    return images.length > 0;
  })();

  const isSubmitDisabled =
    isPending || !hasTitle || !hasContent || !isTextLongEnough || !hasImage;

  /**
   * 화면 렌더 시 topbar 타이틀 및 완료 버튼 설정
   */
  useEffect(() => {
    setTitle("인증하기");

    // 탑바 완료 버튼 설정
    setRightSlot(
      <SubmitButton
        disabled={isSubmitDisabled}
        onClick={handleSubmit(onSubmit)}
      />
    );
  }, [setTitle, setRightSlot, isSubmitDisabled, handleSubmit, onSubmit]);

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

  // 미션 ID가 없으면 미션 홈으로 리다이렉트
  useEffect(() => {
    if (!missionId) {
      router.push("/mission");
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
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-purple-50 p-1">
                  <Typography
                    font="noto"
                    variant="body2M"
                    className="text-purple-500"
                  >
                    미션
                  </Typography>
                </span>
                <Typography
                  font="noto"
                  variant="body2M"
                  className="text-gray-950"
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
            // TODO: 인증 가이드 데이터 노션에서 받아와 활용하도록 수정 @grapefruit
            <p
              id="auth-guide-content"
              className="font-noto font-regular text-[13px] leading-[1.5] text-gray-950"
            >
              1. 인증 글 제목 예시 : 9/17 [아침] 정은 인증 <br />
              &nbsp;날짜 / [아침,점심,저녁] / 닉네임 <br />
              2. 9월 한끗루틴은 아침, 점심, 저녁 중 총 세 번의 루틴을 인증하기
              때문에 <b>태그</b>를 꼭 걸어주세요!
              <br />
              3. 모든 루틴 인증글에는 타임스탬프(날짜, 시간포함) 사진이
              필수입니다! 3. 미션 인증 소감, 이야기도 꼭 남겨주세요!
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
              label={`${MIN_CERTIFICATION_TEXT_LENGTH}자 이상 작성`}
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
          // popstate 인터셉트를 통하지 않고 즉시 이전 화면(미션 홈)으로 이동
          router.replace(`/mission`);
        }}
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
