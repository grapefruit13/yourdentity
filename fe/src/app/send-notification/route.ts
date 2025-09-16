import { debug } from "@/shared/utils/debugger";
import admin from "firebase-admin";
import { Message } from "firebase-admin/messaging";
import { NextRequest, NextResponse } from "next/server";

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    const serviceAccountKey = process.env.FCM_SERVICE_KEY_STRINGIFY;

    if (!serviceAccountKey) {
      throw new Error(
        "FCM_SERVICE_KEY_STRINGIFY environment variable is not set"
      );
    }

    const serviceAccount = JSON.parse(serviceAccountKey);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    debug.log("Firebase Admin SDK initialized successfully");
  } catch (error) {
    debug.error("Firebase Admin SDK initialization error::", error);
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
