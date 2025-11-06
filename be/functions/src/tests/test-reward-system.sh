#!/bin/bash

###############################################################################
# 리워드 시스템 테스트 스크립트
# 
# 사용법:
#   ./test-reward-system.sh
#
# 필요사항:
#   - Firebase Functions 실행 중 (http://127.0.0.1:5001)
#   - Notion 리워드 정책 DB 설정됨
#   - 테스트용 커뮤니티 & 게시글 존재
###############################################################################

set -e  # 에러 발생 시 중단

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   리워드 시스템 테스트${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 설정
BASE_URL="http://127.0.0.1:5001/youthvoice-2025/asia-northeast3/api"
TEST_USER_ID="reward-test-user-$(date +%s)"

# 테스트 데이터 (실제 데이터로 교체 필요)
# 기존 커뮤니티 & 게시글 ID를 입력하세요
read -p "커뮤니티 ID를 입력하세요 (엔터 시 기본값 사용): " COMMUNITY_ID
read -p "게시글 ID를 입력하세요 (엔터 시 기본값 사용): " POST_ID

COMMUNITY_ID=${COMMUNITY_ID:-"test-community"}
POST_ID=${POST_ID:-"test-post"}

echo ""
echo -e "${YELLOW}📝 테스트 설정${NC}"
echo "  - API Base URL: $BASE_URL"
echo "  - 테스트 유저 ID: $TEST_USER_ID"
echo "  - 커뮤니티 ID: $COMMUNITY_ID"
echo "  - 게시글 ID: $POST_ID"
echo ""

# Step 1: ID 토큰 발급
echo -e "${YELLOW}[1/5] ID 토큰 발급 중...${NC}"
cd /Users/hyerin/TechforImpact/yourdentity/be/functions
TOKEN_OUTPUT=$(PRODUCTION=true node src/scripts/getIdToken.js "$TEST_USER_ID" 2>&1)
echo "$TOKEN_OUTPUT"

# 토큰 추출
ID_TOKEN=$(echo "$TOKEN_OUTPUT" | grep -A 1 "⏬ ID_TOKEN" | tail -n 1 | xargs)

if [ -z "$ID_TOKEN" ]; then
  echo -e "${RED}❌ ID 토큰 발급 실패${NC}"
  exit 1
fi

echo -e "${GREEN}✅ ID 토큰 발급 완료${NC}"
echo ""

# Step 2: 사용자 초기 리워드 확인
echo -e "${YELLOW}[2/5] 사용자 초기 리워드 확인 중...${NC}"
INITIAL_RESPONSE=$(curl -s -X GET "$BASE_URL/users/$TEST_USER_ID" \
  -H "Authorization: Bearer $ID_TOKEN")

echo "$INITIAL_RESPONSE" | jq '.' 2>/dev/null || echo "$INITIAL_RESPONSE"
INITIAL_REWARDS=$(echo "$INITIAL_RESPONSE" | jq -r '.data.rewards // 0' 2>/dev/null || echo "0")
echo -e "${BLUE}초기 리워드: $INITIAL_REWARDS${NC}"
echo ""

# Step 3: 댓글 작성 (리워드 부여)
echo -e "${YELLOW}[3/5] 댓글 작성 중 (리워드 자동 부여)...${NC}"
COMMENT_DATA="{\"content\": \"리워드 테스트 댓글 - $(date +%Y-%m-%d\ %H:%M:%S)\"}"

COMMENT_RESPONSE=$(curl -s -X POST "$BASE_URL/communities/$COMMUNITY_ID/posts/$POST_ID/comments" \
  -H "Authorization: Bearer $ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$COMMENT_DATA")

echo "$COMMENT_RESPONSE" | jq '.' 2>/dev/null || echo "$COMMENT_RESPONSE"

COMMENT_ID=$(echo "$COMMENT_RESPONSE" | jq -r '.data.id // empty' 2>/dev/null)

if [ -z "$COMMENT_ID" ]; then
  echo -e "${RED}❌ 댓글 작성 실패${NC}"
  echo "$COMMENT_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ 댓글 작성 완료 (ID: $COMMENT_ID)${NC}"
echo ""

# Step 4: 리워드 부여 대기 (비동기 처리)
echo -e "${YELLOW}[4/5] 리워드 부여 처리 대기 중 (3초)...${NC}"
sleep 3
echo ""

# Step 5: 사용자 최종 리워드 확인
echo -e "${YELLOW}[5/5] 사용자 최종 리워드 확인 중...${NC}"
FINAL_RESPONSE=$(curl -s -X GET "$BASE_URL/users/$TEST_USER_ID" \
  -H "Authorization: Bearer $ID_TOKEN")

echo "$FINAL_RESPONSE" | jq '.' 2>/dev/null || echo "$FINAL_RESPONSE"
FINAL_REWARDS=$(echo "$FINAL_RESPONSE" | jq -r '.data.rewards // 0' 2>/dev/null || echo "0")
echo -e "${BLUE}최종 리워드: $FINAL_REWARDS${NC}"
echo ""

# 결과 비교
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   테스트 결과${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "초기 리워드:  ${YELLOW}$INITIAL_REWARDS${NC}"
echo -e "최종 리워드:  ${YELLOW}$FINAL_REWARDS${NC}"

REWARD_DIFF=$((FINAL_REWARDS - INITIAL_REWARDS))
echo -e "증가량:       ${GREEN}+$REWARD_DIFF${NC}"
echo ""

if [ "$REWARD_DIFF" -gt 0 ]; then
  echo -e "${GREEN}✅ 리워드 시스템 정상 작동!${NC}"
  echo -e "${GREEN}   댓글 작성 시 $REWARD_DIFF 포인트가 자동으로 부여되었습니다.${NC}"
else
  echo -e "${RED}❌ 리워드 부여 실패${NC}"
  echo -e "${YELLOW}   가능한 원인:${NC}"
  echo -e "   - Notion DB에 'comment_create' 정책이 없거나 비활성화됨"
  echo -e "   - 환경변수 NOTION_REWARD_POLICY_DB_ID가 잘못 설정됨"
  echo -e "   - 중복 방지로 인해 이미 부여된 리워드"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

