const { Client } = require('@notionhq/client');
const { db, FieldValue } = require("../config/database");



class NotionUserService {
  constructor() {
    this.notion = new Client({
      auth: process.env.NOTION_API_KEY,
    });
    
    this.notionUserAccountDB = process.env.NOTION_USER_ACCOUNT_DB_ID;
    this.activeUserDB  = process.env.NOTION_ACTIVE_USER;
    this.withdrawUserDB = process.env.NOTION_WITHDRAWN_USER;
    this.pendingUserDB = process.env.NOTION_PENDING_USER;
  }


  /**
   * Notion데이터베이스 초기화
   * ※이슈
   *   - this.notion.database.query를 사용하는 경우 삭제처리가 되지 않음 -> 버전이슈?(SDK함수 자체가 함수 호출을 지원X?)
   *   - SDK를 거치지 않고 직접 HTTP요청을 날림
   */
    // async clearNotionDatabase(databaseId) {
    // // 데이터베이스 내 모든 페이지 조회
    // const response = await this.notion.databases.query({
    //     database_id: databaseId,
    //     start_cursor: cursor,
    // });

    // const pages = response.results;

    // for (const page of pages) {
    //     await this.notion.pages.update({
    //     page_id: page.id,
    //     archived: true, // 페이지를 삭제 대신 아카이브 처리
    //     });
    // }

    // console.log(`${pages.length}개의 페이지를 아카이브 처리했습니다.`);
    // }
  async archiveNotionPage(pageId, notionToken) {
  const url = `https://api.notion.com/v1/pages/${pageId}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${notionToken}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ archived: true })
  });

  const data = await res.json();
  console.log(`페이지 아카이브 완료: ${pageId}`, data);
}

async clearNotionDatabase(databaseId) {
  let hasMore = true;
  let startCursor = undefined;

  while (hasMore) {
    const res = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.NOTION_API_KEY}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        page_size: 100,
        start_cursor: startCursor
      })
    });

    const data = await res.json();

    if (!data.results || !Array.isArray(data.results)) {
      console.error("Notion API 결과가 배열이 아닙니다.", data);
      break;
    }

    for (const page of data.results) {
      await fetch(`https://api.notion.com/v1/pages/${page.id}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${process.env.NOTION_API_KEY}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ archived: true })
      });
      console.log(`페이지 아카이브 처리: ${page.id}`);
    }

    hasMore = data.has_more;
    startCursor = data.next_cursor;
  }
}

  /**
   * Firebase의 users 컬렉션에서 활동회원 조회 후
   * Notion 데이터베이스에 등록
   * TODO
   * 1. 지갑주소를 어떠한 값으로 사용할 것인지>
   * 2. 현재 가입완료 일시, 앱 첫 로그인 데이터는 동일하게 users의 createdAt을 사용하는데 통일 or 구분 고려
   * 3. 최초 접속언어, 설정 언어가 로그인 하는 경우 설정 프로세스에 포함이 되는지 -> firebase구조 추가 고려
   * 4. 초대자를 유입경로 타입으로 대체가 가능한지? 초대자를 저장하는 프로세스 확인 -> firebase구조 추가 고려
   * 5. push광고 수신 여부에 대해 설정하는 프로세스 확인 -> firebase구조 추가 고려
   * 6. 현재 firebase에서는 role에는 user|admin인데 기획쪽에서는 한끗, 유스보이스, 교육자....추가되는 환경으로 컬렉션 구조를 role에 사용할지 분리할지 고려필요
   * 7. 노션 데이터베이스를 지우는 경우 속도 측면에서 느림 -> 개선이 필요해 보임
   *   + 노션에서는 전체 삭제를 지원하지 않고 페이지를 아카이브 처리해서 개별적으로 archived: true로 삭제를 진행
   * ※ firebase구조 추가 고려라고 되어 있는 부분은 우선 컬럼은 다 추가함
   * 8. SMS광고 수신 여부, Push 광고 수신 여부 통일 고려 -> 현재는 push만 사용
   */
  async syncUserAccounts() {

    //노션DB 초기화
    await this.clearNotionDatabase(this.notionUserAccountDB);

    const snapshot = await db.collection("users")
        //.where("status", "==", "active") // 활동회원만 조회
        .get();

    let count = 0; // 동기화 카운트

    for (const doc of snapshot.docs) {
      const user = doc.data();

      let createdAtIso = null;
      let lastLoginIso = null;
      if(user.createdAt){
         const date = new Date(user.createdAt);
        if (!isNaN(date.getTime())) {
            createdAtIso = date.toISOString();
        }
      }
       if(user.lastLogin){
         const date = new Date(user.lastLogin);
        if (!isNaN(date.getTime())) {
            lastLoginIso = date.toISOString();
        }
      }

      const notionPage = {
        '사용자ID': { title: [{ text: { content: doc.id } }] },
        //"프로필 사진": { rich_text: [{ text: { content: user.profileImageUrl || "" } }] },
        "프로필 사진": {
            files: [
                {
                name: "profile-image",
                type: "external",
                 external: { url: user.profileImageUrl || "https://example.com/default-profile.png" },
                },
            ],
            },
        "사용자 별명": { rich_text: [{ text: { content: user.multiProfiles?.[user.mainProfileId]?.nickname || "" } }] },
        "상태" : { select: { name: (user.status || "NONE").toUpperCase() } },
        "역할": { select: { name: user.role || "user" } },
        "전화번호": { rich_text: [{ text: { content: user.phoneNumber || "" } }] },
        "출생연도": { number: user.birthYear || null },
        "이메일": { rich_text: [{ text: { content: user.email || "" } }] },
        "가입완료 일시": createdAtIso ? { date: { start: createdAtIso } } : undefined,
        "가입 방법": { select: { name: user.authType || "email" } },
        "앱 첫 로그인": createdAtIso ? { date: { start: createdAtIso } } : undefined,
        "최근 앱 활동 일시": lastLoginIso ? { date: { start: lastLoginIso } } : undefined,
        "초대자": { rich_text: [{ text: { content: user.inviter || "" } }] },
        "유입경로": { rich_text: [{ text: { content: user.utmSource || "" } }] },       
        "Push 광고 수신 여부": { select: { name: user.pushAdConsent || "미설정" } },
        "패널티 주기": { checkbox: user.penalty || false },
        //기획에는 없고 Firebase에만 있는 데이터 추가여부 고려
        //"포인트": { number: user.rewardPoints || 0 },
        //"레벨": { number: user.level || 1 },
        //"배지": { rich_text: [{ text: { content: (user.badges || []).join(", ") } }] },
        //"업로드 제한": { number: user.uploadQuotaBytes || 1073741824 }, // 1GB 기본
        //"누적 사용량": { number: user.usedStorageBytes || 0 },
        //"UI 점수": { rich_text: [{ text: { content: user.points || "0" } }] },
      };

      await this.notion.pages.create({
        parent: { database_id: this.notionUserAccountDB  },
        properties: notionPage,
      });
      count++; // 정상적으로 생성될 때마다 카운트 증가
    }
    // 동기화 완료 후 count 반환
    return { syncedCount: count };
  }




}

module.exports = new NotionUserService();