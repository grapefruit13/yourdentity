#!/bin/bash

###############################################################################
# 댓글 일일 제한 동시성 테스트 (Race Condition 검증)
# 
# 테스트 시나리오:
#   1. 4개 순차 작성 → 4 포인트
#   2. 2개 동시 발사 → 1개만 리워드 (총 5 포인트)
#   3. 7번째 작성 → 리워드 미부여 (총 5 포인트 유지)
#   
# 검증 포인트:
#   - Firestore 트랜잭션 충돌 감지
#   - dailyRewardCounters 카운터 방식 동시성 처리
#   - Race Condition 완벽 방지
###############################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   댓글 일일 제한 동시성 테스트 (Race Condition)${NC}"
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

# Step 2: 댓글 4개 작성 (순차적)
echo -e "${YELLOW}[2/4] 댓글 4개 작성 (순차적)...${NC}"

for i in {1..4}; do
  echo "   [$i/4] 댓글 작성 중..."
  COMMENT_RESP=$(curl -s -X POST "$BASE_URL/comments/communities/CP:G7C66H69GK/posts/CPeBmNlLwH8RKgGjJ59w" \
    -H "Authorization: Bearer $ID_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"content\":\"댓글 #$i\"}")
  
  STATUS=$(echo "$COMMENT_RESP" | jq -r '.status')
  if [ "$STATUS" != "201" ]; then
    echo -e "${RED}   ❌ 댓글 작성 실패${NC}"
    exit 1
  fi
  
  sleep 0.3
done

AFTER_4=$(curl -s "$BASE_URL/users/$TEST_USER_ID" -H "Authorization: Bearer $ID_TOKEN" | jq -r '.data.rewards')
echo -e "${GREEN}   ✅ 4개 작성 완료 → 리워드: $AFTER_4 포인트${NC}"
echo ""

# Step 3: 댓글 2개 동시 작성 (Race Condition 테스트)
echo -e "${YELLOW}[3/4] 댓글 2개 동시 작성 (Race Condition 테스트)...${NC}"
echo -e "   ${YELLOW}⚡ 동시에 2개 요청 발사!${NC}"

# 임시 파일로 결과 저장
TMP_DIR=$(mktemp -d)
COMMENT_5_FILE="$TMP_DIR/comment_5.json"
COMMENT_6_FILE="$TMP_DIR/comment_6.json"

# 백그라운드로 동시 실행
curl -s -X POST "$BASE_URL/comments/communities/CP:G7C66H69GK/posts/CPeBmNlLwH8RKgGjJ59w" \
  -H "Authorization: Bearer $ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"댓글 #5 (동시)"}' > "$COMMENT_5_FILE" &

curl -s -X POST "$BASE_URL/comments/communities/CP:G7C66H69GK/posts/CPeBmNlLwH8RKgGjJ59w" \
  -H "Authorization: Bearer $ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"댓글 #6 (동시)"}' > "$COMMENT_6_FILE" &

# 두 요청 모두 완료될 때까지 대기
wait

STATUS_5=$(cat "$COMMENT_5_FILE" | jq -r '.status')
STATUS_6=$(cat "$COMMENT_6_FILE" | jq -r '.status')
COMMENT_ID_5=$(cat "$COMMENT_5_FILE" | jq -r '.data.id // empty')
COMMENT_ID_6=$(cat "$COMMENT_6_FILE" | jq -r '.data.id // empty')

# 정리
rm -rf "$TMP_DIR"

if [ "$STATUS_5" = "201" ] && [ -n "$COMMENT_ID_5" ]; then
  echo -e "${GREEN}   ✅ 댓글 #5 생성 성공 (ID: $COMMENT_ID_5)${NC}"
else
  echo -e "${RED}   ❌ 댓글 #5 생성 실패${NC}"
fi

if [ "$STATUS_6" = "201" ] && [ -n "$COMMENT_ID_6" ]; then
  echo -e "${GREEN}   ✅ 댓글 #6 생성 성공 (ID: $COMMENT_ID_6)${NC}"
else
  echo -e "${RED}   ❌ 댓글 #6 생성 실패${NC}"
fi

sleep 2
AFTER_6=$(curl -s "$BASE_URL/users/$TEST_USER_ID" -H "Authorization: Bearer $ID_TOKEN" | jq -r '.data.rewards')
echo ""

# Step 4: 추가 검증용 7번째 댓글
echo -e "${YELLOW}[4/4] 7번째 댓글 작성 (추가 검증)...${NC}"

COMMENT_7=$(curl -s -X POST "$BASE_URL/comments/communities/CP:G7C66H69GK/posts/CPeBmNlLwH8RKgGjJ59w" \
  -H "Authorization: Bearer $ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"댓글 #7 (검증)"}')

STATUS_7=$(echo "$COMMENT_7" | jq -r '.status')
COMMENT_ID_7=$(echo "$COMMENT_7" | jq -r '.data.id // empty')

if [ "$STATUS_7" = "201" ] && [ -n "$COMMENT_ID_7" ]; then
  echo -e "${GREEN}   ✅ 댓글 #7 생성 성공 (ID: $COMMENT_ID_7)${NC}"
fi

sleep 1
AFTER_7=$(curl -s "$BASE_URL/users/$TEST_USER_ID" -H "Authorization: Bearer $ID_TOKEN" | jq -r '.data.rewards')

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   테스트 결과 (Race Condition 검증)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "4개 작성 후:    ${YELLOW}$AFTER_4 포인트${NC}"
echo -e "6개 작성 후:    ${YELLOW}$AFTER_6 포인트${NC} (동시 2개 포함)"
echo -e "7개 작성 후:    ${YELLOW}$AFTER_7 포인트${NC}"
echo ""

# 검증 로직
if [ "$AFTER_4" -eq 4 ] && [ "$AFTER_6" -eq 5 ] && [ "$AFTER_7" -eq 5 ]; then
  echo -e "${GREEN}✅ Race Condition 방지 성공!${NC}"
  echo -e "${GREEN}   - 4개 순차 작성: 4 포인트 ✅${NC}"
  echo -e "${GREEN}   - 동시 2개 발사: 1개만 리워드 부여 ✅${NC}"
  echo -e "${GREEN}   - 최종: 5 포인트 (제한 작동) ✅${NC}"
  echo -e "${GREEN}   - 7번째 댓글: 리워드 미부여 ✅${NC}"
  echo ""
  echo -e "${GREEN}🎯 Firestore 트랜잭션이 동시성을 제대로 처리했습니다!${NC}"
elif [ "$AFTER_6" -eq 6 ]; then
  echo -e "${RED}❌ Race Condition 발생!${NC}"
  echo -e "${RED}   동시에 발사한 2개가 모두 리워드를 받았습니다${NC}"
  echo -e "${RED}   트랜잭션 충돌 감지가 실패했습니다${NC}"
else
  echo -e "${YELLOW}⚠️  예상과 다른 결과${NC}"
  echo -e "${YELLOW}   예상: 4→5→5, 실제: $AFTER_4→$AFTER_6→$AFTER_7${NC}"
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

