#!/bin/bash

###############################################################################
# 00:00 경계 케이스 테스트
# Usage: ./test-midnight-edge-case.sh
###############################################################################

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FUNCTIONS_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$FUNCTIONS_DIR"

# Inline Node.js 스크립트로 테스트 실행
node -e "
require('dotenv').config();
const { db, FieldValue, admin } = require('./src/config/database');

(async () => {
  console.log('\\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🌙 00:00 경계 케이스 테스트');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n');

  const testUserId = \`midnight-test-\${Date.now()}\`;

  try {
    console.log('1️⃣ 테스트 사용자 생성...');
    await admin.auth().createUser({
      uid: testUserId,
      email: \`\${testUserId}@test.example.com\`,
      emailVerified: true,
    });
    
    await db.collection('users').doc(testUserId).set({
      rewards: 0,
      createdAt: FieldValue.serverTimestamp(),
    });
    
    console.log(\`   ✅ 사용자 생성: \${testUserId}\\n\`);

    console.log('2️⃣ 테스트 데이터 생성 (UTC 기준)...');
    
    const testDate = new Date('2025-11-10T00:00:00.000Z');
    
    const testCases = [
      { time: new Date(testDate.getTime() + (23 * 3600 + 59 * 60 + 59) * 1000), label: '11/10 23:59:59 UTC' },
      { time: new Date(testDate.getTime() + 24 * 3600 * 1000), label: '11/11 00:00:00 UTC' },
      { time: new Date(testDate.getTime() + (24 * 3600 + 1) * 1000), label: '11/11 00:00:01 UTC' },
    ];

    for (const [idx, testCase] of testCases.entries()) {
      await db
        .collection(\`users/\${testUserId}/rewardsHistory\`)
        .doc(\`COMMENT:test-\${idx}\`)
        .set({
          actionKey: 'comment',
          amount: 1,
          changeType: 'add',
          createdAt: testCase.time,
          isProcessed: true,
        });
      
      console.log(\`   ✅ \${testCase.label}: \${testCase.time.toISOString()}\`);
    }
    console.log('');

    const nov10Start = new Date('2025-11-10T00:00:00.000Z');
    const nov11Start = new Date('2025-11-11T00:00:00.000Z');

    const nov10Count = await db
      .collection(\`users/\${testUserId}/rewardsHistory\`)
      .where('actionKey', '==', 'comment')
      .where('createdAt', '>=', nov10Start)
      .where('createdAt', '<', nov11Start)
      .get();

    console.log('3️⃣ 11/10 (UTC) 카운트:');
    console.log(\`   범위: \${nov10Start.toISOString()} ~ \${nov11Start.toISOString()}\`);
    console.log(\`   결과: \${nov10Count.size}개\`);
    console.log(\`   예상: 1개 (23:59:59만 포함)\`);
    console.log('');

    const nov12Start = new Date('2025-11-12T00:00:00.000Z');

    const nov11Count = await db
      .collection(\`users/\${testUserId}/rewardsHistory\`)
      .where('actionKey', '==', 'comment')
      .where('createdAt', '>=', nov11Start)
      .where('createdAt', '<', nov12Start)
      .get();

    console.log('4️⃣ 11/11 (UTC) 카운트:');
    console.log(\`   범위: \${nov11Start.toISOString()} ~ \${nov12Start.toISOString()}\`);
    console.log(\`   결과: \${nov11Count.size}개\`);
    console.log(\`   예상: 2개 (00:00:00, 00:00:01 포함)\`);
    console.log('');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 검증 결과');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const nov10Pass = nov10Count.size === 1;
    const nov11Pass = nov11Count.size === 2;
    
    console.log(\`11/10 카운트: \${nov10Count.size}개 \${nov10Pass ? '✅' : '❌'}\`);
    console.log(\`11/11 카운트: \${nov11Count.size}개 \${nov11Pass ? '✅' : '❌'}\`);
    console.log('');
    
    if (nov10Pass && nov11Pass) {
      console.log('✅ 00:00 경계 케이스 정상 작동!');
      console.log('   - 11/11 00:00은 11/11에만 카운트됨 (중복 없음)');
      console.log('   - 날짜 경계가 정확하게 작동함');
    } else {
      console.log('❌ 경계 케이스 오류 발견!');
      if (!nov10Pass) {
        console.log(\`   11/10 예상: 1개, 실제: \${nov10Count.size}개\`);
      }
      if (!nov11Pass) {
        console.log(\`   11/11 예상: 2개, 실제: \${nov11Count.size}개\`);
      }
    }
    console.log('');

    console.log('🧹 테스트 사용자 삭제 중...');
    await admin.auth().deleteUser(testUserId);
    await db.collection('users').doc(testUserId).delete();
    
    const historySnap = await db.collection(\`users/\${testUserId}/rewardsHistory\`).get();
    const batch = db.batch();
    historySnap.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    
    console.log('   ✅ 정리 완료\\n');

    process.exit(nov10Pass && nov11Pass ? 0 : 1);

  } catch (error) {
    console.error('\\n❌ 오류:', error.message);
    console.error(error);
    process.exit(1);
  }
})();
"

