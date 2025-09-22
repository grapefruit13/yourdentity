"use client";

import { useState } from "react";
import { sendNotification, fetchToken } from "@/shared/lib/firebase";
import { debug } from "@/shared/utils/debugger";

interface NotificationData {
  title: string;
  message: string;
  link?: string;
}

/**
 * @description FCM 토큰 사용해 알림 메시지 전송
 */
export const useNotification = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendPushNotification = async (data: NotificationData) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await fetchToken();

      if (!token) {
        throw new Error(
          "FCM 토큰을 가져올 수 없습니다. 브라우저에서 알림 권한을 허용해주세요."
        );
      }

      debug.log(
        "Sending notification with token:",
        token.substring(0, 10) + "..."
      );

      // Firebase Functions를 통해 알림 전송
      const result = await sendNotification({
        token,
        ...data,
      });

      debug.log("Notification sent successfully:", result);
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "알림 전송에 실패했습니다.";
      setError(errorMessage);
      debug.error("Failed to send notification:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendPushNotification,
    isLoading,
    error,
  };
};
