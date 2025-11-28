"use client";

interface CommunityErrorStateProps {
  error: Error | unknown;
  onRetry: () => void;
  defaultMessage?: string;
}

/**
 * @description 커뮤니티 페이지 에러 상태 컴포넌트
 */
const CommunityErrorState = ({
  error,
  onRetry,
  defaultMessage = "데이터를 불러오는데 실패했습니다",
}: CommunityErrorStateProps) => {
  return (
    <div className="min-h-screen bg-white">
      <div className="p-4">
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="text-red-600">
            {error instanceof Error ? error.message : defaultMessage}
          </div>
          <button
            onClick={onRetry}
            className="mt-2 text-sm text-red-600 underline hover:text-red-800"
          >
            다시 시도
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommunityErrorState;
