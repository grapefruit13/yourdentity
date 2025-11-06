#!/bin/bash

# 사용자 리워드 확인 테스트
# Usage: ./test-check-user-rewards.sh [userId]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FUNCTIONS_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

USER_ID="${1:-reward-test-user-001}"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 사용자 리워드 확인 테스트"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd "$FUNCTIONS_DIR"
node src/tests/checkUserRewards.js "$USER_ID"

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ 테스트 성공"
else
  echo "❌ 테스트 실패 (exit code: $EXIT_CODE)"
fi

exit $EXIT_CODE

