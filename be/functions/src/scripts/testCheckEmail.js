/**
 * checkEmailAvailability Function 테스트 스크립트
 * 
 * 사용법:
 * # 에뮬레이터 모드 (로컬 테스트)
 * 애뮬레이터 실행 후
 * cd /be/functions
 * pnpm test:check-email:emu test@example.com
 */

const admin = require("firebase-admin");

// 🔥 에뮬레이터 연결 (로컬 테스트용)
const USE_EMULATOR = process.env.USE_EMULATOR === "true";

// 환경 변수를 먼저 설정 (초기화 전에!)
if (USE_EMULATOR) {
  process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
  process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";
  process.env.GCLOUD_PROJECT = "youthvoice-2025";
  console.log("🎯 에뮬레이터 모드: Firestore@8080, Auth@9099에 연결");
  console.log(`📦 프로젝트: ${process.env.GCLOUD_PROJECT}\n`);
} else {
  console.log("🌐 프로덕션 모드: 실제 Firestore에 연결\n");
}

// Firebase Admin 초기화 (에뮬레이터 모드에서는 credential 불필요)
if (!admin.apps.length) {
  if (USE_EMULATOR) {
    // 에뮬레이터: credential 없이 초기화
    admin.initializeApp({
      projectId: "youthvoice-2025",
    });
  } else {
    // 프로덕션: 기본 credential 사용
    admin.initializeApp();
  }
}

const {checkEmailAvailability} = require("../services/authService");

const testEmail = process.argv[2];

if (!testEmail) {
  console.error("❌ 이메일을 입력하세요:");
  console.log("사용법: node src/scripts/testCheckEmail.js test@example.com");
  process.exit(1);
}

console.log("🔍 이메일 중복 체크 테스트 시작...");
console.log(`📧 검사할 이메일: ${testEmail}\n`);

checkEmailAvailability(testEmail)
    .then((result) => {
      console.log("✅ 테스트 완료!\n");
      console.log("📊 결과:", JSON.stringify(result, null, 2));

      if (result.available) {
        console.log("\n✨ 이 이메일은 사용 가능합니다!");
      } else {
        console.log("\n⚠️ 이 이메일은 이미 사용 중입니다!");
        console.log(`   - 가입 방법: ${result.existingAuthType === "email" ? "이메일" : "SNS"}`);
        console.log(`   - Provider: ${result.existingProvider}`);
      }

      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ 테스트 실패:", error);
      process.exit(1);
    });

