const { Client } = require('@notionhq/client');
const { db, FieldValue } = require("../config/database");
const { ADMIN_LOG_ACTIONS } = require("../constants/adminLogActions");

// 배치 처리 설정 (notionUserService와 동일)
const DELAY_MS = 1200; // 지연시간
const BATCH_SIZE = 500; // 배치 사이즈

// changeType → 지급 타입 매핑
const CHANGE_TYPE_TO_PAYMENT_TYPE_MAP = {
  'add': '지급',
  'deduct': '차감',
};

// 대상 액션 키 목록
const TARGET_ACTION_KEYS = [
  'additional_point',
  'comment',
  'routine_post',
  'routine_review',
  'gathering_review_text',
  'gathering_review_media',
  'tmi_review',
];

class NotionRewardHistoryService {
  constructor() {
    const {
      NOTION_API_KEY,
      NOTION_REWARD_HISTORY_DB_ID,
      NOTION_USER_ACCOUNT_DB_ID,
      NOTION_REWARD_POLICY_DB_ID,
    } = process.env;

    // 환경 변수 검증
    if (!NOTION_API_KEY) {
      const error = new Error("NOTION_API_KEY 환경변수가 설정되지 않았습니다");
      error.code = "INTERNAL_ERROR";
      throw error;
    }
    if (!NOTION_REWARD_HISTORY_DB_ID) {
      const error = new Error("NOTION_REWARD_HISTORY_DB_ID 환경변수가 설정되지 않았습니다");
      error.code = "INTERNAL_ERROR";
      throw error;
    }
    if (!NOTION_USER_ACCOUNT_DB_ID) {
      const error = new Error("NOTION_USER_ACCOUNT_DB_ID 환경변수가 설정되지 않았습니다");
      error.code = "INTERNAL_ERROR";
      throw error;
    }

    this.notion = new Client({
      auth: NOTION_API_KEY,
    });

    this.notionRewardHistoryDB = NOTION_REWARD_HISTORY_DB_ID;
    this.notionUserAccountDB = NOTION_USER_ACCOUNT_DB_ID;
    this.notionRewardPolicyDB = NOTION_REWARD_POLICY_DB_ID;
    this.dbSchema = null; // 데이터베이스 스키마 캐시
  }

  /**
   * Notion 데이터베이스 스키마 조회 (필드명 및 타입 확인)
   * @param {string} databaseId - Notion 데이터베이스 ID
   * @return {Promise<Object>} 필드명과 타입 정보, 없으면 null 반환
   */
  async getDatabaseSchema(databaseId) {
    try {
      const response = await this.notion.databases.retrieve({
        database_id: databaseId,
      });
      
      // 응답 검증 - properties가 없으면 null 반환 (데이터 소스 기반 DB일 수 있음)
      if (!response || !response.properties) {
        console.warn(`[스키마 조회] 응답에 properties가 없습니다. 데이터 소스 기반 데이터베이스일 수 있습니다.`);
        return null;
      }
      
      const schema = {};
      for (const [fieldName, fieldData] of Object.entries(response.properties)) {
        schema[fieldName] = {
          type: fieldData.type,
          id: fieldData.id,
        };
      }
      
      return schema;
    } catch (error) {
      console.error(`[스키마 조회 실패] 데이터베이스 ${databaseId}:`, error.message);
      console.error('에러 상세:', error);
      return null; // 에러 발생 시 null 반환하여 계속 진행
    }
  }

  /**
   * Notion 리워드 정책 DB에서 actionKey → 사용자 행동 매핑 조회
   * @return {Promise<Object>} {actionKey: 사용자 행동} 매핑
   */
  async getRewardPolicyMapping() {
    try {
      if (!this.notionRewardPolicyDB) {
        console.warn('[WARN] NOTION_REWARD_POLICY_DB_ID가 설정되지 않아 정책 매핑을 조회할 수 없습니다.');
        return {};
      }

      let results = [];
      let hasMore = true;
      let startCursor;

      while (hasMore) {
        const res = await fetch(`https://api.notion.com/v1/databases/${this.notionRewardPolicyDB}/query`, {
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
          const errorText = await res.text();
          console.error(`[Notion 정책 API Error] Status: ${res.status}, Response: ${errorText}`);
          return {};
        }

        const data = await res.json();

        if (data.error) {
          console.error(`[Notion 정책 API Error]`, data.error);
          return {};
        }

        results = results.concat(data.results);
        hasMore = data.has_more;
        startCursor = data.next_cursor;
      }

      const policyMap = {};
      for (const page of results) {
        const props = page.properties;
        const actionKey = props["__DEV_ONLY__"]?.rich_text?.[0]?.plain_text || null;
        const userAction = props["사용자 행동"]?.title?.[0]?.plain_text || null;
        
        if (actionKey && userAction) {
          policyMap[actionKey] = {
            userAction: userAction,
            pageId: page.id
          };
        }
      }

      console.log(`[정책 매핑] ${Object.keys(policyMap).length}개의 정책을 조회했습니다.`);
      return policyMap;
    } catch (error) {
      console.error('[정책 매핑 조회 실패]:', error.message);
      return {};
    }
  }

  /**
   * 전체 사용자의 리워드 히스토리를 Notion에 동기화
   * @return {Promise<{syncedCount: number, failedCount: number, total: number}>}
   */
  async syncRewardHistoryToNotion() {
    try {
      console.log('=== 리워드 히스토리 동기화 시작 ===');

      // 0. Notion 리워드 정책 DB에서 actionKey → 사용자 행동 매핑 조회
      const rewardPolicyMap = await this.getRewardPolicyMapping();

      // 0-1. Notion 데이터베이스 스키마 조회 (필드명 확인)
      const dbSchema = await this.getDatabaseSchema(this.notionRewardHistoryDB);
      
      // "회원 관리" 필드가 relation 타입인지 확인
      const userRelationFieldName = '회원 관리';
      let hasUserRelationField = false;
      
      if (dbSchema) {
        console.log('Notion 데이터베이스 스키마 조회 완료');
        console.log('사용 가능한 필드:', Object.keys(dbSchema));
        hasUserRelationField = dbSchema[userRelationFieldName] && dbSchema[userRelationFieldName].type === 'relation';
      } else {
        console.warn(`[WARN] 스키마를 조회할 수 없습니다. 기본 필드명을 사용합니다.`);
        // 스키마를 조회할 수 없어도 기본 필드명으로 시도
        hasUserRelationField = true; // 일단 시도해보고 에러 발생 시 건너뜀
      }
      
      if (!hasUserRelationField && dbSchema) {
        console.warn(`[WARN] "${userRelationFieldName}" 필드가 relation 타입이 아니거나 존재하지 않습니다. 회원 관리 연동을 건너뜁니다.`);
      }

      // 1. Firestore에서 전체 rewardsHistory 조회 (collectionGroup 쿼리)
      const rewardsHistorySnapshot = await db
        .collectionGroup('rewardsHistory')
        .where('actionKey', 'in', TARGET_ACTION_KEYS)
        .where('changeType', 'in', ['add', 'deduct'])
        .orderBy('createdAt', 'desc')
        .get();

      console.log(`Firestore에서 ${rewardsHistorySnapshot.docs.length}개의 리워드 히스토리를 가져왔습니다.`);

      if (rewardsHistorySnapshot.docs.length === 0) {
        console.log('동기화할 리워드 히스토리가 없습니다.');
        return { syncedCount: 0, failedCount: 0, total: 0 };
      }

      // 2. Notion에 있는 기존 리워드 히스토리 목록 가져오기 (중복 체크용 및 필드명 확인)
      const notionRewardHistories = await this.getNotionRewardHistories(this.notionRewardHistoryDB);
      console.log(`Notion에 기존 리워드 히스토리 ${Object.keys(notionRewardHistories).length}개가 존재합니다.`);

      // 2-1. 기존 페이지가 있으면 properties에서 실제 필드명 확인
      let actualUserRelationFieldName = null;
      if (Object.keys(notionRewardHistories).length > 0) {
        try {
          const firstHistoryKey = Object.keys(notionRewardHistories)[0];
          const firstPageId = notionRewardHistories[firstHistoryKey].pageId;
          const samplePage = await this.notion.pages.retrieve({ page_id: firstPageId });
          
          if (samplePage && samplePage.properties) {
            // "회원 관리" 필드가 있는지 확인
            const fieldNames = Object.keys(samplePage.properties);
            console.log('실제 필드명 목록:', fieldNames);
            
            // "회원 관리" 필드 찾기 (공백 포함 가능)
            const userRelationField = fieldNames.find(name => {
              const trimmedName = name.trim();
              return trimmedName === '회원 관리' && samplePage.properties[name].type === 'relation';
            });
            
            if (userRelationField) {
              actualUserRelationFieldName = userRelationField; // 실제 필드명 사용 (공백 포함)
              hasUserRelationField = true;
              console.log(`"회원 관리" 필드 확인됨: "${actualUserRelationFieldName}"`);
            } else {
              hasUserRelationField = false;
              console.warn(`[WARN] "회원 관리" relation 필드를 찾을 수 없습니다.`);
              console.warn(`[WARN] 사용 가능한 relation 필드:`, fieldNames.filter(name => samplePage.properties[name].type === 'relation'));
            }
          }
        } catch (error) {
          console.warn(`[WARN] 기존 페이지 조회 실패:`, error.message);
        }
      } else {
        // 기존 페이지가 없으면 데이터베이스 스키마에서 필드명 확인
        console.log('[INFO] 기존 페이지가 없어 데이터베이스 스키마에서 필드명을 확인합니다.');
        if (dbSchema && hasUserRelationField) {
          // 스키마에서 "회원 관리" 필드 찾기 (공백 포함 가능)
          const schemaFieldNames = Object.keys(dbSchema);
          const userRelationField = schemaFieldNames.find(name => {
            const trimmedName = name.trim();
            return trimmedName === '회원 관리' && dbSchema[name].type === 'relation';
          });
          
          if (userRelationField) {
            actualUserRelationFieldName = userRelationField;
            console.log(`[INFO] 스키마에서 "회원 관리" 필드 확인됨: "${actualUserRelationFieldName}"`);
          } else {
            // 스키마에서도 찾지 못하면 기본 필드명 시도
            actualUserRelationFieldName = '회원 관리';
            console.log(`[INFO] 스키마에서 필드를 찾지 못해 기본 필드명 사용: "${actualUserRelationFieldName}"`);
          }
        } else if (hasUserRelationField) {
          // 스키마를 조회할 수 없지만 hasUserRelationField가 true면 기본 필드명 시도
          actualUserRelationFieldName = '회원 관리';
          console.log(`[INFO] 기본 필드명 사용: "${actualUserRelationFieldName}"`);
        } else {
          console.log('[INFO] 회원 관리 필드가 없어 회원 관리 연동을 건너뜁니다.');
        }
      }

      // 3. Notion 회원 관리 DB 정보는 필요시 개별 조회 (programService 방식)
      // 배치 처리 중에 각 사용자를 개별 조회하므로 여기서는 스킵

      let syncedCount = 0;
      let failedCount = 0;
      const syncedHistoryIds = [];
      const failedHistoryIds = [];

      // 4. 배치 처리로 Notion에 동기화
      for (let i = 0; i < rewardsHistorySnapshot.docs.length; i += BATCH_SIZE) {
        const batch = rewardsHistorySnapshot.docs.slice(i, i + BATCH_SIZE);
        console.log(`배치 ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(rewardsHistorySnapshot.docs.length / BATCH_SIZE)} 처리 중... (${i + 1}-${Math.min(i + BATCH_SIZE, rewardsHistorySnapshot.docs.length)}번째)`);

        // 배치 내에서 병렬 처리
        const batchPromises = batch.map(async (doc) => {
          try {
            const historyData = doc.data();
            const historyId = doc.id;
            
            // userId 추출 (컬렉션 경로에서: users/{userId}/rewardsHistory/{historyId})
            const pathParts = doc.ref.path.split('/');
            const userId = pathParts[1]; // users/{userId}/rewardsHistory/{historyId}

            if (!userId) {
              console.warn(`[WARN] userId를 추출할 수 없습니다: ${doc.ref.path}`);
              failedCount++;
              failedHistoryIds.push(historyId);
              return { success: false, historyId, error: 'userId_not_found' };
            }

            // Notion 회원 관리 DB에서 사용자 pageId 조회 (programService 방식 사용)
            let notionUser = null;
            if (actualUserRelationFieldName) {
              try {
                // programService처럼 dataSources.query로 직접 찾기
                const userDbId = process.env.NOTION_USER_ACCOUNT_DB_ID2 || this.notionUserAccountDB;
                const response = await this.notion.dataSources.query({
                  data_source_id: userDbId,
                  filter: {
                    property: '사용자ID',
                    rich_text: {
                      equals: userId
                    }
                  },
                  page_size: 1
                });
                
                if (response.results && response.results.length > 0) {
                  notionUser = { pageId: response.results[0].id };
                } else {
                  console.warn(`[WARN] Notion에 사용자 ${userId}가 존재하지 않습니다. 회원 관리 연동 없이 진행합니다.`);
                }
              } catch (error) {
                console.warn(`[WARN] 사용자 ${userId} 조회 실패:`, error.message);
              }
            }

            // 리워드 타입 결정 (Notion 정책 DB에서 조회 - 관계형 필드)
            let rewardTypeRelation = [];
            if (historyData.actionKey === 'additional_point') {
              // 관리자 지급은 정책 DB에 없으므로 관계형 필드 비워두기
              rewardTypeRelation = [];
            } else if (rewardPolicyMap[historyData.actionKey]) {
              // 정책 DB에서 페이지 ID 가져와서 relation으로 연결
              const policyInfo = rewardPolicyMap[historyData.actionKey];
              rewardTypeRelation = [{ id: policyInfo.pageId }];
            } else {
              console.warn(`[WARN] actionKey "${historyData.actionKey}"에 대한 정책을 찾을 수 없습니다.`);
              rewardTypeRelation = [];
            }
            
            // 지급 타입 결정
            const paymentType = CHANGE_TYPE_TO_PAYMENT_TYPE_MAP[historyData.changeType] || '지급';

            // 내용 (reason)
            const content = historyData.reason || '';

            // 나다움 포인트 (amount)
            const amount = historyData.amount || 0;

            // 적립/차감 날짜
            let rewardDate = null;
            if (historyData.createdAt) {
              if (historyData.createdAt.toDate) {
                rewardDate = historyData.createdAt.toDate().toISOString();
              } else if (historyData.createdAt instanceof Date) {
                rewardDate = historyData.createdAt.toISOString();
              } else if (typeof historyData.createdAt === 'string') {
                rewardDate = new Date(historyData.createdAt).toISOString();
              }
            }

            // 만료 날짜 (expiresAt)
            let expiryDate = null;
            if (historyData.expiresAt) {
              try {
                if (historyData.expiresAt.toDate) {
                  expiryDate = historyData.expiresAt.toDate().toISOString();
                } else if (historyData.expiresAt instanceof Date) {
                  expiryDate = historyData.expiresAt.toISOString();
                } else if (typeof historyData.expiresAt === 'string') {
                  expiryDate = new Date(historyData.expiresAt).toISOString();
                }
                console.log(`[만료 날짜] historyId=${historyId}, expiresAt=${expiryDate}`);
              } catch (error) {
                console.warn(`[만료 날짜 파싱 실패] historyId=${historyId}:`, error.message);
              }
            } else {
              console.log(`[만료 날짜 없음] historyId=${historyId}, changeType=${historyData.changeType}`);
            }

            // Notion 페이지 데이터 구성
            // title 필드에 historyId 저장 (중복 체크용)
            const notionPage = {
              '나다움 ID': { 
                title: [{ 
                  text: { 
                    content: historyId
                  } 
                }] 
              },
            };

            // 회원 관리 relation 필드 추가 (programService와 동일한 방식)
            // actualUserRelationFieldName이 확인된 경우에만 추가
            if (actualUserRelationFieldName && notionUser && notionUser.pageId) {
              notionPage[actualUserRelationFieldName] = {
                relation: [
                  {
                    id: notionUser.pageId
                  }
                ]
              };
            }

            // 나머지 필드 추가
            notionPage['리워드 타입'] = {
              relation: rewardTypeRelation
            };
            notionPage['나다움 포인트'] = {
              number: amount
            };
            notionPage['내용'] = {
              rich_text: content ? [{ text: { content: content } }] : []
            };
            notionPage['지급 타입'] = {
              select: {
                name: paymentType
              }
            };
            notionPage['적립/차감 날짜'] = rewardDate ? {
              date: { start: rewardDate }
            } : { date: null };
            
            // 만료 날짜 필드 추가 (expiresAt이 있는 경우)
            if (expiryDate) {
              notionPage['만료 날짜'] = {
                date: { start: expiryDate }
              };
              console.log(`[Notion 필드 추가] 만료 날짜: ${expiryDate}, historyId=${historyId}`);
            } else {
              // expiresAt이 없으면 필드를 추가하지 않음
              console.log(`[Notion 필드 스킵] 만료 날짜 없음 (historyId=${historyId})`);
            }

            // 중복 체크용 고유 키 생성 (historyId 사용)
            const uniqueKey = historyId;

            // Upsert: 기존 페이지가 있으면 업데이트, 없으면 생성
            try {
              if (notionRewardHistories[uniqueKey]) {
                // 기존 페이지 업데이트
                console.log(`[업데이트] historyId=${historyId}, pageId=${notionRewardHistories[uniqueKey].pageId}`);
                if (notionPage['만료 날짜']) {
                  console.log(`[업데이트] 만료 날짜 필드 포함됨:`, notionPage['만료 날짜']);
                }
                await this.updateNotionPageWithRetry(notionRewardHistories[uniqueKey].pageId, notionPage);
              } else {
                // 새 페이지 생성
                console.log(`[생성] historyId=${historyId}`);
                if (notionPage['만료 날짜']) {
                  console.log(`[생성] 만료 날짜 필드 포함됨:`, notionPage['만료 날짜']);
                }
                await this.createNotionPageWithRetry(notionPage);
              }
            } catch (error) {
              // "회원 관리" 필드 관련 에러인 경우 필드를 제외하고 재시도
              if (error.message && (error.message.includes('회원 관리') || error.message.includes('not a property'))) {
                console.warn(`[WARN] 필드 관련 에러 발생. 필드를 제외하고 재시도합니다: ${error.message}`);
                // 회원 관리 필드 제거 (실제 필드명 사용)
                const notionPageWithoutUser = { ...notionPage };
                if (actualUserRelationFieldName) {
                  delete notionPageWithoutUser[actualUserRelationFieldName];
                } else {
                  // actualUserRelationFieldName이 없으면 모든 가능한 필드명 시도
                  delete notionPageWithoutUser['회원 관리'];
                  delete notionPageWithoutUser['회원 관리 '];
                }
                
                if (notionRewardHistories[uniqueKey]) {
                  await this.updateNotionPageWithRetry(notionRewardHistories[uniqueKey].pageId, notionPageWithoutUser);
                } else {
                  await this.createNotionPageWithRetry(notionPageWithoutUser);
                }
              } else {
                // 다른 에러는 그대로 throw
                throw error;
              }
            }

            syncedCount++;
            syncedHistoryIds.push(historyId);
            return { success: true, historyId };
          } catch (error) {
            failedCount++;
            const historyId = doc.id;
            failedHistoryIds.push(historyId);
            console.error(`[동기화 실패] 리워드 히스토리 ${historyId}:`, error.message || error);
            return { success: false, historyId, error: error.message };
          }
        });

        // 배치 결과 처리
        const batchResults = await Promise.all(batchPromises);
        const batchSuccess = batchResults.filter(r => r.success).length;
        const batchFailed = batchResults.filter(r => !r.success).length;

        console.log(`배치 완료: 성공 ${batchSuccess}개, 실패 ${batchFailed}개 (총 진행률: ${syncedCount + failedCount}/${rewardsHistorySnapshot.docs.length})`);

        // 마지막 배치가 아니면 지연
        if (i + BATCH_SIZE < rewardsHistorySnapshot.docs.length) {
          console.log(`${DELAY_MS/1000}초 대기 중...`);
          await new Promise(resolve => setTimeout(resolve, DELAY_MS));
        }
      }

      console.log(`=== 리워드 히스토리 동기화 완료 ===`);
      console.log(`총 ${syncedCount}개 동기화, 실패: ${failedCount}개`);

      // adminLogs에 동기화 결과 저장
      try {
        const logRef = db.collection("adminLogs").doc();
        await logRef.set({
          adminId: "Notion 관리자",
          action: ADMIN_LOG_ACTIONS.USER_ALL_SYNCED, // 적절한 액션으로 변경 필요할 수 있음
          targetId: "",
          timestamp: new Date(),
          metadata: {
            syncedCount: syncedCount,
            failedCount: failedCount,
            total: rewardsHistorySnapshot.docs.length,
            syncedHistoryIds: syncedHistoryIds,
            failedHistoryIds: failedHistoryIds,
          }
        });
        console.log(`[adminLogs] 리워드 히스토리 동기화 이력 저장 완료`);
      } catch (logError) {
        console.error("[adminLogs] 로그 저장 실패:", logError);
      }

      return { 
        syncedCount, 
        failedCount, 
        total: rewardsHistorySnapshot.docs.length 
      };
    } catch (error) {
      console.error('syncRewardHistoryToNotion 전체 오류:', error);
      throw error;
    }
  }

  /**
   * Notion 리워드 히스토리 DB에서 모든 페이지 조회
   * @param {string} databaseId - Notion 데이터베이스 ID
   * @return {Promise<Object>} {uniqueKey: {pageId, ...}}
   */
  async getNotionRewardHistories(databaseId) {
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
        const errorText = await res.text();
        console.error(`[Notion API Error] Status: ${res.status}, Response: ${errorText}`);
        const err = new Error(`Notion API 요청 실패: ${res.status} - ${errorText}`);
        err.code = "INTERNAL_ERROR";
        throw err;
      }

      const data = await res.json();

      if (data.error) {
        console.error(`[Notion API Error]`, data.error);
        const err = new Error(`Notion API 에러: ${data.error.message || JSON.stringify(data.error)}`);
        err.code = "INTERNAL_ERROR";
        throw err;
      }

      results = results.concat(data.results);
      hasMore = data.has_more;
      startCursor = data.next_cursor;
    }

    const historyMap = {};
    for (const page of results) {
      const props = page.properties;
      // title 필드에 historyId가 저장되어 있음
      const title = props["나다움 ID"]?.title?.[0]?.plain_text || null;
      if (title) {
        // title이 historyId이므로 그대로 사용
        historyMap[title] = { pageId: page.id };
      }
    }
    return historyMap;
  }

  /**
   * 재시도 로직이 포함된 Notion 페이지 업데이트
   * @param {string} pageId - Notion 페이지 ID
   * @param {Object} notionPage - Notion 페이지 속성
   * @param {number} maxRetries - 최대 재시도 횟수
   */
  async updateNotionPageWithRetry(pageId, notionPage, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.notion.pages.update({
          page_id: pageId,
          properties: notionPage,
        });
        // 성공 시 만료 날짜 필드가 포함되었는지 확인
        if (notionPage['만료 날짜']) {
          console.log(`[업데이트 성공] pageId=${pageId}, 만료 날짜 필드 포함됨`);
        }
        return; // 성공하면 종료
      } catch (error) {
        console.warn(`Notion 페이지 업데이트 시도 ${attempt}/${maxRetries} 실패 (pageId: ${pageId}):`, error.message);
        // 필드명 관련 에러인지 확인
        if (error.message && (error.message.includes('만료 날짜') || error.message.includes('not a property'))) {
          console.error(`[필드명 에러] "만료 날짜" 필드가 Notion에 존재하지 않을 수 있습니다. 에러:`, error.message);
          // 만료 날짜 필드를 제거하고 재시도
          const notionPageWithoutExpiry = { ...notionPage };
          delete notionPageWithoutExpiry['만료 날짜'];
          console.log(`[필드 제거 후 재시도] 만료 날짜 필드 제거`);
          notionPage = notionPageWithoutExpiry;
        }
        
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

  /**
   * 재시도 로직이 포함된 Notion 페이지 생성
   * @param {Object} notionPage - Notion 페이지 속성
   * @param {number} maxRetries - 최대 재시도 횟수
   * @param {string} databaseId - Notion 데이터베이스 ID
   */
  async createNotionPageWithRetry(notionPage, maxRetries = 3, databaseId = null) {
    const targetDatabaseId = databaseId || this.notionRewardHistoryDB;
    
    let properties, parent;
    if (notionPage.parent && notionPage.properties) {
      parent = notionPage.parent;
      properties = notionPage.properties;
    } else {
      parent = { database_id: targetDatabaseId };
      properties = notionPage;
    }
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.notion.pages.create({
          parent: parent,
          properties: properties,
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
}

module.exports = new NotionRewardHistoryService();

