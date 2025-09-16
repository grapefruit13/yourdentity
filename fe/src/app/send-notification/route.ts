import { debug } from "@/shared/utils/debugger";
import admin, { ServiceAccount } from "firebase-admin";
import { Message } from "firebase-admin/messaging";
import { NextRequest, NextResponse } from "next/server";

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FCM_PROJECT_ID,
      private_key_id: process.env.FCM_PRIVATE_KEY_ID,
      private_key: process.env.FCM_PRIVATE_KEY,
      client_email: process.env.FCM_CLIENT_EMAIL,
      client_id: process.env.FCM_CLIENT_ID,
      auth_uri: process.env.FCM_AUTH_URI,
      token_uri: process.env.FCM_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.FCM_AUTH_PROVIDER_CERT_URL,
      client_x509_cert_url: process.env.FCM_CLIENT_CERT_URL,
      universe_domain: process.env.FCM_UNIVERSE_DOMAIN,
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as ServiceAccount),
    });
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
