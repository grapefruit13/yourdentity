const { Client } = require('@notionhq/client');
const fcmHelper = require('../utils/fcmHelper');
const { getRelationValues, getTitleValue, getTextContent, getSelectValue } = require('../utils/notionHelper');
const FirestoreService = require('./firestoreService');

// 에러 코드 정의
const ERROR_CODES = {
  MISSING_API_KEY: 'MISSING_NOTION_API_KEY',
  MISSING_DB_ID: 'MISSING_NOTION_NOTIFICATION_DB_ID',
  NOTION_API_ERROR: 'NOTION_API_ERROR',
  NOTIFICATION_NOT_FOUND: 'NOTIFICATION_NOT_FOUND',
  NO_USERS_SELECTED: 'NO_USERS_SELECTED',
  NO_VALID_USER_IDS: 'NO_VALID_USER_IDS',
  INVALID_NOTIFICATION_DATA: 'INVALID_NOTIFICATION_DATA',
  FCM_SEND_FAILED: 'FCM_SEND_FAILED',
  STATUS_UPDATE_FAILED: 'STATUS_UPDATE_FAILED',
};

// Notion 필드명 상수
const NOTION_FIELDS = {
  TITLE: '이름',
  CONTENT: '알림 내용',
  MEMBER_MANAGEMENT: '회원 관리',
  SEND_STATUS: '전송 상태',
  USER_ID: '사용자ID',
  LAST_PAYMENT_DATE: '가장 최근에 지급한 일시',
};

// 상황별 알림 내용 템플릿 필드명 상수
const TEMPLATE_FIELDS = {
  PROGRAM_TYPE: '프로그램 유형',
  NOTIFICATION_CONTENT: '알림 내용',
};

// 전송 상태 값 상수
const SEND_STATUS = {
  PENDING: '전송 대기',
  COMPLETED: '전송 완료',
  PARTIAL: '부분 완료',
  FAILED: '전송 실패',
};

class NotificationService {
  constructor() {
    const {
      NOTION_API_KEY,
      NOTION_NOTIFICATION_DB_ID,
      NOTION_NOTIFICATION_TEMPLATE_DB_ID,
      NOTION_VERSION,
    } = process.env;

    // 환경 변수 검증
    if (!NOTION_API_KEY) {
      const error = new Error("NOTION_API_KEY가 필요합니다");
      error.code = ERROR_CODES.MISSING_API_KEY;
      throw error;
    }
    if (!NOTION_NOTIFICATION_DB_ID) {
      const error = new Error("NOTION_NOTIFICATION_DB_ID가 필요합니다");
      error.code = ERROR_CODES.MISSING_DB_ID;
      throw error;
    }

    this.notion = new Client({
      auth: NOTION_API_KEY,
      notionVersion: NOTION_VERSION,
    });

    this.notificationDatabaseId = NOTION_NOTIFICATION_DB_ID;
    this.templateDatabaseId = NOTION_NOTIFICATION_TEMPLATE_DB_ID;
    this.firestoreService = new FirestoreService("users");
  }

  /**
   * 프로그램 유형별 알림 내용 템플릿 조회
   * @param {string} programType - 프로그램 유형 (예: "한끗루틴", "TMI 프로젝트" 등)
   * @return {Promise<string>} 알림 내용 템플릿
   */
  async getNotificationTemplateByType(programType) {
    try {
      if (!this.templateDatabaseId) {
        return null;
      }

      if (!programType) {
        return null;
      }

      let databaseId = this.templateDatabaseId;
      if (databaseId && !databaseId.includes('-')) {
        if (databaseId.length === 32) {
          databaseId = `${databaseId.slice(0, 8)}-${databaseId.slice(8, 12)}-${databaseId.slice(12, 16)}-${databaseId.slice(16, 20)}-${databaseId.slice(20)}`;
        }
      }

      let allResults = [];
      let hasMore = true;
      let startCursor = undefined;
      
      while (hasMore) {
        try {
          const queryParams = {
            database_id: databaseId,
            page_size: 100
          };
          
          if (startCursor) {
            queryParams.start_cursor = startCursor;
          }

          const response = await this.notion.databases.query(queryParams);
          
          if (response.results) {
            allResults = allResults.concat(response.results);
          }
          
          hasMore = response.has_more || false;
          startCursor = response.next_cursor;
          
          if (!hasMore) break;
        } catch (queryError) {
          try {
            const fetchUrl = `https://api.notion.com/v1/databases/${databaseId}/query`;
            const fetchResponse = await fetch(fetchUrl, {
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

            if (!fetchResponse.ok) {
              break;
            }

            const fetchData = await fetchResponse.json();
            if (fetchData.results) {
              allResults = allResults.concat(fetchData.results);
            }
            hasMore = fetchData.has_more || false;
            startCursor = fetchData.next_cursor;
          } catch (fetchError) {
            break;
          }
        }
      }
      
      const results = allResults.filter(page => {
        const props = page.properties || {};
        const programTypeField = props[TEMPLATE_FIELDS.PROGRAM_TYPE];
        
        if (!programTypeField) return false;
        
        if (programTypeField.select && programTypeField.select.name === programType) {
          return true;
        }
        
        if (programTypeField.title && programTypeField.title.length > 0) {
          const titleText = programTypeField.title.map(t => t.plain_text).join('');
          return titleText === programType;
        }
        
        return false;
      });

      if (results.length === 0) {
        return null;
      }

      const templatePage = results[0];
      const props = templatePage.properties;
      const notificationContent = getTextContent(props[TEMPLATE_FIELDS.NOTIFICATION_CONTENT]);

      if (!notificationContent) {
        return null;
      }

      return notificationContent;
    } catch (error) {
      console.error(`템플릿 조회 실패:`, error.message);
      return null;
    }
  }

  /**
   * Notion 알림 페이지에서 데이터 추출
   * @param {string} pageId - Notion 알림 페이지 ID
   * @return {Promise<Object>} 알림 데이터 (title, content, userIds, programType)
   */
  async getNotificationData(pageId) {
    try {
      const page = await this.notion.pages.retrieve({ page_id: pageId });
      const props = page.properties;

      let title = getTitleValue(props[NOTION_FIELDS.TITLE]);
      if (!title) {
        title = getTextContent(props[NOTION_FIELDS.TITLE]) || 
          props[NOTION_FIELDS.TITLE]?.title?.[0]?.plain_text ||
          props[NOTION_FIELDS.TITLE]?.rich_text?.[0]?.plain_text || '';
      }

      const contentField = props[NOTION_FIELDS.CONTENT];
      
      let programTypeName = '';
      
      if (contentField) {
        if (contentField.type === 'rich_text' && contentField.rich_text) {
          programTypeName = contentField.rich_text.map(text => text.plain_text).join('').trim();
        } else if (contentField.type === 'title' && contentField.title) {
          programTypeName = contentField.title.map(text => text.plain_text).join('').trim();
        } else if (contentField.type === 'select' && contentField.select) {
          programTypeName = contentField.select.name || '';
        } else if (contentField.type === 'text' && contentField.text) {
          programTypeName = contentField.text.map(text => text.plain_text).join('').trim();
        } else {
          programTypeName = getTextContent(contentField) || '';
          if (!programTypeName) {
            programTypeName = (contentField.rich_text || []).map(text => text.plain_text).join('').trim() ||
              (contentField.title || []).map(text => text.plain_text).join('').trim() || '';
          }
        }
      }

      let content = '';
      if (programTypeName && programTypeName.trim()) {
        const templateContent = await this.getNotificationTemplateByType(programTypeName.trim());
        if (templateContent) {
          content = templateContent;
        }
      }

      const userRelations = props[NOTION_FIELDS.MEMBER_MANAGEMENT]?.relation || [];
      const relationPageIds = userRelations.map(relation => relation.id);

      if (relationPageIds.length === 0) {
        const error = new Error("선택된 사용자가 없습니다.");
        error.code = ERROR_CODES.NO_USERS_SELECTED;
        error.statusCode = 400;
        throw error;
      }

      const userIds = await this.extractUserIdsFromRelation(relationPageIds);

      if (userIds.length === 0) {
        const error = new Error("유효한 사용자 ID를 찾을 수 없습니다.");
        error.code = ERROR_CODES.NO_VALID_USER_IDS;
        error.statusCode = 400;
        throw error;
      }

      return {
        title,
        content,
        userIds,
        pageId,
      };
    } catch (error) {
      console.error("알림 데이터 추출 실패:", error.message);

      if (error.code) {
        throw error;
      }

      // Notion API 에러 처리
      if (error.code === 'object_not_found') {
        const notFoundError = new Error('알림 페이지를 찾을 수 없습니다.');
        notFoundError.code = ERROR_CODES.NOTIFICATION_NOT_FOUND;
        notFoundError.statusCode = 404;
        throw notFoundError;
      }

      const serviceError = new Error(`알림 데이터를 가져오는데 실패했습니다: ${error.message}`);
      serviceError.code = ERROR_CODES.NOTION_API_ERROR;
      serviceError.originalError = error;
      throw serviceError;
    }
  }

  /**
   * Relation 페이지 ID들에서 Firebase User ID 추출 및 검증
   * @param {Array<string>} relationPageIds - Notion 사용자 페이지 ID 배열
   * @return {Promise<Array<string>>} Firestore users 컬렉션에 존재하는 유효한 User ID 배열
   */
  async extractUserIdsFromRelation(relationPageIds) {
    try {
      const extractedUserIds = [];

      // 1단계: Notion에서 사용자 ID 추출
      for (const pageId of relationPageIds) {
        try {
          const userPage = await this.notion.pages.retrieve({ page_id: pageId });
          const userProps = userPage.properties;

          let firebaseUserId = getTitleValue(userProps[NOTION_FIELDS.USER_ID]);
          
          if (!firebaseUserId) {
            firebaseUserId = getTextContent(userProps[NOTION_FIELDS.USER_ID]) || 
              userProps[NOTION_FIELDS.USER_ID]?.rich_text?.[0]?.plain_text ||
              userProps[NOTION_FIELDS.USER_ID]?.title?.[0]?.plain_text;
          }

          if (firebaseUserId && firebaseUserId.trim()) {
            extractedUserIds.push(firebaseUserId.trim());
          }
        } catch (userPageError) {
          console.error(`사용자 페이지 ${pageId} 조회 실패:`, userPageError.message);
        }
      }

      // 2단계: Firestore users 컬렉션에서 사용자 존재 여부 검증
      const validUserIds = [];
      const invalidUserIds = [];

      for (const userId of extractedUserIds) {
        try {
          const user = await this.firestoreService.getDocument("users", userId);
          
          if (user) {
            validUserIds.push(userId);
          } else {
            invalidUserIds.push(userId);
            console.warn(`[검증 실패] Firestore에 존재하지 않는 사용자 ID: ${userId}`);
          }
        } catch (firestoreError) {
          console.error(`[검증 에러] 사용자 ${userId} Firestore 조회 중 오류:`, firestoreError.message);
          invalidUserIds.push(userId);
        }
      }

      if (invalidUserIds.length > 0) {
        console.warn(`[사용자 ID 검증] 총 ${extractedUserIds.length}개 중 ${invalidUserIds.length}개가 Firestore에 존재하지 않음`);
      }

      if (validUserIds.length === 0) {
        const error = new Error("Firestore에 존재하는 유효한 사용자가 없습니다.");
        error.code = ERROR_CODES.NO_VALID_USER_IDS;
        error.statusCode = 400;
        throw error;
      }

      return validUserIds;
    } catch (error) {
      console.error("사용자 ID 추출 실패:", error.message);

      if (error.code) {
        throw error;
      }

      throw new Error(`사용자 ID를 추출하는데 실패했습니다: ${error.message}`);
    }
  }

  /**
   * 알림 전송 및 상태 업데이트
   * @param {string} pageId - Notion 알림 페이지 ID
   * @return {Promise<Object>} 전송 결과
   */
  async sendNotification(pageId) {
    try {
      const { title, content, userIds } = await this.getNotificationData(pageId);

      if (!title || !content) {
        const error = new Error("알림 제목과 내용은 필수입니다.");
        error.code = ERROR_CODES.INVALID_NOTIFICATION_DATA;
        error.statusCode = 400;
        throw error;
      }

      const sendResult = await fcmHelper.sendNotificationToUsers(
        userIds,
        title,
        content,
        "announcement",
        "",
        ""
      );

      const successCount = sendResult?.successCount || sendResult?.sentCount || 0;
      const failureCount = sendResult?.failureCount || sendResult?.failedCount || 0;
      const totalCount = userIds.length;

      if (successCount === totalCount && failureCount === 0) {
        try {
          await this.updateNotionStatus(pageId, SEND_STATUS.COMPLETED);
          await this.updateLastPaymentDate(pageId);
        } catch (err) {
          console.warn("상태 업데이트 실패:", err.message);
        }
      } else if (successCount > 0) {
        try {
          await this.updateNotionStatus(pageId, SEND_STATUS.PARTIAL);
          await this.updateLastPaymentDate(pageId);
        } catch (err) {
          console.warn("상태 업데이트 실패:", err.message);
        }
      } else if (successCount === 0) {
        try {
          await this.updateNotionStatus(pageId, SEND_STATUS.FAILED);
        } catch (err) {
          console.warn("상태 업데이트 실패:", err.message);
        }
      }

      return {
        success: true,
        notificationId: pageId,
        title,
        totalUsers: totalCount,
        successCount,
        failureCount,
        sendResult,
      };
    } catch (error) {
      console.error("알림 전송 실패:", error.message);

      try {
        await this.updateNotionStatus(pageId, SEND_STATUS.FAILED);
      } catch (statusError) {
        console.warn("상태 업데이트 실패:", statusError.message);
      }

      if (error.code) {
        throw error;
      }

      const serviceError = new Error(`알림 전송에 실패했습니다: ${error.message}`);
      serviceError.code = ERROR_CODES.FCM_SEND_FAILED;
      serviceError.originalError = error;
      throw serviceError;
    }
  }

  /**
   * "전송 대기" 상태인 모든 알림 조회
   * @return {Promise<Array<Object>>} 대기 상태 알림 목록
   */
  async getPendingNotifications() {
    try {
      let databaseId = this.notificationDatabaseId;
      if (databaseId && !databaseId.includes('-') && databaseId.length === 32) {
        databaseId = `${databaseId.slice(0, 8)}-${databaseId.slice(8, 12)}-${databaseId.slice(12, 16)}-${databaseId.slice(16, 20)}-${databaseId.slice(20)}`;
      }
      
      const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.NOTION_API_KEY}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          filter: {
            property: NOTION_FIELDS.SEND_STATUS,
            status: {
              equals: SEND_STATUS.PENDING
            }
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        const apiError = new Error(`Notion API 호출 실패: ${response.status} - ${errorText}`);
        apiError.code = ERROR_CODES.NOTION_API_ERROR;
        apiError.statusCode = response.status;
        throw apiError;
      }

      const data = await response.json();

      return (data.results || []).map(page => ({
        pageId: page.id,
        properties: page.properties
      }));
    } catch (error) {
      console.error("대기 상태 알림 조회 실패:", error.message);

      if (error.code) {
        throw error;
      }

      const serviceError = new Error(`대기 상태 알림을 조회하는데 실패했습니다: ${error.message}`);
      serviceError.code = ERROR_CODES.NOTION_API_ERROR;
      serviceError.originalError = error;
      throw serviceError;
    }
  }

  /**
   * 모든 "전송 대기" 상태 알림 전송
   * @return {Promise<Object>} 전송 결과
   */
  async sendAllPendingNotifications() {
    try {
      const pendingNotifications = await this.getPendingNotifications();

      if (pendingNotifications.length === 0) {
        return {
          success: true,
          message: "전송할 대기 상태 알림이 없습니다.",
          total: 0,
          successCount: 0,
          errorCount: 0,
          results: []
        };
      }

      const results = [];
      let successCount = 0;
      let errorCount = 0;

      for (const notification of pendingNotifications) {
        try {
          const result = await this.sendNotification(notification.pageId);
          results.push({
            pageId: notification.pageId,
            success: true,
            ...result
          });
          successCount++;
        } catch (error) {
          console.error(`알림 ${notification.pageId} 전송 실패:`, error.message);
          results.push({
            pageId: notification.pageId,
            success: false,
            error: error.message
          });
          errorCount++;

          try {
            await this.updateNotionStatus(notification.pageId, SEND_STATUS.FAILED);
          } catch (statusError) {
            console.warn(`상태 업데이트 실패 (${notification.pageId}):`, statusError.message);
          }
        }
      }

      return {
        success: true,
        message: `총 ${pendingNotifications.length}개의 알림을 처리했습니다.`,
        total: pendingNotifications.length,
        successCount,
        errorCount,
        results
      };
    } catch (error) {
      console.error("대기 상태 알림 일괄 전송 실패:", error.message);
      throw error;
    }
  }

  /**
   * Notion 알림 페이지 상태 업데이트
   * @param {string} pageId - Notion 페이지 ID
   * @param {string} status - 상태 값 (SEND_STATUS 상수 사용)
   * @return {Promise<void>}
   */
  async updateNotionStatus(pageId, status) {
    try {
      await this.notion.pages.update({
        page_id: pageId,
        properties: {
          [NOTION_FIELDS.SEND_STATUS]: {
            status: {
              name: status,
            },
          },
        },
      });
    } catch (error) {
      console.error("Notion 상태 업데이트 실패:", error.message);

      // Notion API 에러 처리
      if (error.code === 'validation_error') {
        const validationError = new Error(`상태 옵션이 유효하지 않습니다: ${status}`);
        validationError.code = ERROR_CODES.STATUS_UPDATE_FAILED;
        validationError.statusCode = 400;
        throw validationError;
      }

      const serviceError = new Error(`상태 업데이트에 실패했습니다: ${error.message}`);
      serviceError.code = ERROR_CODES.STATUS_UPDATE_FAILED;
      serviceError.originalError = error;
      throw serviceError;
    }
  }

  /**
   * "가장 최근에 지급한 일시" 필드 업데이트
   * @param {string} pageId - Notion 페이지 ID
   * @return {Promise<void>}
   */
  async updateLastPaymentDate(pageId) {
    try {
      const now = new Date().toISOString();
      await this.notion.pages.update({
        page_id: pageId,
        properties: {
          [NOTION_FIELDS.LAST_PAYMENT_DATE]: {
            date: {
              start: now,
            },
          },
        },
      });
    } catch (error) {
      console.error("가장 최근에 지급한 일시 업데이트 실패:", error.message);
      // 에러가 발생해도 알림 전송은 성공했으므로 에러를 throw하지 않음
    }
  }
}

module.exports = NotificationService;

