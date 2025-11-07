"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import type { ExtendedRecordMap } from "notion-types";
import { NotionRenderer } from "react-notion-x";
import "react-notion-x/src/styles.css";
import { Typography } from "@/components/shared/typography";
import Icon from "@/components/shared/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { IMAGE_URL } from "@/constants/shared/_image-url";
import { useGetProgramsById } from "@/hooks/generated/programs-hooks";
import { useGetPrograms } from "@/hooks/generated/programs-hooks";
import { useTopBarStore } from "@/stores/shared/topbar-store";
import type {
  ProgramDetailResponse,
  ProgramListResponse,
} from "@/types/generated/api-schema";
import { cn } from "@/utils/shared/cn";
import { formatDateRange, getTimeAgo } from "@/utils/shared/date";

const MAX_INQUIRIES_DISPLAY = 3;

/**
 * @description 한끗루틴 상세 페이지
 */
const RoutineDetailPage = () => {
  const params = useParams();
  const programId = params.id as string;

  const [shouldLoadNotion, setShouldLoadNotion] = useState(false);
  const [activeTab, setActiveTab] = useState<"detail" | "reviews" | "faq">(
    "detail"
  );
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);
  const tabRef = useRef<HTMLDivElement>(null);
  const detailSectionRef = useRef<HTMLDivElement>(null);
  const reviewsSectionRef = useRef<HTMLDivElement>(null);
  const faqSectionRef = useRef<HTMLDivElement>(null);

  // TopBar 제어
  const setTitle = useTopBarStore((state) => state.setTitle);
  const setRightSlot = useTopBarStore((state) => state.setRightSlot);
  const resetTopBar = useTopBarStore((state) => state.reset);

  // 프로그램 상세 정보 조회
  const {
    data: programDetailData,
    isLoading,
    error,
  } = useGetProgramsById({
    request: { programId },
    select: (data) => {
      if (!data || typeof data !== "object") {
        return null;
      }
      const responseData = data as ProgramDetailResponse["data"];
      return responseData?.program || null;
    },
  });

  // 공유하기 기능
  const handleShare = useCallback(async () => {
    if (!programDetailData) return;

    const programTitle =
      programDetailData.title || programDetailData.programName || "한끗루틴";
    const shareTitle = `${programTitle} 모집`;
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    const shareText = programDetailData.description || shareTitle;

    // Web Share API 지원 확인 (모바일/일부 데스크톱 브라우저)
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (error) {
        // 사용자가 공유를 취소한 경우는 에러로 처리하지 않음
        if ((error as Error).name !== "AbortError") {
          console.error("공유 실패:", error);
        } else {
          // 사용자가 취소한 경우 그냥 종료
          return;
        }
      }
    }

    // Web Share API를 지원하지 않거나 실패한 경우 클립보드에 복사
    try {
      await navigator.clipboard.writeText(shareUrl);
      // TODO: 토스트 메시지 표시 (선택사항)
      alert("링크가 클립보드에 복사되었습니다.");
    } catch (error) {
      alert("링크 복사에 실패했습니다.");
    }
  }, [programDetailData]);

  // 프로그램 데이터 로드 시 TopBar title과 rightSlot 설정
  useEffect(() => {
    if (!programDetailData) return;

    const programTitle =
      programDetailData.title || programDetailData.programName || "한끗루틴";
    setTitle(`${programTitle}`);

    // 공유하기 버튼
    const shareButton = (
      <button
        onClick={handleShare}
        className="flex h-10 w-10 items-center justify-center"
        aria-label="공유하기"
      >
        <Icon
          src={IMAGE_URL.ICON.share.url}
          width={24}
          height={24}
          className="text-gray-600"
        />
      </button>
    );
    setRightSlot(shareButton);

    // 언마운트 시 TopBar 초기화
    return () => {
      resetTopBar();
    };
  }, [programDetailData, setTitle, setRightSlot, resetTopBar, handleShare]);

  // 또는: 윗 컨텐츠 표시 후 일정 시간 지연 후 로드
  useEffect(() => {
    if (!programDetailData || shouldLoadNotion) return;

    // 프로그램 상세 정보가 로드된 후 500ms 지연 후 Notion 데이터 로드
    const timer = setTimeout(() => {
      setShouldLoadNotion(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [programDetailData, shouldLoadNotion]);

  // Notion 데이터 조회 (지연 로드)
  const { data: notionRecordMap } = useQuery<ExtendedRecordMap, Error>({
    queryKey: ["notion-program-blocks", programId],
    queryFn: async () => {
      const response = await fetch(`/api/notion/programs/${programId}/blocks`);
      if (!response.ok) {
        throw new Error(`Notion API 요청 실패: ${response.statusText}`);
      }
      const result = await response.json();
      return result.data as ExtendedRecordMap;
    },
    enabled: shouldLoadNotion,
  });

  // 모집 중인 프로그램 목록 조회 (추천 배너용)
  const { data: recommendedProgramsData } = useGetPrograms({
    request: {
      recruitmentStatus: "ongoing",
      programType: "ROUTINE",
      pageSize: 5,
    },
    select: (data) => {
      if (!data || typeof data !== "object") {
        return [];
      }
      const responseData = data as ProgramListResponse["data"];
      // 현재 프로그램 제외
      return responseData?.programs?.filter((p) => p.id !== programId) || [];
    },
  });

  // 탭에 해당하는 섹션으로 스크롤하는 함수
  const scrollToTabSection = useCallback(
    (tab: "detail" | "reviews" | "faq") => {
      let targetRef: React.RefObject<HTMLDivElement | null> | null = null;

      switch (tab) {
        case "detail":
          targetRef = detailSectionRef;
          break;
        case "reviews":
          targetRef = reviewsSectionRef;
          break;
        case "faq":
          targetRef = faqSectionRef;
          break;
      }

      if (!targetRef?.current) return;

      const targetElement = targetRef.current;

      // scrollIntoView 사용 (MDN 표준 메서드)
      // block: 'start' - 요소의 상단이 뷰포트 상단에 맞춰짐
      // behavior: 'smooth' - 부드러운 스크롤
      // scroll-margin-top CSS 속성으로 offset 조정됨
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    },
    []
  );

  // 탭 클릭 시 해당 섹션으로 스크롤
  const handleTabClick = useCallback(
    (tab: "detail" | "reviews" | "faq") => {
      setActiveTab(tab);

      // DOM 업데이트 완료 후 스크롤 실행
      // setTimeout을 사용하여 상태 업데이트 후 DOM 렌더링 완료 대기
      setTimeout(() => {
        scrollToTabSection(tab);
      }, 0);
    },
    [scrollToTabSection]
  );

  // URL 해시에 따라 초기 탭 설정
  useEffect(() => {
    if (typeof window !== "undefined" && programDetailData) {
      const hash = window.location.hash.replace("#", "");
      if (hash === "detail" || hash === "reviews" || hash === "faq") {
        setActiveTab(hash);
        // DOM 렌더링 완료 후 스크롤
        setTimeout(() => {
          scrollToTabSection(hash);
        }, 100);
      }
    }
  }, [programDetailData, scrollToTabSection]);

  // 프로그램 타입에 따른 일러스트 배경색
  const getProgramBgColor = (programType?: string): string => {
    switch (programType) {
      case "ROUTINE":
        return "bg-pink-100";
      case "TMI":
        return "bg-green-100";
      case "GATHERING":
        return "bg-orange-100";
      default:
        return "bg-blue-100";
    }
  };

  // 프로그램 타입에 따른 일러스트 아이콘
  const getProgramIcon = (programType?: string): string => {
    switch (programType) {
      case "ROUTINE":
        return "🎵";
      case "TMI":
        return "🍿";
      case "GATHERING":
        return "✂️";
      default:
        return "📋";
    }
  };

  // 모집 상태 텍스트 변환
  const getRecruitmentStatusText = (status?: string): string => {
    switch (status) {
      case "모집 전":
        return "모집 전";
      case "모집 중":
        return "모집 중";
      case "모집 완료":
        return "모집 완료";
      case "모집 취소":
        return "모집 취소";
      default:
        return "-";
    }
  };

  // 모집 상태 배경색 클래스
  const getRecruitmentStatusBgClass = (status?: string): string => {
    switch (status) {
      case "모집 중":
        return "bg-pink-100 text-pink-700";
      case "모집 전":
        return "bg-gray-100 text-gray-700";
      case "모집 완료":
        return "bg-gray-100 text-gray-700";
      case "모집 취소":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-4">
        <Typography font="noto" variant="body2R" className="text-gray-500">
          데이터를 불러오는 중 오류가 발생했습니다.
        </Typography>
      </div>
    );
  }

  if (isLoading || !programDetailData) {
    return (
      <div className="mt-12 min-h-screen bg-white">
        <div className="space-y-6 p-4">
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  const program = programDetailData;
  const faqList = program.faqList || [];
  const inquiries: Array<{
    id?: string;
    author?: string;
    content?: string;
    createdAt?: string;
  }> = []; // TODO: QnA API 연동 필요

  return (
    <div className="min-h-screen bg-white pt-12">
      {/* 썸네일 영역 - 상하좌우 패딩/마진 없이 꽉 채움 */}
      <div className="relative aspect-square w-full max-w-[470px] overflow-hidden">
        {/* TEMP: 썸네일 사진으로 반영해야 함 */}
        <div
          className={`relative flex h-full items-center justify-center ${getProgramBgColor(program.programType)}`}
        >
          {/* 일러스트 영역 */}
          <div className="text-8xl">{getProgramIcon(program.programType)}</div>
          {/* CHECK: 배지 표시? 아니면 썸네일 사진에 배지 표시? */}
          {/* {program.recruitmentStatus === "모집 중" && (
            <div className="absolute top-4 right-4 flex h-10 w-32 items-center justify-center rounded bg-yellow-400 text-xs font-bold text-black">
              모집중
            </div>
          )} */}
        </div>
      </div>

      {/* 모집 중 칩 */}
      <div className="w-full bg-white px-4 pt-2">
        {program.recruitmentStatus == "모집 중" && (
          <Typography
            font="noto"
            variant="label1B"
            className="bg-main-500 inline-flex items-center rounded-lg px-3 py-1.5 pt-3 font-medium text-white"
          >
            • 모집 중
          </Typography>
        )}
      </div>

      {/* 제목 및 설명 */}
      <div className="w-full bg-white px-4 pt-2">
        <Typography as="h2" font="noto" variant="title5" className="mb-2">
          {program.title || program.programName || "-"}
        </Typography>
        <Typography font="noto" variant="body2R" className="text-gray-600">
          {program.description || "-"}
        </Typography>
      </div>

      {/* 주요 정보 박스 */}
      <div className="w-full bg-white px-4 pt-4 pb-15">
        <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-100 px-3 py-4">
          {program.recruitmentStartDate && program.recruitmentEndDate && (
            <div className="flex items-start justify-between gap-4">
              <Typography
                font="noto"
                variant="label1B"
                className="shrink-0 text-gray-700"
              >
                신청 기간
              </Typography>
              <Typography
                font="noto"
                variant="label1R"
                className="flex-1 text-gray-600"
              >
                {formatDateRange(
                  program.recruitmentStartDate,
                  program.recruitmentEndDate
                )}
              </Typography>
            </div>
          )}
          {program.startDate && program.endDate && (
            <div className="flex items-start justify-between gap-4">
              <Typography
                font="noto"
                variant="label1B"
                className="shrink-0 text-gray-700"
              >
                활동 기간
              </Typography>
              <Typography
                font="noto"
                variant="label1R"
                className="flex-1 text-gray-600"
              >
                {formatDateRange(program.startDate, program.endDate)}
              </Typography>
            </div>
          )}
          {program.targetAudience && (
            <div className="flex items-start justify-between gap-4">
              <Typography
                font="noto"
                variant="label1B"
                className="shrink-0 text-gray-700"
              >
                참여 대상
              </Typography>
              <Typography
                font="noto"
                variant="label1R"
                className="flex-1 text-gray-600"
              >
                {program.targetAudience}
              </Typography>
            </div>
          )}
        </div>
        <Typography
          font="noto"
          variant="label2R"
          className="mt-4 text-gray-400"
        >
          *최소 인원 미달 시 모임은 취소될 수 있습니다.
        </Typography>
      </div>

      {/* 탭 네비게이션 */}
      <div
        ref={tabRef}
        className="sticky top-12 z-10 border-b border-gray-200 bg-white"
      >
        <div className="flex">
          <button
            onClick={() => handleTabClick("detail")}
            className={cn(
              "flex-1 border-b-2 px-4 py-3 text-center",
              activeTab === "detail"
                ? "border-pink-500 text-pink-500"
                : "border-transparent text-gray-500"
            )}
          >
            <Typography font="noto" variant="body3B">
              상세 설명
            </Typography>
          </button>
          <button
            onClick={() => handleTabClick("reviews")}
            className={cn(
              "flex-1 border-b-2 px-4 py-3 text-center",
              activeTab === "reviews"
                ? "border-pink-500 text-pink-500"
                : "border-transparent text-gray-500"
            )}
          >
            <Typography font="noto" variant="body3B">
              프로그램 후기
            </Typography>
          </button>
          <button
            onClick={() => handleTabClick("faq")}
            className={cn(
              "flex-1 border-b-2 px-4 py-3 text-center",
              activeTab === "faq"
                ? "border-pink-500 text-pink-500"
                : "border-transparent text-gray-500"
            )}
          >
            <Typography font="noto" variant="body3B">
              자주 묻는 질문
            </Typography>
          </button>
        </div>
      </div>

      {/* 상세 설명 탭 */}
      <div
        id="detail"
        ref={detailSectionRef}
        style={{ scrollMarginTop: "120px" }}
      >
        {notionRecordMap ? (
          <div className="notion-page">
            <NotionRenderer
              recordMap={notionRecordMap}
              fullPage={false}
              darkMode={false}
            />
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center rounded-lg bg-gray-100">
            <Typography font="noto" variant="body2R" className="text-gray-500">
              컨텐츠를 불러올 수 없습니다.
            </Typography>
          </div>
        )}
      </div>

      {/* 프로그램 후기 탭 */}
      <div
        id="reviews"
        ref={reviewsSectionRef}
        className="p-4"
        style={{ scrollMarginTop: "120px" }}
      >
        <div className="mb-4 flex items-center justify-between">
          <Typography as="h3" font="noto" variant="heading3B">
            참여했던 친구들의 후기에요!
          </Typography>
          <Link href={`/community?category=한끗루틴`} className="text-pink-500">
            <Typography font="noto" variant="body3R">
              피드 보러가기 →
            </Typography>
          </Link>
        </div>
        {/* TODO: 후기 목록 구현 */}
        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <Typography font="noto" variant="body2R" className="text-gray-500">
              아직 후기가 없습니다.
            </Typography>
          </div>
        </div>
      </div>

      {/* 자주 묻는 질문 탭 */}
      <div
        id="faq"
        ref={faqSectionRef}
        className="p-4"
        style={{ scrollMarginTop: "120px" }}
      >
        <Typography as="h3" font="noto" variant="heading3B" className="mb-4">
          자주 묻는 질문이에요!
        </Typography>
        <div className="space-y-2">
          {faqList.length > 0 ? (
            faqList.map((faq) => (
              <details
                key={faq.id}
                className="rounded-lg border border-gray-200 bg-white"
                open={expandedFaqId === faq.id}
                onToggle={(e) => {
                  setExpandedFaqId(
                    e.currentTarget.open ? faq.id || null : null
                  );
                }}
              >
                <summary className="flex cursor-pointer items-center justify-between p-4">
                  <Typography font="noto" variant="body3R">
                    {faq.title || "-"}
                  </Typography>
                  <svg
                    className={cn(
                      "h-5 w-5 transition-transform",
                      expandedFaqId === faq.id && "rotate-180"
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </summary>
                <div className="border-t border-gray-200 p-4">
                  {faq.content && faq.content.length > 0 ? (
                    <div className="space-y-2">
                      {faq.content.map((item, index) => (
                        <Typography
                          key={index}
                          font="noto"
                          variant="body2R"
                          className="text-gray-700"
                        >
                          {item.text || ""}
                        </Typography>
                      ))}
                    </div>
                  ) : (
                    <Typography
                      font="noto"
                      variant="body2R"
                      className="text-gray-500"
                    >
                      내용이 없습니다.
                    </Typography>
                  )}
                </div>
              </details>
            ))
          ) : (
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <Typography
                font="noto"
                variant="body2R"
                className="text-gray-500"
              >
                아직 등록된 질문이 없습니다.
              </Typography>
            </div>
          )}
        </div>
      </div>

      {/* 최하단: 댓글/문의 섹션 */}
      <div className="border-t border-gray-200 bg-gray-50 p-4">
        <div className="mb-4 flex items-center justify-between">
          <Typography as="h3" font="noto" variant="heading3B">
            더 궁금한 점이 있으신가요?
          </Typography>
          <Link
            href={`/routines/${programId}/comments`}
            className="text-pink-500"
          >
            <Typography font="noto" variant="body3R">
              문의 남기기 →
            </Typography>
          </Link>
        </div>

        {/* 문의 목록 (최대 3개) */}
        <div className="space-y-3">
          {inquiries.length > 0 ? (
            inquiries.slice(0, MAX_INQUIRIES_DISPLAY).map((inquiry) => (
              <div
                key={inquiry.id}
                className="rounded-lg border border-gray-200 bg-white p-4"
              >
                <div className="mb-2 flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gray-300"></div>
                  <div className="flex-1">
                    <Typography font="noto" variant="body3R">
                      {inquiry.author || "익명"}
                    </Typography>
                    {inquiry.createdAt && (
                      <Typography
                        font="noto"
                        variant="caption1R"
                        className="text-gray-500"
                      >
                        {getTimeAgo(inquiry.createdAt)}
                      </Typography>
                    )}
                  </div>
                </div>
                <Typography
                  font="noto"
                  variant="body2R"
                  className="text-gray-700"
                >
                  {inquiry.content || "-"}
                </Typography>
              </div>
            ))
          ) : (
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <Typography
                font="noto"
                variant="body2R"
                className="text-gray-500"
              >
                아직 등록된 문의가 없습니다.
              </Typography>
            </div>
          )}

          {/* 더 보기 버튼 */}
          {inquiries.length > MAX_INQUIRIES_DISPLAY && (
            <Link
              href={`/routines/${programId}/comments`}
              className="block rounded-lg border border-gray-200 bg-white p-4 text-center"
            >
              <Typography font="noto" variant="body3R">
                다른 문의 더 보기 →
              </Typography>
            </Link>
          )}
        </div>
      </div>

      {/* 프로그램 추천 배너 */}
      {recommendedProgramsData && recommendedProgramsData.length > 0 && (
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <Typography as="h3" font="noto" variant="heading3B" className="mb-2">
            현재 모집 중인 프로그램이에요!
          </Typography>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {recommendedProgramsData.map((recommendedProgram) => (
              <Link
                key={recommendedProgram.id}
                href={`/routines/${recommendedProgram.id || ""}`}
                className="flex min-w-[240px] flex-shrink-0 flex-col overflow-hidden rounded-lg border-2 border-pink-300 bg-white"
              >
                {/* 일러스트 영역 */}
                <div
                  className={`relative flex h-32 items-center justify-center ${getProgramBgColor(recommendedProgram.programType)}`}
                >
                  <div className="text-6xl">
                    {getProgramIcon(recommendedProgram.programType)}
                  </div>
                </div>
                {/* 텍스트 영역 */}
                <div className="flex flex-1 flex-col justify-between p-4">
                  <div>
                    <Typography
                      as="h4"
                      font="noto"
                      variant="heading3B"
                      className="mb-2"
                    >
                      {recommendedProgram.title ||
                        recommendedProgram.programName ||
                        "-"}
                    </Typography>
                    <Typography
                      font="noto"
                      variant="body3R"
                      className="line-clamp-2 text-gray-600"
                    >
                      {recommendedProgram.description || "-"}
                    </Typography>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 하단 고정 버튼 */}
      <div className="sticky bottom-0 z-20 border-t border-gray-200 bg-white p-4">
        <button className="w-full rounded-lg bg-pink-500 px-4 py-3 text-white">
          <Typography font="noto" variant="body3R" className="text-white">
            참여하기 →
          </Typography>
        </button>
      </div>
    </div>
  );
};

export default RoutineDetailPage;
