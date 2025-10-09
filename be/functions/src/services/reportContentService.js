const { Client } = require('@notionhq/client');
const { db, FieldValue } = require("../config/database");



class ReportContentService {
  constructor() {
    this.notion = new Client({
      auth: process.env.NOTION_API_KEY,
    });
    
    this.reportsDatabaseId = process.env.NOTION_REPORT_CONTENT_DB_ID;
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

    const notion = new Client({ auth: process.env.NOTION_API_KEY });

    // 1. 중복 신고 체크
    const existingReport = await this.checkDuplicateReport(reporterId, targetType, targetId);
    if (existingReport) {
      throw new Error("이미 신고한 콘텐츠입니다.");
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
      status: 'pending',
      reviewedBy: null,
      reviewedAt: null,
      memo: null,
      createdAt: new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString(),
      notionUpdatedAt: new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString()
    };

    // 4. Notion에 직접 저장
    const notionPage = await this.syncToNotion(notionReport);

    // 5. 필요 시 Notion 결과 반환
    return {
      ...notionReport,
      notionPageId: notionPage?.id || null,
      message: "신고가 정상적으로 접수되었습니다 (Notion에 저장됨)."
    };

    return savedReport;
  } catch (error) {
    console.error("Create report error:", error);
    throw error;
  }
}

/**
 * 동일 신고(중복 신고) 여부 체크 - 노션 데이터베이스에서 확인
 */
async checkDuplicateReport(reporterId, targetType, targetId) {
  try {
    const notionTargetType = this.mapTargetType(targetType);

    const response = await fetch(`https://api.notion.com/v1/databases/${this.reportsDatabaseId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filter: {
          and: [
            { property: '신고자ID', rich_text: { equals: reporterId } },
            { property: '신고 타입', title: { equals: notionTargetType } },
            { property: '신고 콘텐츠', rich_text: { equals: targetId } },
          ]
        },
        page_size: 1
      })
    });

    const data = await response.json();

    if (!data.results || data.results.length === 0) return null;

    const page = data.results[0];
    return { id: page.id, reporterId, targetType, targetId };

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
        throw new Error("communityId가 필요합니다. 게시글은 반드시 커뮤니티 하위에 존재합니다.");
      }

      const postDoc = await db.doc(`communities/${communityId}/posts/${targetId}`).get();
      if (!postDoc.exists) {
        throw new Error("신고하려는 게시글을 찾을 수 없습니다.");
      }
    } else if (targetType === 'comment') {
      const commentDoc = await db.doc(`comments/${targetId}`).get();
      if (!commentDoc.exists) {
        throw new Error("신고하려는 댓글을 찾을 수 없습니다.");
      }
    }
  } catch (error) {
    console.error("Validate target exists error:", error);
    throw error;
  }
}


/**
 * 사용자 신고 목록 조회 (cursor 기반 페이지네이션)
 * + Firestore -> Reports컬렉션 Index추가(reporterId, createdAt, _name_)
 * {
    "reporterId": "2JJJUVyFPyRRRiyOgGfEqIZS3123",  
    "size": 1,
    "lastCreatedAt": "2025-10-09T12:06:22.296Z"  -> 다음 페이지를 조회하는 경우만 요청
  }
 */
async getUserReports(reporterId, { size = 10, lastCreatedAt }) {
  let query = db.collection("reports")
    .where("reporterId", "==", reporterId)
    .orderBy("createdAt", "desc") // 최신 순 정렬
    .limit(size);

  if (lastCreatedAt) {
    query = query.startAfter(lastCreatedAt); // 커서 적용
  }

  const snapshot = await query.get();
  const reports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const hasMore = snapshot.docs.length === size;
  const nextCursor = hasMore ? reports[reports.length - 1].createdAt : null;

  return { reports, hasMore, nextCursor };
}



/**
 * 신고 상세 조회 서비스
 */
async getReportFromNotion({ targetType, targetId, targetUserId }) {
  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${this.reportsDatabaseId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filter: {
          and: [
            { property: '신고 타입', title: { equals: targetType } },
            { property: '신고 콘텐츠', rich_text: { equals: targetId } },
            { property: '작성자', rich_text: { equals: targetUserId } },
          ]
        },
        page_size: 1
      })
    });

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return null; // ❌ 해당 신고 없음
    }

    const page = data.results[0];
    const props = page.properties;

    // ✅ 반환 데이터 구조
    return {
      notionPageId: page.id,
      targetType: props['신고 타입']?.title?.[0]?.text?.content || null,
      targetId: props['신고 콘텐츠']?.rich_text?.[0]?.text?.content || null,
      targetUserId: props['작성자']?.rich_text?.[0]?.text?.content || null,
      reporterId: props['신고자ID']?.rich_text?.[0]?.text?.content || null,
      reportReason: props['신고 사유']?.rich_text?.[0]?.text?.content || null,
      communityId: props['커뮤니티 ID']?.rich_text?.[0]?.text?.content || null,
      status: props['상태']?.select?.name || null,
      reportedAt: props['신고일시']?.date?.start || null,
      syncNotionAt: props['동기화 시간(Notion)']?.date?.start || null,
      syncNotionFirebase: props['동기화 시간(Firebase)']?.date?.start || null,
    };

  } catch (error) {
    console.error("Notion 데이터 조회 실패:", error);
    throw error;
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
    
    const { targetType, targetId, targetUserId, communityId, reporterId, reportReason, firebaseUpdatedAt, notionUpdatedAt, status} = reportData;

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
        '상태': { select: { name: status } },
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
    throw new Error(`Notion 동기화 실패: ${error.message}`);
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
        const status = props['상태']?.select?.name || 'pending';
        const notionUpdatedAt = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString();

        reports.push({
          notionPageId: page.id,
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

    console.log("✅ Notion 신고 데이터 개수:", reports.length);

    // 2. Firebase 동기화

    for (const report of reports) {
      try {
        const { targetType, targetId, communityId, status } = report;
        if (!targetId || !targetType) continue;

        if (targetType === "게시글") {
          const postRef = db.doc(`communities/${communityId}/posts/${targetId}`);
          const communityRef = db.doc(`communities/${communityId}/posts/${targetId}`);

          await db.runTransaction(async (t) => {
            const postSnap = await t.get(postRef);
            const communitySnap = await t.get(communityRef);

            // 안전하게 reportsCount 초기화
            let reportsCount = communitySnap.exists ? communitySnap.data().reportsCount : 0;
            if (typeof reportsCount !== 'number' || isNaN(reportsCount)) {
              reportsCount = 0;
            }

            if (status === "resolved") {
              t.update(postRef, { isLocked: true });
              t.update(communityRef, { reportsCount: reportsCount + 1 });
            } else {
              t.update(postRef, { isLocked: false });
              if (reportsCount > 0) {
                t.update(communityRef, { reportsCount: reportsCount - 1 });
              }
            }

            console.log(`📄 [게시글] ${targetId} → ${status}, reportsCount: ${reportsCount}`);
          });

        } else if (targetType === "댓글") {
          const commentRef = db.doc(`comments/${targetId}`);

          await db.runTransaction(async (t) => {
            const commentSnap = await t.get(commentRef);

            // 안전하게 reportsCount 초기화
            let reportsCount = commentSnap.exists ? commentSnap.data().reportsCount : 0;
            if (typeof reportsCount !== 'number' || isNaN(reportsCount)) {
              reportsCount = 0;
            }

            if (status === "resolved") {
              t.update(commentRef, { isLocked: true, reportsCount: reportsCount + 1 });
            } else {
              t.update(commentRef, { isLocked: false });
              if (reportsCount > 0) {
                t.update(commentRef, { reportsCount: reportsCount - 1 });
              }
            }

            console.log(`💬 [댓글] ${targetId} → ${status}, reportsCount: ${reportsCount}`);
          });
        }

        // 🔹 3. Notion에 동기화 시간 기록
        await this.notion.pages.update({
          page_id: report.notionPageId,
          properties: {
            '동기화 시간(Notion)': {
              date: {
                start: new Date(new Date(report.notionUpdatedAt).getTime() - 9 * 60 * 60 * 1000).toISOString()
              }
            }
          }
        });

      } catch (err) {
        console.error(`⚠️ 동기화 중 오류 (targetId: ${report.targetId}):`, err);
      }
    }

    console.log("✅ Notion → Firebase 동기화 완료");
    return reports;
  } catch (error) {
    console.error("❌ Notion 데이터 가져오기 실패:", error);
    throw error;
  }
}



}
module.exports = new ReportContentService();