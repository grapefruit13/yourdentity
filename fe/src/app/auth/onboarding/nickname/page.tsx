'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../../lib/firebase';

export default function NicknamePage() {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        router.push('/auth/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!nickname.trim()) {
      setError('닉네임을 입력해주세요.');
      setLoading(false);
      return;
    }

    if (nickname.length < 2 || nickname.length > 20) {
      setError('닉네임은 2-20자 사이여야 합니다.');
      setLoading(false);
      return;
    }

    try {
      // 백엔드 API 호출하여 닉네임 저장
      const uid = user?.uid;
      if (!uid) throw new Error('로그인 상태가 아닙니다.');

      const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID as string;
      const isLocalhost =
        typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' ||
          window.location.hostname === '127.0.0.1');

      const base = isLocalhost
        ? `http://127.0.0.1:5001/${projectId}/asia-northeast3/api`
        : `https://asia-northeast3-${projectId}.cloudfunctions.net/api`;

      const res = await fetch(`${base}/users/${uid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: nickname.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({} as any));
        throw new Error(data?.error || `닉네임 업데이트 실패 (${res.status})`);
      }

      // 다음 단계로 이동
      router.push('/auth/onboarding/phone');
    } catch (error: any) {
      console.error('닉네임 설정 실패:', error);
      setError(error.message || '닉네임 설정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            닉네임 설정
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            다른 사용자에게 표시될 닉네임을 설정해주세요
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-700">
              닉네임
            </label>
            <input
              id="nickname"
              name="nickname"
              type="text"
              required
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="닉네임을 입력하세요 (2-20자)"
              maxLength={20}
            />
            <p className="mt-1 text-xs text-gray-500">
              {nickname.length}/20자
            </p>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? '설정 중...' : '다음 단계'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
