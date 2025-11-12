/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @description 커뮤니티 글 수정 페이지
 */
"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import { useForm } from "react-hook-form";
import ButtonBase from "@/components/shared/base/button-base";
import TextEditor from "@/components/shared/text-editor";
import { Typography } from "@/components/shared/typography";
import Modal from "@/components/shared/ui/modal";
import {
  MAX_FILES,
  WRITE_MESSAGES,
  POST_EDIT_CONSTANTS,
  ERROR_MESSAGES,
} from "@/constants/community/_write-constants";
import { communitiesKeys } from "@/constants/generated/query-keys";
import { useRequireAuth } from "@/hooks/auth/useRequireAuth";
import {
  useGetCommunitiesPostsByTwoIds,
  usePutCommunitiesPostsByTwoIds,
} from "@/hooks/generated/communities-hooks";
import { useTopBarStore } from "@/stores/shared/topbar-store";
import type { WriteFormValues } from "@/types/community/_write-types";
import type * as Schema from "@/types/generated/api-schema";
import type * as CommunityTypes from "@/types/generated/communities-types";
import {
  replaceEditorFileHrefWithUploadedUrls,
  replaceEditorImageSrcWithUploadedUrls,
  extractImagePathsFromContent,
  extractFilePathsFromContent,
} from "@/utils/community/editor-content";
import { deleteFilesByPath } from "@/utils/community/file-utils";
import { isFilePathMatching } from "@/utils/community/post-edit-utils";
import { uploadFileQueue } from "@/utils/community/upload-utils";
import { getCurrentDateTime } from "@/utils/shared/date";
import { debug } from "@/utils/shared/debugger";
import { extractTextFromHtml, elementToHtml } from "@/utils/shared/text-editor";

/**
 * @description 커뮤니티 게시글 수정 페이지
 */
const EditPageContent = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  // 상세 페이지와 동일하게 식별자 추출
  const postId = params.id as string;
  const communityId = searchParams.get("communityId") || "";

  // 선택적 뱃지/헤더용 파라미터 (작성 페이지와 맞추기 위함)
  const selectedCommunityName = searchParams.get("communityName") || "";
  const selectedCategoryFromQuery =
    searchParams.get("category") || POST_EDIT_CONSTANTS.NO_CATEGORY;

  // 인증 체크
  const { isReady, user } = useRequireAuth({});

  const { data: postData } = useGetCommunitiesPostsByTwoIds({
    request: {
      communityId,
      postId,
    },
    enabled: !!postId && !!communityId,
  });

  const { mutateAsync: updatePostAsync, isPending } =
    usePutCommunitiesPostsByTwoIds();

  // 폼 준비
  const { handleSubmit, setValue, getValues, watch } = useForm<WriteFormValues>(
    {
      defaultValues: {
        title: "",
        content: "",
        category: POST_EDIT_CONSTANTS.DEFAULT_CATEGORY,
      },
      mode: "onChange",
    }
  );

  const setRightSlot = useTopBarStore((state) => state.setRightSlot);

  // 상세 데이터에서 초기값 구성
  const post = postData as Schema.CommunityPost | undefined;

  // 기존 media 배열을 state로 관리
  const [originalMedia, setOriginalMedia] = useState<string[]>([]);

  // post 데이터가 로드되면 초기 media 설정
  useEffect(() => {
    if (post?.media) {
      // media가 string[] 형태인지 확인
      const mediaArray = Array.isArray(post.media)
        ? post.media.map((item) => {
            // string이면 그대로, object면 fileName이나 path 추출
            if (typeof item === "string") return item;
            return item?.fileName || item?.path || item?.url || "";
          })
        : [];
      setOriginalMedia(mediaArray.filter(Boolean));
    }
  }, [post]);

  const initialTitleHtml = typeof post?.title === "string" ? post.title : "";

  const initialContentHtml =
    typeof post?.content === "string" ? post.content : "";

  const resolvedCategory = post?.category ?? selectedCategoryFromQuery;

  // 제출 시 일괄 업로드할 파일 큐
  const [fileQueue, setFileQueue] = useState<
    Array<{ clientId: string; file: File }>
  >([]);
  // 제출 시 일괄 업로드할 이미지 큐
  const [imageQueue, setImageQueue] = useState<
    Array<{ clientId: string; file: File }>
  >([]);
  // 클로저 문제 방지를 위한 ref
  const imageQueueRef = useRef(imageQueue);
  const fileQueueRef = useRef(fileQueue);

  // ref를 최신 값으로 동기화
  useEffect(() => {
    imageQueueRef.current = imageQueue;
  }, [imageQueue]);

  useEffect(() => {
    fileQueueRef.current = fileQueue;
  }, [fileQueue]);

  /**
   * 파일 중복 제거
   */
  const dedupeFiles = (files: File[]) => {
    const map = new Map<string, File>();
    files.forEach((f) => {
      const key = `${f.name}-${f.size}-${f.lastModified}`;
      if (!map.has(key)) map.set(key, f);
    });
    return Array.from(map.values());
  };

  /**
   * 이미지 선택 시 clientId를 발급/등록하고 반환
   */
  const registerImage = (file: File): string => {
    const clientId = crypto.randomUUID();
    debug.log("이미지 등록:", {
      clientId,
      fileName: file.name,
      fileSize: file.size,
    });
    setImageQueue((prev) => {
      if (prev.length >= MAX_FILES) {
        alert(`이미지는 최대 ${MAX_FILES}장까지 첨부할 수 있어요.`);
        return prev;
      }
      const newQueue = [...prev, { clientId, file }];
      debug.log("imageQueue 업데이트:", newQueue.length);
      return newQueue;
    });
    return clientId;
  };

  /**
   * 단일 일반 파일 추가
   */
  const addAttachFile = (file: File): string => {
    const clientId = crypto.randomUUID();
    setFileQueue((prev) => {
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
   * @param currentImageQueue - 현재 imageQueue (클로저 문제 방지)
   */
  const handleImageUpload = async (currentImageQueue?: typeof imageQueue) => {
    const queueToUse = currentImageQueue ?? imageQueue;
    debug.log("handleImageUpload 호출, queueToUse.length:", queueToUse.length);

    const {
      byIdToPath: imgIdToPath,
      byIdToUrl: imgIdToUrl,
      failedCount: imageFailedCount,
    } = await uploadFileQueue(queueToUse, "이미지");

    if (queueToUse.length > 0 && imageFailedCount > 0) {
      alert(WRITE_MESSAGES.IMAGE_UPLOAD_PARTIAL_FAILED(imageFailedCount));
      throw new Error(ERROR_MESSAGES.IMAGE_UPLOAD_FAILED);
    }

    if (queueToUse.length > 0 && imgIdToUrl.size === 0) {
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
   * @param content - 콘텐츠 HTML
   * @param imageUrlMap - 이미지 URL 매핑
   * @param currentImageQueue - 현재 imageQueue (클로저 문제 방지)
   */
  const handleImageUrlReplacement = (
    content: string,
    imageUrlMap: Map<string, string>,
    currentImageQueue?: typeof imageQueue
  ): string => {
    debug.log("handleImageUrlReplacement 시작:", {
      contentLength: content?.length || 0,
      imageUrlMapSize: imageUrlMap.size,
      currentImageQueueLength: currentImageQueue?.length || 0,
    });

    const contentWithUrls = replaceEditorImageSrcWithUploadedUrls(
      content,
      imageUrlMap
    );

    const queueToUse = currentImageQueue ?? imageQueue;
    debug.log("queueToUse.length:", queueToUse.length);

    if (queueToUse.length > 0) {
      const tempContainer = document.createElement("div");
      tempContainer.innerHTML = contentWithUrls;
      const imagesWithClientId = tempContainer.querySelectorAll(
        "img[data-client-id]"
      );
      debug.log(
        "교체 후 남은 data-client-id 이미지:",
        imagesWithClientId.length
      );

      // imageQueue에 있는 clientId만 체크 (기존 이미지는 무시)
      const queueClientIds = new Set(queueToUse.map((item) => item.clientId));
      const failedImages: string[] = [];

      imagesWithClientId.forEach((img) => {
        const clientId = img.getAttribute("data-client-id");
        if (clientId && queueClientIds.has(clientId)) {
          // imageQueue에 있는 이미지인데 교체되지 않았다면 실패
          failedImages.push(clientId);
        }
      });

      if (failedImages.length > 0) {
        debug.error("교체 실패한 이미지 clientId:", failedImages);
        debug.error("imageUrlMap:", Array.from(imageUrlMap.entries()));
        alert(WRITE_MESSAGES.IMAGE_URL_REPLACE_FAILED);
        throw new Error(ERROR_MESSAGES.IMAGE_URL_REPLACE_FAILED);
      }

      // imageQueue에 없는 기존 이미지의 data-client-id는 제거 (이미 업로드된 이미지)
      imagesWithClientId.forEach((img) => {
        const clientId = img.getAttribute("data-client-id");
        if (clientId && !queueClientIds.has(clientId)) {
          debug.log(
            `기존 이미지의 data-client-id 제거: ${clientId} (이미 업로드된 이미지)`
          );
          img.removeAttribute("data-client-id");
        }
      });

      // 최종 HTML 재생성
      let finalHtml = "";
      tempContainer.childNodes.forEach((child) => {
        finalHtml += elementToHtml(child);
      });
      return finalHtml;
    }

    return contentWithUrls;
  };

  /**
   * 파일 업로드 및 URL 교체
   * @param content - 콘텐츠 HTML
   * @param currentFileQueue - 현재 fileQueue (클로저 문제 방지)
   * @returns 업로드된 파일 경로와 URL이 교체된 콘텐츠, 실패 시 null
   */
  const handleFileUpload = async (
    content: string,
    currentFileQueue?: typeof fileQueue
  ): Promise<{ filePaths: string[]; content: string } | null> => {
    const queueToUse = currentFileQueue ?? fileQueue;

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
   * 업로드된 파일들 롤백 삭제
   */
  const rollbackUploadedFiles = async (
    imagePaths: string[],
    filePaths: string[]
  ) => {
    const filesToDelete = [...imagePaths, ...filePaths];
    if (filesToDelete.length === 0) return;

    debug.log("게시글 수정 실패, 파일 삭제 시작:", filesToDelete);
    try {
      await deleteFilesByPath(filesToDelete);
      debug.log("파일 삭제 완료");
    } catch (deleteError) {
      debug.error("파일 삭제 중 에러:", deleteError);
    }
  };

  /**
   * 에러가 이미 처리된 경우인지 확인
   */
  const isHandledError = (error: unknown): boolean => {
    if (!(error instanceof Error)) return false;
    return (
      error.message === ERROR_MESSAGES.IMAGE_UPLOAD_FAILED ||
      error.message === ERROR_MESSAGES.IMAGE_URL_REPLACE_FAILED
    );
  };

  // 완료 버튼
  const hasTitle = (watch("title") || "").trim();
  const hasContent = extractTextFromHtml(watch("content") || "").length > 0;
  const isSubmitDisabled = isPending || !hasTitle || !hasContent;

  /**
   * media 배열 구성
   * - 기존 media에서 현재 content에 없는 것은 제거
   * - 새로 업로드된 이미지/파일 filePath 추가
   * - 현재 content에 있는 기존 이미지/파일 filePath 유지
   */
  const buildMediaArray = (
    currentImagePaths: string[],
    currentFilePaths: string[],
    uploadedImagePaths: string[],
    uploadedFilePaths: string[]
  ): string[] => {
    // 현재 content에 있는 모든 경로들을 합침
    const allCurrentPaths = [...currentImagePaths, ...currentFilePaths];

    const existingMediaInContent = originalMedia.filter((path) =>
      allCurrentPaths.some((currentPath) =>
        isFilePathMatching(currentPath, path)
      )
    );

    return [
      ...existingMediaInContent,
      ...uploadedImagePaths,
      ...uploadedFilePaths,
    ].filter((path, index, self) => self.indexOf(path) === index);
  };

  /**
   * 게시글 수정 성공 후 처리
   */
  const handleUpdateSuccess = () => {
    alert(POST_EDIT_CONSTANTS.UPDATE_SUCCESS);
    setImageQueue([]);
    setFileQueue([]);

    // 쿼리 무효화
    queryClient.invalidateQueries({
      queryKey: communitiesKeys.getCommunitiesPostsByTwoIds({
        communityId,
        postId,
      }),
    });
    queryClient.invalidateQueries({
      queryKey: communitiesKeys.getCommunitiesPosts({
        page: undefined,
        size: undefined,
        programType: undefined,
        programState: undefined,
      }),
    });

    // 상세 페이지로 이동
    router.replace(`/community/post/${postId}?communityId=${communityId}`);
  };

  /**
   * 에러 로깅 및 처리
   */
  const handleError = async (
    error: unknown,
    uploadedImagePaths: string[],
    uploadedFilePaths: string[]
  ) => {
    debug.error("게시글 수정 실패:", error);
    if (error instanceof Error) {
      debug.error("에러 메시지:", error.message);
      debug.error("에러 스택:", error.stack);
    }
    if ((error as any)?.response) {
      debug.error("API 응답 에러:", {
        status: (error as any).response.status,
        data: (error as any).response.data,
      });
    }

    // 에러 발생 시 업로드된 파일들 롤백
    if (uploadedImagePaths.length > 0 || uploadedFilePaths.length > 0) {
      await rollbackUploadedFiles(uploadedImagePaths, uploadedFilePaths);
    }

    // 에러가 이미 처리된 경우는 다시 alert하지 않음
    if (isHandledError(error)) {
      return;
    }

    const errorMessage =
      (error as any)?.response?.data?.message ||
      (error instanceof Error
        ? error.message
        : POST_EDIT_CONSTANTS.UNKNOWN_ERROR);
    alert(`${POST_EDIT_CONSTANTS.UPDATE_FAILED} ${errorMessage}`);
  };

  /**
   * 제출 핸들러
   */
  const onSubmit = async (values: WriteFormValues) => {
    if (!postId || !communityId) {
      alert(POST_EDIT_CONSTANTS.POST_NOT_FOUND);
      return;
    }

    const trimmedTitle = values.title.trim();
    const currentContent = getValues("content");
    let uploadedImagePaths: string[] = [];
    let uploadedFilePaths: string[] = [];

    // ref에서 최신 값 가져오기
    const currentImageQueue = imageQueueRef.current;
    const currentFileQueue = fileQueueRef.current;

    debug.log("게시글 수정 시작:", {
      imageQueueLength: currentImageQueue.length,
      fileQueueLength: currentFileQueue.length,
      currentContentLength: currentContent?.length || 0,
    });

    try {
      // 1. 이미지 업로드 및 검증
      debug.log("이미지 업로드 시작, imageQueue:", currentImageQueue);
      const { imagePaths, imageUrlMap } =
        await handleImageUpload(currentImageQueue);
      uploadedImagePaths = imagePaths;
      debug.log("이미지 업로드 완료, uploadedImagePaths:", uploadedImagePaths);

      // 2. 이미지 URL 교체 및 검증
      const contentWithUrls = handleImageUrlReplacement(
        currentContent,
        imageUrlMap,
        currentImageQueue
      );

      // 3. 파일 업로드 및 URL 교체
      const fileUploadResult = await handleFileUpload(
        contentWithUrls,
        currentFileQueue
      );
      if (!fileUploadResult) {
        // 파일 업로드 실패 시 alert는 이미 표시되었으므로 여기서 종료
        return;
      }
      const { filePaths, content: finalContent } = fileUploadResult;
      uploadedFilePaths = filePaths;

      // 4. 최종 content에서 현재 존재하는 이미지/파일 filePath 추출
      const currentImagePaths = extractImagePathsFromContent(finalContent);
      const currentFilePaths = extractFilePathsFromContent(finalContent);
      debug.log("현재 content의 이미지 filePath:", currentImagePaths);
      debug.log("현재 content의 파일 filePath:", currentFilePaths);
      debug.log("기존 media:", originalMedia);

      // 5. media 배열 구성
      const finalMedia = buildMediaArray(
        currentImagePaths,
        currentFilePaths,
        uploadedImagePaths,
        uploadedFilePaths
      );
      debug.log("최종 media 배열:", finalMedia);

      // 6. 게시글 수정
      const categoryToUse =
        resolvedCategory ||
        values.category ||
        POST_EDIT_CONSTANTS.DEFAULT_CATEGORY;

      const requestParam = {
        communityId,
        postId,
        data: {
          title: trimmedTitle,
          content: finalContent,
          category: categoryToUse,
          media: finalMedia,
        },
      } as CommunityTypes.TPUTCommunitiesPostsByTwoIdsReq;

      debug.log("게시글 수정 API 요청:", {
        communityId,
        postId,
        data: {
          title: trimmedTitle,
          contentLength: finalContent?.length || 0,
          category: categoryToUse,
          media: finalMedia,
        },
      });

      await updatePostAsync(requestParam);
      debug.log("게시글 수정 API 성공");

      // 7. 성공 후 처리
      handleUpdateSuccess();
    } catch (error) {
      await handleError(error, uploadedImagePaths, uploadedFilePaths);
    }
  };

  // TopBar 우측 완료 버튼
  useEffect(() => {
    setRightSlot(
      <ButtonBase
        type="submit"
        className="disabled:opacity-50"
        disabled={isSubmitDisabled}
        onClick={handleSubmit(onSubmit)}
      >
        <Typography font="noto" variant="body2M" className="text-main-600">
          완료
        </Typography>
      </ButtonBase>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setRightSlot, isSubmitDisabled, handleSubmit]);

  // Auth 초기화 대기 또는 미인증 시 렌더 생략
  if (!isReady || !user) {
    return null;
  }

  return (
    <form className="flex flex-col pt-12" onSubmit={handleSubmit(onSubmit)}>
      {/* 선택된 프로그램 정보 표시 (작성 페이지와 동일 UI) */}
      <div className="flex flex-col gap-4 bg-gray-100 p-5 py-3">
        {(selectedCommunityName || resolvedCategory) && (
          <div className="flex border-collapse flex-col gap-1 rounded-lg border border-gray-200 bg-white">
            {/* 글 카테고리 정보 */}
            <div className="flex w-full flex-col gap-1 px-4 py-2">
              <div className="flex items-center gap-2">
                <span className="bg-main-50 rounded-lg p-1">
                  <Typography
                    font="noto"
                    variant="body2M"
                    className="text-main-500"
                  >
                    {resolvedCategory}
                  </Typography>
                </span>
                {selectedCommunityName && (
                  <Typography
                    font="noto"
                    variant="body2M"
                    className="text-gray-950"
                  >
                    {selectedCommunityName}
                  </Typography>
                )}
              </div>
              <Typography
                font="noto"
                variant="label2M"
                className="text-gray-400"
              >
                {getCurrentDateTime()}
              </Typography>
            </div>
            {/* 공개 범위 (UI만 유지) */}
            <div className="flex w-full items-center justify-between border-t border-t-gray-300 p-4">
              <Typography
                font="noto"
                variant="label1M"
                className="text-gray-600"
              >
                공개 범위
              </Typography>
              <div className="flex items-center gap-1">
                <input type="checkbox" className="border border-gray-950" />
                <Typography
                  font="noto"
                  variant="label1M"
                  className="text-gray-600"
                >
                  참여자에게만 공개
                </Typography>
              </div>
            </div>
          </div>
        )}
        {/* 인증방법 */}
        <div className="border-main-300 bg-main-50 flex flex-col rounded-lg border px-5 py-4">
          <div className="flex items-center justify-between">
            <Typography font="noto" variant="label1M" className="text-gray-800">
              인증 방법
            </Typography>
            <ButtonBase className="size-8" aria-expanded={false}>
              <ChevronDown size={16} className="text-gray-800" />
            </ButtonBase>
          </div>
        </div>
      </div>
      <TextEditor
        initialTitleHtml={initialTitleHtml}
        initialContentHtml={initialContentHtml}
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

      {/* 뒤로가기 컨펌 모달 (UI 유지용, 바로 목록 이동 처리) */}
      <Modal
        isOpen={false}
        title="그만둘까요?"
        description="작성 중인 내용이 사라져요."
        cancelText="계속하기"
        confirmText="그만두기"
        onClose={() => {}}
        onConfirm={() => {
          router.replace(`/community`);
        }}
        variant="primary"
      />
    </form>
  );
};

const Page = () => {
  return (
    <Suspense>
      <EditPageContent />
    </Suspense>
  );
};

export default Page;
