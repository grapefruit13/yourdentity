const {onRequest} = require("firebase-functions/v2/https");
const {setGlobalOptions} = require("firebase-functions/v2");
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const {admin} = require("./src/config/database");

// Swagger 설정 (자동 업데이트 포함)
const swaggerConfig = require("./src/config/swagger");

// 미들웨어
const logger = require("./src/middleware/logger");
const errorHandler = require("./src/middleware/errorHandler");
const swaggerCapture = require("./src/middleware/swaggerCapture");

// 라우터
const userRoutes = require("./src/routes/users");
const missionRoutes = require("./src/routes/missions");
const imageRoutes = require("./src/routes/images");
const routineRoutes = require("./src/routes/routines");
const gatheringRoutes = require("./src/routes/gatherings");
const tmiRoutes = require("./src/routes/tmi");
const communityRoutes = require("./src/routes/communities");
const commentRoutes = require("./src/routes/comments");
const storeRoutes = require("./src/routes/store");

// 리전 설정
setGlobalOptions({region: "asia-northeast3"});

// Express 앱 생성
const app = express();

// ✅ 전역 CORS 설정 (OPTIONS 자동 처리 포함)
app.use(
    cors({
      origin: [
        "http://127.0.0.1:5001",
        "http://localhost:5001",
        "http://127.0.0.1:4000",
        "http://localhost:4000",
        "http://127.0.0.1:3000",
        "http://localhost:3000",
        "http://127.0.0.1:8080",
        "http://localhost:8080",
        "https://yourdentity.vercel.app",
      ],
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    }),
);

app.use(express.json());
app.use(logger);

// 자동 Swagger 업데이트 (개발 모드에서만)
if (process.env.NODE_ENV === "development") {
  app.use(swaggerConfig.autoUpdateMiddleware);
  app.use(swaggerCapture.capture());
}

// Swagger UI
app.use("/api-docs", swaggerUi.serve, async (req, res, next) => {
  try {
    const mergedSpec = await swaggerConfig.getMerged();
    const swaggerUiHandler = swaggerUi.setup(mergedSpec, {
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "Yourdentity API Documentation (자동 업데이트)",
      swaggerOptions: {
        url: "/youthvoice-2025/asia-northeast3/api/api-docs.json",
        validatorUrl: null,
        tryItOutEnabled: true,
        supportedSubmitMethods: ["get", "post", "put", "patch", "delete"],
        // ⚠️ requestInterceptor는 제거 (응답 헤더에서만 처리)
      },
    });
    swaggerUiHandler(req, res, next);
  } catch (error) {
    console.error("❌ Swagger UI 설정 실패:", error);
    const swaggerUiHandler = swaggerUi.setup(swaggerConfig.default, {
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "Yourdentity API Documentation",
    });
    swaggerUiHandler(req, res, next);
  }
});

// Swagger JSON 엔드포인트
app.get("/api-docs.json", async (req, res) => {
  try {
    const mergedSpec = await swaggerConfig.getMerged();
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.json(mergedSpec);
  } catch (error) {
    console.error("❌ Swagger JSON 생성 실패:", error);
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.json(swaggerConfig.default);
  }
});

// 개발 모드용 Swagger 관리 API
if (process.env.NODE_ENV === "development") {
  app.post("/api-docs/update", async (req, res) => {
    try {
      await swaggerConfig.updateSwagger();
      res.json({
        success: true,
        message: "Swagger 문서가 업데이트되었습니다.",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res
          .status(500)
          .json({success: false, message: "Swagger 업데이트 실패"});
    }
  });

  app.get("/api-docs/captured", (req, res) => {
    res.json({
      success: true,
      data: {
        capturedCount: swaggerCapture.getCapturedData().size,
        capturedEndpoints: Array.from(swaggerCapture.getCapturedData().keys()),
        openAPISpec: swaggerCapture.toOpenAPISpec(),
      },
    });
  });

  app.post("/api-docs/captured/clear", (req, res) => {
    swaggerCapture.clearCapturedData();
    res.json({
      success: true,
      message: "캡처된 데이터가 초기화되었습니다.",
      timestamp: new Date().toISOString(),
    });
  });
}

// 기본 라우트
app.get("/", (req, res) => {
  res.json({
    message: "Hello World from Firebase Functions v2!",
    timestamp: new Date().toISOString(),
    service: "Express.js on Firebase Functions v6",
    version: "2.0.0",
    documentation: "/api-docs",
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: "2.0.0",
  });
});

app.post("/echo", (req, res) => {
  res.json({
    message: "Echo response",
    received: req.body,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
});

// API 라우트 등록
app.use("/users", userRoutes);
app.use("/missions", missionRoutes);
app.use("/images", imageRoutes);
app.use("/routines", routineRoutes);
app.use("/gatherings", gatheringRoutes);
app.use("/tmi", tmiRoutes);
app.use("/communities", communityRoutes);
app.use("/store", storeRoutes);
app.use("/", commentRoutes);

// 알림 전송 라우트
app.post("/send-notification", async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({error: "Method not allowed"});
  }

  try {
    const {token, title, message, link} = req.body;
    if (!token || !title || !message) {
      return res
          .status(400)
          .json({error: "Token, title, and message are required"});
    }

    const payload = {
      token,
      notification: {title, body: message},
      ...(link && {webpush: {fcmOptions: {link}}}),
    };

    const result = await admin.messaging().send(payload);

    res.status(200).json({
      success: true,
      message: "Notification sent successfully",
      messageId: result,
    });
  } catch (error) {
    console.error("Error sending notification", error);
    res.status(500).json({
      error: "Failed to send notification",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// 에러 핸들러
app.use(errorHandler);

exports.api = onRequest(app);
