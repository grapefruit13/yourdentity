const {onRequest} = require("firebase-functions/v2/https");
const {setGlobalOptions} = require("firebase-functions/v2");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpecs = require("./src/config/swagger");

// 미들웨어
const logger = require("./src/middleware/logger");
const errorHandler = require("./src/middleware/errorHandler");

// 라우터
const userRoutes = require("./src/routes/users");
const missionRoutes = require("./src/routes/missions");
const imageRoutes = require("./src/routes/images");

// Firebase Admin 초기화 (트리거 로드 전에 보장)
if (!admin.apps.length) {
  admin.initializeApp();
}

// 1세대 Auth Triggers
const {
  createUserDocument,
  deleteUserDocument,
} = require("./src/triggers/authTrigger");

// 서울 리전 설정
setGlobalOptions({region: "asia-northeast3"});

// Express 앱 생성
const app = express();

// 기본 미들웨어 설정
// 개발용 CORS (모든 origin 허용)
app.use(cors({ origin: true }));

// 프로덕션용 CORS (특정 도메인만 허용)
const allowedOrigins = [
  // 개발 환경
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  // Firebase Emulator Suite UI
  "http://localhost:4000",
  "http://127.0.0.1:4000",
  // 프로덕션 환경
  "https://yourdentity.web.app",
  "https://yourdentity.firebaseapp.com",
  // Firebase Functions 도메인
  "https://asia-northeast3-youthvoice-2025.cloudfunctions.net",
  "https://asia-northeast3-yourdentity.cloudfunctions.net",
  // Swagger UI (개발용)
  "http://127.0.0.1:5001",
  "http://localhost:5001",
];
app.use(cors({
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
}));

app.use(express.json());
app.use(logger);

// 기본 라우트들 (기존 호환성을 위해 유지)
app.get("/", (req, res) => {
  res.json({
    message: "Hello World from Firebase Functions v2!",
    timestamp: new Date().toISOString(),
    service: "Express.js on Firebase Functions v6",
    version: "2.0.0",
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

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  explorer: true,
  customCss: ".swagger-ui .topbar { display: none }",
  customSiteTitle: "Yourdentity API Documentation",
}));

// API 라우트 등록
app.use("/users", userRoutes);
app.use("/missions", missionRoutes);
app.use("/images", imageRoutes);

// 에러 핸들러 (마지막에 등록)
app.use(errorHandler);

exports.api = onRequest(app);

// 1세대 Auth Triggers 내보내기
exports.createUserDocument = createUserDocument;
exports.deleteUserDocument = deleteUserDocument;
