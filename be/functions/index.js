const { onRequest } = require("firebase-functions/v2/https");
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerConfig = require("./src/config/swagger");

const { admin } = require("./src/config/database");

// 미들웨어
const logger = require("./src/middleware/logger");
const errorHandler = require("./src/middleware/errorHandler");

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
const announcementRoutes = require("./src/routes/announcements");

if (!admin.apps.length) {
  admin.initializeApp();
}

// 1세대 Auth Triggers
// eslint-disable-next-line no-unused-vars
const functions = require("firebase-functions");
const {
  createUserDocument,
  deleteUserDocument,
} = require("./src/triggers/authTrigger");

// 서울 리전 설정 (1st generation에서는 functions.region 사용)

// Express 앱 생성
const app = express();

const allowedOrigins = [
  // 개발 환경
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:4000",
  "http://127.0.0.1:4000",
  "http://localhost:5001",
  "http://127.0.0.1:5001",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  // 프로덕션 환경
  "https://yourdentity.vercel.app",
  "https://yourdentity.web.app",
  "https://yourdentity.firebaseapp.com",
  "https://asia-northeast3-youthvoice-2025.cloudfunctions.net",
  "https://asia-northeast3-yourdentity.cloudfunctions.net",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // 개발 환경에서는 origin이 없는 요청도 허용
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("CORS blocked origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

app.use(express.json());
app.use(logger);

if (process.env.NODE_ENV === "development") {
  app.use(swaggerConfig.autoUpdateMiddleware);
}

// Swagger UI
app.use("/api-docs", swaggerUi.serve, async (req, res, next) => {
  try {
    const mergedSpec = await swaggerConfig.getMerged();
    const swaggerUiHandler = swaggerUi.setup(mergedSpec, {
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "Yourdentity API Documentation (자동 업데이트)",
      swaggerOptions: {
        url: "/api-docs.json",
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
        .json({ success: false, message: "Swagger 업데이트 실패" });
    }
  });
}

// 기본 라우트들 (기존 호환성을 위해 유지)
app.get("/", (req, res) => {
  res.json({
    message: "Hello World from Firebase Functions!",
    timestamp: new Date().toISOString(),
    service: "Express.js on Firebase Functions v6 (Mixed Generation)",
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
app.use("/tmis", tmiRoutes);
app.use("/communities", communityRoutes);
app.use("/store", storeRoutes);
app.use("/comments", commentRoutes);
app.use("/notion/announcements", announcementRoutes);

// 에러 핸들러 (마지막에 등록)
app.use(errorHandler);

exports.api = onRequest(
  {
    region: "asia-northeast3",
    cors: true,
  },
  app
);

// 1세대 Auth Triggers 내보내기
exports.createUserDocument = createUserDocument;
exports.deleteUserDocument = deleteUserDocument;
