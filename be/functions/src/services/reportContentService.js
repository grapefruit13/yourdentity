const { Client } = require('@notionhq/client');
const { db, FieldValue } = require("../config/database");



class ReportContentService {
  constructor() {
    this.notion = new Client({
      auth: process.env.NOTION_API_KEY,
    });
    
    this.reportsDatabaseId = process.env.NOTION_REPORT_CONTENT_DB_ID;
    this.reportedDatabaseId = process.env.NOTION_REPORTED_CONTENT_DB_ID;
  }

/**
   * 게시글/댓글 신고 생성
   */
async createReport(reportData) {
  try {
    const { 
      targetType, 
      targetId, 
      targetUserId,
      communityId, 
      reporterId, 
      reportReason 
    } = reportData;


    // 1. 중복 신고 체크
    const existingReport = await this.checkDuplicateReport(reporterId, targetType, targetId);
    if (existingReport) {
      const error = new Error("이미 신고한 콘텐츠입니다.");
      error.code = "DUPLICATE_REPORT";
      error.status = 400;
      throw error;
    }

    // 2. 신고 대상 존재 여부 확인
    await this.validateTargetExists(targetType, targetId, communityId);

    // 3. Notion에 직접 저장
    const notionReport = {
      targetType,
      targetId,
      targetUserId,
      communityId,
      reporterId,
      reportReason,
      status: false,
      reviewedBy: null,
      reviewedAt: null,
      memo: null,
      createdAt: new Date().toISOString(),
      notionUpdatedAt: new Date().toISOString()
    };

    // 4. Notion에 직접 저장
    const notionPage = await this.syncToNotion(notionReport);

    // 5. 필요 시 Notion 결과 반환
    return {
      ...notionReport,
      notionPageId: notionPage?.id || null,
      message: "신고가 정상적으로 접수되었습니다 (Notion에 저장됨)."
    };

  } catch (error) {
    console.error("Create report error:", error);
    throw error;
  }
}

/**
 * 동일 신고(중복 신고) 여부 체크 - 노션 데이터베이스에서 확인
 * reportsDatabaseId와 reportedDatabaseId 두 데이터베이스 모두에서 확인
 */
async checkDuplicateReport(reporterId, targetType, targetId) {
  try {
    const notionTargetType = this.mapTargetType(targetType);

    // 두 데이터베이스에서 중복 체크를 위한 공통 필터
    const filter = {
      and: [
        { property: '신고자ID', rich_text: { equals: reporterId } },
        { property: '신고 타입', title: { equals: notionTargetType } },
        { property: '신고 콘텐츠', rich_text: { equals: targetId } },
      ]
    };

    // 1. reportsDatabaseId에서 중복 체크
    const response1 = await fetch(`https://api.notion.com/v1/databases/${this.reportsDatabaseId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filter: filter,
        page_size: 1
      })
    });

    const data1 = await response1.json();

    if (!response1.ok) {
      throw new Error(`Notion duplicate check failed (reportsDatabaseId): ${data1.message || response1.statusText}`);
    }

    // reportsDatabaseId에서 중복 발견
    if (data1.results && data1.results.length > 0) {
      const page = data1.results[0];
      return { id: page.id, reporterId, targetType, targetId, database: 'reportsDatabaseId' };
    }

    // 2. reportedDatabaseId에서 중복 체크
    const response2 = await fetch(`https://api.notion.com/v1/databases/${this.reportedDatabaseId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filter: filter,
        page_size: 1
      })
    });

    const data2 = await response2.json();

    if (!response2.ok) {
      throw new Error(`Notion duplicate check failed (reportedDatabaseId): ${data2.message || response2.statusText}`);
    }

    // reportedDatabaseId에서 중복 발견
    if (data2.results && data2.results.length > 0) {
      const page = data2.results[0];
      return { id: page.id, reporterId, targetType, targetId, database: 'reportedDatabaseId' };
    }

    // 두 데이터베이스 모두에서 중복 없음
    return null;

  } catch (error) {
    console.error('Notion 중복 신고 확인 실패:', error);
    throw error;
  }
}



/**
 * 신고 대상 존재 여부 확인
 */
async validateTargetExists(targetType, targetId, communityId) {
  try {
    if (targetType === 'post') {

      if (!communityId) {
        const error1 = new Error("communityId가 필요합니다. 게시글은 반드시 커뮤니티 하위에 존재합니다.");
        error1.code = "MISSING_COMMUNITY_ID";
        error1.status = 400;
        throw error1;
      }

      const postDoc = await db.doc(`communities/${communityId}/posts/${targetId}`).get();
      if (!postDoc.exists) {
        const error2 = new Error("신고하려는 게시글을 찾을 수 없습니다.");
        error2.code = "NOTION_POST_NOT_FOUND";
        error2.status = 404;
        throw error2;
      }
    } else if (targetType === 'comment') {
      const commentDoc = await db.doc(`comments/${targetId}`).get();
      if (!commentDoc.exists) {
        const error3 = new Error("신고하려는 댓글을 찾을 수 없습니다.");
        error3.code = "COMMENT_NOT_FOUND";
        error3.status = 404;
        throw error3;
      }
    }
  } catch (error) {
    console.error("Validate target exists error:", error);
    throw error;
  }
}


unmapTargetType(label) {
  switch (label) {
    case "게시글": return "post";
    case "댓글": return "comment";
    default: return label;
  }
}


/**
 * 사용자 신고 목록 조회 (cursor 기반 페이지네이션)
 * + Firestore -> Reports컬렉션 Index추가(reporterId, createdAt, _name_)
 * {
    "reporterId": "2JJJUVyFPyRRRiyOgGfEqIZS3123",  
    "size": 1,
    "cursor" : "28a1f705-fa4a-80a7-9369-c7049596b9c2" -> 다음 페이지를 조회하는 경우만 요청
  }
 */
async getReportsByReporter(reporterId, { size = 10, cursor }) {
  try {
    const body = {
      filter: {
        property: '신고자ID',
        rich_text: { equals: reporterId }
      },
      sorts: [
        { property: '신고일시', direction: 'descending' } // 최신 순 정렬
      ],
      page_size: size
    };

    if (cursor) {
      body.start_cursor = cursor;
    }

    const response = await fetch(`https://api.notion.com/v1/databases/${this.reportsDatabaseId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return { reports: [], hasMore: false, nextCursor: null };
    }

    const reports = data.results.map(page => {
      const props = page.properties;
      return {
        notionPageId: page.id,
        targetType: this.unmapTargetType(props['신고 타입']?.title?.[0]?.text?.content),
        targetId: props['신고 콘텐츠']?.rich_text?.[0]?.text?.content || null,
        targetUserId: props['작성자']?.rich_text?.[0]?.text?.content || null,
        reporterId: props['신고자ID']?.rich_text?.[0]?.text?.content || null,
        reportReason: props['신고 사유']?.rich_text?.[0]?.text?.content || null,
        communityId: props['커뮤니티 ID']?.rich_text?.[0]?.text?.content || null,
        //status: props['상태']?.select?.name || null,
        status : props['상태']?.checkbox || false,
        reportedAt: props['신고일시']?.date?.start || null,
        syncNotionAt: props['동기화 시간(Notion)']?.date?.start || null,
        syncNotionFirebase: props['동기화 시간(Firebase)']?.date?.start || null
      };
    });

    return {
      reports,
      hasMore: data.has_more,
      nextCursor: data.next_cursor || null
    };

  } catch (error) {
    console.error("Notion 신고 조회 실패:", error);
    throw new Error("Notion에서 신고 데이터를 조회하는 중 오류가 발생했습니다.");
  }
}



/**
 * Notion에 동기화
 */
async syncToNotion(reportData) {
  try {
    const notionResult = await this.syncReportToNotion(reportData);
    return notionResult;
  } catch (error) {
    console.error("Sync to Notion error:", error);
    throw error;
  }
}


/**
 * 신고 데이터를 Notion에 동기화(요청에 대한)
 */
async syncReportToNotion(reportData) {
  try {
    
    const { targetType, targetId, targetUserId, communityId, reporterId, reportReason, firebaseUpdatedAt, notionUpdatedAt, status = false} = reportData;
    
    /*
    TODO : 로그인 토큰 관련 이슈가 해결되면
    - 작성자 ID를 저장하고 노션에 보여줄때는 users컬렉션에서 작성자 이름 + 해당 작성자 이름을 클릭하면 작성자 정보 데이터베이스 추가필요
    - 신고자 ID를 저장하고 노션에 보여줄때는 users컬렉션에서 신고자 이름을 + 해당 신고자를 클릭하는 경우 해당 사용자에 대한 데이터베이스 만들기
    */
    async function getReporterName(reporterId) {
      if (!reporterId) return "알 수 없음";
    
      const userDoc = await db.collection("users").doc(reporterId).get();
      if (!userDoc.exists) return "알 수 없음";
    
      const userData = userDoc.data();
      return userData.name || "알 수 없음";
    }

    
    const reporterName = await getReporterName(reporterId);


    const notionData = {
      parent: { database_id: this.reportsDatabaseId },
      properties: {
        '신고 타입': { title: [{ text: { content: this.mapTargetType(targetType) } }] },
        '신고 콘텐츠': { rich_text: [{ text: { content: `${targetId}` } }] },
        '작성자': { rich_text: [{ text: { content: `${targetUserId}` } }] },
        '신고 사유': { rich_text: [{ text: { content: reportReason } }] },
        '신고자': { rich_text: [{ text: { content: reporterName } }] },
        '신고자ID': { rich_text: [{ text: { content: `${reporterId}` } }] },
        '신고일시': { date: { start: new Date().toISOString() } },
        '커뮤니티 ID': { rich_text: communityId ? [{ text: { content: communityId } }] : [] },
        '상태': { checkbox: status },
        '동기화 시간(Firebase)': { 
            date: { 
              start: new Date(new Date().getTime()).toISOString()
            },
          },
        }
    };


    const response = await this.notion.pages.create(notionData);
    console.log('Notion 동기화 성공:', response.id);
    return { success: true, notionPageId: response.id };
  } catch (error) {
    console.error('Notion 동기화 실패:', error);
    //throw new Error(`Notion 동기화 실패: ${error.message}`);
    const customError = new Error("Notion 동기화 중 오류가 발생했습니다.");
    customError.code = "NOTION_SYNC_FAILED";
    customError.status = 500;
    throw customError;
  }
}



mapTargetType(targetType) {
  return { post: '게시글', comment: '댓글' }[targetType] || '기타';
}


/**
 * Notion 데이터베이스의 모든 페이지 삭제
 */
async clearNotionDatabase() {
  try {
    let cursor = undefined;
    do {
      const response = await this.notion.databases.query({
        database_id: this.reportsDatabaseId,
        start_cursor: cursor,
      });

      for (const page of response.results) {
        // Notion API에서는 실제로 페이지를 'delete'하는 것이 아니라 'archived' 처리
        await this.notion.pages.update({
          page_id: page.id,
          archived: true,
        });
        console.log(`페이지 삭제 처리 완료: ${page.id}`);
      }

      cursor = response.has_more ? response.next_cursor : undefined;
    } while (cursor);
  } catch (error) {
    console.error('Notion 데이터베이스 초기화 실패:', error);
    throw new Error(`Notion 데이터베이스 초기화 실패: ${error.message}`);
  }
}

/**
 * 노션DB 와 Firebase 동기화
 */
async syncResolvedReports() {
  let cursor = undefined;
  const reports = [];

  try {
    // 1. Notion에서 데이터 조회
    while (true) {
      const body = { start_cursor: cursor };
      const response = await fetch(`https://api.notion.com/v1/databases/${this.reportsDatabaseId}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      if (!data.results) break;

      for (const page of data.results) {
        const props = page.properties;
        const targetType = props['신고 타입']?.title?.[0]?.text?.content || null;
        const targetId = props['신고 콘텐츠']?.rich_text?.[0]?.text?.content || null;
        const communityId = props['커뮤니티 ID']?.rich_text?.[0]?.text?.content || null;
        const status = props['상태']?.checkbox || false;
        const notionUpdatedAt = new Date().toISOString();

        reports.push({
          notionPageId: page.id,
          notionPage: page, // 전체 페이지 객체도 저장 (properties 복사용)
          targetType,
          targetId,
          communityId,
          status,
          notionUpdatedAt
        });
      }

      if (!data.has_more) break;
      cursor = data.next_cursor;
    }

    console.log("Notion 신고 데이터 개수:", reports.length);

    // 2. targetId별로 그룹화하고, 그룹 내 하나라도 status=true이면 모두 true로 처리
    const reportsByTarget = {};
    
    for (const report of reports) {
      const { targetId, targetType, communityId } = report;
      if (!targetId || !targetType) continue;
      
      // targetId를 키로 사용 (게시글은 communityId도 포함, 댓글은 targetId만)
      const key = targetType === "게시글" 
        ? `${targetType}_${communityId}_${targetId}` 
        : `${targetType}_${targetId}`;
      
      if (!reportsByTarget[key]) {
        reportsByTarget[key] = {
          targetType,
          targetId,
          communityId,
          reports: [],
          hasResolved: false
        };
      }
      
      reportsByTarget[key].reports.push(report);
      
      // 그룹 내 하나라도 status=true이면 hasResolved를 true로 설정
      if (report.status) {
        reportsByTarget[key].hasResolved = true;
      }
    }

    // 3. hasResolved가 true인 그룹의 모든 리포트를 status=true로 처리
    const processedReports = [];
    for (const key in reportsByTarget) {
      const group = reportsByTarget[key];
      
      if (group.hasResolved) {
        // 그룹 내 모든 리포트를 status=true로 처리
        for (const report of group.reports) {
          processedReports.push({
            ...report,
            status: true // 모두 true로 설정
          });
        }
      } else {
        // hasResolved가 false인 경우는 그대로 유지
        processedReports.push(...group.reports);
      }
    }

    console.log(`처리된 신고 데이터 개수: ${processedReports.length} (그룹화 후)`);

   // 4. Firebase 동기화 및 Notion 데이터베이스 이동
   let syncedCount = 0;
   let failedCount = 0;

   for (const report of processedReports) {
     try {
       const { targetType, targetId, communityId, status, notionPage } = report;
       if (!targetId || !targetType) continue;

       // status=true인 경우에만 동기화 진행
       // (그룹화 단계에서 동일한 신고 콘텐츠에 status=true가 하나라도 있으면 모두 true로 처리됨)
       if (!status) {
         console.log(`[건너뜀] ${targetId} → status가 false이므로 동기화하지 않음`);
         continue;
       }

       // 작성자 ID 가져오기
       const targetUserId = notionPage.properties['작성자']?.rich_text?.[0]?.text?.content || null;

       let syncSuccess = false;

       // Firebase 동기화 (status=true인 경우만 여기 도달)
       if (targetType === "게시글") {
         const postRef = db.doc(`communities/${communityId}/posts/${targetId}`);

         await db.runTransaction(async (t) => {
           const postSnap = await t.get(postRef);

           // status=true이므로 항상 isLocked: true로 설정
           t.update(postRef, { isLocked: true });

           console.log(`[게시글] ${targetId} → locked`);
         });
         syncSuccess = true;

       } else if (targetType === "댓글") {
         const commentRef = db.doc(`comments/${targetId}`);

         await db.runTransaction(async (t) => {
           const commentSnap = await t.get(commentRef);

           // status=true이므로 항상 isLocked: true로 설정
           t.update(commentRef, { isLocked: true });

           console.log(`[댓글] ${targetId} → locked`);
         });
         syncSuccess = true;
       }

       // Firebase 동기화 성공 시 Notion 데이터베이스 이동 및 users 컬렉션 reportCount 증가
       if (syncSuccess) {
         try {
          //  // users 컬렉션의 reportCount 증가 (작성자가 있는 경우만)
          //  if (targetUserId) {
          //    try {
          //      const userRef = db.collection("users").doc(targetUserId);
          //      await userRef.set({
          //        reportCount: FieldValue.increment(1)
          //      }, { merge: true });
          //      console.log(`[Users] ${targetUserId}의 reportCount 증가 완료`);
          //    } catch (userError) {
          //      console.error(`[Users] ${targetUserId}의 reportCount 증가 실패:`, userError.message);
          //      // users 업데이트 실패는 전체 프로세스를 중단하지 않음
          //    }
          //  }

           // 원본 페이지의 모든 properties 복사
           const sourceProps = notionPage.properties;
           const backupProperties = {};

           // 각 필드 타입별로 복사
           for (const [key, value] of Object.entries(sourceProps)) {
             if (!value || !value.type) continue;

             // Notion API 형식 그대로 복사
             if (value.type === "title") {
               backupProperties[key] = { title: value.title || [] };
             } else if (value.type === "rich_text") {
               backupProperties[key] = { rich_text: value.rich_text || [] };
             } else if (value.type === "select") {
               backupProperties[key] = value.select ? { select: value.select } : { select: null };
             } else if (value.type === "date") {
               backupProperties[key] = value.date ? { date: value.date } : { date: null };
             } else if (value.type === "number") {
               backupProperties[key] = { number: value.number ?? null };
             } else if (value.type === "checkbox") {
               backupProperties[key] = { checkbox: value.checkbox ?? false };
             } else if (value.type === "files") {
               backupProperties[key] = { files: value.files || [] };
             } else if (value.type === "multi_select") {
               backupProperties[key] = { multi_select: value.multi_select || [] };
             } else if (value.type === "relation") {
               backupProperties[key] = { relation: value.relation || [] };
             } else if (value.type === "rollup") {
               backupProperties[key] = { rollup: value.rollup || null };
             } else if (value.type === "formula") {
               backupProperties[key] = { formula: value.formula || null };
             } else if (value.type === "created_time") {
               backupProperties[key] = { created_time: value.created_time || null };
             } else if (value.type === "created_by") {
               backupProperties[key] = { created_by: value.created_by || null };
             } else if (value.type === "last_edited_time") {
               backupProperties[key] = { last_edited_time: value.last_edited_time || null };
             } else if (value.type === "last_edited_by") {
               backupProperties[key] = { last_edited_by: value.last_edited_by || null };
             }
           }

           // 상태를 true로 설정 (status=true인 경우만 여기 도달)
           backupProperties['상태'] = {
             checkbox: true
           };

           // 동기화 시간 추가
           backupProperties['동기화 시간(Notion)'] = {
             date: {
               start: new Date(report.notionUpdatedAt).toISOString()
             }
           };

           // reportedDatabaseId에 새 페이지 생성
           await this.notion.pages.create({
             parent: { database_id: this.reportedDatabaseId },
             properties: backupProperties
           });

           // 원본 데이터베이스에서 페이지 아카이브 (삭제)
           await this.notion.pages.update({
             page_id: report.notionPageId,
             archived: true
           });


          // Notion 페이지 이동이 모두 성공한 후에 reportCount 증가
          // users 컬렉션의 reportCount 증가 (작성자가 있는 경우만)
           if (targetUserId) {
            try {
              const userRef = db.collection("users").doc(targetUserId);
              await userRef.set({
                reportCount: FieldValue.increment(1)
              }, { merge: true });
              console.log(`[Users] ${targetUserId}의 reportCount 증가 완료`);
            } catch (userError) {
              console.error(`[Users] ${targetUserId}의 reportCount 증가 실패:`, userError.message);
              // users 업데이트 실패는 전체 프로세스를 중단하지 않음
            }
          }

           syncedCount++;
           console.log(`[성공] ${targetId} → reportedDatabaseId로 이동 완료`);
         } catch (notionError) {
           console.error(`[Notion 이동 실패] ${targetId}:`, notionError.message);
           failedCount++;
         }
       } else {
         failedCount++;
       }

     } catch (err) {
       console.error(`동기화 중 오류 (targetId: ${report.targetId}):`, err);
       failedCount++;
     }
   }

    console.log(`Notion → Firebase 동기화 완료: 성공 ${syncedCount}개, 실패 ${failedCount}개`);
    return { 
      total: reports.length, 
      synced: syncedCount, 
      failed: failedCount,
      reports: processedReports
    };
  } catch (error) {
    console.error("Notion 데이터 가져오기 실패:", error);
    throw error;
  }
}



}
module.exports = new ReportContentService();