"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import CommunityDetail from "@/components/community/CommunityDetail";
import { samplePosts } from "@/constants/community/sampleData";
import { useGetCommunityPostDetail } from "@/hooks/community/useGetCommunityPostDetail";
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
    date: apiData.timeAgo,
    content: fullContent || apiData.preview.description, // content가 없으면 preview.description 사용
    category: apiData.category || "일상 공유",
    tags: apiData.tags,
    stats: {
      likes: apiData.likesCount,
      comments: apiData.commentsCount,
    },
    thumbnail: apiData.preview.thumbnail?.url,
  };
};

/**
 * @description 커뮤니티 상세 페이지
 */
const CommunityDetailPage = () => {
  const params = useParams();
  const router = useRouter();

  // URL에서 communityId와 postId를 추출
  const communityId = params.communityId as string;
  const postId = params.postId as string;

  const { data, isLoading, error } = useGetCommunityPostDetail({
    communityId,
    postId,
  });

  // API 에러 시 샘플 데이터로 폴백
  const [fallbackPost, setFallbackPost] = useState<CommunityPost | null>(null);

  useEffect(() => {
    if (error) {
      // API 에러 시 샘플 데이터에서 해당 postId와 communityId 찾기
      const foundPost = samplePosts.find(
        (p) => p.id === postId && p.communityId === communityId
      );
      if (foundPost) {
        setFallbackPost(foundPost);
      }
    }
  }, [error, postId, communityId]);

  // API 데이터를 기존 타입으로 변환
  const apiPost = data?.data
    ? transformApiDataToCommunityPost(data.data, communityId)
    : null;

  // API 성공 시 API 데이터, 에러 시 폴백 데이터 사용
  const post = apiPost || fallbackPost;

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
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">
            {error
              ? "포스트를 불러오는 중 오류가 발생했습니다."
              : "포스트를 찾을 수 없습니다."}
          </div>
          <button
            onClick={() => router.push("/community")}
            className="mt-2 text-sm text-blue-600 underline hover:text-blue-800"
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
