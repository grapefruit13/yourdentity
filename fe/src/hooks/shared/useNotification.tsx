"use client";

import { useState } from "react";
import { fetchToken } from "@/lib/firebase";
import { debug } from "@/utils/shared/debugger";

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

      const response = await fetch("/api/send-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, ...data }),
      });

      const result = await response.json();
      if (!response.ok || !result?.success) {
        throw new Error(result?.error || "알림 전송에 실패했습니다.");
      }

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
