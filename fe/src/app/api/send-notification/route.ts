import { NextRequest, NextResponse } from "next/server";
import admin, { ServiceAccount } from "firebase-admin";
import { Message } from "firebase-admin/messaging";
import { debug } from "@/utils/shared/debugger";

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  const serviceKeyString = process.env.FCM_SERVICE_KEY_STRINGIFIED;

  debug.log("Environment variable exists:", !!serviceKeyString);
  debug.log("Service key string length:", serviceKeyString?.length || 0);

  if (serviceKeyString && serviceKeyString.trim() !== "") {
    try {
      let serviceAccount: ServiceAccount;

      try {
        serviceAccount = JSON.parse(serviceKeyString);
      } catch (parseError) {
        debug.error("JSON parsing failed:", parseError);
        throw new Error(
          `Failed to parse FCM_SERVICE_KEY_STRINGIFIED: ${parseError instanceof Error ? parseError.message : "Invalid JSON format"}`
        );
      }

      // 서비스 계정 키 정규화 (camelCase와 snake_case 모두 지원)
      const accountRecord = serviceAccount as Record<string, unknown>;
      const normalizedAccount: ServiceAccount = {
        projectId: (accountRecord["project_id"] ??
          accountRecord["projectId"]) as string,
        privateKey: (accountRecord["private_key"] ??
          accountRecord["privateKey"]) as string,
        clientEmail: (accountRecord["client_email"] ??
          accountRecord["clientEmail"]) as string,
      };

      const missingFields = Object.entries(normalizedAccount)
        .filter(([, value]) => !value)
        .map(([key]) => key);

      if (missingFields.length > 0) {
        debug.error("Missing required fields:", missingFields);
        debug.error("Service account keys:", Object.keys(accountRecord));
        throw new Error(
          `Service account is missing required properties: ${missingFields.join(", ")}`
        );
      }

      admin.initializeApp({
        credential: admin.credential.cert(normalizedAccount),
      });

      debug.log(
        "Firebase Admin SDK initialized successfully with project:",
        normalizedAccount.projectId
      );
    } catch (error) {
      debug.error("Firebase Admin SDK initialization error:", error);
      throw error;
    }
  } else {
    debug.warn(
      "FCM_SERVICE_KEY_STRINGIFIED environment variable is not set or empty - FCM functionality will be disabled"
    );
  }
}

/**
 * @description FCM 알림 전송
 */
export async function POST(request: NextRequest) {
  try {
    // Firebase가 초기화되지 않은 경우
    if (!admin.apps.length) {
      return NextResponse.json(
        {
          success: false,
          error:
            "FCM service is not configured. Please set FCM_SERVICE_KEY_STRINGIFIED environment variable.",
        },
        { status: 503 }
      );
    }

    const { token, title, message, link } = await request.json();

    debug.log("Received notification request::", {
      token,
      title,
      message,
      link,
    });

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Token is required" },
        { status: 400 }
      );
    }

    const payload: Message = {
      token,
      notification: {
        title: title,
        body: message,
      },
      webpush: link && {
        fcmOptions: {
          link,
        },
      },
    };

    debug.log("Sending notification with payload::", payload);

    const tokenResult = await admin.messaging().send(payload);
    debug.log("Notification sent successfully::", token);

    return NextResponse.json({
      success: true,
      message: "Notification sent!",
      data: {
        token: tokenResult,
      },
    });
  } catch (error) {
    debug.error("Error in POST handler::", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
