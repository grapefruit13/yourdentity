"use client";

import Link from "next/link";
import { Typography } from "@/components/shared/typography";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetRoutines } from "@/hooks/generated/routines-hooks";
import type { RoutineListItem } from "@/types/generated/api-schema"; // TEMP

/**
 * @description 한끗루틴 목록 페이지
 */
const RoutinesPage = () => {
  const {
    data: routinesData,
    isLoading,
    error,
  } = useGetRoutines({
    request: { page: 0, size: 20 },
    select: (data) => {
      return data?.routines || [];
    },
  });

  // 상태 텍스트 변환 함수
  const getStatusText = (
    status?: "RECRUITING" | "IN_PROGRESS" | "COMPLETED"
  ) => {
    switch (status) {
      case "RECRUITING":
        return "모집중";
      case "IN_PROGRESS":
        return "진행중";
      case "COMPLETED":
        return "완료";
      default:
        return "-";
    }
  };

  // 상태 배경색 클래스 반환 함수
  const getStatusBgClass = (
    status?: "RECRUITING" | "IN_PROGRESS" | "COMPLETED"
  ) => {
    switch (status) {
      case "RECRUITING":
        return "bg-blue-100 text-blue-700";
      case "IN_PROGRESS":
        return "bg-green-100 text-green-700";
      case "COMPLETED":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-4">
        <Typography font="noto" variant="body2R" className="text-red-500">
          데이터를 불러오는 중 오류가 발생했습니다.
        </Typography>
      </div>
    );
  }

  // TEMP: 서버 데이터가 없을 때 사용할 폴백 데이터 적용
  const routines: RoutineListItem[] =
    routinesData && routinesData.length > 0
      ? routinesData
      : MOCK_ROUTINES_FALLBACK;

  return (
    <div className="min-h-screen bg-white p-4">
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex items-start gap-4 rounded-lg border border-gray-200 p-4"
            >
              <Skeleton className="h-20 w-20 flex-shrink-0 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex gap-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {routines?.map((routine) => (
            <Link
              key={routine.id}
              href={`/routines/${routine.id || ""}`}
              className="block rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
            >
              <div className="flex items-start gap-4">
                <div className="h-20 w-20 flex-shrink-0">
                  <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-gray-100">
                    <span className="text-2xl">📋</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <h2 className="text-lg font-semibold">
                      {routine.name || "-"}
                    </h2>
                    {routine.status && (
                      <span
                        className={`rounded px-2 py-1 text-xs ${getStatusBgClass(routine.status)}`}
                      >
                        {getStatusText(routine.status)}
                      </span>
                    )}
                  </div>
                  <p className="mb-2 text-sm text-gray-600">
                    {routine.description || "-"}
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                    {routine.stockCount !== undefined &&
                      routine.soldCount !== undefined && (
                        <span>
                          👥 {routine.soldCount}/{routine.stockCount}명
                        </span>
                      )}
                    {routine.viewCount !== undefined && (
                      <span>👁️ {routine.viewCount}회</span>
                    )}
                    {routine.deadline && (
                      <span>
                        📅 {new Date(routine.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

// TEMP: 동기화된 서버데이터가 아직 없어 서버 스펙을 반영한 임시 폴백 목데이터 (페이지 하단에 상수로 정의)
const MOCK_ROUTINES_FALLBACK: RoutineListItem[] = [
  {
    id: "routine_1",
    name: "10분 마음챙김 명상",
    description: "하루 10분, 현재에 집중하는 명상 루틴",
    status: "IN_PROGRESS",
    stockCount: 25,
    soldCount: 18,
    viewCount: 150,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    sellerId: "seller_001",
    sellerName: "유스보이스",
    price: 0,
    currency: "KRW",
    buyable: true,
  },
  {
    id: "routine_2",
    name: "아침 15분 스트레칭",
    description: "가볍게 몸을 깨우는 전신 스트레칭 루틴",
    status: "RECRUITING",
    stockCount: 20,
    soldCount: 5,
    viewCount: 85,
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    sellerId: "seller_001",
    sellerName: "유스보이스",
    price: 0,
    currency: "KRW",
    buyable: true,
  },
];

export default RoutinesPage;
