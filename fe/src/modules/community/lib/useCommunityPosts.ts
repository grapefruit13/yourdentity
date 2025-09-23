import { useState, useEffect } from 'react';
import { CommunityPost } from '../types';
import { samplePosts } from '../constants/sampleData';

/**
 * @description 커뮤니티 포스트 데이터를 관리하는 커스텀 훅
 * 현재는 샘플 데이터를 사용하지만, 향후 API 연동 시 쉽게 교체 가능
 */
export const useCommunityPosts = () => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 현재는 샘플 데이터 사용
  // 향후 API 연동 시 이 부분을 API 호출로 교체
  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // TODO: API 호출로 교체
      // const response = await fetch('/api/community/posts');
      // const data = await response.json();
      // setPosts(data);
      
      // 현재는 샘플 데이터 사용
      await new Promise(resolve => setTimeout(resolve, 500)); // 로딩 시뮬레이션
      setPosts(samplePosts);
    } catch (err) {
      setError('포스트를 불러오는데 실패했습니다.');
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return {
    posts,
    loading,
    error,
    refetch: fetchPosts
  };
};
