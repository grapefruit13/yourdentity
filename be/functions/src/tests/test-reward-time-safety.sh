#!/bin/bash

###############################################################################
# 리워드 시스템 시간 안정성 통합 테스트
#
# 테스트 항목:
#   1. 서버 타임존 확인
#   2. 일일 제한 (5개)
#   3. 00:00 경계 케이스
###############################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   🔒 리워드 시스템 시간 안정성 통합 테스트${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR" || {
  echo "Error: Failed to change directory to $SCRIPT_DIR"
  exit 1
}

ALL_PASSED=true

# Test 1: 서버 타임존 확인
echo -e "${YELLOW}[1/3] 서버 타임존 확인...${NC}"
echo ""
if ./verify-server-timezone.sh; then
  echo -e "${GREEN}✅ 서버 타임존 확인 완료${NC}"
else
  echo -e "${RED}❌ 서버 타임존 확인 실패${NC}"
  ALL_PASSED=false
fi
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Test 2: 일일 제한 (5개)
echo -e "${YELLOW}[2/3] 댓글 일일 제한 테스트 (5개)...${NC}"
echo ""
if ./test-comment-daily-limit.sh; then
  echo -e "${GREEN}✅ 일일 제한 테스트 통과${NC}"
else
  echo -e "${RED}❌ 일일 제한 테스트 실패${NC}"
  ALL_PASSED=false
fi
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Test 3: 00:00 경계 케이스
echo -e "${YELLOW}[3/3] 00:00 경계 케이스 테스트...${NC}"
echo ""
if ./test-midnight-edge-case.sh; then
  echo -e "${GREEN}✅ 경계 케이스 테스트 통과${NC}"
else
  echo -e "${RED}❌ 경계 케이스 테스트 실패${NC}"
  ALL_PASSED=false
fi
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# 최종 결과
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   📊 최종 테스트 결과${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ "$ALL_PASSED" = true ]; then
  echo -e "${GREEN}✅ 모든 시간 안정성 테스트 통과!${NC}"
  echo ""
  echo -e "${GREEN}🔒 검증 완료:${NC}"
  echo -e "   ✅ UTC 명시적 사용으로 타임존 이슈 없음"
  echo -e "   ✅ 일일 제한 (5개) 정상 작동"
  echo -e "   ✅ 00:00 경계 케이스 정상 작동"
  echo -e "   ✅ Firestore 쿼리 형식 정확"
  echo -e "   ✅ 프로덕션/개발 환경 일관성 보장"
  echo ""
  exit 0
else
  echo -e "${RED}❌ 일부 테스트 실패${NC}"
  echo -e "${YELLOW}   위 로그를 확인해주세요${NC}"
  echo ""
  exit 1
fi

