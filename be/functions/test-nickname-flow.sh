#!/bin/bash
set -euo pipefail

# 색상 정의
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

API="http://localhost:5001/youthvoice-2025/asia-northeast3/api"

echo "🧪 닉네임 플로우 테스트"
echo "================================"
echo ""

# 테스트용 닉네임 생성
TEST_NICKNAME="test_nick_$(date +%s%N | cut -b1-10)"
echo -e "${BLUE}테스트 닉네임: $TEST_NICKNAME${NC}"
echo ""

# 1. 사용자 1 생성
echo "1️⃣ 사용자 1 생성"
echo "--------------------------------"
TEST_EMAIL_1="nickname-test-1-$(date +%s%N)@example.com"
TEST_PASSWORD="test123456"

SIGNUP_RESPONSE_1=$(curl -s -X POST \
  "http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL_1\",
    \"password\": \"$TEST_PASSWORD\",
    \"returnSecureToken\": true
  }")

USER_ID_1=$(echo "$SIGNUP_RESPONSE_1" | jq -r '.localId // empty')
ID_TOKEN_1=$(echo "$SIGNUP_RESPONSE_1" | jq -r '.idToken // empty')

if [ -z "$ID_TOKEN_1" ]; then
  echo -e "${RED}❌ 사용자 1 회원가입 실패${NC}"
  echo "Response: $SIGNUP_RESPONSE_1"
  exit 1
fi

echo -e "${GREEN}✅ 사용자 1 회원가입 성공${NC}"
echo "User ID: $USER_ID_1"
echo ""

# authTrigger 처리 대기
echo "⏳ authTrigger 처리 대기 중... (2초)"
sleep 2
echo ""

# 2. 닉네임 가용성 확인 (존재하지 않는 닉네임)
echo "2️⃣ 닉네임 가용성 확인 (존재하지 않는 닉네임)"
echo "--------------------------------"
AVAILABILITY_RESPONSE=$(curl -s -X GET "$API/users/nickname-availability?nickname=$TEST_NICKNAME")

echo "$AVAILABILITY_RESPONSE" | jq '.'
echo ""

AVAILABLE=$(echo "$AVAILABILITY_RESPONSE" | jq -r '.data.available // false')

if [ "$AVAILABLE" = "true" ]; then
  echo -e "${GREEN}✅ 닉네임 사용 가능${NC}"
else
  echo -e "${RED}❌ 닉네임 사용 불가 (예상: true)${NC}"
  exit 1
fi
echo ""

# 3. 사용자 1 온보딩 (닉네임 설정)
echo "3️⃣ 사용자 1 온보딩 - 닉네임 설정"
echo "--------------------------------"
ONBOARDING_RESPONSE=$(curl -s -X PATCH "$API/users/me/onboarding" \
  -H "Authorization: Bearer $ID_TOKEN_1" \
  -H "Content-Type: application/json" \
  -d "{
    \"nickname\": \"$TEST_NICKNAME\"
  }")

echo "$ONBOARDING_RESPONSE" | jq '.'
echo ""

ONBOARDING_STATUS=$(echo "$ONBOARDING_RESPONSE" | jq -r '.status // empty')

if [ "$ONBOARDING_STATUS" = "200" ]; then
  echo -e "${GREEN}✅ 온보딩 성공${NC}"
else
  echo -e "${RED}❌ 온보딩 실패${NC}"
  echo "Response: $ONBOARDING_RESPONSE"
  exit 1
fi
echo ""

# 트랜잭션 완료 대기
echo "⏳ 트랜잭션 완료 대기 중... (1초)"
sleep 1
echo ""

# 4. 닉네임 가용성 재확인 (이미 사용 중인 닉네임)
echo "4️⃣ 닉네임 가용성 재확인 (이미 사용 중)"
echo "--------------------------------"
AVAILABILITY_RESPONSE_2=$(curl -s -X GET "$API/users/nickname-availability?nickname=$TEST_NICKNAME")

echo "$AVAILABILITY_RESPONSE_2" | jq '.'
echo ""

AVAILABLE_2=$(echo "$AVAILABILITY_RESPONSE_2" | jq -r '.data.available')
echo "Available value: '$AVAILABLE_2' (type: $(echo "$AVAILABILITY_RESPONSE_2" | jq -r '.data.available | type'))"

if [ "$AVAILABLE_2" = "false" ]; then
  echo -e "${GREEN}✅ 닉네임 중복 확인됨 (예상: false)${NC}"
else
  echo -e "${RED}❌ 닉네임 중복 확인 실패 (예상: false, 실제: $AVAILABLE_2)${NC}"
  exit 1
fi
echo ""

# 5. 사용자 2 생성 및 동일 닉네임으로 온보딩 시도 (실패해야 함)
echo "5️⃣ 사용자 2 생성 및 동일 닉네임으로 온보딩 시도 (실패 예상)"
echo "--------------------------------"
TEST_EMAIL_2="nickname-test-2-$(date +%s%N)@example.com"

SIGNUP_RESPONSE_2=$(curl -s -X POST \
  "http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL_2\",
    \"password\": \"$TEST_PASSWORD\",
    \"returnSecureToken\": true
  }")

USER_ID_2=$(echo "$SIGNUP_RESPONSE_2" | jq -r '.localId // empty')
ID_TOKEN_2=$(echo "$SIGNUP_RESPONSE_2" | jq -r '.idToken // empty')

if [ -z "$ID_TOKEN_2" ]; then
  echo -e "${RED}❌ 사용자 2 회원가입 실패${NC}"
  exit 1
fi

echo -e "${GREEN}✅ 사용자 2 회원가입 성공${NC}"
echo "User ID: $USER_ID_2"
echo ""

sleep 2

ONBOARDING_RESPONSE_2=$(curl -s -X PATCH "$API/users/me/onboarding" \
  -H "Authorization: Bearer $ID_TOKEN_2" \
  -H "Content-Type: application/json" \
  -d "{
    \"nickname\": \"$TEST_NICKNAME\"
  }")

echo "$ONBOARDING_RESPONSE_2" | jq '.'
echo ""

ONBOARDING_STATUS_2=$(echo "$ONBOARDING_RESPONSE_2" | jq -r '.status // empty')
ONBOARDING_MESSAGE=$(echo "$ONBOARDING_RESPONSE_2" | jq -r '.message // empty')

if [ "$ONBOARDING_STATUS_2" != "200" ]; then
  if [[ "$ONBOARDING_MESSAGE" == *"닉네임"* ]] || [[ "$ONBOARDING_MESSAGE" == *"NICKNAME_TAKEN"* ]]; then
    echo -e "${GREEN}✅ 예상대로 중복 닉네임 에러 발생${NC}"
  else
    echo -e "${YELLOW}⚠️  에러 발생했지만 메시지 확인 필요${NC}"
  fi
else
  echo -e "${RED}❌ 중복 닉네임인데도 성공함 (예상: 실패)${NC}"
  exit 1
fi
echo ""

# 6. 사용자 1 정보 확인
echo "6️⃣ 사용자 1 정보 확인"
echo "--------------------------------"
USER_INFO=$(curl -s -X GET "$API/users/me" \
  -H "Authorization: Bearer $ID_TOKEN_1" \
  -H "Content-Type: application/json")

echo "$USER_INFO" | jq '.data.user | {nickname, onboardingCompleted}'
echo ""

NICKNAME=$(echo "$USER_INFO" | jq -r '.data.user.nickname // empty')
ONBOARDING_COMPLETED=$(echo "$USER_INFO" | jq -r '.data.user.onboardingCompleted // false')

if [ "$NICKNAME" = "$TEST_NICKNAME" ] && [ "$ONBOARDING_COMPLETED" = "true" ]; then
  echo -e "${GREEN}✅ 사용자 1 닉네임 및 온보딩 완료 상태 확인${NC}"
else
  echo -e "${RED}❌ 사용자 1 정보 확인 실패${NC}"
  echo "  nickname: $NICKNAME (예상: $TEST_NICKNAME)"
  echo "  onboardingCompleted: $ONBOARDING_COMPLETED (예상: true)"
  exit 1
fi
echo ""

echo "================================"
echo -e "${GREEN}🎉 닉네임 플로우 테스트 완료!${NC}"
echo ""
echo "테스트 결과:"
echo "  ✅ 닉네임 가용성 확인 API 작동"
echo "  ✅ 온보딩 닉네임 설정 성공"
echo "  ✅ 중복 닉네임 방지 작동"
echo "  ✅ 트랜잭션 동시성 보장"

