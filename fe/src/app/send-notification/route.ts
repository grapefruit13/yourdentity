import { NextRequest, NextResponse } from "next/server";
import admin, { ServiceAccount } from "firebase-admin";
import { Message } from "firebase-admin/messaging";
import { debug } from "@/shared/utils/debugger";

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    const serviceKeyString = process.env.FCM_SERVICE_KEY_STRINGIFIED;

    debug.log("Environment variable exists:", !!serviceKeyString);
    debug.log("Service key string length:", serviceKeyString?.length || 0);

    if (!serviceKeyString || serviceKeyString.trim() === "") {
      throw new Error(
        "FCM_SERVICE_KEY_STRINGIFIED environment variable is not set or empty"
      );
    }

    let serviceAccount: ServiceAccount;

    try {
      serviceAccount = JSON.parse(serviceKeyString);
    } catch (parseError) {
      debug.error("JSON parsing failed:", parseError);
      throw new Error(
        `Failed to parse FCM_SERVICE_KEY_STRINGIFIED: ${parseError instanceof Error ? parseError.message : "Invalid JSON format"}`
      );
    }

    // 필수 속성들 검증
    const requiredFields = ["project_id", "private_key", "client_email"];
    const missingFields = requiredFields.filter(
      (field) => !serviceAccount[field as keyof ServiceAccount]
    );

    if (missingFields.length > 0) {
      debug.error("Missing required fields:", missingFields);
      debug.error("Service account keys:", Object.keys(serviceAccount));
      throw new Error(
        `Service account is missing required properties: ${missingFields.join(", ")}`
      );
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    debug.log(
      "Firebase Admin SDK initialized successfully with project:",
      serviceAccount.projectId
    );
  } catch (error) {
    debug.error("Firebase Admin SDK initialization error:", error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const result = await admin.messaging().send(payload);
    debug.log("Notification sent successfully::", result);

    return NextResponse.json({
      success: true,
      message: "Notification sent!",
      result,
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
