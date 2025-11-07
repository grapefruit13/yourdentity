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
import BottomSheet from "@/components/shared/ui/bottom-sheet";
import Modal from "@/components/shared/ui/modal";
import { usePostCommunitiesPostsById } from "@/hooks/generated/communities-hooks";
import type * as CommunityTypes from "@/types/generated/communities-types";
import { cn } from "@/utils/shared/cn";

type WriteFormValues = {
  title: string;
  content: string; // HTML 포함
  category: "한끗 루틴" | "TMI 프로젝트" | "월간 소모임";
};

const MAX_FILES = 5;

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

  // 선택된 커뮤니티 ID가 있으면 사용, 없으면 기본값 사용
  const COMMUNITY_ID = selectedCommunityId;

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
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);
  const [isLeaveConfirmOpen, setIsLeaveConfirmOpen] = useState(false);
  const allowLeaveCountRef = useRef(0);

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
  const registerImage = useCallback((file: File): string => {
    const clientId = crypto.randomUUID();
    setImageQueue((prev) => {
      if (prev.length >= MAX_FILES) {
        alert(`이미지는 최대 ${MAX_FILES}장까지 첨부할 수 있어요.`);
        return prev;
      }
      return [...prev, { clientId, file }];
    });
    return clientId;
  }, []);

  /**
   * 단일 일반 파일 추가 (clientId 발급 후 큐에 등록)
   */
  const addAttachFile = useCallback((file: File): string => {
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
  }, []);

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
  const uploadQueuedFiles = useCallback(async () => {
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
      if (!item?.success || !data?.path) continue;
      const original = data.originalFileName ?? data.fileName ?? "";
      const clientId = String(original).split("__")[0] || "";
      if (clientId) {
        byIdToPath.set(clientId, data.path);
        // fileUrl이 없으면 path를 URL로 사용
        const url = data.fileUrl || data.path;
        if (url) byIdToUrl.set(clientId, url);
      }
    }
    return { byIdToPath, byIdToUrl };
  }, [fileQueue]);

  /**
   * 이미지 큐를 한 번에 업로드하고 clientId 매핑을 반환
   * @returns { byIdToPath, byIdToUrl, failedCount } - 실패한 이미지 개수 포함
   */
  const uploadQueuedImages = useCallback(async () => {
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
      // path가 없으면 업로드 실패로 간주
      if (!data?.path) {
        failedCount += 1;
        continue;
      }

      const original = data.originalFileName ?? data.fileName ?? "";
      // clientId는 파일명 앞부분에 __로 구분되어 있음
      const clientId = String(original).split("__")[0] || "";

      // clientId 파싱 실패는 경고이지만 업로드 자체는 성공
      if (clientId) {
        byIdToPath.set(clientId, data.path);
        // fileUrl이 없으면 path를 URL로 사용
        const url = data.fileUrl || data.path;
        byIdToUrl.set(clientId, url);
      }
    }

    return { byIdToPath, byIdToUrl, failedCount };
  }, [imageQueue]);

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
   * 제출 핸들러
   * - 제목/내용 유효성 검사 후 첨부 파일 업로드 → 글 등록까지 수행
   * - 실패 시 업로드된 파일들 롤백 삭제
   */
  const onSubmit = async (values: WriteFormValues) => {
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

    let uploadedImagePathsLocal: string[] = [];
    let uploadedFilePaths: string[] = [];

    try {
      // 이미지 일괄 업로드 및 콘텐츠 내 src 교체
      const {
        byIdToPath: imgIdToPath,
        byIdToUrl: imgIdToUrl,
        failedCount: imageFailedCount,
      } = await uploadQueuedImages();

      // 이미지 업로드 실패 확인
      if (imageQueue.length > 0 && imageFailedCount > 0) {
        alert(
          `에 실패했습니다. (${imageFailedCount}개 실패) 잠시 후 다시 시도해주세요.`
        );
        return;
      }

      // 이미지가 있는데 URL 매핑이 제대로 안 된 경우
      if (imageQueue.length > 0 && imgIdToUrl.size === 0) {
        alert("이미지 업로드에 실패했습니다. 잠시 후 다시 시도해주세요.");
        return;
      }

      uploadedImagePathsLocal = Array.from(imgIdToPath.values());
      // getValues()를 사용하여 최신 content 값을 가져옴
      const currentContent = getValues("content");
      let contentWithUrls = replaceEditorImageSrcWithUploadedUrls(
        currentContent,
        imgIdToUrl
      );

      // 이미지가 있는데 src가 교체되지 않은 경우 확인
      if (imageQueue.length > 0) {
        const tempContainer = document.createElement("div");
        tempContainer.innerHTML = contentWithUrls;
        const imagesWithClientId = tempContainer.querySelectorAll(
          "img[data-client-id]"
        );
        if (imagesWithClientId.length > 0) {
          alert("이미지 URL 교체에 실패했습니다. 잠시 후 다시 시도해주세요.");
          return;
        }
      }

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
      const postResponse = await new Promise<{
        postId: string;
        communityId: string;
      }>((resolve, reject) => {
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
          onSuccess: (res) => {
            const responseData = (res as any)?.data as
              | CommunityTypes.TPOSTCommunitiesPostsByIdRes
              | undefined;
            const postId = responseData?.id;
            const communityId = responseData?.communityId;

            if (!postId || !communityId) {
              reject(
                new Error(
                  "응답에서 postId 또는 communityId를 찾을 수 없습니다."
                )
              );
              return;
            }

            resolve({ postId, communityId });
          },
          onError: (err) => reject(err),
        });
      });

      alert("게시물이 등록되었습니다.");
      // 상태 초기화
      setImageQueue([]);
      setFileQueue([]);
      setValue("title", "");
      setValue("content", "");

      // 상세 페이지로 이동
      if (postResponse.postId && postResponse.communityId) {
        router.replace(
          `/community/post/${postResponse.postId}?communityId=${postResponse.communityId}`
        );
      }
    } catch {
      await deleteFilesByPath([
        ...uploadedImagePathsLocal,
        ...uploadedFilePaths,
      ]);
      alert("등록에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

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
      {selectedCommunityName && (
        <div className="mb-4 flex flex-col gap-2 px-5">
          <div className="flex items-center gap-2">
            <span className="bg-main-600 rounded-full px-3 py-1 text-xs font-medium text-white">
              {selectedCommunityName}
            </span>
          </div>
          <Typography font="noto" variant="body2R" className="text-gray-500">
            {getCurrentDateTime()}
          </Typography>
        </div>
      )}

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
                className="text-main-600"
              >
                *
              </Typography>
            </div>
            <ButtonBase className="flex items-center gap-1">
              <Typography font="noto" variant="body2M">
                {selectedCommunityName || "프로그램"}
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
                className="text-main-600"
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
                className="text-main-600"
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
        <div className="border-main-300 bg-main-50 flex flex-col rounded-xl border px-5 py-4">
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
                        checked ? "bg-main-600" : "bg-transparent"
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
            className="bg-main-600 w-full rounded-lg py-[10px] text-white"
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
            className="rounded-lg border border-gray-300 bg-white px-4 py-[10px] text-gray-800 active:bg-gray-100"
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
            className="bg-main-600 rounded-lg px-4 py-[10px] text-white active:opacity-90 disabled:opacity-50"
            disabled={isPending || !isDirty}
          >
            <Typography font="noto" variant="body2B">
              {isPending ? "등록 중..." : "등록"}
            </Typography>
          </ButtonBase>
        </div>
      </div>

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
