#!/usr/bin/env node

require('dotenv').config();
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

async function main() {
  const userId = process.argv[2] || 'reward-test-user';
  
  console.log(`\n📊 사용자 리워드 확인: ${userId}\n`);

  // 1. 사용자 정보 조회
  const userDoc = await db.collection('users').doc(userId).get();
  
  if (!userDoc.exists) {
    console.log('❌ 사용자를 찾을 수 없습니다.');
    process.exit(1);
  }

  const userData = userDoc.data();
  console.log(`현재 리워드: ${userData.rewards || 0} 포인트`);
  console.log(`레벨: ${userData.level || 1}`);
  console.log(`배지: ${(userData.badges || []).join(', ') || '없음'}`);

  // 2. 리워드 히스토리 조회
  console.log('\n📜 리워드 내역:');
  const historySnapshot = await db
    .collection(`users/${userId}/rewardsHistory`)
    .orderBy('createdAt', 'desc')
    .limit(10)
    .get();

  if (historySnapshot.empty) {
    console.log('  리워드 내역이 없습니다.');
  } else {
    historySnapshot.docs.forEach((doc, idx) => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate?.() || new Date();
      console.log(`\n  ${idx + 1}. ${doc.id}`);
      console.log(`     액션: ${data.actionKey}`);
      console.log(`     포인트: ${data.changeType === 'add' ? '+' : '-'}${data.amount}`);
      console.log(`     시간: ${createdAt.toLocaleString('ko-KR')}`);
      if (data.metadata) {
        console.log(`     메타: ${JSON.stringify(data.metadata)}`);
      }
    });
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main().then(() => process.exit(0)).catch(err => {
  console.error('오류:', err);
  process.exit(1);
});

