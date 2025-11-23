"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import MissionDetailActionBar from "@/components/mission/mission-detail-action-bar";
import MissionInfoBox from "@/components/mission/mission-info-box";
import MissionReviewCard from "@/components/mission/mission-review-card";
import { Typography } from "@/components/shared/typography";
import AccordionItem from "@/components/shared/ui/accordion-item";
import DetailImage from "@/components/shared/ui/detail-image";
import Modal from "@/components/shared/ui/modal";
import ShareButton from "@/components/shared/ui/share-button";
import TabButton from "@/components/shared/ui/tab-button";
import { Skeleton } from "@/components/ui/skeleton";
import { missionsKeys } from "@/constants/generated/query-keys";
import { MOCK_FAQ_ITEMS } from "@/constants/mission/_mock-faq";
import { MOCK_REVIEW_ITEMS } from "@/constants/mission/_mock-reviews";
import { MISSION_DETAIL_TABS } from "@/constants/shared/_detail-tabs";
import { LINK_URL } from "@/constants/shared/_link-url";
import {
  useGetMissionsById,
  usePostMissionsApplyById,
} from "@/hooks/generated/missions-hooks";
import useToggle from "@/hooks/shared/useToggle";
import { useTopBarStore } from "@/stores/shared/topbar-store";
import type { MissionDetailTabType } from "@/types/mission/tab-types";
import { shareContent } from "@/utils/shared/share";

/**
 * @description 미션 상세 페이지
 */
const Page = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useParams();
  const missionId = params.id as string;
  const setTitle = useTopBarStore((state) => state.setTitle);
  const setRightSlot = useTopBarStore((state) => state.setRightSlot);
  const resetTopBar = useTopBarStore((state) => state.reset);

  const [activeTab, setActiveTab] = useState<MissionDetailTabType>("faq");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // 미션 상세 조회 API
  const {
    data: missionResponse,
    isLoading,
    error,
  } = useGetMissionsById({
    request: { missionId },
  });

  const missionData = missionResponse?.mission;
  const [isLiked, setIsLiked] = useState(false);
  const {
    isOpen: isConfirmModalOpen,
    open: openConfirmModal,
    close: closeConfirmModal,
  } = useToggle();

  // 미션 신청 API
  const { mutate: applyMission, isPending: isApplying } =
    usePostMissionsApplyById({
      onSuccess: () => {
        // 진행중인 미션 목록 쿼리 무효화하여 목록 갱신
        queryClient.invalidateQueries({
          queryKey: missionsKeys.getMissionsMe({}),
        });
        // 미션 통계 쿼리 무효화하여 통계 갱신
        queryClient.invalidateQueries({
          queryKey: missionsKeys.getMissionsStats,
        });
        alert("미션이 시작되었어요!");
        closeConfirmModal();
        router.push(LINK_URL.MISSION);
      },
      onError: () => {
        alert("미션 신청 중 오류가 발생했습니다. 다시 시도해주세요.");
      },
    });

  // TopBar 설정
  useEffect(() => {
    if (!missionData?.title) return;

    const missionTitle = missionData.title;
    setTitle(
      missionTitle.length > 20
        ? `${missionTitle.slice(0, 20)}...`
        : missionTitle
    );

    // 공유하기 기능
    const handleShare = async () => {
      const shareUrl =
        typeof window !== "undefined" ? window.location.href : "";
      const shareText = missionData.notes || missionTitle;

      await shareContent({
        title: missionTitle,
        text: shareText,
        url: shareUrl,
      });
    };

    // 공유하기 버튼
    const shareButton = <ShareButton onClick={handleShare} />;
    setRightSlot(shareButton);

    return () => {
      resetTopBar();
    };
  }, [missionData, setTitle, setRightSlot, resetTopBar]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-4">
        <Typography font="noto" variant="body2R" className="text-red-500">
          미션 정보를 불러오는 중 오류가 발생했습니다.
        </Typography>
      </div>
    );
  }

  if (isLoading || !missionData) {
    return (
      <div className="min-h-screen bg-white pt-12">
        <div className="space-y-6 p-4">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  // 정보 박스 데이터 구성
  const infoItems = [
    {
      label: "신청 기간",
      value: missionData.isUnlimited
        ? "무제한"
        : missionData.applicationDeadline || "-",
    },
    {
      label: "인증 마감",
      value: missionData.certificationDeadline || "-",
    },
    {
      label: "참여 대상",
      value: missionData.targetAudience || "-",
    },
  ];

  return (
    <div className="min-h-screen bg-white pt-12">
      {/* 메인 이미지 */}
      <DetailImage
        imageUrl={missionData.detailPageUrl || "/imgs/mockup.jpg"}
        alt={missionData.title || "미션 이미지"}
      />

      <div className="flex flex-col p-5 pb-12">
        {/* 미션 제목 */}
        <Typography
          as="h2"
          font="noto"
          variant="title5"
          className="mb-6 text-gray-950"
        >
          {missionData.title || "-"}
        </Typography>

        {/* 정보 박스 */}
        <MissionInfoBox items={infoItems} />
        {/* 하단 안내 문구 */}
        <Typography font="noto" variant="label2R" className="text-gray-400">
          *모든 미션 인증은 새벽 5시에 초기화 됩니다.
        </Typography>
      </div>

      {/* 탭메뉴 */}
      <div className="flex bg-white px-5 pt-5">
        {MISSION_DETAIL_TABS.map((tab) => (
          <TabButton
            key={tab.id}
            label={tab.label}
            isActive={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          />
        ))}
      </div>

      {/* 탭 컨텐츠 */}
      {activeTab === "description" && (
        <div className="bg-white px-5 py-10">
          <div className="flex flex-col gap-4">
            <Typography font="noto" variant="body1R" className="text-gray-950">
              {missionData.notes || "미션 설명이 없습니다."}
            </Typography>
          </div>
        </div>
      )}
      {activeTab === "reviews" && (
        <div className="bg-white px-5 py-10">
          <div className="flex flex-col gap-4">
            {/* TODO: 실제 미션 후기 컨텐츠로 교체 */}
            <div className="flex items-center justify-between">
              <Typography
                font="noto"
                variant="heading3B"
                className="text-gray-950"
              >
                미션에 참여한 친구들의 후기예요!
              </Typography>
              <button className="flex items-center gap-1">
                <Typography
                  font="noto"
                  variant="body3R"
                  className="text-main-500"
                >
                  후기 보러가기
                </Typography>
                <ChevronRight className="text-main-500 size-3" />
              </button>
            </div>
            {/* y scroll layout */}
            <div className="scrollbar-hide -mx-5 flex gap-2 overflow-x-auto overflow-y-hidden px-5">
              {MOCK_REVIEW_ITEMS.map((review, index) => (
                <MissionReviewCard
                  key={index}
                  imageUrl={review.imageUrl}
                  imageAlt={review.imageAlt}
                  title={review.title}
                  content={review.content}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "faq" && (
        <div className="flex flex-col">
          <Typography
            font="noto"
            variant="heading3B"
            className="border-b border-gray-200 px-5 pt-10 pb-5 text-gray-950"
          >
            자주 묻는 질문이에요!
          </Typography>

          {/* TODO: 실제 FAQ 데이터로 교체 */}
          {MOCK_FAQ_ITEMS.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            const isLast = index === MOCK_FAQ_ITEMS.length - 1;

            return (
              <AccordionItem
                key={index}
                title={faq.question}
                content={faq.answer}
                isOpen={isOpen}
                onToggle={() => setOpenFaqIndex(isOpen ? null : index)}
                isLast={isLast}
              />
            );
          })}
        </div>
      )}

      {/* 하단 액션 바 */}
      <MissionDetailActionBar
        deadline={
          missionData?.certificationDeadline
            ? new Date(missionData.certificationDeadline)
            : undefined
        }
        isLiked={isLiked}
        onLikeClick={() => {
          setIsLiked((prev) => !prev);
          // TODO: 실제 찜하기 API 호출
        }}
        onStartClick={openConfirmModal}
      />

      {/* 미션 시작 확인 모달 */}
      <Modal
        isOpen={isConfirmModalOpen}
        title="미션을 시작할까요?"
        description={`${missionData.title}\n미션을 시작해 볼까요?`}
        confirmText={isApplying ? "신청 중..." : "시작하기"}
        cancelText="취소"
        onConfirm={() => {
          applyMission({ missionId });
        }}
        onClose={closeConfirmModal}
        variant="primary"
      />
    </div>
  );
};

export default Page;
