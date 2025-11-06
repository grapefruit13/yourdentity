#!/usr/bin/env node

require('dotenv').config();
const { Client } = require('@notionhq/client');

async function main() {
  console.log('\n🔍 Notion API 연결 테스트\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 환경변수 확인
  const apiKey = process.env.NOTION_API_KEY;
  const dbId = process.env.NOTION_REWARD_POLICY_DB_ID;

  console.log(`NOTION_API_KEY: ${apiKey ? '✅ 설정됨 (길이: ' + apiKey.length + ')' : '❌ 없음'}`);
  console.log(`NOTION_REWARD_POLICY_DB_ID: ${dbId || '❌ 없음'}`);
  console.log('');

  if (!apiKey || !dbId) {
    console.log('❌ 환경변수가 설정되지 않았습니다.');
    process.exit(1);
  }

  // Notion Client 초기화
  const notion = new Client({ auth: apiKey });

  // 1. 데이터베이스 조회 테스트
  console.log('📊 데이터베이스 조회 테스트...');
  try {
    const response = await notion.databases.retrieve({ database_id: dbId });
    console.log('✅ 데이터베이스 조회 성공!');
    console.log(`   이름: ${response.title?.[0]?.plain_text || '(제목 없음)'}`);
    console.log(`   생성일: ${response.created_time}`);
    console.log('');
  } catch (error) {
    console.log('❌ 데이터베이스 조회 실패:');
    console.log(`   ${error.message}`);
    console.log('');
    console.log('💡 해결 방법:');
    console.log('   1. Notion에서 데이터베이스 페이지를 엽니다');
    console.log('   2. 우측 상단 ⋯ (더보기) → Connections (연결) 클릭');
    console.log('   3. Integration을 추가하고 권한을 부여합니다');
    console.log('   4. 또는 DB ID가 올바른지 확인합니다\n');
    process.exit(1);
  }

  // 2. 데이터베이스 쿼리 테스트
  console.log('🔎 데이터베이스 쿼리 테스트...');
  try {
    const response = await notion.databases.query({
      database_id: dbId,
      page_size: 10,
    });
    
    console.log(`✅ 쿼리 성공! (${response.results.length}개 항목 발견)`);
    
    if (response.results.length === 0) {
      console.log('⚠️  데이터베이스가 비어있습니다.');
      console.log('   Key, Rewards, IsActive 컬럼과 데이터를 추가해주세요.\n');
    } else {
      console.log('\n📋 발견된 리워드 정책:');
      response.results.forEach((page, idx) => {
        const props = page.properties;
        const key = props.Key?.title?.[0]?.plain_text || '(없음)';
        const rewards = props.Rewards?.number || 0;
        const isActive = props.IsActive?.checkbox || false;
        
        console.log(`   ${idx + 1}. Key: "${key}", Rewards: ${rewards}, Active: ${isActive ? '✅' : '❌'}`);
      });
      console.log('');
    }
    
    console.log('🎉 모든 테스트 통과! Notion API 연결이 정상입니다.\n');
    
  } catch (error) {
    console.log('❌ 쿼리 실패:');
    console.log(`   ${error.message}\n`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('❌ 예상치 못한 오류:', err);
  process.exit(1);
});

