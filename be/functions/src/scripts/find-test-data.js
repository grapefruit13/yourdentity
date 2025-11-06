#!/usr/bin/env node

/**
 * 테스트용 커뮤니티 & 게시글 찾기
 */

require('dotenv').config();
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

async function main() {
  console.log('🔍 테스트용 데이터 찾는 중...\n');

  try {
    // 커뮤니티 조회
    const communitiesSnapshot = await db.collection('communities').limit(3).get();
    
    if (communitiesSnapshot.empty) {
      console.log('❌ 커뮤니티가 없습니다.');
      process.exit(1);
    }

    console.log('📂 사용 가능한 커뮤니티:');
    
    for (const communityDoc of communitiesSnapshot.docs) {
      const communityId = communityDoc.id;
      const communityData = communityDoc.data();
      
      console.log(`\n  ┌─ 커뮤니티 ID: ${communityId}`);
      console.log(`  │  이름: ${communityData.name || '(이름 없음)'}`);
      
      // 해당 커뮤니티의 게시글 조회
      const postsSnapshot = await db
        .collection(`communities/${communityId}/posts`)
        .limit(3)
        .get();
      
      if (!postsSnapshot.empty) {
        console.log(`  │  게시글 수: ${postsSnapshot.size}개`);
        console.log(`  │`);
        
        postsSnapshot.docs.forEach((postDoc, idx) => {
          const postData = postDoc.data();
          console.log(`  │  ${idx + 1}. 게시글 ID: ${postDoc.id}`);
          console.log(`  │     제목: ${postData.title || '(제목 없음)'}`);
        });
      } else {
        console.log(`  │  ⚠️  게시글 없음`);
      }
      
      console.log(`  └─────────────────────────────────────`);
    }

    // 첫 번째 커뮤니티의 첫 번째 게시글 추천
    const firstCommunity = communitiesSnapshot.docs[0];
    const firstCommunityId = firstCommunity.id;
    
    const firstPostSnapshot = await db
      .collection(`communities/${firstCommunityId}/posts`)
      .limit(1)
      .get();
    
    if (!firstPostSnapshot.empty) {
      const firstPostId = firstPostSnapshot.docs[0].id;
      
      console.log('\n✅ 추천 테스트 데이터:');
      console.log(`   커뮤니티 ID: ${firstCommunityId}`);
      console.log(`   게시글 ID: ${firstPostId}`);
      console.log('\n🧪 테스트 명령어:');
      console.log(`   export TEST_COMMUNITY_ID="${firstCommunityId}"`);
      console.log(`   export TEST_POST_ID="${firstPostId}"`);
    } else {
      console.log('\n⚠️  게시글이 있는 커뮤니티를 찾지 못했습니다.');
      console.log('   테스트를 위해 먼저 게시글을 생성해주세요.');
    }

  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    process.exit(1);
  }
}

main().then(() => process.exit(0));

