const { Client } = require('@notionhq/client');
const { db, FieldValue } = require("../config/database");
const { ADMIN_LOG_ACTIONS } = require("../constants/adminLogActions");


class AdminLogsService {

    constructor() {
        this.notion = new Client({
          auth: process.env.NOTION_API_KEY,
        });
    
        this.notionAdminLogDB = process.env.NOTION_ADMIN_LOG_DB_ID;
    }


    /**
   * Firebase의 adminLogs 컬렉션에서 데이터 조회 후
   * Notion 데이터베이스에 동기화
   * - 관리자ID(컬렉션 ID)를 기준으로 노션에서 해당 페이지를 찾아 업데이트
   * - 노션에 없으면 새로 생성
   */
  async syncAdminLogs() {
    try {
      console.log('=== 관리자 로그 동기화 시작 ===');
      
      // 1. Firebase adminLogs 컬렉션 전체 조회
      const snapshot = await db.collection("adminLogs").get();
      console.log(`Firebase에서 ${snapshot.docs.length}건의 관리자 로그를 가져왔습니다.`);

      // 2. 노션 데이터베이스에서 기존 데이터 조회 (관리자ID 기준)
      const notionAdminLogs = await this.getNotionAdminLogs(this.notionAdminLogDB);

      let syncedCount = 0;
      let failedCount = 0;
      const syncedLogIds = [];
      const failedLogIds = [];

      // 3. 각 adminLog 데이터를 노션에 동기화
      for (const doc of snapshot.docs) {
        try {
          const adminLogId = doc.id;
          const adminLog = doc.data();

          // 노션 데이터 구성
          const notionPage = this.buildNotionAdminLogPage(adminLog, adminLogId);

          // 노션에 기존 페이지가 있으면 업데이트, 없으면 생성
          if (notionAdminLogs[adminLogId]) {
            // 기존 페이지 업데이트
            await this.notion.pages.update({
              page_id: notionAdminLogs[adminLogId].pageId,
              properties: notionPage,
            });
            console.log(`[업데이트] 관리자 로그 ${adminLogId} 노션 동기화 완료`);
          } else {
            // 새 페이지 생성
            await this.notion.pages.create({
              parent: { database_id: this.notionAdminLogDB },
              properties: notionPage,
            });
            console.log(`[생성] 관리자 로그 ${adminLogId} 노션 동기화 완료`);
          }

          syncedCount++;
          syncedLogIds.push(adminLogId);
        } catch (error) {
          failedCount++;
          failedLogIds.push(doc.id);
          console.error(`[동기화 실패] 관리자 로그 ${doc.id}:`, error.message || error);
        }
      }

      console.log(`=== 관리자 로그 동기화 완료 ===`);
      console.log(`성공: ${syncedCount}건, 실패: ${failedCount}건`);

      return { syncedCount, failedCount };

    } catch (error) {
      console.error('syncAdminLogs 전체 오류:', error);
      throw error;
    }
  }


  /**
   * adminLog 데이터를 노션 페이지 형식으로 변환
   */
  buildNotionAdminLogPage(adminLog, adminLogId) {
    // 상태 계산: SUCCESS, PARTIAL, FAILURE
    const metadata = adminLog.metadata || {};
    const syncedCount = metadata.syncedCount || 0;
    const failedCount = metadata.failedCount || 0;
    const total = metadata.total || 1;

    let status = "SUCCESS";
    if (failedCount > 0 && syncedCount === 0) {
      status = "FAILURE";
    } else if (syncedCount > 0 && failedCount > 0) {
      status = "PARTIAL";
    } else if (total > 1 && failedCount > 0) {
      status = "PARTIAL";
    }

    // 날짜 처리
    const timestampDate = safeDateToIso(adminLog.timestamp);

    // 노션 페이지 속성 구성
    const notionPage = {
      "관리자ID": {
        rich_text: [{ text: { content: adminLogId } }]
      },
      "행위자": {
        title: [{ text: { content: adminLog.adminId || "" } }]
      },
      "행위명": {
        select : { name: adminLog.action || "" }
      },
      "대상ID": {
        rich_text: [{ text: { content: adminLog.targetId || "" } }]
      },
      "상태": {
        select: { name: status }
      },
      "전체 건수": {
        number: total
      },
      "성공": {
        number: syncedCount || (status === "SUCCESS" ? 1 : 0)
      },
      "실패": {
        number: failedCount || (status === "FAILURE" ? 1 : 0)
      },
      "동기화 시간": { date: { start: new Date().toISOString() } }
    };

    // 발생일시 추가
    if (timestampDate) {
      notionPage["발생일시"] = {
        date: { start: timestampDate }
      };
    }

    return notionPage;
  }


  /**
   * 노션 데이터베이스에서 모든 관리자 로그 조회 (관리자ID 기준)
   */
  async getNotionAdminLogs(databaseId) {
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

       // 응답 상태 확인
       if (!res.ok) {
        const errorText = await res.text();
        console.error(`[Notion API Error] Status: ${res.status}, Response: ${errorText}`);
        throw new Error(`Notion API 요청 실패: ${res.status} - ${errorText}`);
      }

      const data = await res.json();

      // 에러 응답 확인
      if (data.error) {
        console.error(`[Notion API Error]`, data.error);
        throw new Error(`Notion API 에러: ${data.error.message || JSON.stringify(data.error)}`);
      }

      // results가 배열인지 확인
      if (!Array.isArray(data.results)) {
        console.error(`[Notion API Error] 예상치 못한 응답 구조:`, data);
        throw new Error(`Notion API 응답 형식 오류: results가 배열이 아닙니다.`);
      }


      results = results.concat(data.results);
      hasMore = data.has_more;
      startCursor = data.next_cursor;
    }

    const logMap = {};
    for (const page of results) {
      const props = page.properties;
      // 관리자ID 필드에서 컬렉션 ID 추출
      const adminLogId = props["관리자ID"]?.rich_text?.[0]?.plain_text || null;
      if (adminLogId) {
        logMap[adminLogId] = { pageId: page.id };
      }
    }
    return logMap;
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


module.exports = new AdminLogsService();