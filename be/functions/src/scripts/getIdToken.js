#!/usr/bin/env node

/**
 * Firebase ID 토큰 발급 스크립트
 * 
 * Usage:
 *   # 에뮬레이터 모드 (기본)
 *   node src/scripts/getIdToken.js <userId>
 *   
 *   # 프로덕션 모드
 *   PRODUCTION=true node src/scripts/getIdToken.js <userId>
 * 
 * Examples:
 *   node src/scripts/getIdToken.js test-user-123
 *   PRODUCTION=true node src/scripts/getIdToken.js real-user-456
 */

// .env 파일 로드
try {
  require('dotenv').config();
} catch (_) {
  // dotenv가 없어도 계속 진행
}

const admin = require('firebase-admin');

// 환경 설정
const isProduction = process.env.PRODUCTION === 'true';

if (!isProduction) {
  // 에뮬레이터 환경 설정
  process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
  process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
  console.log('🔧 에뮬레이터 모드');
} else {
  console.log('🚀 프로덕션 모드 (실제 Firebase 사용)');
}

if (!admin.apps.length) {
  if (isProduction) {
    // 프로덕션: 서비스 계정 키 필요
    admin.initializeApp();
  } else {
    // 에뮬레이터: projectId만 필요
    admin.initializeApp({ projectId: 'youthvoice-2025' });
  }
}

function parseArgs(argv) {
  const args = { uid: undefined };
  for (const arg of argv.slice(2)) {
    if (arg.startsWith('--uid=')) {
      args.uid = arg.substring('--uid='.length);
    }
  }
  if (!args.uid && argv[2]) {
    args.uid = argv[2];
  }
  return args;
}

async function getIdTokenFromCustomToken(customToken, uid, isProduction) {
  // Auth API URL 설정
  const AUTH_BASE = isProduction 
    ? "https://identitytoolkit.googleapis.com/v1"
    : "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1";
  
  const API_KEY = isProduction
    ? process.env.WEB_API_KEY || "WEB_API_KEY"
    : "fake-api-key";
  
  const response = await fetch(`${AUTH_BASE}/accounts:signInWithCustomToken?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: customToken,
      returnSecureToken: true
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to exchange custom token: ${response.status} ${text}`);
  }

  const json = await response.json();
  return json.idToken;
}

async function main() {
  const { uid } = parseArgs(process.argv);
  
  if (!uid) {
    console.error('❌ Usage: node getDevToken.js <uid>');
    console.error('   OR: node getDevToken.js --uid=<uid>');
    process.exit(1);
  }

  try {
    console.log(`🔑 ID 토큰 발급 중... (UID: ${uid})`);
    
    // 1. 사용자 생성 또는 확인
    let userRecord;
    try {
      userRecord = await admin.auth().getUser(uid);
      console.log(`✅ 기존 사용자 발견: ${uid}`);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // 사용자 자동 생성 (에뮬레이터 & 프로덕션 모두)
        const email = isProduction 
          ? `${uid}@test.example.com`  // 프로덕션 테스트용
          : `${uid}@dev.example.com`;  // 에뮬레이터
          
        userRecord = await admin.auth().createUser({
          uid: uid,
          email: email,
          displayName: isProduction ? `Test User ${uid}` : `Dev User ${uid}`,
          emailVerified: true
        });
        console.log(`✅ 새 사용자 생성: ${uid} (${email})`);
        if (isProduction) {
          console.warn(`⚠️  프로덕션에 테스트 사용자가 생성되었습니다`);
        }
      } else {
        throw error;
      }
    }

    // 2. Custom Token 생성
    const customToken = await admin.auth().createCustomToken(uid);
    console.log(`✅ Custom Token 생성 완료`);

    // 3. ID Token 발급
    const idToken = await getIdTokenFromCustomToken(customToken, uid, isProduction);
    console.log(`✅ ID Token 발급 완료`);

    // 4. 결과 출력
    console.log('\n🔧 사용법:');
    console.log(`export FIREBASE_UID=${uid}`);
    console.log(`export FIREBASE_ID_TOKEN=${idToken}`);
    
    console.log('\n🧪 API 테스트 예시:');
    console.log(`curl -H "Authorization: Bearer ${idToken}" http://localhost:5001/youthvoice-2025/asia-northeast3/api/users/me`);

    console.log('\n📋 토큰 정보:');
    console.log(`UID=${uid}`);
    console.log(`⏬ ID_TOKEN\n${idToken}`);

  } catch (error) {
    console.error('❌ 토큰 발급 실패:', error.message);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('❌ 예상치 못한 오류:', err);
  process.exit(1);
});
