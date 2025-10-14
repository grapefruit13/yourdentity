"use client";

import { NotionPageData } from "@/types/shared/notion";

interface RoutineDetailPageProps {
  data: NotionPageData;
}

/**
 * @description 활동 소개 페이지 컴포넌트
 */
export const RoutineDetailPage = ({ data }: RoutineDetailPageProps) => {
  return (
    <div className="min-h-screen bg-white">
      {/* 상세 소개 이미지 */}
      {data.detailImage && (
        <div className="w-full">
          <img
            src={data.detailImage}
            alt={data.title}
            className="h-auto w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>
      )}

      {/* 컨텐츠 영역 */}
      <div className="px-4 py-6">
        {/* 타이틀 */}
        <h1 className="mb-4 text-3xl font-bold text-gray-900">{data.title}</h1>

        {/* 루틴 설명 */}
        <p className="mb-6 text-base leading-relaxed text-gray-700">
          {data.description}
        </p>

        {/* 대표 이미지 */}
        {data.mainImage && (
          <div className="mb-6 w-full overflow-hidden rounded-lg">
            <img
              src={data.mainImage}
              alt={`${data.title} 대표 이미지`}
              className="h-auto w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
        )}

        {/* 활동 정보 카드 */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            활동 정보
          </h2>

          <div className="space-y-3">
            {/* 상태 */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">상태</span>
              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${
                  data.status === "활동중"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {data.status}
              </span>
            </div>

            {/* 카테고리 */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">카테고리</span>
              <span className="text-sm font-medium text-gray-900">
                {data.category}
              </span>
            </div>

            {/* 난이도 */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">난이도</span>
              <span className="text-sm font-medium text-gray-900">
                {data.difficulty}
              </span>
            </div>

            {/* 소요 시간 */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">소요 시간</span>
              <span className="text-sm font-medium text-gray-900">
                {data.duration}분
              </span>
            </div>

            {/* 참여 인원 */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">참여 인원</span>
              <span className="text-sm font-medium text-gray-900">
                {data.currentParticipants} / {data.maxParticipants}명
              </span>
            </div>
          </div>
        </div>

        {/* 일정 정보 */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">일정</h2>

          <div className="space-y-3">
            {/* 신청 기간 */}
            <div>
              <span className="mb-1 block text-sm font-medium text-gray-700">
                신청 기간
              </span>
              <span className="text-sm text-gray-600">
                {data.applicationStartDate} ~ {data.applicationEndDate}
              </span>
            </div>

            {/* 활동 기간 */}
            <div>
              <span className="mb-1 block text-sm font-medium text-gray-700">
                활동 기간
              </span>
              <span className="text-sm text-gray-600">
                {data.startDate} ~ {data.endDate}
              </span>
            </div>
          </div>
        </div>

        {/* 태그 */}
        {data.tags.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-3 text-xl font-semibold text-gray-900">태그</h2>
            <div className="flex flex-wrap gap-2">
              {data.tags.map((tag, index) => (
                <span
                  key={index}
                  className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 추가 정보 */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h2 className="mb-3 text-xl font-semibold text-gray-900">
            추가 정보
          </h2>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">중복 참여:</span>
              <span className="text-sm font-medium text-gray-900">
                {data.allowDuplicate ? "가능" : "불가능"}
              </span>
            </div>

            {data.adminNote && (
              <div>
                <span className="mb-1 block text-sm font-medium text-gray-700">
                  관리자 메모
                </span>
                <p className="text-sm text-gray-600">{data.adminNote}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
