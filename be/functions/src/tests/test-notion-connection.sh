#!/bin/bash

# Notion API 연결 테스트
# Usage: ./test-notion-connection.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FUNCTIONS_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔗 Notion API 연결 테스트"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd "$FUNCTIONS_DIR"
node src/tests/testNotionConnection.js

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ Notion 연결 성공"
else
  echo "❌ Notion 연결 실패 (exit code: $EXIT_CODE)"
fi

exit $EXIT_CODE

