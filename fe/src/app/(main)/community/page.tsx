"use client";

import { useState } from "react";
import CommunityModal from "@/components/community/CommunityModal";
import { useCommunityPosts } from "@/hooks/community/useCommunityPosts";
import { CommunityPost } from "@/types/community";

/**
 * @description 커뮤니티 페이지
 */
const Page = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | undefined>();

  // 커뮤니티 포스트 데이터 관리
  const { posts, loading, error, refetch } = useCommunityPosts();

  const handlePostClick = (post: CommunityPost) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPost(undefined);
  };

  // Early Return 패턴으로 조건부 렌더링 처리
  if (loading) {
    return (
      <div className="p-4">
        <h1 className="mb-6 text-2xl font-bold">커뮤니티</h1>
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">포스트를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <h1 className="mb-6 text-2xl font-bold">커뮤니티</h1>
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="text-red-600">{error}</div>
          <button
            onClick={refetch}
            className="mt-2 text-sm text-red-600 underline hover:text-red-800"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="mb-6 text-2xl font-bold">커뮤니티</h1>

      {/* 포스트 목록 */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            아직 작성된 포스트가 없습니다.
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="cursor-pointer rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
              onClick={() => handlePostClick(post)}
            >
              <h3 className="mb-2 text-lg font-semibold">{post.title}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>{post.author.name}</span>
                <span className="rounded-md bg-pink-200 px-1.5 py-0.5 text-xs text-pink-600">
                  {post.author.badge}
                </span>
                <span>•</span>
                <span>{post.date}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 모달 */}
      <CommunityModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        post={selectedPost}
      />
    </div>
  );
};

export default Page;
