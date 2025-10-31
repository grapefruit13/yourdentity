#!/bin/bash

# 스크립트 위치 기준으로 작업 디렉토리 이동
cd "$(dirname "$0")" || {
  echo "❌ Error: Failed to change directory to script location" >&2
  exit 1
}

# 환경 변수 설정
# EMULATOR_MODE: "all" (전체 에뮬레이터) 또는 "functions-only" (Functions만 에뮬레이터)
export EMULATOR_MODE="${1:-all}"

echo "🧪 온보딩 테스트 실행기"
echo "================================"
echo ""

if [ "$EMULATOR_MODE" = "all" ]; then
  echo "🔧 테스트 모드: 전체 에뮬레이터 (Auth + Firestore + Functions)"
elif [ "$EMULATOR_MODE" = "functions-only" ]; then
  echo "🔧 테스트 모드: Functions만 에뮬레이터 (실제 Auth + Firestore 사용)"
  echo "⚠️  주의: 실제 Firebase 프로젝트에 테스트 데이터가 생성됩니다!"
else
  echo "❌ 잘못된 EMULATOR_MODE: $EMULATOR_MODE"
  echo "사용법: $0 [all|functions-only]"
  exit 1
fi
echo ""

# Emulator 실행 확인
check_port() {
  local url=$1
  local name=$2
  for i in {1..30}; do
    if curl -sSf "$url" > /dev/null 2>&1; then
      echo "✅ $name 준비 완료"
      return 0
    fi
    sleep 1
  done
  echo "❌ $name 준비 실패: $url"
  exit 1
}

if [ "$EMULATOR_MODE" = "all" ]; then
  # 전체 에뮬레이터 모드: Auth, Firestore, Functions 모두 확인
  check_port "http://127.0.0.1:9099" "Auth Emulator"
  check_port "http://127.0.0.1:8080" "Firestore Emulator"
  
  # Functions는 API health 엔드포인트로 확인
  echo "⏳ Functions Emulator 확인 중..."
  for i in {1..30}; do
    if curl -sSf "http://127.0.0.1:5001/youthvoice-2025/asia-northeast3/api/health" > /dev/null 2>&1; then
      echo "✅ Functions Emulator 준비 완료"
      break
    fi
    sleep 1
    if [ $i -eq 30 ]; then
      echo "❌ Functions Emulator 준비 실패"
      exit 1
    fi
  done
  
  echo "✅ Firebase Emulator 실행 중"
  echo ""
  
  # 데이터 초기화
  echo "🧹 테스트 데이터 초기화..."
  curl -s -X DELETE "http://localhost:9099/emulator/v1/projects/youthvoice-2025/accounts" > /dev/null
  echo "✅ Auth 데이터 초기화 완료"
  curl -s -X DELETE "http://localhost:8080/emulator/v1/projects/youthvoice-2025/databases/(default)/documents" > /dev/null
  echo "✅ Firestore 데이터 초기화 완료"
else
  # Functions만 에뮬레이터 모드: Functions API health로 확인
  echo "⏳ Functions Emulator 확인 중..."
  for i in {1..30}; do
    if curl -sSf "http://127.0.0.1:5001/youthvoice-2025/asia-northeast3/api/health" > /dev/null 2>&1; then
      echo "✅ Functions Emulator 준비 완료"
      break
    fi
    sleep 1
    if [ $i -eq 30 ]; then
      echo "❌ Functions Emulator 준비 실패"
      exit 1
    fi
  done
  
  echo "✅ Functions Emulator 실행 중"
  echo "⚠️  실제 Auth 및 Firestore를 사용합니다. 수동 데이터 정리가 필요할 수 있습니다."
fi
echo ""
echo "================================"
echo ""

# 이메일 온보딩 테스트
echo "📧 닉네임 온보딩 테스트"
echo "================================"
bash test-nickname-flow.sh
echo ""
echo "================================"
echo ""

# 카카오 동기화 + 온보딩 테스트
echo "📱 카카오 동기화/온보딩 테스트"
echo "================================"
bash test-kakao-sync-api.sh
echo ""
echo "================================"
echo ""

echo "🎉 모든 테스트 완료!"
echo ""
echo "Firestore 데이터 확인: http://localhost:4000/firestore"

