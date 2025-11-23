"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronRight, Target } from "lucide-react";
import { ActiveMissionCard } from "@/components/mission/active-mission-card";
import { MissionCertificationCard } from "@/components/mission/mission-certification-card";
import { MissionCertificationSuccessModal } from "@/components/mission/mission-certification-success-modal";
import { MissionRecommendationCard } from "@/components/mission/mission-recommendation-card";
import { RecommendedMissionCard } from "@/components/mission/recommended-mission-card";
import { Typography } from "@/components/shared/typography";
import { Button } from "@/components/shared/ui/button";
import HorizontalScrollContainer from "@/components/shared/ui/horizontal-scroll-container";
import { InfoIconWithTooltip } from "@/components/shared/ui/info-icon-with-tooltip";
import Modal from "@/components/shared/ui/modal";
import { MoreButton } from "@/components/shared/ui/more-button";
import { ProgressGauge } from "@/components/shared/ui/progress-gauge";
import { missionsKeys } from "@/constants/generated/query-keys";
import {
  QUIT_MISSION_ERROR_MESSAGE,
  QUIT_MISSION_SUCCESS_MESSAGE,
  TOAST_DELAY_MS,
  TOAST_DURATION_MS,
} from "@/constants/mission/_mission-constants";
import { LINK_URL } from "@/constants/shared/_link-url";
import {
  useGetMissions,
  useGetMissionsMe,
  useGetMissionsStats,
  usePostMissionsQuitById,
} from "@/hooks/generated/missions-hooks";
import useToggle from "@/hooks/shared/useToggle";
import { getNextDay5AM } from "@/utils/shared/date";
import { showToast } from "@/utils/shared/toast";

/**
 * @description 미션 페이지
 */
const Page = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const {
    isOpen: isQuitMissionConfirmOpen,
    open: openQuitMissionConfirm,
    close: closeQuitMissionConfirm,
  } = useToggle();
  const {
    isOpen: isErrorModalOpen,
    open: openErrorModal,
    close: closeErrorModal,
  } = useToggle();
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState<string>("");
  const {
    isOpen: isSuccessModalOpen,
    open: openSuccessModal,
    close: closeSuccessModal,
  } = useToggle();
  const [successMissionName, setSuccessMissionName] = useState<string>("");
  const [successPostId, setSuccessPostId] = useState<string | undefined>(
    undefined
  );

  // 진행중인 미션 조회 API
  const { data: myMissionsResponse } = useGetMissionsMe({
    request: {},
  });

  // 미션 통계 조회 API
  const { data: missionStatsResponse } = useGetMissionsStats();

  const activeMissions = myMissionsResponse?.missions || [];
  const isOnMission = activeMissions.length > 0;
  const remainingMission = activeMissions.length;

  // 미션 통계 데이터
  const missionStats = missionStatsResponse || {};
  const todayTotalCount = missionStats.todayTotalCount ?? 0;
  const todayCompletedCount = missionStats.todayCompletedCount ?? 0;
  const consecutiveDays = missionStats.consecutiveDays ?? 0;

  /**
   * 미션 관련 쿼리 무효화
   */
  const invalidateMissionQueries = () => {
    queryClient.invalidateQueries({
      queryKey: missionsKeys.getMissionsMe({}),
    });
    queryClient.invalidateQueries({
      queryKey: missionsKeys.getMissionsStats,
    });
  };

  /**
   * 미션 그만두기 성공 처리
   */
  const handleQuitMissionSuccess = () => {
    invalidateMissionQueries();
    closeQuitMissionConfirm();
    setSelectedMissionId(null);
    // 모달이 완전히 닫힌 후 토스트 메시지 표시
    setTimeout(() => {
      showToast(QUIT_MISSION_SUCCESS_MESSAGE, {
        duration: TOAST_DURATION_MS,
      });
    }, TOAST_DELAY_MS);
  };

  /**
   * 미션 그만두기 에러 처리
   */
  const handleQuitMissionError = (error: unknown) => {
    const message =
      error instanceof Error ? error.message : QUIT_MISSION_ERROR_MESSAGE;
    setErrorMessage(message);
    openErrorModal();
  };

  // 미션 그만두기 API
  const { mutate: quitMission, isPending: isQuittingMission } =
    usePostMissionsQuitById({
      onSuccess: handleQuitMissionSuccess,
      onError: handleQuitMissionError,
    });

  const handleQuitMission = (missionId: string) => {
    quitMission({ missionId });
  };

  // 추천 미션 목록 조회 API (인기순으로 최대 4개)
  const { data: recommendedMissionsResponse } = useGetMissions({
    request: {
      sortBy: "popular",
    },
  });

  const recommendedMissions =
    recommendedMissionsResponse?.missions?.slice(0, 4) || [];

  // 이미 처리된 쿼리 파라미터인지 확인하는 ref
  const hasProcessedSuccessParams = useRef(false);

  // 쿼리 파라미터에서 성공 정보 확인 및 모달 표시
  useEffect(() => {
    const success = searchParams.get("success");
    const missionName = searchParams.get("missionName");
    const postId = searchParams.get("postId");

    // 성공 파라미터가 있고 아직 처리하지 않은 경우에만 실행
    if (
      success === "true" &&
      missionName &&
      !hasProcessedSuccessParams.current
    ) {
      hasProcessedSuccessParams.current = true;

      setSuccessMissionName(missionName);
      setSuccessPostId(postId || undefined);
      openSuccessModal();

      // URL에서 쿼리 파라미터 제거 (Next.js router 사용)
      const params = new URLSearchParams(searchParams.toString());
      params.delete("success");
      params.delete("missionName");
      params.delete("postId");
      const newSearch = params.toString();
      const newUrl = newSearch ? `/mission?${newSearch}` : "/mission";
      router.replace(newUrl);
    }
  }, [searchParams, openSuccessModal, router]);

  return (
    <div className="h-full min-h-screen bg-gray-200">
      <div className="p-5">
        <Typography
          as="span"
          font="noto"
          variant="heading2B"
          className="pb-4 text-gray-950"
        >
          {isOnMission
            ? `오늘의 미션이 ${remainingMission}개 남았어요!`
            : `오늘의 미션을 시작해 볼까요?`}
        </Typography>
        {/* 흰카드 */}
        {isOnMission ? (
          <HorizontalScrollContainer
            className="mt-4"
            containerClassName="flex w-[calc(100%)] gap-3"
          >
            {activeMissions.map((mission) => {
              // TODO: 미션 상세 정보 조회하여 tags 가져오기
              // 현재는 API 응답에 포함되지 않아 임시로 처리
              const missionNotionPageId = mission.missionNotionPageId || "";
              const missionTitle = mission.missionTitle || "";
              const endTime = mission.startedAt
                ? getNextDay5AM(mission.startedAt)
                : new Date();

              const handleDelete = () => {
                if (!missionNotionPageId) {
                  return;
                }

                setSelectedMissionId(missionNotionPageId);
                openQuitMissionConfirm();
              };

              return (
                <div
                  key={mission.id || missionNotionPageId}
                  className="flex w-[99%] max-w-[99%] min-w-[99%] shrink-0 flex-col gap-1"
                >
                  <div className="w-full">
                    <ActiveMissionCard
                      title={missionTitle}
                      tags={["temp1", "temp2", "temp3"]}
                      endTime={endTime}
                      onDelete={handleDelete}
                      onClick={() => {
                        if (missionNotionPageId) {
                          router.push(
                            `${LINK_URL.MISSION_CERTIFY}?missionId=${missionNotionPageId}`
                          );
                        }
                      }}
                    />
                  </div>
                  <Button
                    variant="default"
                    size="default"
                    className="w-full rounded-lg"
                    onClick={() => {
                      if (missionNotionPageId) {
                        router.push(
                          `${LINK_URL.MISSION_CERTIFY}?missionId=${missionNotionPageId}`
                        );
                      }
                    }}
                  >
                    <Typography
                      font="noto"
                      variant="body3B"
                      className="text-white"
                    >
                      미션 인증하기
                    </Typography>
                    <ChevronRight className="h-4 w-4 text-white" />
                  </Button>
                </div>
              );
            })}
          </HorizontalScrollContainer>
        ) : (
          <>
            <MissionRecommendationCard message="진행 중인 미션이 없어요. 미션을 시작해 보세요!" />
            <Button
              variant="default"
              size="default"
              className="mt-1 w-full rounded-lg"
              onClick={() => router.push(LINK_URL.MISSION_LIST)}
            >
              <Typography font="noto" variant="body3B" className="text-white">
                미션 보러가기
              </Typography>
              <ChevronRight className="h-4 w-4 text-white" />
            </Button>
          </>
        )}
      </div>

      {/* 흰화면 */}
      <div className="h-full rounded-2xl bg-white px-5 py-6">
        {/* 미션 진척 현황 */}
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-gray-400" />
          <Typography font="noto" variant="heading3B" className="text-gray-950">
            미션 진척 현황
          </Typography>
        </div>
        <div className="mt-3 grid grid-cols-[1.2fr_1fr] grid-rows-2 gap-2">
          {/* 왼쪽 큰 패널: 행 2개 병합 */}
          <div className="row-span-2 flex flex-col items-center justify-center rounded-lg border border-gray-200 py-2">
            {/* 왼쪽 패널 내용 */}
            <Typography font="noto" variant="label1R" className="text-gray-950">
              오늘의 미션 인증 현황
            </Typography>
            <ProgressGauge
              total={todayTotalCount}
              completed={todayCompletedCount}
            />
          </div>

          {/* 오른쪽 위 패널 */}
          <div className="rounded-lg border border-gray-200 bg-gray-100 px-3 py-2">
            {/* 오른쪽 위 패널 내용 */}
            <div className="flex items-center gap-1">
              <Typography
                font="noto"
                variant="label1R"
                className="text-gray-950"
              >
                연속 미션일
              </Typography>
              <InfoIconWithTooltip message="하루도 빠짐없이 매일 미션을 인증한 연속 일수입니다." />
            </div>
            <div className="flex items-center gap-1">
              <Typography
                font="noto"
                variant="heading1B"
                className="text-gray-600"
              >
                {consecutiveDays}
              </Typography>
              <Typography
                font="noto"
                variant="label2R"
                className="text-gray-400"
              >
                일
              </Typography>
            </div>
          </div>

          {/* 오른쪽 아래 패널 */}
          <div className="rounded-lg border border-gray-200 bg-gray-100 px-3 py-2">
            {/* 오른쪽 아래 패널 내용 */}
            <div className="flex items-center gap-1">
              <Typography
                font="noto"
                variant="label1R"
                className="text-gray-950"
              >
                진행 미션 수
              </Typography>
              <InfoIconWithTooltip message="현재 진행 중인 미션의 개수입니다." />
            </div>
            <div className="flex items-center gap-1">
              <Typography
                font="noto"
                variant="heading1B"
                className="text-gray-600"
              >
                {remainingMission}
              </Typography>
              <Typography
                font="noto"
                variant="label2R"
                className="text-gray-400"
              >
                개
              </Typography>
            </div>
          </div>
        </div>
        {/* 미션 진행중인거 없을때 */}
        {!isOnMission && (
          <>
            {/* 친구들이 인증한 미션이에요 */}
            <div className="mt-9 mb-5 flex w-full items-center justify-between">
              <Typography
                font="noto"
                variant="heading3B"
                className="text-gray-950"
              >
                친구들이 인증한 미션이에요
              </Typography>
              <MoreButton onClick={() => router.push(LINK_URL.COMMUNITY)} />
            </div>
            {/* 후기 슬라이딩 */}
            <HorizontalScrollContainer
              className="-mx-5"
              containerClassName="flex gap-3 px-5"
            >
              {/* TODO: 카드 클릭 시 미션 인증이 올라간 피드 상세로 이동 */}
              <MissionCertificationCard
                title="오늘 하늘이 이뻤어요!"
                thumbnailText="두줄까지 미리보기로 보이게!! 구름이 뭉게뭉게 있어서 하늘이 이뻐요! 두줄까지 미리보기로 보이게!! 구름이 뭉게뭉게 있어서 하늘이 이뻐요!"
                thumbnailImageUrl="/imgs/mockup3.jpg"
                tagName="건강한 아침 러닝 30분 하기"
                postId="1"
              />
              <MissionCertificationCard
                title="오늘 하늘이 이뻤어요!"
                thumbnailText="두줄까지 미리보기로 보이게!! 구름이 뭉게뭉게 있어서 하늘이 이뻐요! 두줄까지 미리보기로 보이게!! 구름이 뭉게뭉게 있어서 하늘이 이뻐요!"
                thumbnailImageUrl="/imgs/mockup3.jpg"
                tagName="건강한 아침 러닝 30분 하기"
                postId="1"
              />
              <MissionCertificationCard
                title="오늘 하늘이 이뻤어요!"
                thumbnailText="두줄까지 미리보기로 보이게!! 구름이 뭉게뭉게 있어서 하늘이 이뻐요! 두줄까지 미리보기로 보이게!! 구름이 뭉게뭉게 있어서 하늘이 이뻐요!"
                thumbnailImageUrl="/imgs/mockup3.jpg"
                tagName="건강한 아침 러닝 30분 하기"
                postId="1"
              />
              <MissionCertificationCard
                title="오늘 하늘이 이뻤어요!"
                thumbnailText="두줄까지 미리보기로 보이게!! 구름이 뭉게뭉게 있어서 하늘이 이뻐요! 두줄까지 미리보기로 보이게!! 구름이 뭉게뭉게 있어서 하늘이 이뻐요!"
                thumbnailImageUrl="/imgs/mockup3.jpg"
                tagName="건강한 아침 러닝 30분 하기"
                postId="1"
              />
            </HorizontalScrollContainer>
          </>
        )}
        {/* 미션 진행 중인거 있을때  */}
        {isOnMission && (
          <>
            <div className="mt-9 mb-3 flex w-full items-center justify-between">
              <Typography
                font="noto"
                variant="heading3B"
                className="text-gray-950"
              >
                다음 미션으로 이건 어때요?
              </Typography>
              <MoreButton onClick={() => router.push(LINK_URL.MISSION_LIST)} />
            </div>
            {/* 후기 슬라이딩 */}
            <HorizontalScrollContainer
              className="-mx-5"
              containerClassName="flex gap-3 px-5"
              gradientColor="white"
            >
              {recommendedMissions.map((mission) => (
                <RecommendedMissionCard
                  key={mission.id}
                  title={mission.title || ""}
                  tagName={mission.categories?.[0] || ""}
                  likeCount={mission.reactionCount || 0}
                  onClick={() => {
                    if (mission.id) {
                      router.push(`/mission/${mission.id}`);
                    }
                  }}
                />
              ))}
            </HorizontalScrollContainer>
          </>
        )}
      </div>
      {/* 미션 그만두기 컨펌 모달 */}
      <Modal
        isOpen={isQuitMissionConfirmOpen}
        title="미션을 그만둘까요?"
        description="진행 중인 미션을 그만두면 더 이상 미션을 진행할 수 없어요. 그래도 그만둘까요?"
        cancelText="취소"
        confirmText={isQuittingMission ? "처리 중..." : "그만두기"}
        onClose={() => {
          closeQuitMissionConfirm();
          setSelectedMissionId(null);
        }}
        onConfirm={() => {
          if (selectedMissionId) {
            handleQuitMission(selectedMissionId);
          }
        }}
        variant="primary"
        confirmDisabled={isQuittingMission}
      />

      {/* 에러 모달 */}
      <Modal
        isOpen={isErrorModalOpen}
        title="오류가 발생했어요"
        description={errorMessage}
        confirmText="확인"
        onClose={closeErrorModal}
        onConfirm={closeErrorModal}
        variant="primary"
      />

      {/* 미션 인증 완료 성공 모달 */}
      <MissionCertificationSuccessModal
        isOpen={isSuccessModalOpen}
        missionName={successMissionName}
        postId={successPostId}
        onClose={closeSuccessModal}
      />
    </div>
  );
};

export default Page;
