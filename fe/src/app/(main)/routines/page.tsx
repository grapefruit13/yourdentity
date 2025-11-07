"use client";

import Link from "next/link";
import { Typography } from "@/components/shared/typography";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetPrograms } from "@/hooks/generated/programs-hooks";
import type { ProgramListResponse } from "@/types/generated/api-schema";
import { formatDateWithDay, formatDateRange } from "@/utils/shared/date";

const MAX_PAGE_SIZE = 20;

/**
 * @description 한끗루틴 목록 페이지
 */
const RoutinesPage = () => {
  const {
    data: programsData,
    isLoading,
    error,
  } = useGetPrograms({
    request: { pageSize: MAX_PAGE_SIZE },
    select: (data) => {
      if (!data || typeof data !== "object") {
        return [];
      }
      const responseData = data as ProgramListResponse["data"];
      if (
        responseData &&
        "programs" in responseData &&
        Array.isArray(responseData.programs)
      ) {
        return responseData.programs || [];
      }
      return [];
    },
  });

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

  // TEMP: 프로그램 타입에 따른 일러스트 아이콘
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

  // 선착순 모집 섹션: 진행 중이 아니면서 모집 완료가 아닌 항목들
  const recruitingPrograms =
    programsData?.filter(
      (program) =>
        program.programStatus !== "진행 중" &&
        program.recruitmentStatus !== "모집 완료"
    ) || [];

  // 활동 중인 루틴 섹션: 진행 중 상태의 항목들만
  const activePrograms =
    programsData?.filter((program) => program.programStatus === "진행 중") ||
    [];

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-4">
        <Typography font="noto" variant="body2R" className="text-red-500">
          데이터를 불러오는 중 오류가 발생했습니다.
        </Typography>
      </div>
    );
  }

  return (
    <div className="mt-12 h-full bg-[#F5F5F0] p-4">
      {isLoading ? (
        <div className="space-y-6">
          {/* 선착순 모집 섹션 스켈레톤 */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-64 w-full rounded-lg" />
              ))}
            </div>
          </div>
          {/* 활동 중인 루틴 섹션 스켈레톤 */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-48" />
            <div className="flex gap-4 overflow-x-auto pb-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="h-64 w-64 flex-shrink-0 rounded-lg"
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {recruitingPrograms.length > 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {recruitingPrograms.map((program) => (
                  <Link
                    key={program.id}
                    href={`/routines/${program.id || ""}`}
                    className="flex flex-col overflow-hidden rounded-lg border-2 border-pink-300 bg-white"
                  >
                    {/* 일러스트 영역 */}
                    <div
                      className={`relative flex h-32 items-center justify-center ${getProgramBgColor(program.programType)}`}
                    >
                      {/* 선착순 모집 배지 */}
                      <div className="absolute top-2 left-2 flex h-8 w-20 items-center justify-center rounded bg-yellow-400 text-xs font-bold text-black">
                        선착순 모집
                      </div>
                      {/* 일러스트 아이콘 */}
                      <div className="text-6xl">
                        {getProgramIcon(program.programType)}
                      </div>
                    </div>
                    {/* 텍스트 영역 */}
                    <div className="flex flex-1 flex-col justify-between p-4">
                      <div>
                        <Typography
                          as="h3"
                          font="noto"
                          variant="heading2B"
                          className="mb-2"
                        >
                          {program.title || program.programName || "-"}
                        </Typography>
                        <div className="mb-4 flex items-center gap-1">
                          <Typography
                            font="noto"
                            variant="body2B"
                            className="text-main-500"
                          >
                            신청기간
                          </Typography>
                          <Typography
                            font="noto"
                            variant="body2R"
                            className="text-gray-600"
                          >
                            {formatDateWithDay(program.recruitmentEndDate)}까지
                          </Typography>
                        </div>
                      </div>
                      <button className="w-full rounded bg-pink-500 px-4 py-2 text-white">
                        <Typography
                          font="noto"
                          variant="body2B"
                          className="text-white"
                        >
                          참여하기 →
                        </Typography>
                      </button>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 활동 중인 루틴 섹션 */}
          {activePrograms.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-500 text-white">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                </div>
                <Typography as="h2" font="noto" variant="title5">
                  활동 중인 루틴
                </Typography>
              </div>
              <Typography
                as="p"
                font="noto"
                variant="body2R"
                className="text-gray-600"
              >
                현재 활동 중인 한끗루틴입니다!
              </Typography>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {activePrograms.map((program) => (
                  <Link
                    key={program.id}
                    href={`/routines/${program.id || ""}`}
                    className="flex min-w-[240px] flex-shrink-0 flex-col overflow-hidden rounded-lg border-2 border-black bg-white"
                  >
                    {/* 일러스트 영역 */}
                    <div
                      className={`relative flex h-32 items-center justify-center ${getProgramBgColor(program.programType)}`}
                    >
                      {/* 일러스트 아이콘 */}
                      <div className="text-6xl">
                        {getProgramIcon(program.programType)}
                      </div>
                    </div>
                    {/* 텍스트 영역 */}
                    <div className="flex flex-1 flex-col justify-between p-4">
                      <div>
                        <Typography as="h3" font="noto" variant="heading2B">
                          {program.title || program.programName || "-"}
                        </Typography>
                        <div className="mb-2 flex justify-center">
                          <Typography
                            font="noto"
                            variant="body3R"
                            className="text-black-100"
                          >
                            {formatDateRange(
                              program.startDate,
                              program.endDate
                            )}
                          </Typography>
                        </div>
                      </div>
                      <button className="w-full rounded bg-black px-4 py-2 text-white">
                        <Typography
                          font="noto"
                          variant="body2B"
                          className="text-white"
                        >
                          한끗루틴 활동하러 가기 →
                        </Typography>
                      </button>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 데이터가 없는 경우 */}
          {recruitingPrograms.length === 0 && activePrograms.length === 0 && (
            <div className="flex min-h-[400px] items-center justify-center">
              <Typography
                font="noto"
                variant="body2R"
                className="text-gray-500"
              >
                현재 모집 중이거나 진행 중인 루틴이 없습니다.
              </Typography>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RoutinesPage;
