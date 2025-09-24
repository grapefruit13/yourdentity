import cors from "cors";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

// Firebase Admin SDK 초기화
admin.initializeApp();

// Firebase Functions region 설정
const region = "us-central1";

// CORS 설정 - 환경변수에서 허용 도메인 가져오기
const getAllowedOrigins = () => {
  // Firebase Functions config에서 가져오기 (v1 방식)
  const configOrigins = functions.config().cors?.origins;
  if (configOrigins) {
    functions.logger.info("Using CORS origins from Firebase config", {
      origins: configOrigins,
    });
    return configOrigins.split(",").map((origin: string) => origin.trim());
  }

  // 환경변수가 설정되지 않은 경우 에러 발생
  const errorMessage =
    "CORS_ORIGINS not configured. Please set Firebase config or environment variable.";
  functions.logger.error(errorMessage);
  throw new Error(errorMessage);
};

const corsHandler = cors({
  origin: getAllowedOrigins(),
  credentials: true,
});

interface NotificationData {
  token: string;
  title: string;
  message: string;
  link?: string;
}

export const sendNotificationHttp = functions
  .region(region)
  .https.onRequest((req, res) => {
    return corsHandler(req, res, async () => {
      // POST 요청만 허용
      if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
      }

      try {
        const data: NotificationData = req.body;
        const { token, title, message, link } = data;

        // 입력 검증
        if (!token || !title || !message) {
          res.status(400).json({
            error: "Token, title, and message are required",
          });
          return;
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

        res.status(200).json({
          success: true,
          message: "Notification sent successfully",
          messageId: result,
        });
      } catch (error) {
        functions.logger.error("Error sending notification", error);
        res.status(500).json({
          error: "Failed to send notification",
          details: error instanceof Error ? error.message : String(error),
        });
      }
    });
  });
