#!/bin/bash
set -euo pipefail

# 색상 정의
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 환경 변수 기반 설정
EMULATOR_MODE="${EMULATOR_MODE:-all}"

API="http://127.0.0.1:5001/youthvoice-2025/asia-northeast3/api"
TEST_EMAIL="kakao-sync-test-$(date +%s%N)@example.com"
TEST_PASSWORD="test123456"

echo "🧪 카카오 동기화 API 테스트"
echo "================================"

# Auth URL 설정
if [ "$EMULATOR_MODE" = "all" ]; then
  AUTH_URL="http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1"
  API_KEY="fake-api-key"
  echo -e "${BLUE}🔧 테스트 모드: 전체 에뮬레이터 (Auth + Firestore + Functions)${NC}"
else
  AUTH_URL="https://identitytoolkit.googleapis.com/v1"
  API_KEY="${FIREBASE_WEB_API_KEY:-AIzaSyDrUoph1tb6UeIPiEcUjyaolThcxWKbHy0}"
  echo -e "${BLUE}🔧 테스트 모드: Functions만 에뮬레이터 (실제 Auth + Firestore 사용)${NC}"
fi
echo ""

# Pretty print JSON if valid, else raw
pp_json() {
  local resp="$1"
  if echo "$resp" | jq -e . >/dev/null 2>&1; then
    echo "$resp" | jq '.'
  else
    echo "$resp"
  fi
}

# JSON 응답 대기/검증 유틸 (최대 10회 재시도)
curl_json() {
  method=$1
  url=$2
  data=${3:-}
  token=${4:-}
  resp=""
  for i in {1..10}; do
    if [ -n "$token" ]; then
      if [ -n "$data" ]; then
        resp=$(curl -s -X "$method" "$url" -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d "$data")
      else
        resp=$(curl -s -X "$method" "$url" -H "Content-Type: application/json" -H "Authorization: Bearer $token")
      fi
    else
      if [ -n "$data" ]; then
        resp=$(curl -s -X "$method" "$url" -H "Content-Type: application/json" -d "$data")
      else
        resp=$(curl -s -X "$method" "$url" -H "Content-Type: application/json")
      fi
    fi
    if echo "$resp" | jq -e . >/dev/null 2>&1; then
      echo "$resp"
      return 0
    fi
    sleep 1
  done
  echo "$resp"
}

# 1. Firebase Auth 계정 생성 (onCreate 트리거 작동)
echo "1️⃣ Firebase Auth 계정 생성 (onCreate 트리거 작동)"
echo "--------------------------------"

SIGNUP_RESPONSE=$(curl_json POST "$AUTH_URL/accounts:signUp?key=$API_KEY" "{\"email\": \"$TEST_EMAIL\", \"password\": \"$TEST_PASSWORD\", \"returnSecureToken\": true}")

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

# authTrigger 처리 대기
echo "⏳ authTrigger 처리 대기 중... (3초)"
sleep 3
echo ""

# 2-1. 카카오 테스트용 customClaims 설정
echo "2-1️⃣ 카카오 테스트용 customClaims 설정"
echo "--------------------------------"
if ! node ../scripts/setKakaoTestClaims.js "$USER_ID"; then
  echo -e "${YELLOW}⚠️  customClaims 설정 실패 (계속 진행)${NC}"
fi

# customClaims 설정 후 새로운 ID Token 발급
echo "⏳ customClaims 반영을 위한 새 토큰 발급 중..."
if [ "$EMULATOR_MODE" = "all" ]; then
  # 에뮬레이터 환경: 재로그인으로 토큰 갱신
  REFRESH_RESPONSE=$(curl_json POST "$AUTH_URL/accounts:signInWithPassword?key=$API_KEY" "{\"email\": \"$TEST_EMAIL\", \"password\": \"$TEST_PASSWORD\", \"returnSecureToken\": true}")
  ID_TOKEN=$(echo "$REFRESH_RESPONSE" | jq -r '.idToken // empty')
  
  if [ -z "$ID_TOKEN" ]; then
    echo -e "${RED}❌ 토큰 갱신 실패${NC}"
    exit 1
  fi
  echo "✅ 새 ID Token 발급 완료 (customClaims 반영됨)"
fi
echo ""

# 2. onCreate로 생성된 문서 확인
echo "2️⃣ onCreate로 생성된 사용자 문서 확인"
echo "--------------------------------"
USER_INFO=$(curl_json GET "$API/users/me" "" "$ID_TOKEN")

pp_json "$USER_INFO"
echo ""

AUTH_TYPE=$(echo "$USER_INFO" | jq -r '.data.user.authType // empty')
ONBOARDING_COMPLETED=$(echo "$USER_INFO" | jq -r '.data.user.onboardingCompleted // false')

echo "✅ onCreate 확인:"
echo "   - authType: $AUTH_TYPE"
echo "   - onboardingCompleted: $ONBOARDING_COMPLETED"
echo ""

# 3. 동기화 API 테스트 (실제 카카오 accessToken 사용)
echo "3️⃣ 동기화 API 테스트"
echo "--------------------------------"

# 환경변수 또는 첫 번째 인자로 accessToken 받기
KAKAO_ACCESS_TOKEN="${1:-${KAKAO_ACCESS_TOKEN:-test}}"

if [ "$KAKAO_ACCESS_TOKEN" = "test" ]; then
  echo -e "${BLUE}💡 에뮬레이터 환경: 'test' accessToken 사용${NC}"
  echo -e "${BLUE}   customClaims에서 더미 데이터를 읽어옵니다${NC}"
  echo ""
fi

echo -e "${BLUE}카카오 accessToken으로 동기화 API 호출 중...${NC}"

SYNC_RESPONSE=$(curl -s -X POST "$API/users/me/sync-kakao-profile" \
  -H "Authorization: Bearer $ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"accessToken\": \"$KAKAO_ACCESS_TOKEN\"}")

pp_json "$SYNC_RESPONSE"
echo ""

# 에러 체크
SYNC_STATUS=$(echo "$SYNC_RESPONSE" | jq -r '.status // empty')
if [ "$SYNC_STATUS" != "200" ] && [ -n "$SYNC_STATUS" ]; then
  echo -e "${RED}❌ 동기화 API 호출 실패${NC}"
  echo "Response: $SYNC_RESPONSE"
  echo ""
fi

# 동기화 후 사용자 정보 확인
echo "📋 동기화 후 사용자 정보 확인"
echo "--------------------------------"
SYNC_USER_INFO=$(curl_json GET "$API/users/me" "" "$ID_TOKEN")

pp_json "$SYNC_USER_INFO"
echo ""

GENDER=$(echo "$SYNC_USER_INFO" | jq -r '.data.user.gender // "null"')
BIRTHDATE=$(echo "$SYNC_USER_INFO" | jq -r '.data.user.birthDate // "null"')
PHONE=$(echo "$SYNC_USER_INFO" | jq -r '.data.user.phoneNumber // "null"')
SERVICE_TERMS=$(echo "$SYNC_USER_INFO" | jq -r '.data.user.serviceTermsAgreed // "null"')
PRIVACY_TERMS=$(echo "$SYNC_USER_INFO" | jq -r '.data.user.privacyTermsAgreed // "null"')
AGE14_TERMS=$(echo "$SYNC_USER_INFO" | jq -r '.data.user.age14TermsAgreed // "null"')
PUSH_TERMS=$(echo "$SYNC_USER_INFO" | jq -r '.data.user.pushTermsAgreed // "null"')

echo "✅ 동기화 결과:"
echo "   - gender: $GENDER"
echo "   - birthDate: $BIRTHDATE"
echo "   - phoneNumber: $PHONE"
echo "   - serviceTermsAgreed: $SERVICE_TERMS"
echo "   - privacyTermsAgreed: $PRIVACY_TERMS"
echo "   - age14TermsAgreed: $AGE14_TERMS"
echo "   - pushTermsAgreed: $PUSH_TERMS"
echo ""

# 4. 온보딩 테스트 (닉네임만)
echo "4️⃣ 온보딩 테스트 - 닉네임 입력"
echo "--------------------------------"
NICKNAME="test_user_$(date +%s%N | cut -b1-10)"
echo "Generated nickname: $NICKNAME"

ONBOARDING_RESPONSE=$(curl -s -X PATCH "$API/users/me/onboarding" \
  -H "Authorization: Bearer $ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"nickname\": \"$NICKNAME\"}")

pp_json "$ONBOARDING_RESPONSE"
echo ""

# 5. 최종 사용자 정보 확인
echo "5️⃣ 최종 사용자 정보 확인"
echo "--------------------------------"
FINAL_USER=$(curl_json GET "$API/users/me" "" "$ID_TOKEN")

pp_json "$FINAL_USER"
echo ""

FINAL_STATUS=$(echo "$FINAL_USER" | jq -r '.data.user.status // empty')

if [ "$FINAL_STATUS" = "active" ]; then
  echo -e "${GREEN}✅ 온보딩 완료(status=active)!${NC}"
else
  echo -e "${RED}❌ 온보딩 상태 오류${NC}"
fi

echo ""
echo "================================"
echo "🎉 카카오 동기화 API 테스트 완료"
echo ""
echo "다음 단계:"
echo "  1. 프론트엔드에서 실제 카카오 로그인"
echo "  2. 받은 accessToken으로 동기화 API 호출"
echo "  3. 개인정보와 약관이 올바르게 저장되는지 확인"

