"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import PostDetail from "@/components/community/PostDetail";
import { useGetCommunitiesPostsByTwoIds } from "@/hooks/generated/communities-hooks";
import type * as Schema from "@/types/generated/api-schema";

/**
 * @description 게시글 상세 페이지
 */
const PostDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL에서 postId와 communityId를 추출
  const postId = params.id as string;
  const communityId = searchParams.get("communityId") || "";

  // API 연동 - useGetCommunitiesPostsByTwoIds 사용 (communityId와 postId 모두 필요)
  const {
    data: postData,
    isLoading,
    error,
  } = useGetCommunitiesPostsByTwoIds({
    request: {
      communityId: communityId || "",
      postId,
    },
    enabled: !!postId && !!communityId, // communityId가 있을 때만 요청
  });

  // 로딩 중
  if (isLoading || !communityId) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">포스트를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  // 에러 처리 또는 communityId가 없는 경우
  if (error || !postData || !communityId) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="mb-4 text-gray-500">
            {error
              ? "포스트를 불러오는 중 오류가 발생했습니다."
              : !communityId
                ? "커뮤니티 정보를 찾을 수 없습니다."
                : "포스트를 찾을 수 없습니다."}
          </div>
          {error && (
            <div className="mb-4 text-sm text-gray-400">
              {error.message || "알 수 없는 오류"}
            </div>
          )}
          <button
            onClick={() => router.push("/community")}
            className="px-4 py-2 text-sm text-blue-600 underline hover:text-blue-800"
          >
            커뮤니티로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // postData를 Schema.CommunityPost 타입으로 변환
  const post = postData as Schema.CommunityPost;

  return <PostDetail post={post} />;
};

export default PostDetailPage;
