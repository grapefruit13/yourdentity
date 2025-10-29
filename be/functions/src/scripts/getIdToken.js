#!/usr/bin/env node

/**
 * 개발용 Firebase ID 토큰 발급 스크립트 (에뮬레이터 환경)
 * Usage:
 *   node be/functions/src/scripts/getDevToken.js [userId]
 *   node be/functions/src/scripts/getDevToken.js --uid=test-user-123
 */
const admin = require('firebase-admin');

// 에뮬레이터 환경 설정
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';

if (!admin.apps.length) {
  admin.initializeApp({ projectId: 'youthvoice-2025' });
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

async function getIdTokenFromCustomToken(customToken, uid) {
  // 에뮬레이터에서 실제 ID Token 생성
  const AUTH_EMULATOR_BASE = "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1";
  
  const response = await fetch(`${AUTH_EMULATOR_BASE}/accounts:signInWithCustomToken?key=fake-api-key`, {
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
    console.log(`🔑 개발용 토큰 발급 중... (UID: ${uid})`);
    
    // 1. 사용자 생성 또는 확인
    let userRecord;
    try {
      userRecord = await admin.auth().getUser(uid);
      console.log(`✅ 기존 사용자 발견: ${uid}`);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // 사용자가 없으면 생성
        userRecord = await admin.auth().createUser({
          uid: uid,
          email: `${uid}@dev.example.com`,
          displayName: `Dev User ${uid}`,
          emailVerified: true
        });
        console.log(`✅ 새 사용자 생성: ${uid}`);
      } else {
        throw error;
      }
    }

    // 2. Custom Token 생성
    const customToken = await admin.auth().createCustomToken(uid);
    console.log(`✅ Custom Token 생성 완료`);

    // 3. ID Token 발급
    const idToken = await getIdTokenFromCustomToken(customToken, uid);
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
