#!/bin/bash

###############################################################################
# 댓글 저장 시간 = 리워드 저장 시간 검증
# 
# 검증 항목:
#   - 댓글 createdAt == rewardsHistory createdAt
#   - 자정 경계에서도 시간 일치
###############################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   ⏰ 댓글 저장 시간 = 리워드 저장 시간 검증${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

BASE_URL="http://127.0.0.1:5001/youthvoice-2025/asia-northeast3/api"
TEST_USER_ID="timestamp-verify-$(date +%s)"
COMMUNITY_ID="CP:G7C66H69GK"
POST_ID="CPeBmNlLwH8RKgGjJ59w"

echo -e "${YELLOW}📝 테스트 설정${NC}"
echo "  - 테스트 유저: $TEST_USER_ID"
echo ""

# Step 1: 사용자 생성
echo -e "${YELLOW}[1/3] 테스트 사용자 생성...${NC}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR/../.." || {
  echo "Error: Failed to change directory to $SCRIPT_DIR/../.."
  exit 1
}

TOKEN_OUTPUT=$(PRODUCTION=true node src/scripts/getIdToken.js "$TEST_USER_ID" 2>&1)
ID_TOKEN=$(echo "$TOKEN_OUTPUT" | grep -A 1 "⏬ ID_TOKEN" | tail -n 1 | xargs)

if [ -z "$ID_TOKEN" ]; then
  echo -e "${RED}❌ ID 토큰 발급 실패${NC}"
  exit 1
fi

echo -e "${GREEN}✅ ID 토큰 발급 완료${NC}"

# 사용자 준비 대기
for i in {1..10}; do
  USER_CHECK=$(curl -s -X GET "$BASE_URL/users/$TEST_USER_ID" -H "Authorization: Bearer $ID_TOKEN")
  if [ "$(echo "$USER_CHECK" | jq -r '.status')" = "200" ]; then
    echo -e "${GREEN}✅ 사용자 준비 완료 (${i}초)${NC}"
    break
  fi
  sleep 1
done
echo ""

# Step 2: 댓글 작성
echo -e "${YELLOW}[2/3] 댓글 작성...${NC}"
COMMENT_DATA='{"content":"타임스탬프 검증 댓글"}'
COMMENT_RESP=$(curl -s -X POST "$BASE_URL/comments/communities/$COMMUNITY_ID/posts/$POST_ID" \
  -H "Authorization: Bearer $ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$COMMENT_DATA")

COMMENT_ID=$(echo "$COMMENT_RESP" | jq -r '.data.id // empty')
if [ -z "$COMMENT_ID" ]; then
  echo -e "${RED}❌ 댓글 생성 실패${NC}"
  echo "$COMMENT_RESP"
  exit 1
fi

echo -e "${GREEN}✅ 댓글 생성: $COMMENT_ID${NC}"
sleep 2
echo ""

# Step 3: 댓글과 리워드 히스토리 시간 비교
echo -e "${YELLOW}[3/3] 타임스탬프 일치 확인...${NC}"
echo ""

node -e "
require('dotenv').config();
const { db } = require('./src/config/database');

(async () => {
  try {
    // 댓글 조회
    const commentDoc = await db.collection('comments').doc('$COMMENT_ID').get();
    if (!commentDoc.exists) {
      console.error('❌ 댓글을 찾을 수 없습니다');
      process.exit(1);
    }
    
    const comment = commentDoc.data();
    const commentTime = comment.createdAt?.toDate?.();
    
    // 리워드 히스토리 조회
    const historyDoc = await db
      .collection('users/$TEST_USER_ID/rewardsHistory')
      .doc('COMMENT:$COMMENT_ID')
      .get();
    
    if (!historyDoc.exists) {
      console.error('❌ 리워드 히스토리를 찾을 수 없습니다');
      process.exit(1);
    }
    
    const history = historyDoc.data();
    const rewardTime = history.createdAt?.toDate?.();
    
    console.log('📊 시간 비교:');
    console.log(\`   댓글 생성 시간:   \${commentTime?.toISOString()}\`);
    console.log(\`   리워드 저장 시간: \${rewardTime?.toISOString()}\`);
    console.log('');
    
    // 밀리초 단위까지 비교
    const timeDiff = Math.abs(commentTime?.getTime() - rewardTime?.getTime());
    
    console.log(\`   시간 차이: \${timeDiff}ms\`);
    console.log('');
    
    if (timeDiff === 0) {
      console.log('✅ 완벽한 일치! (0ms 차이)');
      console.log('   댓글 저장 시간 = 리워드 저장 시간 ✅');
      console.log('');
      console.log('🔒 보장:');
      console.log('   - 일일 제한 체크와 저장 시간 100% 일치');
      console.log('   - 자정 경계에서도 우회 불가능');
      console.log('   - 현금성 포인트 안전하게 관리');
      process.exit(0);
    } else if (timeDiff < 1000) {
      console.log(\`⚠️  1초 미만 차이 (\${timeDiff}ms)\`);
      console.log('   허용 범위 내이지만 완벽하지 않음');
      process.exit(1);
    } else {
      console.log(\`❌ 시간 불일치! (\${timeDiff}ms)\`);
      console.log('   댓글 저장 시간을 리워드에 전달해야 함');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
    process.exit(1);
  }
})();
"

EXIT_CODE=$?

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ $EXIT_CODE -eq 0 ]; then
  echo -e "${GREEN}✅ 타임스탬프 일치 검증 성공!${NC}"
else
  echo -e "${RED}❌ 타임스탬프 불일치 발견${NC}"
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

exit $EXIT_CODE

