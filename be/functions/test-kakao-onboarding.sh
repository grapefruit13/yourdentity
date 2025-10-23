#!/bin/bash

# 색상 정의
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API="http://localhost:5001/youthvoice-2025/asia-northeast3/api"
TEST_EMAIL="kakao-test@example.com"
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

USER_ID=$(echo $SIGNUP_RESPONSE | grep -o '"localId":"[^"]*' | cut -d'"' -f4)
ID_TOKEN=$(echo $SIGNUP_RESPONSE | grep -o '"idToken":"[^"]*' | cut -d'"' -f4)

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

node src/scripts/updateAuthType.js "$USER_ID" "sns" "kakao"
echo ""

# 3. 사용자 정보 확인
echo "3️⃣ 사용자 정보 확인 (authType: sns 확인)"
echo "--------------------------------"
USER_INFO=$(curl -s -X GET "$API/users/me" \
  -H "Authorization: Bearer $ID_TOKEN" \
  -H "Content-Type: application/json")

echo "$USER_INFO" | jq '.user | {name, authType, snsProvider, onboardingCompleted, status}'
echo ""

# 4. 카카오 온보딩 - nickname만 제출 (성공 예상)
echo "4️⃣ 카카오 온보딩 - nickname만 제출 (성공 예상)"
echo "--------------------------------"
ONBOARDING_SUCCESS=$(curl -s -X PATCH "$API/users/me/onboarding" \
  -H "Authorization: Bearer $ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nickname": "kakao_user_123"
  }')

echo "$ONBOARDING_SUCCESS" | jq '.'
echo ""

# 5. 최종 사용자 정보 확인
echo "5️⃣ 최종 사용자 정보 확인"
echo "--------------------------------"
FINAL_USER=$(curl -s -X GET "$API/users/me" \
  -H "Authorization: Bearer $ID_TOKEN" \
  -H "Content-Type: application/json")

echo "$FINAL_USER" | jq '.user | {name, nickname, authType, snsProvider, onboardingCompleted, status}'
echo ""

FINAL_ONBOARDING=$(echo "$FINAL_USER" | jq -r '.user.onboardingCompleted')
FINAL_STATUS=$(echo "$FINAL_USER" | jq -r '.user.status')

if [ "$FINAL_ONBOARDING" = "true" ] && [ "$FINAL_STATUS" = "ACTIVE" ]; then
  echo -e "${GREEN}✅ 카카오 온보딩 테스트 성공!${NC}"
else
  echo -e "${RED}❌ 온보딩 완료 플래그 오류${NC}"
fi

# 6. phoneNumber 선택 필드 테스트
echo ""
echo "6️⃣ phoneNumber 선택 필드 추가 (부분 업데이트)"
echo "--------------------------------"

# 새 토큰 발급 (이전 토큰 만료 가능성 대비)
REFRESH_RESPONSE=$(curl -s -X POST \
  "http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"returnSecureToken\": true
  }")

NEW_ID_TOKEN=$(echo $REFRESH_RESPONSE | grep -o '"idToken":"[^"]*' | cut -d'"' -f4)

ONBOARDING_UPDATE=$(curl -s -X PATCH "$API/users/me/onboarding" \
  -H "Authorization: Bearer $NEW_ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "010-9999-8888"
  }')

echo "$ONBOARDING_UPDATE" | jq '.'
echo ""

# 7. 최종 확인
FINAL_CHECK=$(curl -s -X GET "$API/users/me" \
  -H "Authorization: Bearer $NEW_ID_TOKEN" \
  -H "Content-Type: application/json")

echo "$FINAL_CHECK" | jq '.user | {nickname, phoneNumber, onboardingCompleted}'

echo ""
echo "================================"
echo "🎉 카카오 온보딩 테스트 완료"

