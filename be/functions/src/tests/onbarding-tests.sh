#!/bin/bash
set -e  # 에러 발생 시 즉시 종료

# 스크립트 위치 기준으로 작업 디렉토리 이동
cd "$(dirname "$0")" || {
  echo "❌ Error: Failed to change directory to script location" >&2
  exit 1
}

echo "🧪 온보딩 테스트 실행기"
echo "================================"
echo ""
echo "🔧 테스트 모드: 에뮬레이터 (Auth + Firestore + Functions)"
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

# 에뮬레이터 확인
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
echo ""
echo "================================"
echo ""

# 이메일 온보딩 테스트
echo "📧 닉네임 온보딩 테스트"
echo "================================"
if ! bash test-nickname-flow.sh; then
  echo "❌ Error: 닉네임 온보딩 테스트 실패" >&2
  exit 1
fi
echo ""
echo "================================"
echo ""

# 카카오 동기화 + 온보딩 테스트
echo "📱 카카오 동기화/온보딩 테스트"
echo "================================"
if ! bash test-kakao-sync-api.sh; then
  echo "❌ Error: 카카오 동기화/온보딩 테스트 실패" >&2
  exit 1
fi
echo ""
echo "================================"
echo ""

echo "🎉 모든 테스트 완료!"
echo ""
echo "Firestore 데이터 확인: http://localhost:4000/firestore"

