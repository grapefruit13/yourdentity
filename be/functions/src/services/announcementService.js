const { Client } = require('@notionhq/client');
const {
  getTitleValue,
  getCheckboxValue,
  getDateValue,
  getCreatedByValue
} = require('../utils/notionHelper');

const NOTION_VERSION = process.env.NOTION_VERSION || "2025-09-03";
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const MIN_PAGE_SIZE = 1;

// page_size 검증 및 클램프 함수
function normalizePageSize(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return DEFAULT_PAGE_SIZE;
  return Math.min(MAX_PAGE_SIZE, Math.max(MIN_PAGE_SIZE, Math.trunc(num)));
}

// 에러 코드 정의
const ERROR_CODES = {
  MISSING_API_KEY: 'MISSING_NOTION_API_KEY',
  MISSING_DB_ID: 'MISSING_NOTION_DB_ID',
  NOTION_API_ERROR: 'NOTION_API_ERROR',
  ANNOUNCEMENT_NOT_FOUND: 'ANNOUNCEMENT_NOT_FOUND',
  RATE_LIMITED: 'RATE_LIMITED'
};

// Notion 필드명 상수
const NOTION_FIELDS = {
  NAME: "이름",
  PINNED: "고정",
  START_DATE: "시작일",
  END_DATE: "종료일"
};

class AnnouncementService {
  constructor() {
    // 환경 변수 검증
    const { NOTION_API_KEY, NOTION_ANNOUNCEMENT_DB_ID } = process.env;
    
    if (!NOTION_API_KEY) {
      const error = new Error("NOTION_API_KEY가 필요합니다");
      error.code = ERROR_CODES.MISSING_API_KEY;
      throw error;
    }
    
    if (!NOTION_ANNOUNCEMENT_DB_ID) {
      const error = new Error("NOTION_ANNOUNCEMENT_DB_ID가 필요합니다");
      error.code = ERROR_CODES.MISSING_DB_ID;
      throw error;
    }

    // Notion 클라이언트 초기화
    this.notion = new Client({
      auth: NOTION_API_KEY,
      notionVersion: NOTION_VERSION,
    });
    this.announcementDataSource = NOTION_ANNOUNCEMENT_DB_ID;
  }


  /**
   * 페이지 블록 내용 조회
   * @param {string} pageId - 페이지 ID
   * @returns {Promise<Array>} 블록 배열
   * @private
   */
  async getPageBlocks(pageId) {
    try {
      let cursor;
      const allBlocks = [];
      
      do {
        const response = await this.notion.blocks.children.list({
          block_id: pageId,
          page_size: 100,
          ...(cursor && { start_cursor: cursor })
        });
        
        if (!response || !Array.isArray(response.results)) {
          console.warn('[AnnouncementService] 블록 응답 형식이 올바르지 않습니다.');
          break;
        }
        
        allBlocks.push(...response.results);
        cursor = response.next_cursor;
      } while (cursor);
      
      return allBlocks;
    } catch (error) {
      // object_not_found는 페이지가 없거나 접근 권한이 없는 경우
      if (error.code === 'object_not_found') {
        console.warn('[AnnouncementService] 블록을 찾을 수 없습니다:', pageId);
        return [];
      }
      
      // 기타 에러는 로깅하고 빈 배열 반환 (페이지는 있지만 내용 조회 실패)
      console.error('[AnnouncementService] 블록 조회 오류:', error.message);
      return [];
    }
  }

  /**
   * 종료일 추출 헬퍼 메서드
   * @param {Object} endDateProperty - 종료일 속성 객체
   * @returns {string|null} 종료일 ISO 문자열 또는 null
   * @private
   */
  extractEndDate(endDateProperty) {
    if (!endDateProperty?.date) return null;
    return endDateProperty.date.end || endDateProperty.date.start || null;
  }

  /**
   * Notion 페이지를 공지사항 형식으로 변환
   * @param {Object} page - Notion 페이지 객체
   * @param {Array} blocks - 페이지 블록 배열
   * @param {boolean} includeContent - contentRich 포함 여부 (목록 조회 시 false)
   * @returns {Object} 변환된 공지사항 객체
   * @private
   */
  transformPageToAnnouncement(page, blocks = [], includeContent = true) {
    const props = page.properties || {};
    
    const title = getTitleValue(props[NOTION_FIELDS.NAME]) || '';
    const pinned = getCheckboxValue(props[NOTION_FIELDS.PINNED]) || false;
    const startDate = getDateValue(props[NOTION_FIELDS.START_DATE]) || null;
    const endDate = this.extractEndDate(props[NOTION_FIELDS.END_DATE]);
    const createdBy = getCreatedByValue(props["생성자"]) || page.created_by || null;
    
    // 커버 이미지 추출
    let coverImage = null;
    if (page.cover) {
      if (page.cover.type === 'external' && page.cover.external?.url) {
        coverImage = page.cover.external.url;
      } else if (page.cover.type === 'file' && page.cover.file?.url) {
        coverImage = page.cover.file.url;
      }
    }
    
    const result = {
      id: page.id,
      title,
      author: createdBy?.id || page.created_by?.id || null,
      pinned,
      startDate,
      endDate,
      coverImage: coverImage,
      createdAt: page.created_time || new Date().toISOString(),
      updatedAt: page.last_edited_time || new Date().toISOString(),
      isDeleted: false,
    };

    if (includeContent) {
      result.contentRich = blocks;
    }

    return result;
  }

  /**
   * 공지사항 목록 조회 (Notion 기반)
   * @param {number} [pageSize=20] - 페이지 크기 (1-100)
   * @param {string} [startCursor] - 페이지네이션 커서
   * @returns {Promise<Object>} 공지사항 목록
   */
  async getAnnouncements(pageSize = DEFAULT_PAGE_SIZE, startCursor = null) {
    try {
      const queryBody = {
        page_size: normalizePageSize(pageSize),
        sorts: [
          {
            property: NOTION_FIELDS.PINNED,
            direction: "descending"
          },
          {
            timestamp: "created_time",
            direction: "descending"
          }
        ]
      };

      if (startCursor) {
        queryBody.start_cursor = startCursor;
      }

      const data = await this.notion.dataSources.query({
        data_source_id: this.announcementDataSource,
        ...queryBody
      });

      // 목록 조회 시에는 contentRich를 포함하지 않음 (성능 최적화)
      const announcements = data.results.map(page => 
        this.transformPageToAnnouncement(page, [], false)
      );

      return {
        announcements,
        hasMore: data.has_more,
        nextCursor: data.next_cursor,
        currentPageCount: data.results.length
      };

    } catch (error) {
      console.error('[AnnouncementService] 공지사항 목록 조회 오류:', error.message);
      
      if (error.code === 'object_not_found') {
        const notFoundError = new Error('공지사항 데이터 소스를 찾을 수 없습니다.');
        notFoundError.code = ERROR_CODES.MISSING_DB_ID;
        notFoundError.statusCode = 404;
        throw notFoundError;
      }
      
      if (error.code === 'rate_limited') {
        const rateLimitError = new Error('Notion API 요청 한도가 초과되었습니다. 잠시 후 다시 시도해주세요.');
        rateLimitError.code = ERROR_CODES.RATE_LIMITED;
        rateLimitError.statusCode = 429;
        throw rateLimitError;
      }
      
      const serviceError = new Error(`공지사항 목록 조회 중 오류가 발생했습니다: ${error.message}`);
      serviceError.code = ERROR_CODES.NOTION_API_ERROR;
      serviceError.statusCode = 500;
      throw serviceError;
    }
  }

  /**
   * 공지사항 상세 조회 (Notion 기반 - 페이지 내용 포함)
   * @param {string} pageId - 페이지 ID
   * @returns {Promise<Object>} 공지사항 상세 정보
   */
  async getAnnouncementById(pageId) {
    try {
      // 페이지 조회
      const page = await this.notion.pages.retrieve({ page_id: pageId });
      
      // 블록 조회
      const blocks = await this.getPageBlocks(pageId);

      return this.transformPageToAnnouncement(page, blocks);

    } catch (error) {
      console.error('[AnnouncementService] 공지사항 상세 조회 오류:', error.message);
      
      if (error.code === 'object_not_found') {
        const notFoundError = new Error('공지사항을 찾을 수 없습니다.');
        notFoundError.code = ERROR_CODES.ANNOUNCEMENT_NOT_FOUND;
        notFoundError.statusCode = 404;
        throw notFoundError;
      }
      
      if (error.code === 'rate_limited') {
        const rateLimitError = new Error('Notion API 요청 한도가 초과되었습니다. 잠시 후 다시 시도해주세요.');
        rateLimitError.code = ERROR_CODES.RATE_LIMITED;
        rateLimitError.statusCode = 429;
        throw rateLimitError;
      }
      
      const serviceError = new Error(`공지사항 상세 조회 중 오류가 발생했습니다: ${error.message}`);
      serviceError.code = ERROR_CODES.NOTION_API_ERROR;
      serviceError.statusCode = 500;
      throw serviceError;
    }
  }
}

module.exports = AnnouncementService;


