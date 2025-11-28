"use client";

interface CommunityLoadingStatesProps {
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  hasData: boolean;
  loadingMessage?: string;
  completedMessage?: string;
}

/**
 * @description 커뮤니티 페이지 로딩 상태 컴포넌트
 * - 무한 스크롤 로딩 메시지 및 완료 메시지 표시
 */
const CommunityLoadingStates = ({
  isFetchingNextPage,
  hasNextPage,
  hasData,
  loadingMessage = "데이터를 더 불러오는 중이에요...",
  completedMessage = "모든 데이터를 확인했어요",
}: CommunityLoadingStatesProps) => {
  return (
    <>
      {isFetchingNextPage && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center justify-center pb-6 text-sm text-gray-500"
        >
          {loadingMessage}
        </div>
      )}

      {!hasNextPage && hasData && (
        <div className="pb-6 text-center text-xs text-gray-400">
          {completedMessage}
        </div>
      )}
    </>
  );
};

export default CommunityLoadingStates;
