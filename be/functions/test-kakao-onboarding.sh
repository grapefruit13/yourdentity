#!/bin/bash

# 색상 정의
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API="http://localhost:5001/youthvoice-2025/asia-northeast3/api"
TEST_EMAIL="kakao-test-$(date +%s%N)@example.com"
TEST_PASSWORD="kakao123456"

echo "🧪 카카오 온보딩 테스트 (SNS 제공자)"
echo "================================"
echo ""

# 1. 이메일 회원가입 (나중에 authType을 변경할 예정)
echo "1️⃣ 테스트 계정 생성 (이메일 → SNS로 변경 예정)"
echo "--------------------------------"

SIGNUP_RESPONSE=$(curl -s -X POST \
  "http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"returnSecureToken\": true
  }")

USER_ID=$(echo "$SIGNUP_RESPONSE" | jq -r '.localId // empty')
ID_TOKEN=$(echo "$SIGNUP_RESPONSE" | jq -r '.idToken // empty')

if [ -z "$ID_TOKEN" ]; then
  echo -e "${RED}❌ 회원가입 실패${NC}"
  echo "Response: $SIGNUP_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ 회원가입 성공${NC}"
echo "User ID: $USER_ID"
echo ""

# 2초 대기 (authTrigger 처리 대기)
echo "⏳ authTrigger 처리 대기 중... (2초)"
sleep 2
echo ""

# 2. Firestore에서 authType을 sns로 변경 (카카오 로그인 시뮬레이션)
echo "2️⃣ authType을 'sns'로 변경 (카카오 시뮬레이션)"
echo "--------------------------------"

if ! node src/scripts/updateAuthType.js "$USER_ID" "sns" "kakao"; then
  echo -e "${RED}❌ authType 변경 실패${NC}"
  echo "updateAuthType.js 스크립트 실행에 실패했습니다."
  exit 1
fi
echo ""

# 3. 사용자 정보 확인
echo "3️⃣ 사용자 정보 확인 (authType: sns 확인)"
echo "--------------------------------"
USER_INFO=$(curl -s -X GET "$API/users/me" \
  -H "Authorization: Bearer $ID_TOKEN" \
  -H "Content-Type: application/json")

echo "$USER_INFO" | jq '.data.user | {name, authType, snsProvider, onboardingCompleted, status}'
echo ""

# 4. 카카오 온보딩 - nickname만 제출 (성공 예상)
echo "4️⃣ 카카오 온보딩 - nickname만 제출 (성공 예상)"
echo "--------------------------------"
NICKNAME="kakao_user_$(date +%s%N)"
echo "Generated nickname: $NICKNAME"
ONBOARDING_SUCCESS=$(curl -s -X PATCH "$API/users/me/onboarding" \
  -H "Authorization: Bearer $ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"nickname\": \"$NICKNAME\"
  }")

echo "$ONBOARDING_SUCCESS" | jq '.'
echo ""

# 5. 최종 사용자 정보 확인
echo "5️⃣ 최종 사용자 정보 확인"
echo "--------------------------------"
FINAL_USER=$(curl -s -X GET "$API/users/me" \
  -H "Authorization: Bearer $ID_TOKEN" \
  -H "Content-Type: application/json")

echo "$FINAL_USER" | jq '.data.user | {name, nickname, authType, snsProvider, onboardingCompleted}'
echo ""

FINAL_ONBOARDING=$(echo "$FINAL_USER" | jq -r '.data.user.onboardingCompleted')

if [ "$FINAL_ONBOARDING" = "true" ]; then
  echo -e "${GREEN}✅ 카카오 온보딩 테스트 성공!${NC}"
else
  echo -e "${RED}❌ 온보딩 완료 플래그 오류${NC}"
fi

# 6. 최종 확인
echo ""
echo "6️⃣ 최종 사용자 정보 확인"
echo "--------------------------------"
FINAL_CHECK=$(curl -s -X GET "$API/users/me" \
  -H "Authorization: Bearer $ID_TOKEN" \
  -H "Content-Type: application/json")

echo "$FINAL_CHECK" | jq '.data.user | {nickname, phoneNumber, onboardingCompleted}'

echo ""
echo "================================"
echo "🎉 카카오 온보딩 테스트 완료"

