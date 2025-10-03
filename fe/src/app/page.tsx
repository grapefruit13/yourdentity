"use client";

import PWAGuide from "../components/shared/pwa-guide";
import { Button } from "@/components/shared/ui/button";
import useFcmToken from "@/hooks/shared/useFcmToken";
import { debug } from "@/utils/shared/debugger";
import { signOut, getCurrentUser } from "@/lib/auth";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * @description 홈페이지
 */
const HomePage = () => {
  const { token, notificationPermissionStatus } = useFcmToken();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const effectiveUser = currentUser ?? auth.currentUser;

  useEffect(() => {
    // Popup 방식만 사용: 현재 사용자 구독으로 상태 동기화
    setCurrentUser(getCurrentUser());
    const unsub = onAuthStateChanged(auth, (user) => setCurrentUser(user));
    return () => unsub();
  }, []);

  const handleTestNotification = async () => {
    const response = await fetch("/send-notification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: token,
        title: "테스트 알림",
        message: "store로 링크되는 테스트 알림입니다.",
        link: "/store",
      }),
    });

    const data = await response.json();
    debug.log(data);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  return (
    <>
      <PWAGuide />
      <main className="flex h-screen flex-col items-center justify-center gap-20 p-10">
        <h1 className="mb-4 text-4xl font-bold">FCM 테스트</h1>

        {/* 현재 로그인 상태 표시 */}
        {effectiveUser && (
          <div className="rounded-lg bg-blue-50 p-4 text-sm">
            <p className="font-semibold">로그인됨: {effectiveUser.displayName || effectiveUser.email || 'User'}</p>
            <p className="text-xs text-gray-600">UID: {effectiveUser.uid}</p>
          </div>
        )}

        {notificationPermissionStatus === "granted" ? (
          <h2 className="font-bold">알림 수신 권한이 부여되었습니다.</h2>
        ) : notificationPermissionStatus !== null ? (
          <h2>
            알림 수신 권한이 부여되지 않았습니다. 브라우저 설정에서 알림을
            활성화해주세요.
          </h2>
        ) : null}

        <div className="flex gap-4">
          <Button
            variant="outline"
            disabled={!token}
            onClick={handleTestNotification}
          >
            테스트 알림 전송
          </Button>
          
          {effectiveUser && (
            <Button
              variant="outline"
              onClick={handleLogout}
            >
              로그아웃
            </Button>
          )}

          {!effectiveUser && (
            <>
              <Button
                onClick={() => router.push('/auth/login')}
              >
                로그인
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/auth/signup')}
              >
                이메일 회원가입
              </Button>
            </>
          )}
        </div>
      </main>
    </>
  );
};

export default HomePage;
