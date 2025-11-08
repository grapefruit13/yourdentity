"use client";

import { useRouter } from "next/navigation";
import { Typography } from "@/components/shared/typography";
import BottomSheet from "@/components/shared/ui/bottom-sheet";
import Icon from "@/components/shared/ui/icon";
import { IMAGE_URL } from "@/constants/shared/_image-url";
// TEMP: 실제 데이터 생기면 주석 해제
// import { useGetUsersMeParticipatingCommunities } from "@/hooks/generated/users-hooks";
import { cn } from "@/utils/shared/cn";

interface ProgramSelectBottomSheetProps {
  /** 바텀시트 열림/닫힘 상태 */
  isOpen: boolean;
  /** 바텀시트 닫기 핸들러 */
  onClose: () => void;
}

/**
 * @description 내가 참여중인 프로그램 선택 바텀시트
 * - useGetUsersMeParticipatingCommunities 훅을 사용하여 프로그램 목록 조회
 * - 프로그램 선택 시 /community/write 페이지로 이동하며 프로그램 정보 전달
 */
const ProgramSelectBottomSheet = ({
  isOpen,
  onClose,
}: ProgramSelectBottomSheetProps) => {
  const router = useRouter();

  // 내가 참여중인 커뮤니티 조회
  //   const { data: communitiesData } =
  //     useGetUsersMeParticipatingCommunities({
  //       enabled: isOpen, // 바텀시트가 열렸을 때만 조회
  //     });

  const communitiesData = {
    routine: {
      label: "한끗 루틴",
      items: [{ id: "CP:I4U3J7TMO7", name: "플래너 작성하기" }],
    },
    gathering: {
      label: "월간 소모임",
      items: [{ id: "CP:G7C66H69GK", name: "독서 모임" }],
    },
    tmi: {
      label: "TMI",
      items: [
        { id: "CP:VYTTZW33IH", name: "TMI 프로젝트 2" },
        { id: "CP:U1QFE0UYF9", name: "TMI 프로젝트 1" },
      ],
    },
  };

  // 실제 데이터가 있으면 사용, 없으면 TEMP 목 데이터 사용

  // 타입별 그룹 데이터 구성
  const programGroups = [
    {
      type: "routine",
      label: "한끗 루틴",
      items: communitiesData?.routine?.items || [],
    },
    {
      type: "gathering",
      label: "월간 소모임",
      items: communitiesData?.gathering?.items || [],
    },
    { type: "tmi", label: "TMI", items: communitiesData?.tmi?.items || [] },
  ].filter((group) => group.items.length > 0); // 아이템이 있는 그룹만 표시

  /**
   * 프로그램 선택 핸들러
   * 선택한 프로그램 정보를 쿼리 파라미터로 전달하여 작성 페이지로 이동
   */
  const handleProgramSelect = (programId: string, programName: string) => {
    onClose();
    // 쿼리 파라미터로 프로그램 정보 전달
    router.push(
      `/community/write?communityId=${programId}&communityName=${encodeURIComponent(programName)}`
    );
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col gap-4">
        {/* 제목 */}
        <Typography font="noto" variant="heading3B" className="text-gray-900">
          내가 참여중인 프로그램
        </Typography>

        {/* 프로그램 목록 - 타입별 그룹화 */}
        {programGroups.length > 0 && (
          <div className="flex flex-col gap-6">
            {programGroups.map((group) => (
              <div key={group.type} className="flex flex-col gap-0">
                {/* 그룹 헤더 */}
                <Typography
                  font="noto"
                  variant="body3M"
                  className="text-gray-700"
                >
                  {group.label}
                </Typography>

                {/* 그룹 아이템 목록 */}
                <div className="flex flex-col gap-0">
                  {group.items.map((program, itemIndex) => (
                    <button
                      key={program.id}
                      onClick={() => {
                        if (program.id && program.name) {
                          handleProgramSelect(program.id, program.name);
                        }
                      }}
                      className={cn(
                        "flex w-full items-center justify-between border-b border-gray-100 px-0 py-4 transition-colors hover:bg-gray-50 active:bg-gray-100",
                        itemIndex === group.items.length - 1 && "border-b-0"
                      )}
                      aria-label={`${program.name} 선택`}
                    >
                      <div className="flex flex-col items-start gap-1">
                        <Typography
                          font="noto"
                          variant="body2B"
                          className="text-gray-800"
                        >
                          {program.name}
                        </Typography>
                      </div>
                      <Icon
                        src={IMAGE_URL.ICON.settings.chevronRight.url}
                        width={20}
                        height={20}
                        className="text-gray-400"
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 데이터가 없고 로딩도 완료된 경우 (이론적으로는 발생하지 않아야 함) */}
        {programGroups.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8">
            <Typography font="noto" variant="body2M" className="text-gray-500">
              참여 중인 프로그램이 없어요
            </Typography>
            <Typography
              font="noto"
              variant="body2R"
              className="mt-2 text-gray-400"
            >
              프로그램에 참여한 후 글을 작성할 수 있어요
            </Typography>
          </div>
        )}
      </div>
    </BottomSheet>
  );
};

export default ProgramSelectBottomSheet;
