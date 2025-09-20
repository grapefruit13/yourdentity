const { onRequest } = require('firebase-functions/v2/https');
const { setGlobalOptions } = require('firebase-functions/v2');
const express = require('express');
const cors = require('cors');

// 미들웨어
const logger = require('./src/middleware/logger');
const errorHandler = require('./src/middleware/errorHandler');

// 라우터
const userRoutes = require('./src/routes/users');
const missionRoutes = require('./src/routes/missions');
const imageRoutes = require('./src/routes/images');

// 서울 리전 설정
setGlobalOptions({ region: 'asia-northeast3' });

// Express 앱 생성
const app = express();

// 기본 미들웨어 설정
app.use(cors({ origin: true }));
app.use(express.json());
app.use(logger);

// 기본 라우트들 (기존 호환성을 위해 유지)
app.get('/', (req, res) => {
  res.json({
    message: 'Hello World from Firebase Functions v2!',
    timestamp: new Date().toISOString(),
    service: 'Express.js on Firebase Functions v6',
    version: '2.0.0'
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

app.post('/echo', (req, res) => {
  res.json({
    message: 'Echo response',
    received: req.body,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// API 라우트 등록
app.use('/users', userRoutes);
app.use('/missons', missionRoutes);
app.use('/images', imageRoutes);

// 에러 핸들러 (마지막에 등록)
app.use(errorHandler);

exports.api = onRequest(app);