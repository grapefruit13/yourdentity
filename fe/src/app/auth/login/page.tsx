'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithKakao, onAuthStateChange } from '@/lib/auth';

/**
 * @description 로그인 페이지
 */
const LoginPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);


  // Auth 상태 변경 감지
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      if (user) {
        // 이미 로그인된 경우 홈으로 리다이렉트
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  // 카카오 로그인 핸들러
  const handleKakaoLogin = async (): Promise<void> => {
    setLoading(true);

    try {
      await signInWithKakao();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('카카오 로그인 실패:', error);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Yourdentity</h1>
          <p className="mt-2 text-gray-600">카카오 로그인으로 시작하기</p>
        </div>

        <div className="space-y-4">
          {/* 카카오 로그인 버튼 */}
          <button
            onClick={handleKakaoLogin}
            disabled={loading}
            className="w-full rounded-lg bg-[#FEE500] px-4 py-3 font-semibold text-[#000000] transition hover:bg-[#FDD835] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '로그인 중...' : '카카오로 시작하기'}
          </button>

          {/* 이메일 로그인 버튼 (추후 내부로직 구현 예정) */}
          <button
            onClick={() => router.push('/auth/signup')}
            disabled={loading}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            이메일로 시작하기
          </button>
        </div>

        {/* 약관 동의 안내 */}
        <p className="text-center text-xs text-gray-500">
          로그인 시 <span className="underline">이용약관</span> 및{' '}
          <span className="underline">개인정보처리방침</span>에 동의하는 것으로 간주됩니다.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
