const { onRequest } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");

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

// 서울 리전 설정
setGlobalOptions({ region: "asia-northeast3" });

// Express 앱 생성
const app = express();

// 기본 미들웨어 설정
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
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Access-Control-Allow-Origin",
    ],
  })
);
app.use(express.json());
app.use(logger);

// OPTIONS 요청 처리 (CORS preflight) - 모든 경로에 대해 처리
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With, Access-Control-Allow-Origin"
    );
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.status(200).end();
  } else {
    next();
  }
});

// 자동 Swagger 업데이트 미들웨어 (개발 모드에서만)
if (process.env.NODE_ENV === "development") {
  app.use(swaggerConfig.autoUpdateMiddleware);
  // API 응답 캡처 미들웨어 추가
  app.use(swaggerCapture.capture());
}

// Swagger UI 설정 (자동 업데이트 포함)
app.use("/api-docs", swaggerUi.serve, async (req, res, next) => {
  try {
    // 자동 생성된 Swagger 스펙 가져오기
    const mergedSpec = await swaggerConfig.getMerged();
    const swaggerUiHandler = swaggerUi.setup(mergedSpec, {
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "Yourdentity API Documentation (자동 업데이트)",
      swaggerOptions: {
        url: "/youthvoice-2025/asia-northeast3/api/api-docs.json",
        validatorUrl: null,
        tryItOutEnabled: true,
        supportedSubmitMethods: ["get", "post", "put", "patch", "delete"],
        requestInterceptor: (req) => {
          req.headers["Access-Control-Allow-Origin"] = "http://127.0.0.1:5001";
          req.headers["Access-Control-Allow-Methods"] =
            "GET, POST, PUT, PATCH, DELETE, OPTIONS";
          req.headers["Access-Control-Allow-Headers"] =
            "Content-Type, Authorization, X-Requested-With, Access-Control-Allow-Origin";
          req.headers["Access-Control-Allow-Credentials"] = "true";
          return req;
        },
      },
    });
    swaggerUiHandler(req, res, next);
  } catch (error) {
    console.error("❌ Swagger UI 설정 실패:", error);
    // 기본 스펙으로 폴백
    const swaggerUiHandler = swaggerUi.setup(swaggerConfig.default, {
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "Yourdentity API Documentation",
      swaggerOptions: {
        url: "/youthvoice-2025/asia-northeast3/api/api-docs.json",
        validatorUrl: null,
        tryItOutEnabled: true,
        supportedSubmitMethods: ["get", "post", "put", "patch", "delete"],
      },
    });
    swaggerUiHandler(req, res, next);
  }
});

// Swagger JSON 엔드포인트 (자동 업데이트 포함)
app.get("/api-docs.json", async (req, res) => {
  try {
    const mergedSpec = await swaggerConfig.getMerged();
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:5001");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With, Access-Control-Allow-Origin"
    );
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.send(mergedSpec);
  } catch (error) {
    console.error("❌ Swagger JSON 생성 실패:", error);
    // 기본 스펙으로 폴백
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:5001");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With, Access-Control-Allow-Origin"
    );
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.send(swaggerConfig.default);
  }
});

// 수동 Swagger 업데이트 엔드포인트 (개발용)
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
      res.status(500).json({
        success: false,
        message: "Swagger 업데이트 실패",
        error: error.message,
      });
    }
  });

  // 캡처된 API 응답 데이터 확인 엔드포인트
  app.get("/api-docs/captured", (req, res) => {
    try {
      const capturedData = swaggerCapture.getCapturedData();
      const openAPISpec = swaggerCapture.toOpenAPISpec();

      res.json({
        success: true,
        data: {
          capturedCount: capturedData.size,
          capturedEndpoints: Array.from(capturedData.keys()),
          openAPISpec: openAPISpec,
        },
        message: "캡처된 API 응답 데이터입니다.",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "캡처된 데이터 조회 실패",
        error: error.message,
      });
    }
  });

  // 캡처된 데이터 초기화 엔드포인트
  app.post("/api-docs/captured/clear", (req, res) => {
    try {
      swaggerCapture.clearCapturedData();
      res.json({
        success: true,
        message: "캡처된 데이터가 초기화되었습니다.",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "데이터 초기화 실패",
        error: error.message,
      });
    }
  });
}

// 기본 라우트들 (기존 호환성을 위해 유지)
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
app.use("/", commentRoutes);

// 에러 핸들러 (마지막에 등록)
app.use(errorHandler);

exports.api = onRequest(app);
