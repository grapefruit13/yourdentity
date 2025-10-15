const { Client } = require('@notionhq/client');
const { db, FieldValue } = require("../config/database");



class NotionUserService {

  constructor() {
    const {
      NOTION_API_KEY,
      NOTION_USER_ACCOUNT_DB_ID,
    } = process.env;

    // --- 환경 변수 검증 ---
    if (!NOTION_API_KEY) throw new Error("Missing NOTION_API_KEY");
    if (!NOTION_USER_ACCOUNT_DB_ID)
      throw new Error("Missing NOTION_USER_ACCOUNT_DB_ID");

    // --- Notion 클라이언트 초기화 (v5.x 호환) ---
    this.notion = new Client({
      auth: NOTION_API_KEY,
      notionVersion: "2022-06-28", // 최신 버전 명시 (SDK v5.x 기준)
    });

    // --- Notion 데이터베이스 ID 매핑 ---
    this.notionUserAccountDB = NOTION_USER_ACCOUNT_DB_ID;
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
    const snapshot = await db.collection("users").get();

    //  Firebase에 lastUpdated 필드 존재 여부 확인
    const hasLastUpdated = snapshot.docs.every(doc => !!doc.data().lastUpdated);

    const now = new Date();

    // 현재 노션에 있는 사용자 목록 가져오기 (ID와 lastUpdated 매핑)
    const notionUsers = await this.getNotionUsers(this.notionUserAccountDB);
  
    let syncedCount = 0;
  
    for (const doc of snapshot.docs) {
      const user = doc.data();
      const userId = doc.id;
  
      //문자열 or timestamp로 저장되어도 모두 조회
      const firebaseLastUpdatedDate = safeTimestampToDate(user.lastUpdated);
      const firebaseLastUpdated = firebaseLastUpdatedDate
        ? firebaseLastUpdatedDate.getTime()
        : 0;
      
      const notionLastUpdated = notionUsers[userId]?.lastUpdated
        ? new Date(notionUsers[userId].lastUpdated).getTime()
        : 0;

  
      // Firebase가 더 최신이면 or lastUpdated가 없는 경우 업데이트 필요
      if (!user.lastUpdated || firebaseLastUpdated > notionLastUpdated || !notionUsers[userId]) {
        // 기존 데이터가 있다면 삭제
        if (notionUsers[userId]) {
          await this.archiveNotionPage(notionUsers[userId].pageId);
        }
  
        // 날짜 변환
        const createdAtIso = safeDateToIso(user.createdAt);
        const lastLoginIso = safeDateToIso(user.lastLogin);
        const lastUpdatedIso = now;
        
        // 노션에 새로 생성
        const notionPage = {
          '사용자ID': { title: [{ text: { content: userId } }] },
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
          "상태": { select: { name: (user.status || "NONE").toUpperCase() } },
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
          "Push 광고 수신 여부": {
                        select: {
                          name:
                            user.pushAdConsent === true
                              ? "동의"
                              : user.pushAdConsent === false
                              ? "거부"
                              : "미설정",
                        },
                      },
          "패널티 주기": { checkbox: user.penalty || false },
          "동기화 시간": { date: { start: lastUpdatedIso.toISOString() } },
        };
  
        await this.notion.pages.create({
          parent: { database_id: this.notionUserAccountDB },
          properties: notionPage,
        });

        // Firebase lastUpdated가 없는 경우에만 초기 설정
        if (!user.lastUpdated) {
          await db.collection("users").doc(userId).update({
            lastUpdated: lastUpdatedIso,
          });
        }
  
        syncedCount++;
      }
    }
  
    console.log(`동기화 완료: ${syncedCount}명 갱신됨`);
    return { syncedCount };
  }


// Notion DB에서 모든 사용자 정보 조회
async getNotionUsers(databaseId) {
  let results = [];
  let hasMore = true;
  let startCursor;

  while (hasMore) {
    const res = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.NOTION_API_KEY}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        page_size: 100,
        start_cursor: startCursor,
      }),
    });

    if (!res.ok) {
            const text = await res.text();
            throw new Error(`Notion query failed (${res.status}): ${text}`);
          }

    const data = await res.json();
    results = results.concat(data.results);
    hasMore = data.has_more;
    startCursor = data.next_cursor;
  }

  const userMap = {};
  for (const page of results) {
    const props = page.properties;
    const userId = props["사용자ID"]?.title?.[0]?.text?.content || null;
    const lastUpdated = props["동기화 시간"]?.date?.start || null;
    if (userId) {
      userMap[userId] = { pageId: page.id, lastUpdated };
    }
  }
  return userMap;
}

// 페이지 아카이브(삭제)
async archiveNotionPage(pageId) {
  await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${process.env.NOTION_API_KEY}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ archived: true }),
  });
}






}


function safeDateToIso(dateValue) {
  if (!dateValue) return null;

  let date;
  if (typeof dateValue === "object" && dateValue.seconds) {
    // Firestore Timestamp 객체 처리
    date = new Date(dateValue.seconds * 1000);
  } else {
    // 문자열 혹은 숫자형 처리
    date = new Date(dateValue);
  }

  if (isNaN(date.getTime())) {
    console.warn("잘못된 날짜 값:", dateValue);
    return null;
  }

  return date.toISOString();
}


function safeTimestampToDate(value) {
  if (!value) return null;

  try {
    // Firestore Timestamp인 경우
    if (typeof value.toDate === "function") {
      return value.toDate();
    }

    // 객체 형태의 Timestamp (예: { seconds, nanoseconds })
    if (typeof value === "object" && value.seconds) {
      return new Date(value.seconds * 1000);
    }

    // 문자열 또는 숫자형인 경우
    const d = new Date(value);
    if (!isNaN(d.getTime())) return d;

  } catch (e) {
    console.warn("Invalid date format:", value);
  }

  return null;
}

module.exports = new NotionUserService();