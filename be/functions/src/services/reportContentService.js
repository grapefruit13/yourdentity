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

    // 1. 중복 신고 체크
    const existingReport = await this.checkDuplicateReport(reporterId, targetType, targetId);
    if (existingReport) {
      throw new Error("이미 신고한 콘텐츠입니다.");
    }

    // 2. 신고 대상 존재 여부 확인
    await this.validateTargetExists(targetType, targetId, communityId);

    // 3. Firebase에 신고 데이터 저장
    const firebaseReport = {
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
      createdAt: FieldValue.serverTimestamp(),
      firebaseUpdatedAt: new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString()
    };

    // Firestore에 직접 생성
    const reportRef = db.collection("reports").doc();
    await reportRef.set(firebaseReport);
    const savedReport = { id: reportRef.id, ...firebaseReport };

    // 4. Notion에 동기화 (비동기)
    this.syncToNotion(savedReport).catch(error => {
      console.error('Notion 동기화 실패 (비동기):', error);
    });

    // 5. 신고 대상의 reportsCount 증가(DB구조 변경으로 보류 -> 팀원들도 변경된 구조가 문제가 없을 경우 주석제거)
    //await this.incrementReportsCount(targetType, targetId);

    return savedReport;
  } catch (error) {
    console.error("Create report error:", error);
    throw error;
  }
}

/**
 * 중복 신고 체크
 */
async checkDuplicateReport(reporterId, targetType, targetId) {
  const snapshot = await db.collection("reports")
    .where("reporterId", "==", reporterId)
    .get();

  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .find(report => report.targetType === targetType && report.targetId === targetId);
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
 */
async getUserReports(reporterId, { page = 0, size = 10 }) {
  // reporterId로 필터링 (orderBy 없이)
  const snapshot = await db.collection("reports")
    .where("reporterId", "==", reporterId)
    .get();  // 전체 데이터 가져오기

  const allReports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // 페이지와 사이즈 기준으로 자르기
  const startIndex = page * size;
  const pagedReports = allReports.slice(startIndex, startIndex + size);

  return pagedReports;
}


/**
 * 신고 상세 조회 서비스
 * @param {string} reportId - 조회할 신고 문서 ID
 * @returns {object|null} - 신고 문서 데이터 또는 null
 */
async getReportById(reportId) {
  if (!reportId) {
    throw new Error("reportId가 필요합니다.");
  }

  const docRef = db.collection("reports").doc(reportId);
  const docSnapshot = await docRef.get();

  if (!docSnapshot.exists) {
    return null; // 문서가 없는 경우
  }

  const reportData = docSnapshot.data();


  return { id: docSnapshot.id, ...reportData };
}


/**
 * Notion에 동기화
 */
async syncToNotion(reportData) {
  try {
    const notionResult = await this.syncAllReportsToNotion(reportData);
    if (notionResult.notionPageId) {
      await db.doc(`reports/${reportData.id}`).update({
        notionPageId: notionResult.notionPageId,
        //updatedAt: FieldValue.serverTimestamp()
        firebaseUpdatedAt: new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString()
      });
    }
    return notionResult;
  } catch (error) {
    console.error("Sync to Notion error:", error);
    throw error;
  }
}

/**
 * 신고 데이터 Notion에 동기화(reports컬렉션 전체)
 */
async syncAllReportsToNotion() {
  try {
    //기존 노션 데이터베이스 초기화 (페이지 아카이브)
    await this.clearNotionDatabase();

    //Firebase reports 컬렉션 전체 조회
    const reportsSnapshot = await db.collection("reports").get();
    const reports = reportsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (!reports.length) {
      console.log("Firebase reports 컬렉션에 동기화할 데이터가 없습니다.");
      return;
    }

    //각 report를 노션에 동기화
    for (const report of reports) {
      try {
        await this.syncReportToNotion(report);
      } catch (error) {
        console.error(`Report ID ${report.id} 동기화 실패:`, error.message);
      }
    }

    console.log("모든 reports 동기화 완료!");
  } catch (error) {
    console.error("전체 reports 동기화 실패:", error.message);
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
              start: new Date(new Date(firebaseUpdatedAt ).getTime() - 9 * 60 * 60 * 1000).toISOString()
            },
          },
          '동기화 시간(Notion)': { 
            date: { 
              start: new Date(new Date(notionUpdatedAt ).getTime() - 9 * 60 * 60 * 1000).toISOString()
            },
          }
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

mapTargetTypeToFirebase(targetType){
  return {'게시글' : 'post', '댓글' : 'comment'}[targetType] || 'etc';
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
 * 노션DB 와 Firebase reports컬렉션 동기화
 * - 각 페이지에서 targetId, targetUserId, targetType을 기준으로 Firebase에서 일치하는 데이터 update
 * - 없는 경우 create?? -> 해당 상황은 발생하면 누락된 동기화가 있으므로 구조적으로 문제가 있음
 * -> 기존에 있던 데이터는 삭제하지 않고 유지, firebase와 노션 데이터가 항상 최신 상태로 유지하는 구조
 */
async syncAllReportsToFirebase() {
  const reports = [];

  let cursor = undefined;
  while (true) {
    const response = await this.notion.databases.query({
      database_id: this.reportsDatabaseId,
      start_cursor: cursor
    });
    
    response.results.forEach(page => {
      const props = page.properties;

      // 신고 타입 변환 함수 사용
      const targetTypeText = props['신고 타입']?.title?.[0]?.plain_text || null;
      const targetType = this.mapTargetTypeToFirebase(targetTypeText);
      const notionUpdatedAt  = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString(); // Firebase, Notion 공용

      reports.push({
        notionPageId: page.id,
        targetType,
        targetId: props['신고 콘텐츠']?.rich_text?.[0]?.plain_text || null,
        targetUserId: props['작성자']?.rich_text?.[0]?.plain_text || null,
        reporterId: props['신고자ID']?.rich_text?.[0]?.plain_text || null,
        reportReason: props['신고 사유']?.rich_text?.[0]?.plain_text || null,
        communityId: props['커뮤니티 ID']?.rich_text?.[0]?.plain_text || null,
        status: props['상태']?.select?.name || 'pending',
        notionUpdatedAt 
      });
    });


    if (!response.has_more) break;
    cursor = response.next_cursor;
  }

  // Firebase 업데이트
  const batch = db.batch();
  for (const report of reports) {

    // targetId + targetUserId + targetType 기준으로 기존 문서 찾기
    const querySnapshot = await db.collection("reports")
      .where("targetId", "==", report.targetId) //신고대상ID(신고 콘텐츠)
      .where("targetUserId", "==", report.targetUserId) //신고 대상 작성자
      .where("targetType", "==", report.targetType) //신고 대상 종류
      .where("reporterId", "==", report.reporterId) //신고자ID
      .get();

    if (!querySnapshot.empty) {
      // 이미 존재하면 첫 번째 문서 업데이트
      const docRef = querySnapshot.docs[0].ref;
      // Firebase에 notionUpdatedAt 추가
      report.notionUpdatedAt = report.notionUpdatedAt;
      batch.set(docRef, report, { merge: true });

       //Firebase에 업데이트된 경우, 노션의 "동기화 시간" 갱신
       await this.notion.pages.update({
        page_id: report.notionPageId,
        properties: {
          '동기화 시간(Notion)': {
            date: { start: new Date(new Date(report.notionUpdatedAt ).getTime() - 9 * 60 * 60 * 1000).toISOString() } 
          }
        }
      });
    } else {
      // 없으면 새로운 문서 생성[보류]
      //const docRef = db.collection("reports").doc(report.notionPageId);
      //batch.set(docRef, report);
    }
  }

  await batch.commit();
  return reports;
}

}


module.exports = new ReportContentService();