"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CommunityDetail from "@/components/community/CommunityDetail";
import { CommunityPost } from "@/types/community";
import { samplePosts } from "@/constants/community/sampleData";

/**
 * @description 커뮤니티 상세 페이지
 */
const CommunityDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const postId = params.id as string;
    
    // 실제 환경에서는 API 호출로 데이터를 가져올 것
    const foundPost = samplePosts.find(p => p.id === postId);
    
    if (foundPost) {
      setPost(foundPost);
    } else {
      // 포스트를 찾을 수 없는 경우 커뮤니티 목록으로 리다이렉트
      router.push("/community");
    }
    
    setLoading(false);
  }, [params.id, router]);

  if (loading) {
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
          <div className="text-gray-500">포스트를 찾을 수 없습니다.</div>
        </div>
      </div>
    );
  }

  return <CommunityDetail post={post} />;
};

export default CommunityDetailPage;
