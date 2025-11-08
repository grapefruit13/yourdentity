/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Suspense, useState, useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useForm } from "react-hook-form";
import {
  deleteFilesById,
  postFilesUploadMultiple,
} from "@/api/generated/files-api";
import ButtonBase from "@/components/shared/base/button-base";
import TextEditor from "@/components/shared/text-editor/index";
import { Typography } from "@/components/shared/typography";
import Modal from "@/components/shared/ui/modal";
import {
  MAX_FILES,
  WRITE_MESSAGES,
} from "@/constants/community/_write-constants";
import { usePostCommunitiesPostsById } from "@/hooks/generated/communities-hooks";
import { useTopBarStore } from "@/stores/shared/topbar-store";
import type { WriteFormValues } from "@/types/community/_write-types";
import type * as CommunityTypes from "@/types/generated/communities-types";
import { debug } from "@/utils/shared/debugger";
import { extractTextFromHtml } from "@/utils/shared/text-editor";

/**
 * content HTML의 a[data-file-id]를 응답 fileUrl로 교체하고 data 속성을 제거
 */
const replaceEditorFileHrefWithUploadedUrls = (
  html: string,
  byIdToUrl: Map<string, string>
) => {
  if (!html) return html;
  const container = document.createElement("div");
  container.innerHTML = html;
  container
    .querySelectorAll<HTMLAnchorElement>("a[data-file-id]")
    .forEach((a) => {
      const clientId = a.getAttribute("data-file-id") || "";
      const url = byIdToUrl.get(clientId);
      if (url) {
        a.setAttribute("href", url);
        a.removeAttribute("data-file-id");
      }
    });
  return container.innerHTML;
};

/**
 * content HTML의 img[data-client-id]를 응답 fileUrl로 교체하고 data 속성을 제거
 */
const replaceEditorImageSrcWithUploadedUrls = (
  html: string,
  byIdToUrl: Map<string, string>
) => {
  if (!html) return html;
  if (byIdToUrl.size === 0) return html; // 매핑이 없으면 그대로 반환

  const container = document.createElement("div");
  container.innerHTML = html;
  const images = container.querySelectorAll<HTMLImageElement>(
    "img[data-client-id]"
  );

  images.forEach((img) => {
    const clientId = img.getAttribute("data-client-id");
    if (!clientId) return;

    const url = byIdToUrl.get(clientId);
    if (url) {
      img.setAttribute("src", url);
      img.removeAttribute("data-client-id");
    }
  });

  return container.innerHTML;
};

/**
 * @description 커뮤니티 글 작성 페이지 콘텐츠 (useSearchParams 사용)
 */
const WritePageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mutate, isPending } = usePostCommunitiesPostsById();
  const [isAuthGuideOpen, setIsAuthGuideOpen] = useState(false);

  // 쿼리 파라미터에서 프로그램 정보 가져오기
  const selectedCommunityId =
    searchParams.get("communityId") || "CP:VYTTZW33IH";
  const selectedCommunityName = searchParams.get("communityName") || "";
  const selectedCategory =
    searchParams.get("category") || "선택된 카테고리 없음";

  // 선택된 커뮤니티 ID가 있으면 사용, 없으면 기본값 사용
  const COMMUNITY_ID = selectedCommunityId;

  const { handleSubmit, setValue, getValues, watch, reset } =
    useForm<WriteFormValues>({
      defaultValues: { title: "", content: "", category: "한끗 루틴" },
      mode: "onChange",
    });

  const [isLeaveConfirmOpen, setIsLeaveConfirmOpen] = useState(false);
  const allowLeaveCountRef = useRef(0);
  const setRightSlot = useTopBarStore((state) => state.setRightSlot);

  // 제출 시 일괄 업로드할 파일 큐 (a 태그 href 교체용)
  const [fileQueue, setFileQueue] = useState<
    Array<{ clientId: string; file: File }>
  >([]);
  // 제출 시 일괄 업로드할 이미지 큐 (clientId와 함께 보관)
  const [imageQueue, setImageQueue] = useState<
    Array<{ clientId: string; file: File }>
  >([]);

  /**
   * 파일 중복 제거
   * - 같은 이름/사이즈/최종수정시간 조합은 동일 파일로 간주하여 1개만 유지합니다.
   * @param files 원본 파일 배열
   * @returns 중복이 제거된 파일 배열
   */
  const dedupeFiles = (files: File[]) => {
    const map = new Map<string, File>();
    files.forEach((f) => {
      const key = `${f.name}-${f.size}-${f.lastModified}`;
      if (!map.has(key)) map.set(key, f);
    });
    return Array.from(map.values());
  };

  // 이미지 파일은 TextEditor에서 업로드 콜백을 통해 즉시 처리합니다.

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
   * 파일 다건 업로드
   * - 각 파일명을 `clientId__원래이름`으로 리네임하여 업로드
   * - 응답의 originalFileName/fileName에서 clientId를 파싱하여 안전 매핑
   * - 입력 순서대로 업로드 경로(path) 배열을 반환
   */
  // 첨부 리스트 별도 업로드는 제거(파일 큐를 통해서만 업로드)

  /**
   * 파일 큐를 한 번에 업로드하고 clientId 매핑을 반환
   */
  const uploadQueuedFiles = async () => {
    if (!fileQueue.length)
      return {
        byIdToPath: new Map<string, string>(),
        byIdToUrl: new Map<string, string>(),
      };

    const formData = new FormData();
    fileQueue.slice(0, MAX_FILES).forEach(({ clientId, file }) => {
      const renamed = new File([file], `${clientId}__${file.name}`, {
        type: file.type,
      });
      formData.append("file", renamed);
    });

    const res = await postFilesUploadMultiple(formData);

    // API 응답 구조: res.data.files (res.data.data.files가 아님!)
    const items = (res as any)?.data?.files ?? [];
    const byIdToPath = new Map<string, string>();
    const byIdToUrl = new Map<string, string>();
    for (const item of items) {
      const data = item?.data;
      // path 또는 fileName이 없으면 건너뛰기
      const filePath = data?.path ?? data?.fileName;
      if (!item?.success || !filePath) continue;
      const original = data.originalFileName ?? data.fileName ?? "";
      const clientId = String(original).split("__")[0] || "";
      if (clientId) {
        byIdToPath.set(clientId, filePath);
        // fileUrl이 없으면 path를 URL로 사용
        const url = data.fileUrl || filePath;
        if (url) byIdToUrl.set(clientId, url);
      }
    }
    return { byIdToPath, byIdToUrl };
  };

  /**
   * 이미지 큐를 한 번에 업로드하고 clientId 매핑을 반환
   * @returns { byIdToPath, byIdToUrl, failedCount } - 실패한 이미지 개수 포함
   */
  const uploadQueuedImages = async () => {
    if (!imageQueue.length)
      return {
        byIdToPath: new Map<string, string>(),
        byIdToUrl: new Map<string, string>(),
        failedCount: 0,
      };

    const formData = new FormData();
    imageQueue.slice(0, MAX_FILES).forEach(({ clientId, file }) => {
      const renamed = new File([file], `${clientId}__${file.name}`, {
        type: file.type,
      });
      formData.append("file", renamed);
    });

    const res = await postFilesUploadMultiple(formData);

    // API 응답 구조: res.data.files
    const items = (res as any)?.data?.files ?? [];
    const byIdToPath = new Map<string, string>();
    const byIdToUrl = new Map<string, string>();
    let failedCount = 0;

    // 업로드한 이미지 개수
    const uploadedCount = imageQueue.slice(0, MAX_FILES).length;

    // 응답 개수가 업로드한 개수보다 적으면 일부가 실패한 것
    if (items.length < uploadedCount) {
      failedCount = uploadedCount - items.length;
    }

    // 각 응답 아이템 검사
    for (const item of items) {
      // 실제 업로드 실패만 카운트 (item.success === false)
      if (!item?.success) {
        failedCount += 1;
        continue;
      }

      const data = item?.data;
      // path 또는 fileName이 없으면 업로드 실패로 간주
      const filePath = data?.path ?? data?.fileName;
      if (!filePath) {
        failedCount += 1;
        continue;
      }

      const original = data.originalFileName ?? data.fileName ?? "";
      // clientId는 파일명 앞부분에 __로 구분되어 있음
      const clientId = String(original).split("__")[0] || "";

      // clientId 파싱 실패는 경고이지만 업로드 자체는 성공
      if (clientId) {
        byIdToPath.set(clientId, filePath);
        // fileUrl이 없으면 path를 URL로 사용
        const url = data.fileUrl || filePath;
        byIdToUrl.set(clientId, url);
      }
    }

    return { byIdToPath, byIdToUrl, failedCount };
  };

  /**
   * 파일 경로 배열로 다건 삭제 요청
   * @param paths Cloud Storage 내 파일 경로 배열
   */
  const deleteFilesByPath = async (paths: string[]) => {
    if (!paths.length) return;
    await Promise.allSettled(
      paths.map((p) => deleteFilesById({ filePath: p }))
    );
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
    } = await uploadQueuedImages();

    // 이미지 업로드 실패 확인
    if (imageQueue.length > 0 && imageFailedCount > 0) {
      alert(WRITE_MESSAGES.IMAGE_UPLOAD_PARTIAL_FAILED(imageFailedCount));
      throw new Error("IMAGE_UPLOAD_FAILED");
    }

    // 이미지가 있는데 URL 매핑이 제대로 안 된 경우
    if (imageQueue.length > 0 && imgIdToUrl.size === 0) {
      alert(WRITE_MESSAGES.IMAGE_UPLOAD_FAILED);
      throw new Error("IMAGE_UPLOAD_FAILED");
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
   * @returns 업로드된 파일 경로와 URL이 교체된 콘텐츠
   */
  const handleFileUpload = async (content: string) => {
    const { byIdToPath: fileIdToPath, byIdToUrl: fileIdToUrl } =
      await uploadQueuedFiles();
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
   * 게시글 등록
   * @param title - 제목
   * @param content - 콘텐츠 HTML
   * @param category - 카테고리
   * @param media - 미디어 파일 경로 배열
   * @returns 등록된 게시글 ID와 커뮤니티 ID
   */
  const createPost = (
    title: string,
    content: string,
    category: string,
    media: string[]
  ): Promise<{ postId: string; communityId: string }> => {
    return new Promise((resolve, reject) => {
      const requestParam = {
        communityId: COMMUNITY_ID,
        data: {
          title,
          content,
          category,
          media,
        },
      } as unknown as CommunityTypes.TPOSTCommunitiesPostsByIdReq;

      mutate(requestParam, {
        onSuccess: (res) => {
          const responseData = (res as any)?.data as
            | CommunityTypes.TPOSTCommunitiesPostsByIdRes
            | undefined;
          const postId = responseData?.id;
          const communityId = responseData?.communityId;

          if (!postId || !communityId) {
            reject(new Error(WRITE_MESSAGES.POST_RESPONSE_INVALID));
            return;
          }

          resolve({ postId, communityId });
        },
        onError: (err) => {
          reject(err);
        },
      });
    });
  };

  /**
   * 에러가 이미 처리된 경우인지 확인
   * @param error - 에러 객체
   * @returns 이미 처리된 에러인지 여부
   */
  const isHandledError = (error: unknown): boolean => {
    if (!(error instanceof Error)) return false;
    return (
      error.message === "IMAGE_UPLOAD_FAILED" ||
      error.message === "IMAGE_URL_REPLACE_FAILED"
    );
  };

  /**
   * 업로드된 파일들 롤백 삭제
   * @param imagePaths - 업로드된 이미지 경로 배열
   * @param filePaths - 업로드된 파일 경로 배열
   */
  const rollbackUploadedFiles = async (
    imagePaths: string[],
    filePaths: string[]
  ) => {
    const filesToDelete = [...imagePaths, ...filePaths];
    if (filesToDelete.length === 0) return;

    debug.log("게시글 작성 실패, 파일 삭제 시작:", filesToDelete);
    try {
      await deleteFilesByPath(filesToDelete);
      debug.log("파일 삭제 완료");
    } catch (deleteError) {
      debug.error("파일 삭제 중 에러:", deleteError);
    }
  };

  /**
   * 제출 핸들러
   * - 제목/내용 유효성 검사 후 첨부 파일 업로드 → 글 등록까지 수행
   * - 실패 시 업로드된 파일들 롤백 삭제
   */
  const onSubmit = async (values: WriteFormValues) => {
    const trimmedTitle = values.title.trim();
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
      const { filePaths, content: finalContent } =
        await handleFileUpload(contentWithUrls);
      uploadedFilePaths = filePaths;

      // 4. 게시글 등록
      const postResponse = await createPost(
        trimmedTitle,
        finalContent,
        values.category,
        [...uploadedImagePaths, ...uploadedFilePaths]
      );

      // 5. 성공 후 처리
      alert(WRITE_MESSAGES.POST_CREATE_SUCCESS);
      setImageQueue([]);
      setFileQueue([]);
      reset({
        title: "",
        content: "",
      });
      router.replace(
        `/community/post/${postResponse.postId}?communityId=${postResponse.communityId}`
      );
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
  const isSubmitDisabled = isPending || !hasTitle || !hasContent;

  /**
   * 화면 렌더 시 topbar에 완료(게시글 등록)버튼 추가
   */
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
  }, [setRightSlot, isSubmitDisabled, handleSubmit, onSubmit]);

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
      setIsLeaveConfirmOpen(true);
      // 네비게이션 취소를 위해 현재 히스토리로 다시 푸시
      pushBlockState();
    };

    // 최초 진입 시 한 단계 쌓아 두어 back을 가로챔
    pushBlockState();
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // 현재 날짜/시간 포맷팅
  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
    const dayName = dayNames[now.getDay()];
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}.${month}.${day}(${dayName}) ${hours}:${minutes} 작성 중`;
  };

  return (
    <form className="flex flex-col pt-12" onSubmit={handleSubmit(onSubmit)}>
      {/* 선택된 프로그램 정보 표시 */}
      <div className="flex flex-col gap-4 bg-gray-100 p-5 pt-2 pb-4">
        {selectedCommunityName && (
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
                    {selectedCategory}
                  </Typography>
                </span>
                <Typography
                  font="noto"
                  variant="body2M"
                  className="text-gray-950"
                >
                  {selectedCommunityName}
                </Typography>
              </div>
              <Typography
                font="noto"
                variant="label2M"
                className="text-gray-400"
              >
                {getCurrentDateTime()}
              </Typography>
            </div>
            {/* 공개 범위 */}
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
              className="font-noto font-regular text-[13px] leading-[1.5] text-gray-950"
            >
              1. 인증 글 제목 예시 : 9/17 [아침] 정은 인증 <br />
              &nbsp;날짜 / [아침,점심,저녁] / 닉네임 <br />
              2. 9월 한끗루틴은 아침, 점심, 저녁 총 세 번의 루틴을 인증하기
              때문에&nbsp;
              <Typography font="noto" variant="body3B">
                태그
              </Typography>
              를 꼭 걸어주세요!
              <br />
              3. 모든 루틴 인증글에는 타임스탬프(날짜, 시간 포함) 사진이
              필수입니다. <br />
              4. 루틴 인증 소감, 이야기도 꼭 남겨주세요!
            </p>
          )}
        </div>
      </div>
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
        onClose={() => setIsLeaveConfirmOpen(false)}
        onConfirm={() => {
          setIsLeaveConfirmOpen(false);
          // popstate 인터셉트를 통하지 않고 즉시 이전 화면(커뮤니티 목록)으로 이동
          router.replace(`/community`);
        }}
        variant="primary"
      />
    </form>
  );
};

/**
 * @description 커뮤니티 글 작성 페이지 (Suspense로 감싸기)
 */
const Page = () => {
  return (
    <Suspense>
      <WritePageContent />
    </Suspense>
  );
};

export default Page;
