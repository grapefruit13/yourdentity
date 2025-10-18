/**
 * @description FCM 관련 React Query 키
 */

export const fcmKeys = {
  all: ["fcm"] as const,
  token: () => [...fcmKeys.all, "token"] as const,
  deviceInfo: () => [...fcmKeys.all, "deviceInfo"] as const,
} as const;
