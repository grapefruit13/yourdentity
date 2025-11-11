"use client";

import { useMemo } from "react";
import Input from "@/components/shared/input";
import { Typography } from "@/components/shared/typography";
import { cn } from "@/utils/shared/cn";
import type { ActivityApplicationFormData } from "./types";
import type { useActivityApplicationForm } from "./useActivityApplicationForm";

type FormHandlers = ReturnType<typeof useActivityApplicationForm>;

interface ActivityApplicationFormProps {
  /** 현재 스텝 인덱스 (1: nickname, 2: phone, 3: region, 4: situation, 5: source, 6: motivation) */
  currentStepIndex: number;
  /** 프로그램/활동 이름 */
  programName: string;
  /** 폼 데이터 */
  formData: ActivityApplicationFormData;
  /** 폼 핸들러 (hook에서 반환된 값) */
  handlers: FormHandlers;
  /** 스텝별 타이틀을 가져오는 함수 */
  getStepTitle: (stepIndex: number, programName: string) => string;
  /** 휴대폰 번호 입력 완료 시 호출되는 콜백 (11자리 입력 시 자동 다음 단계 이동용) */
  onPhoneChangeComplete?: (value: string) => void;
}

/**
 * @description 활동 신청 폼 컴포넌트
 * - 재사용 가능한 다단계 폼 구조
 * - 현재 스텝의 필드는 활성화, 이전 스텝의 필드는 읽기 전용으로 표시
 */
export const ActivityApplicationForm = ({
  currentStepIndex,
  programName,
  formData,
  handlers,
  getStepTitle,
  onPhoneChangeComplete,
}: ActivityApplicationFormProps) => {
  // 현재 스텝의 타이틀
  const stepTitle = useMemo(
    () => getStepTitle(currentStepIndex, programName),
    [currentStepIndex, programName, getStepTitle]
  );

  if (currentStepIndex < 1 || currentStepIndex > 6) {
    return null;
  }

  return (
    <div className="p-5">
      {/* 타이틀 - currentStep에 따라 동적 변경 */}
      {stepTitle && (
        <Typography as="h2" font="noto" variant="heading2B" className="mb-6">
          {stepTitle}
        </Typography>
      )}

      {/* 참여 동기 필드 (현재 스텝이 motivation일 때만 활성화) */}
      {currentStepIndex >= 6 && (
        <div className="mb-7">
          <label className="mb-3 block">
            <Typography font="noto" variant="label1B" className="text-gray-700">
              참여 동기
            </Typography>
          </label>
          {currentStepIndex === 6 ? (
            <button
              onClick={() => handlers.setShowMotivationPicker(true)}
              className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-left"
            >
              <Typography
                font="noto"
                variant="body2R"
                className={cn(
                  formData.applicationMotivation
                    ? "text-gray-900"
                    : "text-gray-400"
                )}
              >
                {formData.applicationMotivation || "참여 동기를 선택해주세요"}
              </Typography>
            </button>
          ) : (
            <Input
              type="text"
              value={
                formData.applicationMotivation === "직접 입력하기"
                  ? formData.customMotivation
                  : formData.applicationMotivation || ""
              }
              readOnly
              className="bg-gray-100"
            />
          )}
        </div>
      )}

      {/* 직접 입력한 참여 동기 (motivation 단계에서만 표시) */}
      {currentStepIndex === 6 &&
        formData.applicationMotivation === "직접 입력하기" && (
          <div className="mb-7">
            <label className="mb-3 block">
              <Typography
                font="noto"
                variant="label1B"
                className="text-gray-700"
              >
                직접 입력한 참여 동기
              </Typography>
            </label>
            <textarea
              value={formData.customMotivation}
              onChange={(e) =>
                handlers.handleCustomMotivationChange(e.target.value)
              }
              placeholder="참여 동기를 입력하세요"
              maxLength={200}
              rows={4}
              className={cn(
                "font-noto focus:ring-main-400 focus:outline-main-400 focus:border-main-600 w-full resize-none rounded-md border border-gray-200 px-3 py-2 text-base font-normal shadow-xs focus:outline-3",
                formData.customMotivation.length >= 10 && "border-pink-500"
              )}
            />
            <Typography
              font="noto"
              variant="caption1R"
              className="mt-1 text-right text-gray-400"
            >
              {formData.customMotivation.length}/200
            </Typography>
          </div>
        )}

      {/* 참여 경로 필드 */}
      {currentStepIndex >= 5 && (
        <div className="mb-7">
          <label className="mb-3 block">
            <Typography font="noto" variant="label1B" className="text-gray-700">
              참여 경로
            </Typography>
          </label>
          {currentStepIndex === 5 ? (
            <button
              onClick={() => handlers.setShowSourcePicker(true)}
              className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-left"
            >
              <Typography
                font="noto"
                variant="body2R"
                className={cn(
                  formData.applicationSource ? "text-gray-900" : "text-gray-400"
                )}
              >
                {formData.applicationSource || "참여 경로를 선택해주세요"}
              </Typography>
            </button>
          ) : (
            <Input
              type="text"
              value={formData.applicationSource || ""}
              readOnly
              className="bg-gray-100"
            />
          )}
        </div>
      )}

      {/* 현재 상황 필드 */}
      {currentStepIndex >= 4 && (
        <div className="mb-7">
          <label className="mb-3 block">
            <Typography font="noto" variant="label1B" className="text-gray-700">
              현재 상황
            </Typography>
          </label>
          {currentStepIndex === 4 ? (
            <button
              onClick={() => handlers.setShowSituationPicker(true)}
              className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-left"
            >
              <Typography
                font="noto"
                variant="body2R"
                className={cn(
                  formData.currentSituation ? "text-gray-900" : "text-gray-400"
                )}
              >
                {formData.currentSituation || "현재 상황을 선택해주세요"}
              </Typography>
            </button>
          ) : (
            <Input
              type="text"
              value={formData.currentSituation || ""}
              readOnly
              className="bg-gray-100"
            />
          )}
        </div>
      )}

      {/* 거주 지역 필드 */}
      {currentStepIndex >= 3 && (
        <div className="mb-7">
          <label className="mb-3 block">
            <Typography font="noto" variant="label1B" className="text-gray-700">
              거주 지역
            </Typography>
          </label>
          {currentStepIndex === 3 ? (
            <button
              onClick={() => handlers.setShowRegionPicker(true)}
              className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-left"
            >
              <Typography
                font="noto"
                variant="body2R"
                className={cn(
                  formData.region ? "text-gray-900" : "text-gray-400"
                )}
              >
                {formData.region
                  ? `${formData.region.city} ${formData.region.district}`
                  : "지역을 선택해주세요"}
              </Typography>
            </button>
          ) : (
            <Input
              type="text"
              value={
                formData.region
                  ? `${formData.region.city} ${formData.region.district}`
                  : ""
              }
              readOnly
              className="bg-gray-100"
            />
          )}
        </div>
      )}

      {/* 휴대폰 번호 필드 */}
      {currentStepIndex >= 2 && (
        <div className="mb-7">
          <label className="mb-3 block">
            <Typography font="noto" variant="label1B" className="text-gray-700">
              휴대폰 번호
            </Typography>
          </label>
          {currentStepIndex === 2 ? (
            <Input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => {
                // 숫자만 입력 허용
                const value = e.target.value.replace(/[^0-9]/g, "");
                handlers.handlePhoneChange(value);
                onPhoneChangeComplete?.(value);
              }}
              placeholder="01012345678"
              maxLength={11}
              className={cn(formData.phoneNumber && "border-pink-500")}
            />
          ) : (
            <Input
              type="tel"
              value={formData.phoneNumber}
              readOnly
              className="bg-gray-100"
            />
          )}
        </div>
      )}

      {/* 닉네임 필드 */}
      {currentStepIndex >= 1 && (
        <div className="mb-7">
          <label className="mb-3 block">
            <Typography font="noto" variant="label1B" className="text-gray-700">
              닉네임
            </Typography>
          </label>
          {currentStepIndex === 1 ? (
            <div className="relative">
              <Input
                type="text"
                value={formData.nickname}
                onChange={(e) => handlers.handleNicknameChange(e.target.value)}
                placeholder="닉네임을 입력하세요"
                className={cn("pr-10", formData.nickname && "border-pink-500")}
              />
              {formData.nickname && (
                <button
                  onClick={() => handlers.handleNicknameChange("")}
                  className="absolute top-1/2 right-3 -translate-y-1/2"
                >
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          ) : (
            <Input
              type="text"
              value={formData.nickname}
              readOnly
              className="bg-gray-100"
            />
          )}
        </div>
      )}
    </div>
  );
};
