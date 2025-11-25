import { Skeleton } from "@/components/ui/skeleton";

interface PostDetailSkeletonProps {
  /**
   * @description 헤더 버튼 개수 (기본값: 1)
   */
  headerButtonCount?: number;
  /**
   * @description 카테고리/미션 제목 표시 여부 (기본값: true)
   */
  showCategory?: boolean;
}

/**
 * @description 게시글 상세 페이지 로딩 스켈레톤 컴포넌트
 */
export const PostDetailSkeleton = ({
  headerButtonCount = 1,
  showCategory = true,
}: PostDetailSkeletonProps) => {
  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 스켈레톤 */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3">
        <Skeleton className="h-6 w-16" />
        <div className="flex items-center gap-4">
          {Array.from({ length: headerButtonCount }).map((_, index) => (
            <Skeleton key={index} className="h-5 w-5" />
          ))}
        </div>
      </div>

      {/* 메인 콘텐츠 스켈레톤 */}
      <div className="px-4 py-6 pb-26">
        {/* 카테고리/미션 제목 스켈레톤 */}
        {showCategory && <Skeleton className="mb-2 h-4 w-32" />}

        {/* 제목 스켈레톤 */}
        <Skeleton className="mb-4 h-9 w-3/4" />

        {/* 프로필 섹션 스켈레톤 */}
        <div className="mb-6 flex items-center">
          <Skeleton className="mr-3 h-8 w-8 rounded-full" />
          <div>
            <Skeleton className="mb-1 h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>

        {/* 내용 스켈레톤 */}
        <div className="mb-6 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
};
