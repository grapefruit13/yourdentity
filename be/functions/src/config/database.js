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
    // 에뮬레이터 환경에서는 projectId만 설정
    admin.initializeApp({
      projectId: 'youthvoice-2025'
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
