#!/bin/bash

###############################################################################
# 게시글 작성 리워드 테스트 스크립트
# 
# 테스트 항목:
#   1. 소모임 후기글 (텍스트만) - 20 포인트
#   2. 소모임 후기글 (텍스트 + 사진) - 30 포인트
#   3. TMI 프로젝트 후기글 - 30 포인트
###############################################################################

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   게시글 작성 리워드 테스트${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 설정
BASE_URL="http://127.0.0.1:5001/youthvoice-2025/asia-northeast3/api"
TEST_USER_ID="post-reward-test-$(date +%s)"

# 커뮤니티 ID 입력
read -p "소모임 커뮤니티 ID를 입력하세요: " GATHERING_COMMUNITY_ID
read -p "TMI 커뮤니티 ID를 입력하세요: " TMI_COMMUNITY_ID

GATHERING_COMMUNITY_ID=${GATHERING_COMMUNITY_ID:-"CP:G7C66H69GK"}
TMI_COMMUNITY_ID=${TMI_COMMUNITY_ID:-"CP:I4U3J7TMO7"}

echo ""
echo -e "${YELLOW}📝 테스트 설정${NC}"
echo "  - 테스트 유저 ID: $TEST_USER_ID"
echo "  - 소모임 커뮤니티: $GATHERING_COMMUNITY_ID"
echo "  - TMI 커뮤니티: $TMI_COMMUNITY_ID"
echo ""

# Step 1: ID 토큰 발급
echo -e "${YELLOW}[1/6] ID 토큰 발급 중...${NC}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR/../.."

TOKEN_OUTPUT=$(PRODUCTION=true node src/scripts/getIdToken.js "$TEST_USER_ID" 2>&1)
ID_TOKEN=$(echo "$TOKEN_OUTPUT" | grep -A 1 "⏬ ID_TOKEN" | tail -n 1 | xargs)

if [ -z "$ID_TOKEN" ]; then
  echo -e "${RED}❌ ID 토큰 발급 실패${NC}"
  exit 1
fi

echo -e "${GREEN}✅ ID 토큰 발급 완료${NC}"
echo ""

# Step 2: 초기 리워드 확인
echo -e "${YELLOW}[2/6] 초기 리워드 확인...${NC}"
INITIAL_RESPONSE=$(curl -s -X GET "$BASE_URL/users/$TEST_USER_ID" -H "Authorization: Bearer $ID_TOKEN")
INITIAL_REWARDS=$(echo "$INITIAL_RESPONSE" | jq -r '.data.rewards // 0' 2>/dev/null || echo "0")
echo -e "${BLUE}초기 리워드: $INITIAL_REWARDS 포인트${NC}"
echo ""

# Step 3: 소모임 후기글 (텍스트만) 작성
echo -e "${YELLOW}[3/6] 소모임 후기글 (텍스트만) 작성...${NC}"
TEXT_POST_DATA='{
  "title": "테스트 후기",
  "content": "<p>소모임 참여 후기입니다. 정말 좋았어요!</p>",
  "type": "GATHERING_REVIEW",
  "media": []
}'

TEXT_POST_RESPONSE=$(curl -s -X POST "$BASE_URL/communities/$GATHERING_COMMUNITY_ID/posts" \
  -H "Authorization: Bearer $ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$TEXT_POST_DATA")

TEXT_POST_ID=$(echo "$TEXT_POST_RESPONSE" | jq -r '.data.id // empty' 2>/dev/null)

if [ -z "$TEXT_POST_ID" ]; then
  echo -e "${RED}❌ 텍스트 게시글 작성 실패${NC}"
  echo "$TEXT_POST_RESPONSE"
else
  echo -e "${GREEN}✅ 텍스트 게시글 작성 완료 (ID: $TEXT_POST_ID)${NC}"
  sleep 2
  
  CURRENT_RESPONSE=$(curl -s -X GET "$BASE_URL/users/$TEST_USER_ID" -H "Authorization: Bearer $ID_TOKEN")
  CURRENT_REWARDS=$(echo "$CURRENT_RESPONSE" | jq -r '.data.rewards // 0' 2>/dev/null || echo "0")
  echo -e "${BLUE}현재 리워드: $CURRENT_REWARDS 포인트 (+$((CURRENT_REWARDS - INITIAL_REWARDS)))${NC}"
fi
echo ""

# Step 4: 소모임 후기글 (사진 포함) 작성
echo -e "${YELLOW}[4/6] 소모임 후기글 (사진 포함) 작성...${NC}"
IMAGE_POST_DATA='{
  "title": "테스트 후기 (사진)",
  "content": "<p>사진과 함께 올리는 후기입니다!</p><img src=\"https://example.com/test.jpg\" width=\"1080\" height=\"1080\"/>",
  "type": "GATHERING_REVIEW",
  "media": []
}'

IMAGE_POST_RESPONSE=$(curl -s -X POST "$BASE_URL/communities/$GATHERING_COMMUNITY_ID/posts" \
  -H "Authorization: Bearer $ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$IMAGE_POST_DATA")

IMAGE_POST_ID=$(echo "$IMAGE_POST_RESPONSE" | jq -r '.data.id // empty' 2>/dev/null)

if [ -z "$IMAGE_POST_ID" ]; then
  echo -e "${RED}❌ 이미지 게시글 작성 실패${NC}"
  echo "$IMAGE_POST_RESPONSE"
else
  echo -e "${GREEN}✅ 이미지 게시글 작성 완료 (ID: $IMAGE_POST_ID)${NC}"
  sleep 2
  
  CURRENT_RESPONSE=$(curl -s -X GET "$BASE_URL/users/$TEST_USER_ID" -H "Authorization: Bearer $ID_TOKEN")
  CURRENT_REWARDS=$(echo "$CURRENT_RESPONSE" | jq -r '.data.rewards // 0' 2>/dev/null || echo "0")
  echo -e "${BLUE}현재 리워드: $CURRENT_REWARDS 포인트 (+$((CURRENT_REWARDS - INITIAL_REWARDS)))${NC}"
fi
echo ""

# Step 5: TMI 프로젝트 글 작성
echo -e "${YELLOW}[5/6] TMI 프로젝트 글 작성...${NC}"
TMI_POST_DATA='{
  "title": "TMI 프로젝트 후기",
  "content": "<p>TMI 프로젝트에 참여한 후기입니다!</p>",
  "type": "TMI",
  "media": []
}'

TMI_POST_RESPONSE=$(curl -s -X POST "$BASE_URL/communities/$TMI_COMMUNITY_ID/posts" \
  -H "Authorization: Bearer $ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$TMI_POST_DATA")

TMI_POST_ID=$(echo "$TMI_POST_RESPONSE" | jq -r '.data.id // empty' 2>/dev/null)

if [ -z "$TMI_POST_ID" ]; then
  echo -e "${RED}❌ TMI 게시글 작성 실패${NC}"
  echo "$TMI_POST_RESPONSE"
else
  echo -e "${GREEN}✅ TMI 게시글 작성 완료 (ID: $TMI_POST_ID)${NC}"
  sleep 2
  
  CURRENT_RESPONSE=$(curl -s -X GET "$BASE_URL/users/$TEST_USER_ID" -H "Authorization: Bearer $ID_TOKEN")
  CURRENT_REWARDS=$(echo "$CURRENT_RESPONSE" | jq -r '.data.rewards // 0' 2>/dev/null || echo "0")
  echo -e "${BLUE}현재 리워드: $CURRENT_REWARDS 포인트 (+$((CURRENT_REWARDS - INITIAL_REWARDS)))${NC}"
fi
echo ""

# Step 6: 최종 결과
echo -e "${YELLOW}[6/6] 최종 리워드 확인...${NC}"
FINAL_RESPONSE=$(curl -s -X GET "$BASE_URL/users/$TEST_USER_ID" -H "Authorization: Bearer $ID_TOKEN")
FINAL_REWARDS=$(echo "$FINAL_RESPONSE" | jq -r '.data.rewards // 0' 2>/dev/null || echo "0")

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   최종 테스트 결과${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "초기 리워드:  ${YELLOW}$INITIAL_REWARDS${NC}"
echo -e "최종 리워드:  ${YELLOW}$FINAL_REWARDS${NC}"
echo -e "증가량:       ${GREEN}+$((FINAL_REWARDS - INITIAL_REWARDS))${NC}"
echo ""

EXPECTED_TOTAL=80  # 20 + 30 + 30 = 80

if [ "$FINAL_REWARDS" -eq "$EXPECTED_TOTAL" ]; then
  echo -e "${GREEN}✅ 모든 게시글 리워드가 정상 부여되었습니다!${NC}"
  echo -e "${GREEN}   - 텍스트 후기: 20 포인트${NC}"
  echo -e "${GREEN}   - 사진 후기: 30 포인트${NC}"
  echo -e "${GREEN}   - TMI 글: 30 포인트${NC}"
else
  echo -e "${YELLOW}⚠️  예상 리워드: $EXPECTED_TOTAL 포인트${NC}"
  echo -e "${YELLOW}   실제 리워드: $FINAL_REWARDS 포인트${NC}"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

