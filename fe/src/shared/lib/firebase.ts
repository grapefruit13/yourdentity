import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getFunctions,
  httpsCallable,
  connectFunctionsEmulator,
} from "firebase/functions";
import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { debug } from "../utils/debugger";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const messaging = async () => {
  const supported = await isSupported();
  return supported ? getMessaging(app) : null;
};

/**
 * @description FCM 토큰 가져오기
 */
export const fetchToken = async () => {
  try {
    const fcmMessaging = await messaging();
    if (fcmMessaging) {
      const token = await getToken(fcmMessaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_FCM_VAPID_KEY,
      });
      return token;
    }
    return null;
  } catch (error) {
    debug.error("An error occurred while fetching the token::", error);
    return null;
  }
};

// Firebase Functions 설정
const functions = getFunctions(app);

// 개발 환경에서는 Functions Emulator 사용
if (process.env.NODE_ENV === "development") {
  try {
    // Functions Emulator에 연결 (localhost:5001)
    connectFunctionsEmulator(functions, "localhost", 5001);
    debug.log("Functions Emulator에 연결되었습니다.");
  } catch (error) {
    debug.warn(
      "Functions Emulator 연결 실패 (이미 연결되었거나 에뮬레이터가 실행 중이 아님):",
      error
    );
  }
}

// 알림 전송 함수
interface NotificationData {
  token: string;
  title: string;
  message: string;
  link?: string;
}

/**
 * @description 알림 전송 함수
 * @param data 알림 데이터
 */
export const sendNotification = async (data: NotificationData) => {
  try {
    const sendNotificationFunction = httpsCallable(
      functions,
      "sendNotification"
    );
    const result = await sendNotificationFunction(data);
    return result.data;
  } catch (error) {
    debug.error("Failed to send notification:", error);
    throw error;
  }
};

export { app, messaging, functions };
