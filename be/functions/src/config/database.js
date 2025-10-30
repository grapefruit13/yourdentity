const admin = require("firebase-admin");
const {FieldValue} = require("firebase-admin/firestore");

try {
  require("dotenv").config();
} catch (_) {
  // dotenv not available
}

if (!admin.apps || admin.apps.length === 0) {
  // 에뮬레이터 환경변수 확인
  const isEmulator = process.env.FUNCTIONS_EMULATOR === 'true';
  
  if (isEmulator) {
    admin.initializeApp({
      projectId: 'youthvoice-2025',
      storageBucket: process.env.STORAGE_BUCKET || 'youthvoice-2025.appspot.com'
    });
  } else {
    // 프로덕션 환경에서는 기본 초기화
    admin.initializeApp();
  }
}

const db = admin.firestore();


module.exports = {
  admin,
  db,
  FieldValue,
};
