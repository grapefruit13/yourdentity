"use client";

import {
  Suspense,
  useState,
  useCallback,
  useEffect,
  type KeyboardEvent,
} from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

import Textarea from "@/components/shared/textarea";
import { Typography } from "@/components/shared/typography";
import { IMAGE_URL } from "@/constants/shared/_image-url";
import { usePostReportcontent } from "@/hooks/generated/reports-hooks";
import { useTopBarStore } from "@/stores/shared/topbar-store";
import { cn } from "@/utils/shared/cn";

import { getErrorMessage } from "@/utils/shared/error";
import { showToast } from "@/utils/shared/toast";
const REPORT_REASONS = [
  "광고성 글이에요",
  "명예를 훼손하는 내용이에요",
  "욕설이나 비방 표현을 해요",
  "저작권 침해가 우려돼요",
  "외설적인 내용이 포함돼있어요",
  "기타 부적절한 행위가 있어요",
  "직접 작성",
] as const;

type ReportReason = (typeof REPORT_REASONS)[number];

const RadioIndicator = ({ isActive }: { isActive: boolean }) => {
  return (
    <span
      className={cn(
        "flex size-[18px] items-center justify-center rounded-full border",
        isActive ? "border-[#FF006C]" : "border-gray-300"
      )}
    >
      <span
        className={cn(
          "size-[7.5px] rounded-full",
          isActive ? "bg-[#FF006C]" : "bg-transparent"
        )}
      />
    </span>
  );
};

/**
 * @description 신고 페이지 콘텐츠 (useSearchParams 사용)
 */
const ReportPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const targetType = searchParams.get("targetType") as
    | "post"
    | "comment"
    | null;
  const targetId = searchParams.get("targetId") || "";
  const targetUserId = searchParams.get("targetUserId") || "";
  const communityId = searchParams.get("communityId") || "";

  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(
    null
  );
  const [customReason, setCustomReason] = useState("");

  const { mutateAsync: reportContentAsync, isPending: isReporting } =
    usePostReportcontent();
  const setHideTopBar = useTopBarStore((state) => state.setHideTopBar);

  // 공통 헤더 숨기기/보이기 관리
  useEffect(() => {
    setHideTopBar(true);
    return () => {
      setHideTopBar(false);
    };
  }, [setHideTopBar]);

  // 뒤로가기 핸들러
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  // 신고 사유 선택 핸들러
  const handleReasonSelect = useCallback((reason: ReportReason) => {
    setSelectedReason(reason);
    if (reason !== "직접 작성") {
      setCustomReason("");
    }
  }, []);

  // 라디오 버튼 키보드 접근성 핸들러
  const handleRadioKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    callback: () => void
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      callback();
    }
  };

  // 완료 버튼 클릭 핸들러
  const handleSubmit = useCallback(async () => {
    if (!selectedReason) {
      showToast("신고 사유를 선택해주세요.");
      return;
    }

    if (selectedReason === "직접 작성" && !customReason.trim()) {
      showToast("신고 사유를 입력해주세요.");
      return;
    }

    if (!targetType || !targetId || !targetUserId) {
      showToast("신고 정보가 올바르지 않습니다.");
      return;
    }

    const reportReason =
      selectedReason === "직접 작성" ? customReason.trim() : selectedReason;

    try {
      await reportContentAsync({
        data: {
          targetType,
          targetId,
          targetUserId,
          communityId: communityId || undefined,
          reportReason,
        },
      });

      showToast("신고가 완료되었습니다.");
      router.back();
    } catch (error) {
      const errorMessage = getErrorMessage(
        error,
        "신고 처리 중 오류가 발생했습니다."
      );
      showToast(errorMessage);
    }
  }, [
    selectedReason,
    customReason,
    targetType,
    targetId,
    targetUserId,
    communityId,
    reportContentAsync,
    router,
  ]);

  // 유효성 검사: 선택된 사유가 있고, 직접 작성인 경우 입력값이 있어야 함
  const isValid =
    selectedReason !== null &&
    (selectedReason !== "직접 작성" || customReason.trim().length > 0);

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 flex items-center border-b border-gray-200 bg-white px-4 py-3">
        <button
          onClick={handleBack}
          className="hover:cursor-pointer"
          type="button"
          aria-label="뒤로가기"
        >
          <Image
            src={IMAGE_URL.ICON.chevron.left.url}
            alt={IMAGE_URL.ICON.chevron.left.alt}
            width={24}
            height={24}
          />
        </button>
      </div>

      {/* 본문 */}
      <div className="p-5">
        <Typography
          font="noto"
          variant="heading2B"
          className="mb-5 flex text-gray-950"
        >
          신고하는 이유를 알려주세요.
        </Typography>

        {/* 신고 사유 목록 */}
        <div>
          {REPORT_REASONS.map((reason) => {
            const isActive = selectedReason === reason;
            return (
              <button
                key={reason}
                type="button"
                role="radio"
                aria-checked={isActive}
                tabIndex={0}
                onClick={() => handleReasonSelect(reason)}
                onKeyDown={(event) =>
                  handleRadioKeyDown(event, () => handleReasonSelect(reason))
                }
                disabled={isReporting}
                className="focus-visible:ring-main-500 flex h-10 w-full items-center gap-2 rounded-2xl bg-white transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RadioIndicator isActive={isActive} />
                <Typography
                  font="noto"
                  variant="body2R"
                  className="flex-1 text-left text-gray-900"
                >
                  {reason}
                </Typography>
              </button>
            );
          })}
        </div>

        {/* 직접 작성 입력 필드 */}
        {selectedReason === "직접 작성" && (
          <div className="mt-[-2] ml-6">
            <Textarea
              placeholder="내용을 입력해주세요."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              disabled={isReporting}
              className="h-[66px] !px-3 !py-4 !text-[14px]"
            />
          </div>
        )}
      </div>

      {/* 완료 버튼 */}
      <div className="fixed right-0 bottom-0 left-0 bg-white p-4">
        <button
          onClick={handleSubmit}
          disabled={!isValid || isReporting}
          className={cn(
            "w-full rounded-lg py-3 transition-colors",
            isValid && !isReporting
              ? "bg-[#FF006C] text-white hover:bg-[#E6005F]"
              : "cursor-not-allowed bg-pink-100 text-gray-400"
          )}
          type="button"
        >
          <Typography
            font="noto"
            variant="body2M"
            className={isValid && !isReporting ? "text-white" : "text-gray-400"}
          >
            {isReporting ? "신고 중..." : "완료"}
          </Typography>
        </button>
      </div>
    </div>
  );
};

/**
 * @description 신고 페이지
 * - 게시글/댓글 신고 기능
 * - 신고 사유 선택 및 직접 작성
 */
const ReportPage = () => {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <ReportPageContent />
    </Suspense>
  );
};

export default ReportPage;
