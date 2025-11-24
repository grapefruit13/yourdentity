#!/bin/bash
set -euo pipefail

###############################################################################
# 미션 댓글 조회 통합 테스트
# - getIdToken을 사용해 테스트 계정 생성/로그인
# - 닉네임 온보딩 후 미션 신청 → 인증글 작성 → 댓글 작성
# - 댓글 조회 API(GET /missions/posts/:postId/comments) 검증
#
# 사용법:
#   ./src/tests/test-mission-comment-fetch.sh <missionId>
#
# 환경 변수:
#   API_BASE_URL   기본값 http://127.0.0.1:5001/youthvoice-2025/asia-northeast3/api
#   USE_PRODUCTION true면 Auth는 프로덕션, Functions는 에뮬레이터 URL 그대로 사용
###############################################################################

PROJECT_ID="${PROJECT_ID:-youthvoice-2025}"
REGION="${REGION:-asia-northeast3}"
DEFAULT_API_BASE_URL="http://127.0.0.1:5001/${PROJECT_ID}/${REGION}/api"
API_BASE_URL="${API_BASE_URL:-$DEFAULT_API_BASE_URL}"
USE_PRODUCTION="${USE_PRODUCTION:-false}"

if [ $# -lt 1 ]; then
  echo "Usage: $0 <missionId>"
  exit 1
fi

MISSION_ID="$1"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FUNCTIONS_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
TEST_UID="mission-comment-fetch-$(date +%s)"
NICKNAME=$(printf "mcf%05d" $((RANDOM % 100000)))
POST_TITLE="댓글 조회 테스트 $(date +%H:%M:%S)"
POST_CONTENT="<p>댓글 조회 자동화 테스트 본문 - $(date +%s)</p>"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   미션 댓글 조회 API 통합 테스트${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "  API Base URL : $API_BASE_URL"
echo "  Mission ID   : $MISSION_ID"
echo "  Mode         : $( [ "$USE_PRODUCTION" = "true" ] && echo 'PRODUCTION' || echo 'EMULATOR' )"
echo ""

pretty_print() {
  local file="$1"
  if jq -e . >/dev/null 2>&1 <"$file"; then
    jq '.' <"$file"
  else
    cat "$file"
  fi
}

fail() {
  local message="$1"
  echo -e "${RED}❌ $message${NC}"
  exit 1
}

call_api() {
  local method="$1"
  local url="$2"
  local data="${3:-}"
  local token="${4:-}"

  local tmp
  tmp=$(mktemp)
  local status

  if [ -n "$token" ]; then
    if [ -n "$data" ]; then
      status=$(curl -s -o "$tmp" -w "%{http_code}" -X "$method" "$url" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $token" \
        -d "$data")
    else
      status=$(curl -s -o "$tmp" -w "%{http_code}" -X "$method" "$url" \
        -H "Authorization: Bearer $token")
    fi
  else
    if [ -n "$data" ]; then
      status=$(curl -s -o "$tmp" -w "%{http_code}" -X "$method" "$url" \
        -H "Content-Type: application/json" \
        -d "$data")
    else
      status=$(curl -s -o "$tmp" -w "%{http_code}" -X "$method" "$url")
    fi
  fi

  echo "$tmp $status"
}

wait_for_trigger() {
  echo -e "${YELLOW}⏳ 사용자 문서 생성을 위해 3초 대기...${NC}"
  sleep 3
}

echo -e "${YELLOW}[1/7] 테스트 사용자 ID 토큰 발급...${NC}"
pushd "$FUNCTIONS_DIR" >/dev/null
if [ "$USE_PRODUCTION" = "true" ]; then
  TOKEN_OUTPUT=$(PRODUCTION=true node src/scripts/getIdToken.js "$TEST_UID")
else
  TOKEN_OUTPUT=$(node src/scripts/getIdToken.js "$TEST_UID")
fi
popd >/dev/null

echo "$TOKEN_OUTPUT"
ID_TOKEN=$(echo "$TOKEN_OUTPUT" | grep -A 1 "⏬ ID_TOKEN" | tail -n 1 | xargs)
[ -n "$ID_TOKEN" ] || fail "ID 토큰을 파싱하지 못했습니다."
echo -e "${GREEN}✅ ID 토큰 발급 완료${NC}"
echo ""

wait_for_trigger

echo -e "${YELLOW}[2/7] 닉네임 온보딩...${NC}"
read -r BODY STATUS < <(call_api "PATCH" "$API_BASE_URL/users/me/onboarding" "{\"nickname\":\"$NICKNAME\"}" "$ID_TOKEN")
pretty_print "$BODY"
[ "$STATUS" = "200" ] || fail "온보딩 실패 (HTTP $STATUS)"
rm -f "$BODY"
echo -e "${GREEN}✅ 온보딩 완료${NC}"
echo ""

echo -e "${YELLOW}[3/7] 미션 신청...${NC}"
read -r BODY STATUS < <(call_api "POST" "$API_BASE_URL/missions/$MISSION_ID/apply" "" "$ID_TOKEN")
pretty_print "$BODY"
[ "$STATUS" = "201" ] || fail "미션 신청 실패 (HTTP $STATUS)"
rm -f "$BODY"
echo -e "${GREEN}✅ 미션 신청 성공${NC}"
echo ""

echo -e "${YELLOW}[4/7] 미션 인증글 작성...${NC}"
POST_PAYLOAD=$(jq -n --arg title "$POST_TITLE" --arg content "$POST_CONTENT" '{title: $title, content: $content}')
read -r BODY STATUS < <(call_api "POST" "$API_BASE_URL/missions/$MISSION_ID/posts" "$POST_PAYLOAD" "$ID_TOKEN")
pretty_print "$BODY"
[ "$STATUS" = "201" ] || fail "인증글 작성 실패 (HTTP $STATUS)"
POST_ID=$(jq -r '.data.postId // empty' <"$BODY")
[ -n "$POST_ID" ] || fail "postId 추출 실패"
rm -f "$BODY"
echo -e "${GREEN}✅ 인증글 작성 성공 (postId=$POST_ID)${NC}"
echo ""

echo -e "${YELLOW}[5/7] 댓글 작성...${NC}"
COMMENT_PAYLOAD='{"content":"<p>댓글 조회 테스트입니다.</p>"}'
read -r BODY STATUS < <(call_api "POST" "$API_BASE_URL/missions/posts/$POST_ID/comments" "$COMMENT_PAYLOAD" "$ID_TOKEN")
pretty_print "$BODY"
[ "$STATUS" = "201" ] || fail "댓글 작성 실패 (HTTP $STATUS)"
COMMENT_ID=$(jq -r '.data.id // empty' <"$BODY")
[ -n "$COMMENT_ID" ] || fail "댓글 ID 추출 실패"
rm -f "$BODY"
echo -e "${GREEN}✅ 댓글 작성 성공 (commentId=$COMMENT_ID)${NC}"
echo ""

echo -e "${YELLOW}[6/7] 댓글 목록 조회 (로그인 사용자)...${NC}"
read -r BODY STATUS < <(call_api "GET" "$API_BASE_URL/missions/posts/$POST_ID/comments" "" "$ID_TOKEN")
pretty_print "$BODY"
[ "$STATUS" = "200" ] || fail "댓글 목록 조회 실패 (HTTP $STATUS)"
LIST_COUNT=$(jq '.data.comments | length' <"$BODY")
FOUND_COMMENT=$(jq --arg cid "$COMMENT_ID" '.data.comments[] | select(.id == $cid)' <"$BODY" || true)
if [ -z "$FOUND_COMMENT" ]; then
  rm -f "$BODY"
  fail "댓글 목록에 방금 작성한 댓글이 존재하지 않습니다."
fi
IS_MINE=$(echo "$FOUND_COMMENT" | jq -r '.isMine // false')
if [ "$IS_MINE" != "true" ]; then
  rm -f "$BODY"
  fail "isMine 플래그가 true가 아닙니다."
fi
echo "댓글 개수: $LIST_COUNT"
rm -f "$BODY"
echo -e "${GREEN}✅ 댓글 목록 조회 성공${NC}"
echo ""

echo -e "${YELLOW}[7/7] 댓글 목록 조회 (비로그인) ...${NC}"
read -r BODY STATUS < <(call_api "GET" "$API_BASE_URL/missions/posts/$POST_ID/comments" "")
pretty_print "$BODY"
[ "$STATUS" = "200" ] || fail "비로그인 댓글 조회 실패 (HTTP $STATUS)"
rm -f "$BODY"
echo -e "${GREEN}✅ 비로그인 댓글 조회 성공${NC}"
echo ""

echo -e "${GREEN}🎉 모든 테스트가 성공적으로 완료되었습니다.${NC}"

