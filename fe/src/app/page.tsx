"use client";

import { Button } from "@/shared/components/ui/button";
import useFcmToken from "@/shared/hooks/useFcmToken";
import { debug } from "@/shared/utils/debugger";

/**
 * @description 홈페이지
 */
const HomePage = () => {
  const { token, notificationPermissionStatus } = useFcmToken();

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

  return (
    <main className="flex h-screen flex-col items-center justify-center gap-20 p-10">
      <h1 className="mb-4 text-4xl font-bold">FCM 테스트</h1>

      {notificationPermissionStatus === "granted" ? (
        <h2 className="font-bold">알림 수신 권한이 부여되었습니다.</h2>
      ) : notificationPermissionStatus !== null ? (
        <h2>
          알림 수신 권한이 부여되지 않았습니다. 브라우저 설정에서 알림을
          활성화해주세요.
        </h2>
      ) : null}

      <div>
        <Button
          variant="outline"
          disabled={!token}
          onClick={handleTestNotification}
        >
          테스트 알림 전송
        </Button>
      </div>
    </main>
  );
};

export default HomePage;
