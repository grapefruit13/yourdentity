const { Client } = require('@notionhq/client');
const { db, FieldValue } = require("../config/database");
const { ADMIN_LOG_ACTIONS } = require("../constants/adminLogActions");


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
    let failedCount = 0;
    const syncedUserIds = []; // 동기화된 사용자 ID 목록
    const failedUserIds = []; // 동기화 실패한 사용자 ID 목록
  
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
          try{
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
                '기본 닉네임': { title: [{ text: { content: user.nickname || "" } }] },
                "프로필 사진": {
                  files: [
                    {
                      name: "profile-image",
                      type: "external",
                      external: { url: user.profileImageUrl || "https://example.com/default-profile.png" },
                    },
                  ],
                },
                "사용자ID": { rich_text: [{ text: { content: userId } }] },
                "사용자 실명": { rich_text: [{ text: { content: user.name || "" } }] },
                "상태": user.status
                  ? { select: { name: user.status } }
                  : { select: { name: "데이터 없음" } },
                "역할": { select: { name: user.role || "user" } },
                "전화번호": { rich_text: [{ text: { content: user.phoneNumber || "" } }] },
                "출생연도": { rich_text: [{ text: { content: user.birthDate || "" } }] },
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
                                  user.pushTermsAgreed === true
                                    ? "동의"
                                    : user.pushTermsAgreed === false
                                    ? "거부"
                                    : "미설정",
                              },
                            },
                "자격정지 기간(시작)": user.suspensionStartAt ? {
                  date: { 
                    start: user.suspensionStartAt 
                  }
                } : undefined,
                "자격정지 기간(종료)": user.suspensionEndAt ? {
                  date: { 
                    start: user.suspensionEndAt 
                  }
                } : undefined,
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
              syncedUserIds.push(userId); // 동기화된 사용자 ID 저장

        } catch (error) {
          // 동기화 실패 처리
          failedCount++;
          failedUserIds.push(userId);
          console.error(`[동기화 실패] 사용자 ${userId}:`, error.message || error);
        }

      }
    }
    
  
    console.log(`동기화 완료: ${syncedCount}명 갱신됨`);

    try {
      const logRef = db.collection("adminLogs").doc();
      await logRef.set({
        adminId: "Notion 관리자",
        action: ADMIN_LOG_ACTIONS.USER_PART_SYNCED,
        targetId: "", // 전체 동기화 작업이므로 빈 값
        timestamp: new Date(),
        metadata: {
          syncedCount: syncedCount,
          failedCount: failedCount,
          total: syncedCount + failedCount,
          syncedUserIds: syncedUserIds, // 동기화된 사용자 ID 목록
          failedUserIds: failedUserIds, // 동기화 실패한 사용자 ID 목록
        }
      });
      console.log(`[adminLogs] 회원 동기화 이력 저장 완료: ${syncedCount}명`);
    } catch (logError) {
      console.error("[adminLogs] 로그 저장 실패:", logError);
      // 로그 저장 실패는 메인 작업에 영향을 주지 않도록 에러를 throw하지 않음
    }



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
    const userId = props["사용자ID"]?.rich_text?.[0]?.plain_text || null;
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
    console.log('=== 전체 사용자 동기화 시작 (Upsert 방식) ===');
    
    // 1. Firebase users 컬렉션 전체 가져오기
    const snapshot = await db.collection("users").get();
    console.log(`Firebase에서 ${snapshot.docs.length}명의 사용자 데이터를 가져왔습니다.`);

    // 2. 노션에 있는 기존 사용자 목록 가져오기 (ID와 pageId 매핑)
    const notionUsers = await this.getNotionUsers(this.notionUserAccountDB);
    console.log(`노션에 기존 사용자 ${Object.keys(notionUsers).length}명이 존재합니다.`);

    const now = new Date();
    let syncedCount = 0; //동기화 성공 : update+created
    let updatedCount = 0; //노션에 기존 페이지에 있어서 업데이트 카운트
    let createdCount = 0; //노션에 없어서 새로 생성한 카운트
    let failedCount = 0; //동기화 실패 카운트
    const syncedUserIds = [];
    const failedUserIds = [];

    // 3. 사용자 데이터를 배치로 처리
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
          const existingNotionUser = notionUsers[userId];

          // 날짜 처리
          const createdAtIso = safeDateToIso(user.createdAt);
          const lastLoginIso = safeDateToIso(user.lastLogin);
          const lastUpdatedIso = now;

          // Notion 페이지 데이터 구성
          const notionPage = {
            '기본 닉네임': { title: [{ text: { content: user.nickname || "" } }] },
            "프로필 사진": {
              files: [
                {
                  name: "profile-image",
                  type: "external",
                  external: { url: user.profileImageUrl || "https://example.com/default-profile.png" },
                },
              ],
            },
            "사용자ID": { rich_text: [{ text: { content: userId } }] },
            "사용자 실명": { rich_text: [{ text: { content: user.name || "" } }] },
            "상태": user.status
               ? { select: { name: user.status } }
               : { select: { name: "데이터 없음" } },
            "역할": { select: { name: user.role || "user" } },
            "전화번호": { rich_text: [{ text: { content: user.phoneNumber || "" } }] },
            "출생연도": { rich_text: [{ text: { content: user.birthDate || "" } }] },
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
                  user.pushTermsAgreed === true
                    ? "동의"
                    : user.pushTermsAgreed === false
                    ? "거부"
                    : "미설정",
              },
            },
            "자격정지 기간(시작)": user.suspensionStartAt ? {
              date: { 
                start: user.suspensionStartAt 
              }
            } : undefined,
            "자격정지 기간(종료)": user.suspensionEndAt ? {
              date: { 
                start: user.suspensionEndAt 
              }
            } : undefined,
            "정지 사유": user.suspensionReason ? {
              rich_text: [{
                text: { content: user.suspensionReason }
              }]
            } : {
              rich_text: []
            },
            "동기화 시간": { date: { start: lastUpdatedIso.toISOString() } },
          };

          // Upsert: 기존 페이지가 있으면 업데이트, 없으면 생성
          if (existingNotionUser) {
            // 기존 페이지 업데이트
            await this.updateNotionPageWithRetry(existingNotionUser.pageId, notionPage);
            updatedCount++;
          } else {
            // 새 페이지 생성
            await this.createNotionPageWithRetry(notionPage);
            createdCount++;
          }

          syncedCount++;
          syncedUserIds.push(userId);

          return { success: true, userId, action: existingNotionUser ? 'update' : 'create' };
        } catch (error) {
          failedCount++;
          failedUserIds.push(doc.id);
          console.error(`사용자 ${doc.id} 처리 실패:`, error.message);
          return { success: false, userId: doc.id, error: error.message };
        }
      });

      // 배치 결과 처리
      const batchResults = await Promise.all(batchPromises);
      const batchSuccess = batchResults.filter(r => r.success).length;
      const batchFailed = batchResults.filter(r => !r.success).length;

      console.log(`배치 완료: 성공 ${batchSuccess}명, 실패 ${batchFailed}명 (총 진행률: ${syncedCount + failedCount}/${snapshot.docs.length})`);

      // 마지막 배치가 아니면 지연
      if (i + BATCH_SIZE < snapshot.docs.length) {
        console.log(`${DELAY_MS/1000}초 대기 중...`);
        await new Promise(resolve => setTimeout(resolve, DELAY_MS));
      }
    }


    // 4. Firebase에는 없거나 사용자ID가 빈값인 노션 페이지 아카이브 처리
    const firebaseUserIds = new Set(snapshot.docs.map(doc => doc.id));
    
    // 노션의 모든 페이지 가져오기 (사용자ID가 빈값인 페이지도 포함)
    const allNotionPages = await this.getAllNotionPages(this.notionUserAccountDB);
    
    // 아카이브 대상 페이지 찾기
    const pagesToArchive = [];
    for (const page of allNotionPages) {
      const props = page.properties;
      const userId = props["사용자ID"]?.rich_text?.[0]?.plain_text || "";
      
      // 사용자ID가 빈값이거나, 사용자ID가 있지만 Firebase에 없는 경우 아카이브 대상
      if (!userId || !firebaseUserIds.has(userId)) {
        pagesToArchive.push({
          pageId: page.id,
          userId: userId || "(사용자ID 없음)",
          reason: !userId ? "사용자ID 빈값" : "Firebase에 없음"
        });
      }
    }
    

    let archivedCount = 0;
    let archiveFailedCount = 0;
    
    if (pagesToArchive.length > 0) {
      console.log(`아카이브 대상 페이지 ${pagesToArchive.length}개 발견 (사용자ID 빈값: ${pagesToArchive.filter(p => p.reason === "사용자ID 빈값").length}개, Firebase에 없음: ${pagesToArchive.filter(p => p.reason === "Firebase에 없음").length}개)`);
      
      // 배치 처리로 아카이브
      const ARCHIVE_BATCH_SIZE = 10;
      const ARCHIVE_DELAY_MS = 1000;
      
      for (let i = 0; i < pagesToArchive.length; i += ARCHIVE_BATCH_SIZE) {
        const batch = pagesToArchive.slice(i, i + ARCHIVE_BATCH_SIZE);
        console.log(`아카이브 배치 ${Math.floor(i / ARCHIVE_BATCH_SIZE) + 1}/${Math.ceil(pagesToArchive.length / ARCHIVE_BATCH_SIZE)} 처리 중...`);
        
        await Promise.all(batch.map(async (page) => {
          try {
            await this.archiveNotionPageWithRetry(page.pageId);
            archivedCount++;
            console.log(`[아카이브 성공] 페이지 ${page.pageId} (사용자ID: ${page.userId}, 사유: ${page.reason})`);
          } catch (error) {
            archiveFailedCount++;
            console.error(`[아카이브 실패] 페이지 ${page.pageId} (사용자ID: ${page.userId}):`, error.message);
          }
        }));
        
        // 마지막 배치가 아니면 지연
        if (i + ARCHIVE_BATCH_SIZE < pagesToArchive.length) {
          await new Promise(resolve => setTimeout(resolve, ARCHIVE_DELAY_MS));
        }
      }
    }

    console.log(`=== 전체 동기화 완료 ===`);
    console.log(`총 ${syncedCount}명 동기화 (업데이트: ${updatedCount}명, 생성: ${createdCount}명)`);
    console.log(`실패: ${failedCount}명, 아카이브: ${archivedCount}명`);

    try {
      const logRef = db.collection("adminLogs").doc();
      await logRef.set({
        adminId: "Notion 관리자",
        action: ADMIN_LOG_ACTIONS.USER_ALL_SYNCED,
        targetId: "",
        timestamp: new Date(),
        metadata: {
          syncedCount: syncedCount,
          failedCount: failedCount,
          total: snapshot.docs.length,
          syncedUserIds: syncedUserIds,
          failedUserIds: failedUserIds,
        }
      });
      console.log(`[adminLogs] 전체 동기화 이력 저장 완료`);
    } catch (logError) {
      console.error("[adminLogs] 로그 저장 실패:", logError);
    }

    return { 
      syncedCount, 
      updatedCount, 
      createdCount, 
      archivedCount,
      failedCount, 
      total: snapshot.docs.length 
    };

  } catch (error) {
    console.error('syncAllUserAccounts 전체 오류:', error);
    throw error;
  }
}


// 재시도 로직이 포함된 Notion 페이지 업데이트
async updateNotionPageWithRetry(pageId, notionPage, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await this.notion.pages.update({
        page_id: pageId,
        properties: notionPage,
      });
      return; // 성공하면 종료
    } catch (error) {
      console.warn(`Notion 페이지 업데이트 시도 ${attempt}/${maxRetries} 실패 (pageId: ${pageId}):`, error.message);
      
      if (attempt === maxRetries) {
        throw new Error(`Notion 페이지 업데이트 최종 실패 (pageId: ${pageId}): ${error.message}`);
      }
      
      // 지수 백오프: 1초, 2초, 4초...
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`${delay/1000}초 후 재시도...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
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
  let failedCount = 0;
  const syncedUserIds = []; // 동기화된 사용자 ID 목록
  const failedUserIds = []; // 동기화 실패한 사용자 ID 목록

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
          property: "선택",
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

      const userId = props["사용자ID"]?.rich_text?.[0]?.plain_text;
      if (!userId) continue;
      const userName = props["사용자 실명"]?.rich_text?.[0]?.plain_text || "";
      const penaltyReason = props["정지 사유"]?.rich_text?.[0]?.plain_text || "";
      const penaltyPeriodStart = props["자격정지 기간(시작)"]?.date?.start || "";
      const penaltyPeriodEnd = props["자격정지 기간(종료)"]?.date?.start || "";

      console.log("================================================");
      console.log("penaltyPeriodStart:", penaltyPeriodStart);
      console.log("penaltyPeriodEnd:", penaltyPeriodEnd);
      console.log("================================================");

      // 시작 값은 빈 값인데 종료 값만 있는 경우 검증
      if (!penaltyPeriodStart && penaltyPeriodEnd) {
        // const error = new Error(`사용자 ${userName}의 자격정지 기간(시작)이 없는데 자격정지 기간(종료)이 설정되어 있습니다`);
        // error.code = "SUSPENSION_START_REQUIRED";
        // throw error;

        failedCount++;
        failedUserIds.push(userId);
        console.log("사용자 ${userName}의 자격정지 기간(시작)이 없는데 자격정지 기간(종료)이 설정되어 있습니다");
        continue;

      }

      // Firebase users 컬렉션에서 해당 사용자 찾기
      const userRef = db.collection("users").doc(userId);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        console.warn(`[WARN] Firebase에 ${userId} 사용자가 존재하지 않음`);
        continue;
      }

      // Firebase 자격정지 정보 업데이트
      await userRef.update({
        suspensionReason: penaltyReason,
        suspensionStart: penaltyPeriodStart,
        suspensionEnd: penaltyPeriodEnd,
      });

      // Firebase 업데이트 후 최신 데이터 가져오기
      const updatedUserDoc = await userRef.get();
      const updatedUserData = updatedUserDoc.data();

      console.log("updatedUserData:", updatedUserData);

      // 노션에 Firebase 동기화된 데이터로 업데이트
      await this.notion.pages.update({
        page_id: pageId,
        properties: {
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
      syncedUserIds.push(userId); // 동기화된 사용자 ID 저장
    }

    // 다음 페이지가 있으면 cursor 갱신
    hasMore = data.has_more;
    startCursor = data.next_cursor;
  }

  console.log(`자격정지 회원 전체 동기화 완료: ${syncedCount}명`);


  try {
    const logRef = db.collection("adminLogs").doc();
    await logRef.set({
      adminId: "Notion 관리자",
      action: ADMIN_LOG_ACTIONS.USER_ALL_SYNCED,
      targetId: "", // 전체 동기화 작업이므로 빈 값
      timestamp: new Date(),
      metadata: {
        syncedCount: syncedCount,
        failedCount: failedCount,
        total: syncedCount + failedCount,
        syncedUserIds: syncedUserIds, // 동기화된 사용자 ID 목록
        failedUserIds: failedUserIds, // 동기화 실패한 사용자 ID 목록
      }
    });
    console.log(`[adminLogs] 회원 동기화 이력 저장 완료: ${syncedCount}명 성공, ${failedCount}명 실패`);
  } catch (logError) {
    console.error("[adminLogs] 로그 저장 실패:", logError);
    // 로그 저장 실패는 메인 작업에 영향을 주지 않도록 에러를 throw하지 않음
  }


  return { syncedCount };
}



async syncSelectedUsers() {
  let hasMore = true;
  let startCursor = undefined;
  let syncedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;
  const syncedUserIds = []; // 동기화된 사용자 ID 목록
  const failedUserIds = []; // 건너뜀한 사용자 ID 목록
  let validateErrorCount = 0; //값이 잘못된 경우

  // 모든 페이지를 순회하며 "선택" 필드가 체크된 데이터만 조회
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
          property: "선택",
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

      const userId = props["사용자ID"]?.rich_text?.[0]?.plain_text
      
      if (!userId) {
        console.warn(`[WARN] 사용자ID가 없는 노션 페이지: ${pageId}`);
        skippedCount++;
        failedUserIds.push(userId);
        continue;
      }

      // Firebase users 컬렉션에서 해당 사용자 찾기
      const userRef = db.collection("users").doc(userId);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        console.warn(`[WARN] Firebase에 ${userId} 사용자가 존재하지 않음`);
        skippedCount++;
        failedUserIds.push(userId);
        continue;
      }

      // 노션 필드에서 데이터 추출
      const nickname = props["기본 닉네임"]?.title?.[0]?.plain_text ||  "";
      const name = props["사용자 실명"]?.rich_text?.[0]?.plain_text || "";
      
      // 프로필 사진 URL 추출 (files 타입)
      let profileImageUrl = "";
      if (props["프로필 사진"]?.files && props["프로필 사진"].files.length > 0) {
        const file = props["프로필 사진"].files[0];
        profileImageUrl = file.external?.url || file.file?.url || "";
      }

      // 상태 매핑 (노션: "pending" | "active" | "suspended" -> Firebase 동일)
      const statusSelect = props["상태"]?.select?.name;
      let status = undefined;
      if (statusSelect) {
        if (statusSelect === "pending" || statusSelect === "active" || statusSelect === "suspended") {
          status = statusSelect;
        } else if (statusSelect === "대기" || statusSelect === "활동" || statusSelect === "정지") {
          // 한글 매핑
          status = statusSelect === "대기" ? "pending" : 
                   statusSelect === "활동" ? "active" : "suspended";
        }
      }

      const phoneNumber = props["전화번호"]?.rich_text?.[0]?.plain_text || "";
      const birthDate = props["출생연도"]?.rich_text?.[0]?.plain_text || 
                        (props["출생연도"]?.number ? String(props["출생연도"].number) : "");
      const email = props["이메일"]?.rich_text?.[0]?.plain_text || "";

      // 날짜 필드 추출
      const createdAtDate = props["가입완료 일시"]?.date?.start || null;
      const lastLoginDate = props["최근 앱 활동 일시"]?.date?.start || 
                           props["앱 첫 로그인"]?.date?.start || null;

      // 가입 방법 매핑
      const authTypeSelect = props["가입 방법"]?.select?.name || "";


      // Push 광고 수신 여부
      const pushAgreeSelect = props["Push 광고 수신 여부"]?.select?.name || "";
      let pushTermsAgreed = undefined;
      if (pushAgreeSelect === "동의" || pushAgreeSelect === "true") {
        pushTermsAgreed = true;
      } else if (pushAgreeSelect === "거부" || pushAgreeSelect === "false") {
        pushTermsAgreed = false;
      }

      // 성별 매핑
      const genderSelect = props["성별"]?.select?.name || "";
      let gender = undefined;
      if (genderSelect === "남성" || genderSelect === "male") {
        gender = "male";
      } else if (genderSelect === "여성" || genderSelect === "female") {
        gender = "female";
      }

      // 자격정지 관련 필드
      const suspensionStartAt = props["자격정지 기간(시작)"]?.date?.start || null;
      const suspensionEndAt = props["자격정지 기간(종료)"]?.date?.start || null;
      const suspensionReason = props["정지 사유"]?.rich_text?.[0]?.plain_text || "";

      // 업데이트할 데이터 객체 생성 (undefined가 아닌 값만 업데이트)
      const updateData = {};
      
      if (nickname) updateData.nickname = nickname;
      if (name) updateData.name = name;
      if (profileImageUrl) updateData.profileImageUrl = profileImageUrl;
      if (status) updateData.status = status;
      if (phoneNumber) updateData.phoneNumber = phoneNumber;
      if (birthDate) updateData.birthDate = birthDate;
      if (email) updateData.email = email;
      if (pushTermsAgreed !== undefined) updateData.pushTermsAgreed = pushTermsAgreed;
      if (gender) updateData.gender = gender;
      
      // 날짜 필드 처리
      if (createdAtDate) {
        updateData.createdAt = createdAtDate;
      }
      if (lastLoginDate) {
        updateData.lastLogin = lastLoginDate;
      }

      // 자격정지 필드 처리
      if (suspensionReason) updateData.suspensionReason = suspensionReason;
      if (suspensionStartAt) {
        updateData.suspensionStartAt = suspensionStartAt;
      }
      if (suspensionEndAt) {
        updateData.suspensionEndAt = suspensionEndAt;
      }

      // lastUpdated 업데이트
      const now = new Date();
      updateData.lastUpdated = now;


       // 시작 값은 빈 값인데 종료 값만 있는 경우 검증
       if (!suspensionStartAt && suspensionEndAt) {
        const endDate = new Date(suspensionEndAt);
        const isPermanentSuspension = endDate.getFullYear() === 9999 && 
                                     endDate.getMonth() === 11 && // 12월은 11 (0부터 시작)
                                     endDate.getDate() === 31;
                                     
        if (!isPermanentSuspension) {
            console.warn(`사용자 ${name}의 자격정지 기간(시작)이 없는데 자격정지 기간(종료)이 설정되어 있습니다`);
            validateErrorCount++;
            failedUserIds.push(userId);
            continue;
        }
                                     
      }


      // Firebase 업데이트 실행
      await userRef.update(updateData);

      console.log(`[SUCCESS] ${userId} (${name || nickname}) 업데이트 완료`);

      // 노션의 "선택" 체크박스 해제 (동기화 후 선택 상태 해제)
      try {
        await this.notion.pages.update({
          page_id: pageId,
          properties: {
            "선택": {
              checkbox: false
            },
            "동기화 시간": {
              date: { start: now.toISOString() }
            }
          },
        });
      } catch (notionUpdateError) {
        console.warn(`[WARN] 노션 페이지 ${pageId} 업데이트 실패:`, notionUpdateError.message);
      }

      syncedCount++;
      syncedUserIds.push(userId); // 동기화된 사용자 ID 저장
    }

    // 다음 페이지가 있으면 cursor 갱신
    hasMore = data.has_more;
    startCursor = data.next_cursor;
  }

  console.log(`선택된 회원 동기화 완료: ${syncedCount}명 업데이트, ${skippedCount}명 건너뜀, 잘못된 값: ${validateErrorCount}`);
 
  
  try {
    const logRef = db.collection("adminLogs").doc();
    await logRef.set({
      adminId: "Notion 관리자",
      action: ADMIN_LOG_ACTIONS.USER_ALL_SYNCED,
      targetId: "", // 전체 동기화 작업이므로 빈 값
      timestamp: new Date(),
      metadata: {
        syncedCount: syncedCount,
        failedCount: skippedCount + validateErrorCount,
        total: syncedCount + skippedCount + validateErrorCount,
        syncedUserIds: syncedUserIds, // 동기화된 사용자 ID 목록
        failedUserIds: failedUserIds, // 동기화 실패한 사용자 ID 목록
      }
    });
    console.log(`[adminLogs] 회원 동기화 이력 저장 완료: ${syncedCount}명 성공, ${failedCount}명 실패`);
  } catch (logError) {
    console.error("[adminLogs] 로그 저장 실패:", logError);
    // 로그 저장 실패는 메인 작업에 영향을 주지 않도록 에러를 throw하지 않음
  }
 
 
  return { syncedCount, skippedCount, validateErrorCount };
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