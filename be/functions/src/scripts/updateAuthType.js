const admin = require('firebase-admin');

// Emulator 환경 설정
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

if (!admin.apps.length) {
  admin.initializeApp({ projectId: 'youthvoice-2025' });
}

const userId = process.argv[2];
const authType = process.argv[3] || 'sns';
const snsProvider = process.argv[4] || 'kakao';

if (!userId) {
  console.error('❌ Usage: node updateAuthType.js <userId> [authType] [snsProvider]');
  process.exit(1);
}

const updateData = {
  authType,
};

if (authType === 'sns') {
  updateData.snsProvider = snsProvider;
  updateData.name = '카카오유저';
} else {
  updateData.snsProvider = null;
}

admin.firestore().collection('users').doc(userId).update(updateData)
    .then(() => {
      console.log(`✅ authType 변경 완료: ${authType}${authType === 'sns' ? ` (${snsProvider})` : ''}`);
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ 변경 실패:', err.message);
      process.exit(1);
    });

