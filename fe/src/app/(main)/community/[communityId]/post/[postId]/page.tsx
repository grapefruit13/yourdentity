"use client";

import { useParams, useRouter } from "next/navigation";
import CommunityDetail from "@/components/community/CommunityDetail";
// import { useGetCommunityPostDetail } from "@/hooks/community/useGetCommunityPostDetail";
import { CommunityPost } from "@/types/community";
import { GETCommunityPostDetailRes } from "@/types/community/response";

/**
 * API 응답 데이터를 기존 CommunityPost 타입으로 변환하는 함수
 */
const transformApiDataToCommunityPost = (
  apiData: GETCommunityPostDetailRes,
  communityId: string
): CommunityPost => {
  // content 배열에서 텍스트 내용들을 추출하여 하나의 문자열로 결합
  const fullContent = apiData.content
    .filter((item) => item.type === "text")
    .sort((a, b) => a.order - b.order)
    .map((item) => item.content)
    .join("\n\n");

  return {
    id: apiData.id,
    communityId: communityId,
    title: apiData.title,
    author: {
      name: apiData.author,
      badge: "일반 사용자", // 기본값, 추후 API에서 제공될 수 있음
      avatar: undefined, // 기본값, 추후 API에서 제공될 수 있음
    },
    content: fullContent || apiData.preview.description, // content가 없으면 preview.description 사용
    category: apiData.category || "일상 공유",
    tags: apiData.tags,
    stats: {
      likes: apiData.likesCount,
      comments: apiData.commentsCount,
    },
    thumbnail: apiData.preview.thumbnail?.url,
    createdAt: apiData.createdAt,
  };
};

/**
 * @description 커뮤니티 상세 페이지
 */
const CommunityDetailPage = () => {
  return null;
  const params = useParams();
  const router = useRouter();

  // URL에서 communityId와 postId를 추출
  const communityId = params.communityId as string;
  const postId = params.postId as string;

  const { data, isLoading, isSuccess, error } = useGetCommunityPostDetail({
    communityId,
    postId,
  });

  const post =
    isSuccess && transformApiDataToCommunityPost(data.data, communityId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">포스트를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="mb-4 text-gray-500">
            {error
              ? "포스트를 불러오는 중 오류가 발생했습니다."
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

  return <CommunityDetail post={post} />;
};

export default CommunityDetailPage;
