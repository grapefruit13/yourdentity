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
      
      //노션에서 제공하는 최종 편집 일시를 사용하지 않고 동기화 시간으로 관리하는 이유 : 노션에서 변경사항이 생겼을때 비교하는게 아니라 동기화 버튼을 클릭했을 경우의 시간과 비교하기 위함
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
          //"기본 닉네임": { rich_text: [{ text: { content: user.multiProfiles?.[user.mainProfileId]?.nickname || "" } }] },
          "기본 닉네임": { rich_text: [{ text: { content: user.nickname || "" } }] },
          "사용자 실명": { rich_text: [{ text: { content: user.name || "" } }] },
          "상태": user.status
             ? { select: { name: user.status } }
             : { select: { name: "데이터 없음" } },
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
          "성별": { 
            select: { 
              name: 
                user.gender === 'male' ? "남성" : user.gender === 'female' ? "여성" : "미선택",
            } 
          },
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
          // "패널티 주기": { checkbox: user.penalty || false },
          // "자격정지 적용": {
          //   checkbox: false
          // },
          // "자격정지 상태": user.suspensionType ? {
          //   status: { name: user.suspensionType }
          // } : undefined,
          // "자격정지 기간(일시정지)": (user.suspensionStart && user.suspensionEnd) ? {
          //   date: {
          //     start: user.suspensionStart,
          //     end: user.suspensionEnd
          //   }
          // } : undefined,
          // "자격정지 정책 적용 일시": user.suspensionAppliedAt ? {
          //   date: { 
          //     start: user.suspensionAppliedAt 
          //   }
          // } : undefined,
          "정지 사유": user.suspensionReason ? {
            rich_text: [{
              text: { content: user.suspensionReason }
            }]
          } : {
            rich_text: []
          },
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

/**
 - 전체 사용자 동기화(firebase -> Notion)
   + 기존 :  기존 부분동기화를 진행하는 경우 lastUpate값을 비교해서 노션 동기화 데이터 이후에 변경된 데이터만 동기화
   + 문제점 : 관리자가 노션에서 사용자 정보를 실수로 수정했거나 하는 경우 실제 firebae의 데이터와 다르게 노션에 보여질 수 있는 문제
   + 해결방안 : 주기적으로 관리자가 전체동기화를 진행
   + 참고 : 기존 전체삭제 -> 전체 동기화  순서로 진행을 했는데 노션 api에 너무 많은 요청을 보내게 되면 연결이 끊기는 문제가 있음
     + 해결방법 : 한번에 많은 요청을 보내지 않고 배치 작업으로 요청 분배
 */
async syncAllUserAccounts() {
  try {
    console.log('=== 전체 사용자 동기화 시작 ===');
    
    //1. 기존 Notion 데이터베이스의 모든 페이지 가져오기
    const notionPages = await this.getAllNotionPages(this.notionUserAccountDB);
    console.log(`기존 Notion 사용자 ${notionPages.length}명 → 모두 삭제 처리 중...`);

    //2. 모든 페이지 아카이브 (삭제와 동일 효과) - 배치 처리
    await this.archivePagesInBatches(notionPages);

    //3. Firebase users 컬렉션 전체 가져오기
    const snapshot = await db.collection("users").get();
    const now = new Date();
    let syncedCount = 0;
    let failedCount = 0;

    console.log(`Firebase에서 ${snapshot.docs.length}명의 사용자 데이터를 가져왔습니다.`);

    //4. 사용자 데이터를 배치로 처리
    const BATCH_SIZE = 10; // 10명씩 배치 처리
    const DELAY_MS = 2000; // 2초 지연

    for (let i = 0; i < snapshot.docs.length; i += BATCH_SIZE) {
      const batch = snapshot.docs.slice(i, i + BATCH_SIZE);
      console.log(`배치 ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(snapshot.docs.length / BATCH_SIZE)} 처리 중... (${i + 1}-${Math.min(i + BATCH_SIZE, snapshot.docs.length)}번째)`);

      // 배치 내에서 병렬 처리
      const batchPromises = batch.map(async (doc) => {
        try {
          const user = doc.data();
          const userId = doc.id;

          // 날짜 처리
          const createdAtIso = safeDateToIso(user.createdAt);
          const lastLoginIso = safeDateToIso(user.lastLogin);
          const lastUpdatedIso = now;

          // Notion 페이지 데이터 구성
          const notionPage = {
            "사용자ID": { title: [{ text: { content: userId } }] },
            "프로필 사진": {
              files: [
                {
                  name: "profile-image",
                  type: "external",
                  external: { url: user.profileImageUrl || "https://example.com/default-profile.png" },
                },
              ],
            },
            "기본 닉네임": { rich_text: [{ text: { content: user.nickname || "" } }] },
            "사용자 실명": { rich_text: [{ text: { content: user.name || "" } }] },
            "상태": user.status
               ? { select: { name: user.status } }
               : { select: { name: "데이터 없음" } },
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
            "성별": { 
              select: { 
                name: 
                  user.gender === 'MALE' ? "남성" : user.gender === 'FEMALE' ? "여성" : "미선택",
              } 
            },
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
            // "패널티 주기": { checkbox: user.penalty || false },
            // "자격정지 적용": {
            //   checkbox: false
            // },
            // "자격정지 상태": user.suspensionType ? {
            //   status: { name: user.suspensionType }
            // } : undefined,
            // "자격정지 기간(일시정지)": (user.suspensionStart && user.suspensionEnd) ? {
            //   date: {
            //     start: user.suspensionStart,
            //     end: user.suspensionEnd
            //   }
            // } : undefined,
            // "자격정지 정책 적용 일시": user.suspensionAppliedAt ? {
            //   date: { 
            //     start: user.suspensionAppliedAt 
            //   }
            // } : undefined,
            "정지 사유": user.suspensionReason ? {
              rich_text: [{
                text: { content: user.suspensionReason }
              }]
            } : {
              rich_text: []
            },
            "동기화 시간": { date: { start: lastUpdatedIso.toISOString() } },
          };

          // 재시도 로직과 함께 Notion 페이지 생성
          await this.createNotionPageWithRetry(notionPage);
          return { success: true, userId };
        } catch (error) {
          console.error(`사용자 ${doc.id} 처리 실패:`, error.message);
          return { success: false, userId: doc.id, error: error.message };
        }
      });

      // 배치 결과 처리
      const batchResults = await Promise.all(batchPromises);
      const batchSuccess = batchResults.filter(r => r.success).length;
      const batchFailed = batchResults.filter(r => !r.success).length;

      syncedCount += batchSuccess;
      failedCount += batchFailed;

      console.log(`배치 완료: 성공 ${batchSuccess}명, 실패 ${batchFailed}명 (총 진행률: ${syncedCount + failedCount}/${snapshot.docs.length})`);

      // 마지막 배치가 아니면 지연
      if (i + BATCH_SIZE < snapshot.docs.length) {
        console.log(`${DELAY_MS/1000}초 대기 중...`);
        await new Promise(resolve => setTimeout(resolve, DELAY_MS));
      }
    }

    console.log(`=== 전체 재동기화 완료 ===`);
    console.log(`성공: ${syncedCount}명, 실패: ${failedCount}명`);
    return { syncedCount, failedCount, total: snapshot.docs.length };

  } catch (error) {
    console.error('syncAllUserAccounts 전체 오류:', error);
    throw error;
  }
}

// 페이지들을 배치로 아카이브 처리
async archivePagesInBatches(pages) {
  const BATCH_SIZE = 10;
  const DELAY_MS = 1000;

  for (let i = 0; i < pages.length; i += BATCH_SIZE) {
    const batch = pages.slice(i, i + BATCH_SIZE);
    console.log(`아카이브 배치 ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(pages.length / BATCH_SIZE)} 처리 중...`);

    // 배치 내에서 병렬 처리
    await Promise.all(batch.map(page => this.archiveNotionPageWithRetry(page.id)));

    // 마지막 배치가 아니면 지연
    if (i + BATCH_SIZE < pages.length) {
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
  }
}

// 재시도 로직이 포함된 Notion 페이지 생성
async createNotionPageWithRetry(notionPage, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await this.notion.pages.create({
        parent: { database_id: this.notionUserAccountDB },
        properties: notionPage,
      });
      return; // 성공하면 종료
    } catch (error) {
      console.warn(`Notion 페이지 생성 시도 ${attempt}/${maxRetries} 실패:`, error.message);
      
      if (attempt === maxRetries) {
        throw new Error(`Notion 페이지 생성 최종 실패: ${error.message}`);
      }
      
      // 지수 백오프: 1초, 2초, 4초...
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`${delay/1000}초 후 재시도...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// 재시도 로직이 포함된 페이지 아카이브
async archiveNotionPageWithRetry(pageId, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${process.env.NOTION_API_KEY}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ archived: true }),
      });
      return; // 성공하면 종료
    } catch (error) {
      console.warn(`페이지 아카이브 시도 ${attempt}/${maxRetries} 실패 (pageId: ${pageId}):`, error.message);
      
      if (attempt === maxRetries) {
        throw new Error(`페이지 아카이브 최종 실패 (pageId: ${pageId}): ${error.message}`);
      }
      
      // 지수 백오프
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

async getAllNotionPages(databaseId) {
  let results = [];
  let hasMore = true;
  let startCursor;

  /*
  1. 첫 번째 요청: start_cursor: undefined, page_size: 100
    - 처음 100개 레코드 가져옴
    - has_more: true이면 계속 진행
  2. 두 번째 요청: start_cursor: "이전_응답의_next_cursor", page_size: 100
    - 다음 100개 레코드 가져옴
    - has_more: true이면 계속 진행
   3. 반복: has_more: false가 될 때까지 계속
   4. 완료: 모든 레코드를 results 배열에 누적하여 반환
  */
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

    const data = await res.json();
    results = results.concat(data.results);
    hasMore = data.has_more;
    startCursor = data.next_cursor;
  }

  return results;
}



async syncPenaltyUsers() {
  let hasMore = true;
  let startCursor = undefined;
  let syncedCount = 0;

  // 모든 페이지를 순회하며 Notion DB 전체 조회
  while (hasMore) {
    const notionResponse = await fetch(`https://api.notion.com/v1/databases/${this.notionUserAccountDB}/query`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.NOTION_API_KEY}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filter: {
          property: "자격정지 적용",
          checkbox: { equals: true },
        },
        page_size: 100,
        start_cursor: startCursor,
      }),
    });

    const data = await notionResponse.json();
    const pages = data.results || [];

    // 각 페이지(회원)에 대해 Firebase 업데이트
    for (const page of pages) {
      const pageId = page.id;
      const props = page.properties;

      const userId = props["사용자ID"]?.title?.[0]?.plain_text;
      if (!userId) continue;
      const userName = props["사용자 실명"]?.rich_text?.[0]?.plain_text || "";

      //const penaltyStatus = props["자격정지 상태"]?.status?.name || "미적용";
      const penaltyReason = props["정지 사유"]?.rich_text?.[0]?.plain_text || "";
      //const penaltyAppliedAt = props["자격정지 정책 적용 일시"]?.date?.start || "";
      //const penaltyPeriodStart = props["자격정지 기간(일시정지)"]?.date?.start || "";
      //const penaltyPeriodEnd = props["자격정지 기간(일시정지)"]?.date?.end || "";
      const penaltyPeriodStart = props["자격정지 기간(시작)"]?.date?.start || "";
      const penaltyPeriodEnd = props["자격정지 기간(종료)"]?.date?.start || "";

      console.log("================================================");
      console.log("penaltyPeriodStart:", penaltyPeriodStart);
      console.log("penaltyPeriodEnd:", penaltyPeriodEnd);
      console.log("================================================");


      // 자격정지 상태가 "일시정지"인데 기간이 없는 경우 검증
      // if (penaltyStatus === "일시정지" && (!penaltyPeriodStart || !penaltyPeriodEnd)) {
      //   const error = new Error(`사용자 ${userId}의 자격정지 상태가 일시정지인데 자격정지 기간이 설정되지 않았습니다`);
      //   error.code = "SUSPENSION_PERIOD_REQUIRED";
      //   throw error;
      // }

      // 시작 값은 빈 값인데 종료 값만 있는 경우 검증
      if (!penaltyPeriodStart && penaltyPeriodEnd) {
        const error = new Error(`사용자 ${userName}의 자격정지 기간(시작)이 없는데 자격정지 기간(종료)이 설정되어 있습니다`);
        error.code = "SUSPENSION_START_REQUIRED";
        throw error;
      }

      // 자격정지 기간 처리 로직
      // "미적용"이나 "영구정지"인 경우 기간을 빈 값으로 설정
      // let finalSuspensionStart = "";
      // let finalSuspensionEnd = "";
      
      // if (penaltyStatus === "일시정지") {
      //   // 일시정지인 경우에만 기간 값 사용
      //   finalSuspensionStart = penaltyPeriodStart;
      //   finalSuspensionEnd = penaltyPeriodEnd;
      // }

      // Firebase users 컬렉션에서 해당 사용자 찾기
      const userRef = db.collection("users").doc(userId);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        console.warn(`[WARN] Firebase에 ${userId} 사용자가 존재하지 않음`);
        continue;
      }

      // Firebase 자격정지 정보 업데이트
      await userRef.update({
        //suspensionType: penaltyStatus, 기간이 있으면 일시정지, 없으면 영구정지(firebase에서 컬럼 제거 필요)
        suspensionReason: penaltyReason,
        // suspensionStart: finalSuspensionStart,
        // suspensionEnd: finalSuspensionEnd,
        suspensionStart: penaltyPeriodStart,
        suspensionEnd: penaltyPeriodEnd,
        suspensionAppliedAt: penaltyAppliedAt,
      });

      // Firebase 업데이트 후 최신 데이터 가져오기
      const updatedUserDoc = await userRef.get();
      const updatedUserData = updatedUserDoc.data();

      console.log("updatedUserData:", updatedUserData);

      // 노션에 Firebase 동기화된 데이터로 업데이트
      await this.notion.pages.update({
        page_id: pageId,
        properties: {
          // "자격정지 적용": {
          //   //checkbox: updatedUserData.suspended || false
          //   checkbox: false
          // },
          // "자격정지 상태": {
          //   status: updatedUserData.suspensionType ? { name: updatedUserData.suspensionType } : null
          // },
          // "자격정지 기간(일시정지)": {
          //   date: (updatedUserData.suspensionStart && updatedUserData.suspensionEnd) ? {
          //     start: updatedUserData.suspensionStart,
          //     end: updatedUserData.suspensionEnd
          //   } : null
          // },
          // "자격정지 정책 적용 일시": {
          //   date: updatedUserData.suspensionAppliedAt ? { 
          //     start: updatedUserData.suspensionAppliedAt 
          //   } : { 
          //     start: new Date().toISOString() 
          //   }
          // },
          "자격정지 기간(시작)": {
            date: updatedUserData.suspensionStart ? { 
              start: updatedUserData.suspensionStart 
            } : null
          },
          "자격정지 기간(종료)": {
            date: updatedUserData.suspensionEnd ? { 
              start: updatedUserData.suspensionEnd 
            } : null
          },
          "정지 사유": {
            rich_text: updatedUserData.suspensionReason ? [{
              text: { content: updatedUserData.suspensionReason }
            }] : []
          }
        },
      });

      syncedCount++;
    }

    // 다음 페이지가 있으면 cursor 갱신
    hasMore = data.has_more;
    startCursor = data.next_cursor;
  }

  console.log(`자격정지 회원 전체 동기화 완료: ${syncedCount}명`);
  return { syncedCount };
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