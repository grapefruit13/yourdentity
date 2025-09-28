"use client";

import { Button } from "@/components/shared/ui/button";
import useFcmToken from "@/hooks/shared/useFcmToken";
import { useNotification } from "@/hooks/shared/useNotification";
import { debug } from "@/utils/shared/debugger";

/**
 * @description 미션 페이지
 */
const Page = () => {
  const { notificationPermissionStatus } = useFcmToken();
  const { sendPushNotification, isLoading, error } = useNotification();

  const handleTestNotification = async () => {
    try {
      const result = await sendPushNotification({
        title: "테스트 알림",
        message: "store로 링크되는 테스트 알림입니다.",
        link: `${window.location.origin}/store`,
      });
      debug.log("알림 전송 성공:", result);
    } catch (error) {
      debug.error("알림 전송 실패:", error);
    }
  };
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-20 p-10">
      <h1 className="mb-4 text-4xl font-bold">FCM 테스트</h1>

      {notificationPermissionStatus === "granted" ? (
        <h2 className="font-bold">알림 수신 권한이 부여되었습니다.</h2>
      ) : notificationPermissionStatus !== null ? (
        <h2>
          알림 수신 권한이 부여되지 않았습니다. 브라우저 설정에서 알림을
          활성화해주세요.
        </h2>
      ) : null}

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-red-700">
          <p>오류: {error}</p>
        </div>
      )}

      <div className="flex flex-col items-center gap-4">
        <Button
          variant="outline"
          disabled={notificationPermissionStatus !== "granted" || isLoading}
          onClick={handleTestNotification}
        >
          {isLoading ? "전송 중..." : "테스트 알림 전송"}
        </Button>

        {notificationPermissionStatus !== "granted" && (
          <p className="text-sm text-gray-500">알림 권한이 필요합니다</p>
        )}
      </div>
    </div>
  );
};

export default Page;
