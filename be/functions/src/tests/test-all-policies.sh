#!/bin/bash

# 모든 리워드 정책 확인 테스트
# Usage: ./test-all-policies.sh

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 전체 리워드 정책 확인"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FUNCTIONS_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$FUNCTIONS_DIR"

# 모든 정책 조회
node -e "
require('dotenv').config();
const RewardService = require('./src/services/rewardService');

const policies = [
  '댓글 작성',
  '소모임 후기글 (텍스트 포함)',
  '소모임 후기글 (텍스트, 사진 포함)',
  'TMI 프로젝트 후기글',
];

(async () => {
  try {
    const service = new RewardService();
    
    console.log('🔍 Notion 정책 조회 중...\n');
    
    let allSuccess = true;
    
    for (const actionKey of policies) {
      const reward = await service.getRewardByAction(actionKey);
      
      const status = reward > 0 ? '✅' : '❌';
      const message = reward > 0 
        ? \`\${reward} 포인트\` 
        : '정책 없음 또는 적용 전';
      
      console.log(\`  \${status} \${actionKey}: \${message}\`);
      
      if (reward === 0) {
        allSuccess = false;
      }
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    if (allSuccess) {
      console.log('✅ 모든 정책이 정상 설정되어 있습니다!');
    } else {
      console.log('⚠️  일부 정책이 누락되었거나 적용 전 상태입니다.');
      console.log('   Notion DB에서 다음을 확인해주세요:');
      console.log('   1. 사용자 행동 필드에 정확한 텍스트 입력');
      console.log('   2. 정책 적용 상태 = \"적용 완료\"');
      console.log('   3. 나다움 필드에 숫자 값 입력');
    }
    
    process.exit(allSuccess ? 0 : 1);
  } catch (err) {
    console.error('❌ 오류:', err.message);
    process.exit(1);
  }
})();
"

EXIT_CODE=$?

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ 전체 정책 확인 성공"
else
  echo "❌ 일부 정책 누락 또는 설정 오류"
fi

exit $EXIT_CODE

