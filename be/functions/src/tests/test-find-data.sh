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

# Firestore에서 커뮤니티와 게시글 찾기
node -e "
require('dotenv').config();
const { db } = require('./src/config/database');

(async () => {
  try {
    console.log('🔍 프로덕션 Firestore에서 테스트 데이터 검색 중...\n');
    
    // 커뮤니티 조회
    const communitiesSnapshot = await db.collection('communities').limit(3).get();
    
    if (communitiesSnapshot.empty) {
      console.log('❌ 커뮤니티를 찾을 수 없습니다.');
      process.exit(1);
    }
    
    console.log('📂 사용 가능한 커뮤니티:\n');
    
    for (const communityDoc of communitiesSnapshot.docs) {
      const communityId = communityDoc.id;
      const communityData = communityDoc.data();
      
      console.log('  ┌─ 커뮤니티 ID: ' + communityId);
      console.log('  │  이름: ' + (communityData.name || 'N/A'));
      
      // 해당 커뮤니티의 게시글 조회
      const postsSnapshot = await db
        .collection('communities')
        .doc(communityId)
        .collection('posts')
        .limit(3)
        .get();
      
      if (!postsSnapshot.empty) {
        console.log('  │  게시글 수: ' + postsSnapshot.size + '개');
        console.log('  │');
        
        postsSnapshot.docs.forEach((postDoc, index) => {
          const postData = postDoc.data();
          console.log('  │  ' + (index + 1) + '. 게시글 ID: ' + postDoc.id);
          console.log('  │     제목: ' + (postData.title || postData.content?.substring(0, 30) || 'N/A'));
        });
        console.log('  └─────────────────────────────────────\n');
      } else {
        console.log('  │  (게시글 없음)');
        console.log('  └─────────────────────────────────────\n');
      }
    }
    
    process.exit(0);
  } catch (err) {
    console.error('❌ 오류:', err.message);
    process.exit(1);
  }
})();
"

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ 데이터 조회 성공"
else
  echo "❌ 데이터 조회 실패 (exit code: $EXIT_CODE)"
fi

exit $EXIT_CODE

