#!/bin/bash

echo "🧪 온보딩 테스트 실행기"
echo "================================"
echo ""

# Emulator 실행 확인
if ! curl -s http://localhost:4000 > /dev/null; then
  echo "❌ Firebase Emulator가 실행되지 않았습니다."
  echo "먼저 다음 명령을 실행하세요:"
  echo "  firebase emulators:start"
  exit 1
fi

echo "✅ Firebase Emulator 실행 중"
echo ""

# 데이터 초기화
echo "🧹 테스트 데이터 초기화..."

# Auth 초기화
curl -s -X DELETE "http://localhost:9099/emulator/v1/projects/youthvoice-2025/accounts" > /dev/null
echo "✅ Auth 데이터 초기화 완료"

# Firestore 초기화
curl -s -X DELETE "http://localhost:8080/emulator/v1/projects/youthvoice-2025/databases/(default)/documents" > /dev/null
echo "✅ Firestore 데이터 초기화 완료"
echo ""
echo "================================"
echo ""

# 이메일 온보딩 테스트
echo "📧 이메일 온보딩 테스트"
echo "================================"
bash test-onboarding.sh
echo ""
echo "================================"
echo ""

# 카카오 온보딩 테스트
echo "📱 카카오 온보딩 테스트"
echo "================================"
bash test-kakao-onboarding.sh
echo ""
echo "================================"
echo ""

echo "🎉 모든 테스트 완료!"
echo ""
echo "Firestore 데이터 확인: http://localhost:4000/firestore"

