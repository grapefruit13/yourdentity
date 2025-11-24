import { Skeleton } from "@/components/ui/skeleton";

interface CommentSkeletonProps {
  count?: number;
}

/**
 * @description 댓글 로딩 스켈레톤 컴포넌트
 */
export const CommentSkeleton = ({ count = 5 }: CommentSkeletonProps) => {
  return (
    <div className="px-4 py-6">
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, index) => (
          <div key={`comment-skeleton-${index}`} className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="mt-1 h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
