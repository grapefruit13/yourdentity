"use client";

interface CommunityEmptyStateProps {
  icon?: string;
  title: string;
  description: string;
}

/**
 * @description 커뮤니티 페이지 빈 상태 컴포넌트
 */
const CommunityEmptyState = ({
  icon = "📭",
  title,
  description,
}: CommunityEmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 text-4xl">{icon}</div>
      <p className="mb-2 text-base font-medium text-gray-900">{title}</p>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
};

export default CommunityEmptyState;
