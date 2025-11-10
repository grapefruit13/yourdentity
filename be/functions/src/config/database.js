const admin = require("firebase-admin");
const {FieldValue, Timestamp} = require("firebase-admin/firestore");

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
      storageBucket: process.env.STORAGE_BUCKET,
    });
  } else {
    admin.initializeApp();
  }
}
const db = admin.firestore();

const now = () => Timestamp.now();

module.exports = {
  admin,
  db,
  FieldValue,
  Timestamp,
  now,
};
