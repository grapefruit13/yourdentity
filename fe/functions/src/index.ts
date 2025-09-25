import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

// Firebase Admin SDK 초기화
admin.initializeApp();

// Firebase Functions region 설정
const region = "us-central1";

interface NotificationData {
  token: string;
  title: string;
  message: string;
  link?: string;
}

export const sendNotification = functions
  .region(region)
  .https.onCall(async (data) => {
    try {
      const { token, title, message, link } = data as NotificationData;

      // 입력 검증
      if (!token || !title || !message) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Token, title, and message are required"
        );
      }

      const payload: admin.messaging.Message = {
        token,
        notification: {
          title,
          body: message,
        },
        webpush: link
          ? {
              fcmOptions: {
                link,
              },
            }
          : undefined,
      };

      functions.logger.info("Sending notification", {
        token: token.substring(0, 10) + "...", // 보안을 위해 토큰 일부만 로깅
        title,
        message,
        link,
      });

      const result = await admin.messaging().send(payload);

      functions.logger.info("Notification sent successfully", { result });

      return {
        success: true,
        message: "Notification sent successfully",
        messageId: result,
      };
    } catch (error) {
      functions.logger.error("Error sending notification", error);

      if (error instanceof functions.https.HttpsError) {
        throw error;
      }

      throw new functions.https.HttpsError(
        "internal",
        "Failed to send notification",
        error instanceof Error ? error.message : String(error)
      );
    }
  });
