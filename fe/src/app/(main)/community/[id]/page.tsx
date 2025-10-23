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
  apiData: GETCommunityPostDetailRes
): CommunityPost => {
  return {
    id: apiData.id,
    title: apiData.title,
    author: {
      name: apiData.author,
      badge: "일반 사용자", // 기본값, 추후 API에서 제공될 수 있음
      avatar: undefined, // 기본값, 추후 API에서 제공될 수 있음
    },
    date: apiData.timeAgo,
    content: apiData.preview.description,
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
  const postId = params.id as string;

  // 임시 해결책: 샘플 데이터로 폴백
  // TODO: URL 구조 변경 또는 백엔드 API 수정 필요
  const communityId = "CP:ABC123DEF456"; // 백엔드에서 생성된 실제 커뮤니티 ID

  const { data, isLoading, error } = useGetCommunityPostDetail({
    communityId,
    postId,
  });

  // API 에러 시 샘플 데이터로 폴백
  const [fallbackPost, setFallbackPost] = useState<CommunityPost | null>(null);

  useEffect(() => {
    if (error) {
      // API 에러 시 샘플 데이터에서 해당 postId 찾기
      const foundPost = samplePosts.find((p) => p.id === postId);
      if (foundPost) {
        setFallbackPost(foundPost);
      }
    }
  }, [error, postId]);

  // API 데이터를 기존 타입으로 변환
  const apiPost = data?.data
    ? transformApiDataToCommunityPost(data.data)
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
