import { getApp, getApps, initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported, Messaging } from "firebase/messaging";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
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

// 기본 SDK 인스턴스
export const auth = getAuth(app);
export const db = getFirestore(app);

// 로컬 개발 시 에뮬레이터 연결
if (typeof window !== "undefined") {
  const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  if (isLocalhost) {
    try {
      connectAuthEmulator(auth, "http://127.0.0.1:9099");
      connectFirestoreEmulator(db, "127.0.0.1", 8080);
      // eslint-disable-next-line no-console
      console.log("[Emu] Connected to Auth@9099 and Firestore@8080");
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("[Emu] Emulator connect skipped or already connected:", e);
    }
  }
}

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
      vapidKey: process.env.FCM_VAPID_KEY,
    });
    return token;
  } catch (error) {
    debug.error("An error occurred while fetching the token::", error);
    return null;
  }
};

export { app };
