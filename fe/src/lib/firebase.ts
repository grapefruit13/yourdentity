import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  isSupported,
  Messaging,
} from "firebase/messaging";
import { debug } from "@/utils/shared/debugger";

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

export const getClientMessaging = async (): Promise<Messaging | null> => {
  try {
    const supported = await isSupported();
    return supported ? getMessaging(app) : null;
  } catch (error) {
    debug.error("Failed to get messaging instance:", error);
    return null;
  }
};

/**
 * @description FCM 토큰 가져오기
 */
export const fetchToken = async () => {
  try {
    const fcmMessaging = await getClientMessaging();
    if (!fcmMessaging) return null;

    const token = await getToken(fcmMessaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_FCM_VAPID_KEY,
    });
    return token;
  } catch (error) {
    debug.error("An error occurred while fetching the token::", error);
    return null;
  }
};

export { app };
