#!/usr/bin/env node

/**
 * 에뮬레이터 환경에서 카카오 테스트용 customClaims 설정
 * Usage:
 *   node be/functions/src/scripts/setKakaoTestClaims.js <userId>
 */
const admin = require('firebase-admin');

// Emulator 환경 설정
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';

if (!admin.apps.length) {
  admin.initializeApp({ projectId: 'youthvoice-2025' });
}

const userId = process.argv[2];

if (!userId) {
  console.error('❌ Usage: node setKakaoTestClaims.js <userId>');
  process.exit(1);
}

// 카카오 테스트용 더미 데이터
const customClaims = {
  kakaoName: '테스트유저',
  kakaoGender: 'male',
  kakaoBirthdate: '2000-01-01',
  kakaoPhoneNumber: '01012345678',
  kakaoPicture: '',
  kakaoTerms: [
    {
      tag: 'terms_service',
      agreed_at: new Date().toISOString(),
    },
    {
      tag: 'terms_privacy',
      agreed_at: new Date().toISOString(),
    },
    {
      tag: 'consent_privacy',
      agreed_at: new Date().toISOString(),
    },
    {
      tag: 'user_age_check',
      agreed_at: new Date().toISOString(),
    },
    {
      tag: 'consent_marketing',
      agreed_at: new Date().toISOString(),
    },
  ],
};

admin.auth().setCustomUserClaims(userId, customClaims)
  .then(() => {
    console.log(`✅ 카카오 테스트용 customClaims 설정 완료: ${userId}`);
    console.log('   - name:', customClaims.kakaoName);
    console.log('   - gender:', customClaims.kakaoGender);
    console.log('   - birthdate:', customClaims.kakaoBirthdate);
    console.log('   - phoneNumber:', customClaims.kakaoPhoneNumber);
    console.log('   - terms:', customClaims.kakaoTerms.length, '개');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ customClaims 설정 실패:', err.message);
    process.exit(1);
  });

