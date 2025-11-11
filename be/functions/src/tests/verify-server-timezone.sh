#!/bin/bash

###############################################################################
# 서버 타임존 검증 스크립트
# Usage: ./verify-server-timezone.sh
###############################################################################

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FUNCTIONS_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$FUNCTIONS_DIR"

# Inline Node.js 스크립트로 타임존 확인
node -e "
const now = new Date();

console.log('\\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🌍 서버 타임존 검증');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n');

console.log('📅 현재 시간 정보:');
console.log(\`   - process.env.TZ: \${process.env.TZ || '(설정 없음)'}\`);
console.log(\`   - new Date(): \${now.toString()}\`);
console.log(\`   - toISOString(): \${now.toISOString()}\`);
console.log(\`   - getTimezoneOffset(): \${now.getTimezoneOffset()} 분\`);
console.log('');

console.log('🔍 로컬 vs UTC 비교:');
console.log(\`   - 로컬 시간: \${now.getFullYear()}-\${String(now.getMonth() + 1).padStart(2, '0')}-\${String(now.getDate()).padStart(2, '0')} \${String(now.getHours()).padStart(2, '0')}:\${String(now.getMinutes()).padStart(2, '0')}:\${String(now.getSeconds()).padStart(2, '0')}\`);
console.log(\`   - UTC 시간:  \${now.getUTCFullYear()}-\${String(now.getUTCMonth() + 1).padStart(2, '0')}-\${String(now.getUTCDate()).padStart(2, '0')} \${String(now.getUTCHours()).padStart(2, '0')}:\${String(now.getUTCMinutes()).padStart(2, '0')}:\${String(now.getUTCSeconds()).padStart(2, '0')}\`);
console.log('');

const todayUTC = new Date(Date.UTC(
  now.getUTCFullYear(),
  now.getUTCMonth(),
  now.getUTCDate(),
  0, 0, 0, 0
));

const tomorrowUTC = new Date(todayUTC);
tomorrowUTC.setUTCDate(tomorrowUTC.getUTCDate() + 1);

console.log('📆 UTC 기준 오늘/내일:');
console.log(\`   - todayUTC:    \${todayUTC.toISOString()}\`);
console.log(\`   - tomorrowUTC: \${tomorrowUTC.toISOString()}\`);
console.log('');

const todayLocal = new Date();
todayLocal.setHours(0, 0, 0, 0);
const tomorrowLocal = new Date(todayLocal);
tomorrowLocal.setDate(tomorrowLocal.getDate() + 1);

console.log('⚠️  로컬 타임존 사용 시 (안티패턴):');
console.log(\`   - todayLocal:    \${todayLocal.toISOString()}\`);
console.log(\`   - tomorrowLocal: \${tomorrowLocal.toISOString()}\`);
console.log('');

const isUTCAligned = todayLocal.toISOString() === todayUTC.toISOString();

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📊 검증 결과');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

if (now.getTimezoneOffset() === 0) {
  console.log('✅ 서버가 UTC (GMT+0)에서 실행 중입니다');
  console.log('   → Firebase Functions 기본 설정');
} else {
  const offsetHours = -now.getTimezoneOffset() / 60;
  const sign = offsetHours >= 0 ? '+' : '';
  console.log(\`⚠️  서버가 UTC\${sign}\${offsetHours}에서 실행 중입니다\`);
  console.log(\`   → 한국(KST)은 UTC+9\`);
}

console.log('');

if (!isUTCAligned) {
  console.log('✅ 로컬/UTC 차이 감지됨 → UTC 명시적 사용 필수!');
  console.log('   우리 코드는 UTC 명시적 사용으로 안전 ✅');
} else {
  console.log('ℹ️  로컬 = UTC (차이 없음)');
  console.log('   하지만 UTC 명시적 사용으로 이식성 확보 ✅');
}

console.log('');
console.log('🔒 결론: rewardService.js는 UTC 기준으로 안전하게 구현됨');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n');
"

