#!/bin/bash

###############################################################################
# 댓글 일일 제한 엣지 케이스 테스트
# 
# 테스트 시나리오:
#   1. 5개까지 정상 부여
#   2. 6번째부터 제한
#   3. 00:00 경계 케이스
###############################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   댓글 일일 제한 엣지 케이스 테스트${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

BASE_URL="http://127.0.0.1:5001/youthvoice-2025/asia-northeast3/api"
TEST_USER_ID="comment-limit-edge-$(date +%s)"

echo -e "${YELLOW}📝 테스트 설정${NC}"
echo "  - 테스트 유저: $TEST_USER_ID"
echo ""

# Step 1: 사용자 생성
echo -e "${YELLOW}[1/3] 테스트 사용자 생성 중...${NC}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR/../.."

TOKEN_OUTPUT=$(PRODUCTION=true node src/scripts/getIdToken.js "$TEST_USER_ID" 2>&1)
ID_TOKEN=$(echo "$TOKEN_OUTPUT" | grep -A 1 "⏬ ID_TOKEN" | tail -n 1 | xargs)

if [ -z "$ID_TOKEN" ]; then
  echo -e "${RED}❌ ID 토큰 발급 실패${NC}"
  exit 1
fi

echo -e "${GREEN}✅ ID 토큰 발급 완료${NC}"

# 사용자 문서 생성 대기
echo "   사용자 문서 생성 대기 중..."
for i in {1..10}; do
  USER_CHECK=$(curl -s -X GET "$BASE_URL/users/$TEST_USER_ID" -H "Authorization: Bearer $ID_TOKEN")
  if [ "$(echo "$USER_CHECK" | jq -r '.status')" = "200" ]; then
    echo -e "${GREEN}   ✅ 사용자 준비 완료 (${i}초)${NC}"
    break
  fi
  sleep 1
done
echo ""

# Step 2: 댓글 5개 작성 (제한까지)
echo -e "${YELLOW}[2/3] 댓글 5개 작성 (제한까지)...${NC}"

for i in {1..5}; do
  echo "   [$i/5] 댓글 작성 중..."
  COMMENT_RESP=$(curl -s -X POST "$BASE_URL/comments/communities/CP:G7C66H69GK/posts/CPeBmNlLwH8RKgGjJ59w" \
    -H "Authorization: Bearer $ID_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"content\":\"댓글 #$i\"}")
  
  STATUS=$(echo "$COMMENT_RESP" | jq -r '.status')
  if [ "$STATUS" != "201" ]; then
    echo -e "${RED}   ❌ 댓글 작성 실패${NC}"
    exit 1
  fi
  
  sleep 0.5
done

AFTER_5=$(curl -s "$BASE_URL/users/$TEST_USER_ID" -H "Authorization: Bearer $ID_TOKEN" | jq -r '.data.rewards')
echo -e "${GREEN}   ✅ 5개 작성 완료 → 리워드: $AFTER_5 포인트${NC}"
echo ""

# Step 3: 6번째 댓글 작성 시도 (제한 초과)
echo -e "${YELLOW}[3/3] 6번째 댓글 작성 (제한 초과 테스트)...${NC}"

COMMENT_6=$(curl -s -X POST "$BASE_URL/comments/communities/CP:G7C66H69GK/posts/CPeBmNlLwH8RKgGjJ59w" \
  -H "Authorization: Bearer $ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"댓글 #6 (제한 초과)"}')

STATUS_6=$(echo "$COMMENT_6" | jq -r '.status')
COMMENT_ID_6=$(echo "$COMMENT_6" | jq -r '.data.id // empty')

if [ "$STATUS_6" = "201" ] && [ -n "$COMMENT_ID_6" ]; then
  echo -e "${GREEN}   ✅ 댓글 #6 생성 성공 (ID: $COMMENT_ID_6)${NC}"
else
  echo -e "${RED}   ❌ 댓글 #6 생성 실패${NC}"
  exit 1
fi

sleep 1
AFTER_6=$(curl -s "$BASE_URL/users/$TEST_USER_ID" -H "Authorization: Bearer $ID_TOKEN" | jq -r '.data.rewards')

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   테스트 결과${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "5개 작성 후:  ${YELLOW}$AFTER_5 포인트${NC}"
echo -e "6개 작성 후:  ${YELLOW}$AFTER_6 포인트${NC}"
echo -e "차이:         ${YELLOW}$((AFTER_6 - AFTER_5)) 포인트${NC}"
echo ""

if [ "$AFTER_5" -eq 5 ] && [ "$AFTER_6" -eq 5 ]; then
  echo -e "${GREEN}✅ 일일 제한 정상 작동!${NC}"
  echo -e "${GREEN}   - 5개까지만 리워드 부여됨${NC}"
  echo -e "${GREEN}   - 6번째는 댓글 생성되지만 리워드 미부여${NC}"
elif [ "$AFTER_6" -eq 6 ]; then
  echo -e "${RED}❌ 제한 미작동! 6개 모두 리워드 부여됨${NC}"
else
  echo -e "${YELLOW}⚠️  예상과 다른 결과${NC}"
  echo -e "${YELLOW}   예상: 5 포인트, 실제: $AFTER_6 포인트${NC}"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# 히스토리 확인
echo ""
echo -e "${BLUE}📜 rewardsHistory 확인${NC}"
node -e "
require('dotenv').config();
const { db } = require('./src/config/database');

(async () => {
  const snap = await db.collection('users/$TEST_USER_ID/rewardsHistory')
    .where('actionKey', '==', 'comment')
    .orderBy('createdAt', 'asc')
    .get();
  
  console.log(\`총 \${snap.size}개 기록\n\`);
  
  snap.forEach((doc, i) => {
    const data = doc.data();
    const time = data.createdAt?.toDate?.();
    console.log(\`\${i+1}. \${doc.id.substring(0, 50)}...\`);
    console.log(\`   amount: \${data.amount}, time: \${time?.toISOString()}\`);
  });
})();
"

echo ""

