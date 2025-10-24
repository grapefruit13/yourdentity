#!/bin/bash

# 색상 정의
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API="http://localhost:5001/youthvoice-2025/asia-northeast3/api"
TEST_EMAIL="onboarding-test@example.com"
TEST_PASSWORD="test123456"

echo "🧪 온보딩 API 통합 테스트"
echo "================================"
echo ""

# 1. 이메일 회원가입 (Client SDK 시뮬레이션)
echo "1️⃣ 이메일 회원가입 (authTrigger 작동)"
echo "--------------------------------"

# Firebase Auth REST API로 회원가입
SIGNUP_RESPONSE=$(curl -s -X POST \
  "http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"returnSecureToken\": true
  }")

ID_TOKEN=$(echo $SIGNUP_RESPONSE | grep -o '"idToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$ID_TOKEN" ]; then
  echo -e "${RED}❌ 회원가입 실패${NC}"
  echo "Response: $SIGNUP_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ 회원가입 성공${NC}"
echo "ID Token: ${ID_TOKEN:0:50}..."
echo ""

# 2초 대기 (authTrigger 처리 대기)
echo "⏳ authTrigger 처리 대기 중... (2초)"
sleep 2
echo ""

# 2. 사용자 정보 조회
echo "2️⃣ 사용자 정보 조회 (authType 확인)"
echo "--------------------------------"
USER_INFO=$(curl -s -X GET "$API/users/me" \
  -H "Authorization: Bearer $ID_TOKEN" \
  -H "Content-Type: application/json")

echo "$USER_INFO" | jq '.'
AUTH_TYPE=$(echo "$USER_INFO" | jq -r '.data.user.authType // empty')
ONBOARDING_COMPLETED=$(echo "$USER_INFO" | jq -r '.data.user.onboardingCompleted // false')

echo ""
echo "AuthType: $AUTH_TYPE"
echo "Onboarding Completed: $ONBOARDING_COMPLETED"
echo ""

# 3. 온보딩 테스트 - 필수 필드 누락 (실패 케이스)
echo "3️⃣ 온보딩 테스트 - 필수 필드 누락 (400 예상)"
echo "--------------------------------"
ONBOARDING_FAIL=$(curl -s -i -X PATCH "$API/users/me/onboarding" \
  -H "Authorization: Bearer $ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nickname":"test_nick"}')

echo "$ONBOARDING_FAIL" | head -n 20
echo ""

# 4. 온보딩 테스트 - 약관 누락 (실패 케이스)
echo "4️⃣ 온보딩 테스트 - 약관 누락 (400 예상)"
echo "--------------------------------"
ONBOARDING_NO_TERMS=$(curl -s -i -X PATCH "$API/users/me/onboarding" \
  -H "Authorization: Bearer $ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "홍길동",
    "nickname": "gildong",
    "birthYear": 1998,
    "birthDate": "1998-01-02"
  }')

echo "$ONBOARDING_NO_TERMS" | head -n 20
echo ""

# 5. 온보딩 테스트 - 성공 케이스
echo "5️⃣ 온보딩 테스트 - 전체 필드 + 약관 동의 (성공)"
echo "--------------------------------"
ONBOARDING_SUCCESS=$(curl -s -X PATCH "$API/users/me/onboarding" \
  -H "Authorization: Bearer $ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "홍길동",
    "nickname": "gildong123",
    "birthYear": 1998,
    "birthDate": "1998-01-02",
    "gender": "MALE",
    "phoneNumber": "010-1234-5678",
    "terms": {
      "SERVICE": true,
      "PRIVACY": true,
      "MARKETING": false
    }
  }')

echo "$ONBOARDING_SUCCESS" | jq '.'
echo ""

# 6. 최종 사용자 정보 확인
echo "6️⃣ 최종 사용자 정보 확인"
echo "--------------------------------"
FINAL_USER=$(curl -s -X GET "$API/users/me" \
  -H "Authorization: Bearer $ID_TOKEN" \
  -H "Content-Type: application/json")

echo "$FINAL_USER" | jq '.data.user | {name, nickname, authType, onboardingCompleted, status}'
echo ""

FINAL_ONBOARDING=$(echo "$FINAL_USER" | jq -r '.data.user.onboardingCompleted')
FINAL_STATUS=$(echo "$FINAL_USER" | jq -r '.data.user.status')

if [ "$FINAL_ONBOARDING" = "true" ] && [ "$FINAL_STATUS" = "ACTIVE" ]; then
  echo -e "${GREEN}✅ 온보딩 테스트 성공!${NC}"
else
  echo -e "${RED}❌ 온보딩 완료 플래그 오류${NC}"
fi

echo ""
echo "================================"
echo "🎉 테스트 완료"

