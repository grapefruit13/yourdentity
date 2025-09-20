const { onRequest } = require('firebase-functions/v2/https');
const { setGlobalOptions } = require('firebase-functions/v2');
const express = require('express');
const cors = require('cors');

// 서울 리전 설정 (선택사항)
setGlobalOptions({ region: 'asia-northeast3' });

// Express 앱 생성
const app = express();

// 미들웨어 설정
app.use(cors({ origin: true }));
app.use(express.json());

// Hello World 라우트
app.get('/', (req, res) => {
  res.json({
    message: 'Hello World from Firebase Functions v2!',
    timestamp: new Date().toISOString(),
    service: 'Express.js on Firebase Functions v6'
  });
});

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// 사용자 목록 API
app.get('/users', (req, res) => {
  const users = [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' },
    { id: 3, name: 'Charlie', email: 'charlie@example.com' }
  ];
  
  res.json({
    success: true,
    data: users,
    count: users.length
  });
});

// Echo API (POST 테스트용)
app.post('/echo', (req, res) => {
  res.json({
    message: 'Echo response',
    received: req.body,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

exports.api = onRequest(app);