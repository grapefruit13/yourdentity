'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../../lib/firebase';

export default function PhonePage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
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

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // 전화번호 형식 검증
    const phoneRegex = /^010-\d{4}-\d{4}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError('올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)');
      setLoading(false);
      return;
    }

    try {
      // TODO: 백엔드 API 호출하여 SMS 인증 코드 발송
      console.log('SMS 인증 코드 발송:', phoneNumber);
      
      // 임시로 인증 단계로 이동
      setStep('verify');
    } catch (error: any) {
      console.error('SMS 발송 실패:', error);
      setError(error.message || 'SMS 발송에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!verificationCode.trim()) {
      setError('인증 코드를 입력해주세요.');
      setLoading(false);
      return;
    }

    try {
      // TODO: 백엔드 API 호출하여 인증 코드 검증
      console.log('인증 코드 검증:', verificationCode);
      
      // 임시로 온보딩 완료
      router.push('/auth/onboarding/complete');
    } catch (error: any) {
      console.error('인증 실패:', error);
      setError(error.message || '인증에 실패했습니다.');
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
            휴대전화 인증
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {step === 'phone' 
              ? '휴대전화 번호를 입력해주세요'
              : '전송된 인증 코드를 입력해주세요'
            }
          </p>
        </div>
        
        {step === 'phone' ? (
          <form className="mt-8 space-y-6" onSubmit={handlePhoneSubmit}>
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                휴대전화 번호
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="010-1234-5678"
              />
              <p className="mt-1 text-xs text-gray-500">
                예: 010-1234-5678
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
                {loading ? '발송 중...' : '인증 코드 발송'}
              </button>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleVerificationSubmit}>
            <div>
              <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700">
                인증 코드
              </label>
              <input
                id="verificationCode"
                name="verificationCode"
                type="text"
                required
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="6자리 인증 코드"
                maxLength={6}
              />
              <p className="mt-1 text-xs text-gray-500">
                {phoneNumber}로 전송된 6자리 코드를 입력하세요
              </p>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? '인증 중...' : '인증 완료'}
              </button>
              
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                번호 다시 입력
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
