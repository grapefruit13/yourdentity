'use client';

import React, { useState } from 'react';
import CommunityModal from '../components/CommunityModal';
import { CommunityPost } from '../types';
import { useCommunityPosts } from '../lib/useCommunityPosts';

/**
 * @description 커뮤니티 페이지
 */
const CommunityPage: React.FC = () => {
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

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">커뮤니티</h1>
      
      {/* 로딩 상태 */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-500">포스트를 불러오는 중...</div>
        </div>
      )}
      
      {/* 에러 상태 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="text-red-600">{error}</div>
          <button 
            onClick={refetch}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            다시 시도
          </button>
        </div>
      )}
      
      {/* 포스트 목록 */}
      {!loading && !error && (
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              아직 작성된 포스트가 없습니다.
            </div>
          ) : (
            posts.map((post) => (
              <div 
                key={post.id}
                className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handlePostClick(post)}
              >
                <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>{post.author.name}</span>
                  <span className="text-xs px-1.5 py-0.5 bg-pink-200 text-pink-600 rounded-md">
                    {post.author.badge}
                  </span>
                  <span>•</span>
                  <span>{post.date}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 모달 */}
      <CommunityModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        post={selectedPost}
      />
    </div>
  );
};

export default CommunityPage;
