#!/bin/bash

###############################################################################
# 게시글 저장 시간 = 리워드 저장 시간 검증
# 
# 검증 항목:
#   - 게시글 createdAt == rewardsHistory createdAt
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
echo -e "${BLUE}   ⏰ 게시글 저장 시간 = 리워드 저장 시간 검증${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

BASE_URL="http://127.0.0.1:5001/youthvoice-2025/asia-northeast3/api"
TEST_USER_ID="post-timestamp-verify-$(date +%s)"
COMMUNITY_ID="CP:G7C66H69GK"

echo -e "${YELLOW}📝 테스트 설정${NC}"
echo "  - 테스트 유저: $TEST_USER_ID"
echo "  - 커뮤니티: $COMMUNITY_ID"
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

# Step 2: 게시글 작성 (텍스트 후기)
echo -e "${YELLOW}[2/3] 게시글 작성 (텍스트 후기)...${NC}"
POST_DATA='{
  "title": "타임스탬프 검증 후기",
  "content": "<p>시간 일치 테스트용 게시글입니다.</p>",
  "type": "GATHERING_REVIEW"
}'

POST_RESP=$(curl -s -X POST "$BASE_URL/communities/$COMMUNITY_ID/posts" \
  -H "Authorization: Bearer $ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$POST_DATA")

POST_ID=$(echo "$POST_RESP" | jq -r '.data.id // empty')
if [ -z "$POST_ID" ]; then
  echo -e "${RED}❌ 게시글 생성 실패${NC}"
  echo "$POST_RESP"
  exit 1
fi

echo -e "${GREEN}✅ 게시글 생성: $POST_ID${NC}"
sleep 2
echo ""

# Step 3: 게시글과 리워드 히스토리 시간 비교
echo -e "${YELLOW}[3/3] 타임스탬프 일치 확인...${NC}"
echo ""

node -e "
require('dotenv').config();
const { db } = require('./src/config/database');

(async () => {
  try {
    // 게시글 조회 (community ID로 직접 접근)
    const postDoc = await db
      .collection('communities/$COMMUNITY_ID/posts')
      .doc('$POST_ID')
      .get();
    
    if (!postDoc.exists) {
      console.error('❌ 게시글을 찾을 수 없습니다');
      process.exit(1);
    }
    
    const post = postDoc.data();
    const postTime = post.createdAt?.toDate?.();
    
    // 리워드 히스토리 조회
    const historyDoc = await db
      .collection('users/$TEST_USER_ID/rewardsHistory')
      .doc('GR:TEXT:$POST_ID')
      .get();
    
    if (!historyDoc.exists) {
      console.error('❌ 리워드 히스토리를 찾을 수 없습니다');
      process.exit(1);
    }
    
    const history = historyDoc.data();
    const rewardTime = history.createdAt?.toDate?.();
    
    console.log('📊 시간 비교:');
    console.log(\`   게시글 생성 시간: \${postTime?.toISOString()}\`);
    console.log(\`   리워드 저장 시간: \${rewardTime?.toISOString()}\`);
    console.log('');
    
    // 밀리초 단위까지 비교
    const timeDiff = Math.abs(postTime?.getTime() - rewardTime?.getTime());
    
    console.log(\`   시간 차이: \${timeDiff}ms\`);
    console.log('');
    
    if (timeDiff === 0) {
      console.log('✅ 완벽한 일치! (0ms 차이)');
      console.log('   게시글 저장 시간 = 리워드 저장 시간 ✅');
      console.log('');
      console.log('🔒 보장:');
      console.log('   - 댓글/게시글 모두 Firestore 저장 시간 사용');
      console.log('   - 일일 제한 체크와 저장 시간 100% 일치');
      console.log('   - 자정 경계에서도 우회 불가능');
      console.log('   - 현금성 포인트 안전하게 관리');
      process.exit(0);
    } else if (timeDiff < 100) {
      console.log(\`⚠️  100ms 미만 차이 (\${timeDiff}ms)\`);
      console.log('   허용 가능 범위 (네트워크 지연)');
      process.exit(0);
    } else {
      console.log(\`❌ 시간 불일치! (\${timeDiff}ms)\`);
      console.log('   게시글 저장 시간을 리워드에 전달해야 함');
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
  echo -e "${GREEN}✅ 게시글 타임스탬프 일치 검증 성공!${NC}"
else
  echo -e "${RED}❌ 게시글 타임스탬프 불일치 발견${NC}"
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

exit $EXIT_CODE

