"use client";

import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useForm } from "react-hook-form";
import ButtonBase from "@/components/shared/base/button-base";
import TextEditor from "@/components/shared/text-editor";
import { Typography } from "@/components/shared/typography";
import BottomSheet from "@/components/shared/ui/bottom-sheet";
import { usePostCommunitiesPostsById } from "@/hooks/generated/communities-hooks";
import { post, del } from "@/lib/axios";
import type * as CommunityTypes from "@/types/generated/communities-types";
import { cn } from "@/utils/shared/cn";

type WriteFormValues = {
  title: string;
  content: string; // HTML 포함
  category: "한끗 루틴" | "TMI 프로젝트" | "월간 소모임";
};

type UploadMultipleRes = {
  status: number;
  data: {
    uploaded: number;
    failed: number;
    files: {
      success: boolean;
      data?: {
        fileUrl: string;
        fileName: string;
        path: string;
        originalFileName?: string;
        mimeType?: string;
        size?: number;
        bucket?: string;
      };
    }[];
    errors: string[];
  };
};

const MAX_FILES = 5;

/**
 * @description 커뮤니티 글 작성 페이지
 */
const Page = () => {
  const { mutate, isPending } = usePostCommunitiesPostsById();
  const [isAuthGuideOpen, setIsAuthGuideOpen] = React.useState(false);

  const COMMUNITY_ID = "CP:VYTTZW33IH";

  const {
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { isDirty },
  } = useForm<WriteFormValues>({
    defaultValues: { title: "", content: "", category: "한끗 루틴" },
    mode: "onChange",
  });

  const selectedCategory = watch("category");
  const [isCategorySheetOpen, setIsCategorySheetOpen] = React.useState(false);

  const [attachFiles, setAttachFiles] = React.useState<File[]>([]);
  // 제출 시 일괄 업로드할 파일 큐 (a 태그 href 교체용)
  const [fileQueue, setFileQueue] = React.useState<
    Array<{ clientId: string; file: File }>
  >([]);
  // 제출 시 일괄 업로드할 이미지 큐 (clientId와 함께 보관)
  const [imageQueue, setImageQueue] = React.useState<
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

  /**
   * 상한선만큼 잘라 반환
   * @param files 파일 배열
   * @param max 최대 개수(기본 5)
   * @returns 앞에서부터 최대 max개만 포함한 새 배열
   */
  const takeMax = (files: File[], max = MAX_FILES) => files.slice(0, max);

  // 이미지 파일은 TextEditor에서 업로드 콜백을 통해 즉시 처리합니다.

  /**
   * 이미지 선택 시 clientId를 발급/등록하고 반환 (즉시 업로드는 하지 않음)
   */
  const registerImage = React.useCallback(
    (file: File): string => {
      if (imageQueue.length >= MAX_FILES) {
        alert(`이미지는 최대 ${MAX_FILES}장까지 첨부할 수 있어요.`);
        return "";
      }
      const clientId = crypto.randomUUID();
      setImageQueue((prev) => [...prev, { clientId, file }]);
      return clientId;
    },
    [imageQueue.length]
  );

  /**
   * 단일 일반 파일 추가 (clientId 발급 후 큐/목록에 등록)
   */
  const addAttachFile = React.useCallback(
    (file: File): string => {
      const clientId = crypto.randomUUID();
      const merged = dedupeFiles([...attachFiles, file]);
      if (merged.length > MAX_FILES) {
        alert(`파일은 최대 ${MAX_FILES}개까지 첨부할 수 있어요.`);
      }
      setAttachFiles(takeMax(merged));
      setFileQueue((prev) => [...prev, { clientId, file }]);
      return clientId;
    },
    [attachFiles]
  );

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
  const uploadQueuedFiles = React.useCallback(async () => {
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

    const res = await post<UploadMultipleRes>(
      `/files/upload-multiple`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    const items = res.data?.data?.files ?? [];
    const byIdToPath = new Map<string, string>();
    const byIdToUrl = new Map<string, string>();
    for (const item of items) {
      const data = item?.data;
      if (!item?.success || !data?.path) continue;
      const original = data.originalFileName ?? data.fileName ?? "";
      const clientId = String(original).split("__")[0] || "";
      if (clientId) {
        byIdToPath.set(clientId, data.path);
        if (data.fileUrl) byIdToUrl.set(clientId, data.fileUrl);
      }
    }
    return { byIdToPath, byIdToUrl };
  }, [fileQueue]);

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
   * 이미지 큐를 한 번에 업로드하고 clientId 매핑을 반환
   */
  const uploadQueuedImages = React.useCallback(async () => {
    if (!imageQueue.length)
      return {
        byIdToPath: new Map<string, string>(),
        byIdToUrl: new Map<string, string>(),
      };

    const formData = new FormData();
    imageQueue.slice(0, MAX_FILES).forEach(({ clientId, file }) => {
      const renamed = new File([file], `${clientId}__${file.name}`, {
        type: file.type,
      });
      formData.append("file", renamed);
    });

    const res = await post<UploadMultipleRes>(
      `/files/upload-multiple`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    const items = res.data?.data?.files ?? [];
    const byIdToPath = new Map<string, string>();
    const byIdToUrl = new Map<string, string>();
    for (const item of items) {
      const data = item?.data;
      if (!item?.success || !data?.path) continue;
      const original = data.originalFileName ?? data.fileName ?? "";
      const clientId = String(original).split("__")[0] || "";
      if (clientId) {
        byIdToPath.set(clientId, data.path);
        if (data.fileUrl) byIdToUrl.set(clientId, data.fileUrl);
      }
    }
    return { byIdToPath, byIdToUrl };
  }, [imageQueue]);

  /**
   * content HTML의 img[data-client-id]를 응답 fileUrl로 교체하고 data 속성을 제거
   */
  const replaceEditorImageSrcWithUploadedUrls = (
    html: string,
    byIdToUrl: Map<string, string>
  ) => {
    if (!html) return html;
    const container = document.createElement("div");
    container.innerHTML = html;
    container
      .querySelectorAll<HTMLImageElement>("img[data-client-id]")
      .forEach((img) => {
        const clientId = img.getAttribute("data-client-id") || "";
        const url = byIdToUrl.get(clientId);
        if (url) {
          img.setAttribute("src", url);
          img.removeAttribute("data-client-id");
        }
      });
    return container.innerHTML;
  };

  /**
   * 파일 경로 배열로 다건 삭제 요청
   * @param paths Cloud Storage 내 파일 경로 배열
   */
  const deleteFilesByPath = async (paths: string[]) => {
    if (!paths.length) return;
    await Promise.allSettled(paths.map((p) => del(`/files/${p}`)));
  };

  /**
   * 제출 핸들러
   * - 제목/내용 유효성 검사 후 첨부 파일 업로드 → 글 등록까지 수행
   * - 실패 시 업로드된 파일들 롤백 삭제
   */
  const onSubmit = React.useCallback(
    async (values: WriteFormValues) => {
      const trimmedTitle = values.title.trim();
      const hasContent = (() => {
        const html = values.content || "";
        const text = html
          .replace(/<[^>]*>/g, "") // 태그 제거
          .replace(/&nbsp;/g, " ") // nbsp 치환
          .trim();
        return text.length > 0;
      })();

      if (!trimmedTitle) {
        alert("제목을 입력해주세요.");
        return;
      }
      if (!hasContent) {
        alert("내용을 입력해주세요.");
        return;
      }

      if (imageQueue.length > MAX_FILES || attachFiles.length > MAX_FILES) {
        alert(`이미지/파일은 각각 최대 ${MAX_FILES}개까지만 첨부할 수 있어요.`);
        return;
      }

      let uploadedImagePathsLocal: string[] = [];
      let uploadedFilePaths: string[] = [];

      try {
        // 이미지 일괄 업로드 및 콘텐츠 내 src 교체
        const { byIdToPath: imgIdToPath, byIdToUrl: imgIdToUrl } =
          await uploadQueuedImages();
        uploadedImagePathsLocal = Array.from(imgIdToPath.values());
        let contentWithUrls = replaceEditorImageSrcWithUploadedUrls(
          values.content,
          imgIdToUrl
        );
        // 파일 큐 업로드 및 a[href] 교체
        const { byIdToPath: fileIdToPath, byIdToUrl: fileIdToUrl } =
          await uploadQueuedFiles();
        // 파일 업로드 경로는 큐 결과만 사용 (중복 업로드 방지)
        const uploadedFilePathsSet = Array.from(fileIdToPath.values());
        contentWithUrls = replaceEditorFileHrefWithUploadedUrls(
          contentWithUrls,
          fileIdToUrl
        );
        setValue("content", contentWithUrls, {
          shouldDirty: true,
          shouldValidate: false,
        });
        // 첨부 리스트 업로드는 제거하고(중복 방지), 큐 업로드 결과만 사용
        uploadedFilePaths = uploadedFilePathsSet;

        // 글 작성
        await new Promise<void>((resolve, reject) => {
          const requestParam = {
            communityId: COMMUNITY_ID,
            data: {
              title: trimmedTitle,
              content: contentWithUrls,
              category: values.category,
              media: [
                ...uploadedImagePathsLocal,
                ...uploadedFilePaths,
              ] as string[],
            },
          } as unknown as CommunityTypes.TPOSTCommunitiesPostsByIdReq;

          mutate(requestParam, {
            onSuccess: () => resolve(),
            onError: (err) => reject(err),
          });
        });

        alert("게시물이 등록되었습니다.");
        // 상태 초기화
        setAttachFiles([]);
        setImageQueue([]);
        setFileQueue([]);
        setValue("title", "");
        setValue("content", "");
      } catch {
        await deleteFilesByPath([
          ...uploadedImagePathsLocal,
          ...uploadedFilePaths,
        ]);
        alert("등록에 실패했습니다. 잠시 후 다시 시도해주세요.");
      }
    },
    [
      mutate,
      imageQueue,
      attachFiles,
      setValue,
      uploadQueuedImages,
      uploadQueuedFiles,
    ]
  );

  return (
    <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-4 bg-gray-100 px-5 py-3">
        {/* 카테고리 선택 */}
        <div className="flex border-collapse flex-col rounded-lg border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-200 p-4">
            <div className="flex items-center">
              <Typography font="noto" variant="label1M">
                게시판
              </Typography>
              <Typography
                font="noto"
                variant="label1M"
                className="text-primary-600"
              >
                *
              </Typography>
            </div>
            <ButtonBase className="flex items-center gap-1">
              <Typography font="noto" variant="body2M">
                프로그램
              </Typography>
              <ChevronDown size={16} className="text-gray-950" />
            </ButtonBase>
          </div>
          <div className="flex items-center justify-between border-b border-gray-200 p-4">
            <div className="flex items-center">
              <Typography font="noto" variant="label1M">
                카테고리
              </Typography>
              <Typography
                font="noto"
                variant="label1M"
                className="text-primary-600"
              >
                *
              </Typography>
            </div>
            <ButtonBase
              className="flex items-center gap-1"
              onClick={() => setIsCategorySheetOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={isCategorySheetOpen}
              aria-controls="category-bottom-sheet"
            >
              <Typography font="noto" variant="body2M">
                {selectedCategory}
              </Typography>
              <ChevronDown size={16} className="text-gray-950" />
            </ButtonBase>
          </div>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <Typography font="noto" variant="label1M">
                날짜
              </Typography>
              <Typography
                font="noto"
                variant="label1M"
                className="text-primary-600"
              >
                *
              </Typography>
            </div>
            <ButtonBase className="flex items-center gap-1">
              <Typography font="noto" variant="body2M">
                2025년 10월 29일(목)
              </Typography>
              <ChevronDown size={16} className="text-gray-950" />
            </ButtonBase>
          </div>
        </div>
        {/* 인증방법 */}
        <div className="border-primary-300 bg-primary-50 flex flex-col rounded-xl border px-5 py-4">
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

      {/* 카테고리 선택 바텀시트 */}
      <BottomSheet
        isOpen={isCategorySheetOpen}
        onClose={() => setIsCategorySheetOpen(false)}
      >
        <Typography font="noto" variant="body1B" className="mb-3">
          카테고리 선택
        </Typography>
        <div className="flex flex-col gap-2">
          {(["한끗 루틴", "TMI 프로젝트", "월간 소모임"] as const).map(
            (label) => {
              const checked = selectedCategory === label;
              return (
                <label
                  key={label}
                  className={
                    "flex w-full cursor-pointer items-center gap-4 rounded-lg px-4 py-3"
                  }
                >
                  <input
                    type="radio"
                    name="category"
                    className="peer sr-only"
                    checked={checked}
                    onChange={() =>
                      setValue("category", label, { shouldDirty: true })
                    }
                  />
                  <span
                    className="relative inline-flex size-4 items-center justify-center rounded-full border border-gray-200 shadow-xs drop-shadow-xs transition-colors"
                    aria-hidden
                  >
                    <span
                      className={cn(
                        "inline-block size-2 rounded-full transition-colors",
                        checked ? "bg-primary-600" : "bg-transparent"
                      )}
                    />
                  </span>
                  <Typography
                    font="noto"
                    variant="body2M"
                    className="select-none"
                  >
                    {label}
                  </Typography>
                </label>
              );
            }
          )}
        </div>

        {/* 하단 완료 버튼 */}
        <div className="mt-6">
          <ButtonBase
            className="bg-primary-600 w-full rounded-lg py-[10px] text-white"
            onClick={() => setIsCategorySheetOpen(false)}
          >
            완료
          </ButtonBase>
        </div>
      </BottomSheet>

      {/* 하단 제출 버튼 영역 */}
      <div className="sticky bottom-0 z-40 mt-4 border-t border-gray-200 bg-white px-5 py-3">
        <div className="flex items-center justify-end gap-2">
          <ButtonBase
            type="button"
            className="text-gray-700"
            onClick={() => {
              const { title, content } = getValues();
              if (!title && !content) return;
              if (confirm("작성 중인 내용을 모두 지울까요?")) {
                setValue("title", "", { shouldDirty: true });
                setValue("content", "", { shouldDirty: true });
              }
            }}
          >
            <Typography font="noto" variant="body2M">
              초기화
            </Typography>
          </ButtonBase>
          <ButtonBase
            type="submit"
            className="bg-primary-600 text-white disabled:opacity-50"
            disabled={isPending || !isDirty}
          >
            <Typography font="noto" variant="body2B">
              {isPending ? "등록 중..." : "등록"}
            </Typography>
          </ButtonBase>
        </div>
      </div>

      {/* 실시간 HTML 데모 프리뷰 */}
      <div className="px-5 py-6">
        <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-4">
          <Typography font="noto" variant="body1B">
            실시간 HTML 미리보기
          </Typography>

          {/* Title Preview (HTML String) */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700">제목 HTML</h3>
            <div className="rounded-md border bg-gray-50 p-3">
              <pre className="overflow-x-auto text-xs text-gray-800">
                <code>{watch("title") || "<p>제목이 비어있습니다.</p>"}</code>
              </pre>
            </div>
          </div>

          {/* Content Preview (HTML String) */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700">내용 HTML</h3>
            <div className="rounded-md border bg-gray-50 p-3">
              <pre className="overflow-x-auto text-xs text-gray-800">
                <code>{watch("content") || "<p>내용이 비어있습니다.</p>"}</code>
              </pre>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Rendered Result */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">렌더링 결과</h3>
            <div className="space-y-4 rounded-md border p-4">
              <div
                className="text-2xl font-bold"
                dangerouslySetInnerHTML={{
                  __html: watch("title") || "<p>제목이 비어있습니다.</p>",
                }}
              />
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: watch("content") || "<p>내용이 비어있습니다.</p>",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default Page;
