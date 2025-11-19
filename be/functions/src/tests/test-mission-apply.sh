#!/bin/bash

###############################################################################
# 미션 신청 API 테스트 스크립트
#
# 사용법:
#   ./test-mission-apply.sh
#
# 필요사항:
#   - Firebase Functions Emulator 실행 중 (http://127.0.0.1:5001)
#   - Notion 미션 데이터가 준비되어 있고 missionId를 알고 있어야 함
#   - src/scripts/getIdToken.js 로컬 테스트용 계정 발급 가능
###############################################################################

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   미션 신청 API 테스트${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

BASE_URL="http://127.0.0.1:5001/youthvoice-2025/asia-northeast3/api"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FUNCTIONS_DIR="$SCRIPT_DIR/../.."
TEST_USER_ID="mission-test-$(date +%s)"

read -p "테스트할 missionId를 입력하세요: " MISSION_ID
if [ -z "$MISSION_ID" ]; then
  echo -e "${RED}❌ missionId가 필요합니다.${NC}"
  exit 1
fi

echo ""
echo -e "${YELLOW}📝 테스트 설정${NC}"
echo "  - API Base URL: $BASE_URL"
echo "  - Test User ID: $TEST_USER_ID"
echo "  - Mission ID:   $MISSION_ID"
echo ""

echo -e "${YELLOW}[1/3] 테스트용 ID 토큰 발급 중...${NC}"
cd "$FUNCTIONS_DIR"
TOKEN_OUTPUT=$(PRODUCTION=true node src/scripts/getIdToken.js "$TEST_USER_ID" 2>&1)
echo "$TOKEN_OUTPUT"
ID_TOKEN=$(echo "$TOKEN_OUTPUT" | grep -A 1 "⏬ ID_TOKEN" | tail -n 1 | xargs)

if [ -z "$ID_TOKEN" ]; then
  echo -e "${RED}❌ ID 토큰 발급 실패${NC}"
  exit 1
fi

echo -e "${GREEN}✅ ID 토큰 발급 완료${NC}"
echo ""

function call_apply_api() {
  local response_body http_status
  response_body=$(mktemp)
  http_status=$(curl -s -o "$response_body" -w "%{http_code}" \
    -X POST "$BASE_URL/missions/$MISSION_ID/apply" \
    -H "Authorization: Bearer $ID_TOKEN" \
    -H "Content-Type: application/json")

  echo "$http_status" "$response_body"
}

echo -e "${YELLOW}[2/3] 첫 번째 신청 시도 (성공 예상)...${NC}"
read HTTP_STATUS RESPONSE_FILE < <(call_apply_api)
cat "$RESPONSE_FILE" | jq '.' 2>/dev/null || cat "$RESPONSE_FILE"
FIRST_STATUS=$(cat "$RESPONSE_FILE" | jq -r '.status // 0' 2>/dev/null)

if [ "$HTTP_STATUS" != "201" ]; then
  echo -e "${RED}❌ 첫 신청이 201이 아닙니다 (HTTP $HTTP_STATUS)${NC}"
  rm -f "$RESPONSE_FILE"
  exit 1
fi

echo -e "${GREEN}✅ 첫 번째 신청 성공 (HTTP $HTTP_STATUS)${NC}"
rm -f "$RESPONSE_FILE"
echo ""

echo -e "${YELLOW}[3/3] 두 번째 신청 시도 (중복 신청 차단 예상)...${NC}"
read HTTP_STATUS RESPONSE_FILE < <(call_apply_api)
cat "$RESPONSE_FILE" | jq '.' 2>/dev/null || cat "$RESPONSE_FILE"

if [ "$HTTP_STATUS" != "409" ]; then
  echo -e "${RED}❌ 중복 신청 차단이 동작하지 않았습니다 (HTTP $HTTP_STATUS)${NC}"
  rm -f "$RESPONSE_FILE"
  exit 1
fi

ERROR_CODE=$(cat "$RESPONSE_FILE" | jq -r '.code // ""' 2>/dev/null)
if [ "$ERROR_CODE" != "MISSION_ALREADY_APPLIED" ]; then
  echo -e "${YELLOW}⚠️  예상과 다른 에러 코드: $ERROR_CODE${NC}"
else
  echo -e "${GREEN}✅ 중복 신청 차단 정상 동작 (HTTP $HTTP_STATUS)${NC}"
fi

rm -f "$RESPONSE_FILE"
echo ""

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 미션 신청 API 테스트 완료!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

