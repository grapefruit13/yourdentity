#!/bin/bash

# 테스트용 커뮤니티/게시글 데이터 찾기
# Usage: ./test-find-data.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FUNCTIONS_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 테스트 데이터 찾기"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd "$FUNCTIONS_DIR"
node src/tests/findTestData.js

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ 데이터 조회 성공"
else
  echo "❌ 데이터 조회 실패 (exit code: $EXIT_CODE)"
fi

exit $EXIT_CODE

