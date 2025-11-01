const { Client } = require('@notionhq/client');
const { 
  getTitleValue,
  getFileUrls,
  getCheckboxValue,
  getDateValue,
  formatNotionBlocks,
} = require('../utils/notionHelper');

// 상수 정의
const QUERY_PAGE_SIZE = 1; // 홈 화면은 최신 1개만 조회

const NOTION_FIELDS = {
  NAME: "이름",
  BACKGROUND_IMAGE: "배경화면",
  ACTIVITY_REVIEW: "활동후기",
  NADAUM_EXHIBITION: "나다움전시",
  DEPLOY_DATE: "운영 배포일자",
};

const ERROR_CODES = {
  HOME_NOT_FOUND: 'HOME_NOT_FOUND',
  MISSING_API_KEY: 'MISSING_NOTION_API_KEY',
  MISSING_DB_ID: 'MISSING_NOTION_HOME_DB_ID',
  NOTION_API_ERROR: 'NOTION_API_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
};

const ERROR_MESSAGES = {
  MISSING_API_KEY: 'NOTION_API_KEY가 설정되지 않았습니다',
  MISSING_DB_ID: 'NOTION_HOME_DB_ID가 설정되지 않았습니다',
  HOME_NOT_FOUND: '운영 배포된 홈 화면 데이터가 존재하지 않습니다.',
  DATA_SOURCE_NOT_FOUND: '홈 화면 데이터 소스를 찾을 수 없습니다.',
  RATE_LIMITED: 'Notion API 요청 한도가 초과되었습니다. 잠시 후 다시 시도해주세요.',
};

class HomeService {
  constructor() {
    // Notion 클라이언트 초기화 (lazy)
    this.notion = null;
    this.homeDataSource = null;
  }

  /**
   * Notion 클라이언트 초기화 (필요할 때만)
   * @throws {Error} NOTION_API_KEY 또는 NOTION_HOME_DB_ID가 없는 경우
   */
  initNotionClient() {
    if (this.notion) return;

    const {
      NOTION_API_KEY,
      NOTION_HOME_DB_ID,
      NOTION_VERSION = "2025-09-03",
    } = process.env;

    if (!NOTION_API_KEY) {
      const error = new Error(ERROR_MESSAGES.MISSING_API_KEY);
      error.code = ERROR_CODES.MISSING_API_KEY;
      error.statusCode = 500;
      throw error;
    }

    if (!NOTION_HOME_DB_ID) {
      const error = new Error(ERROR_MESSAGES.MISSING_DB_ID);
      error.code = ERROR_CODES.MISSING_DB_ID;
      error.statusCode = 500;
      throw error;
    }

    this.notion = new Client({
      auth: NOTION_API_KEY,
      notionVersion: NOTION_VERSION,
    });

    this.homeDataSource = NOTION_HOME_DB_ID;
  }

  /**
   * 홈 화면 데이터 조회 (운영 배포일자 기준 가장 최신 페이지 1개)
   * @returns {Promise<Object>} 홈 화면 데이터 (id, name, backgroundImage, content 등)
   * @throws {Error} HOME_NOT_FOUND - 배포된 홈 화면이 없는 경우
   * @throws {Error} NOTION_API_ERROR - Notion API 호출 실패
   * @throws {Error} RATE_LIMITED - API 요청 한도 초과
   */
  async getHomeScreenData() {
    try {
      // Lazy initialization
      this.initNotionClient();

      const queryBody = {
        page_size: QUERY_PAGE_SIZE,
        filter: {
          property: NOTION_FIELDS.DEPLOY_DATE,
          date: {
            is_not_empty: true
          }
        },
        sorts: [
          {
            property: NOTION_FIELDS.DEPLOY_DATE,
            direction: "descending"
          }
        ]
      };

      const data = await this.notion.dataSources.query({
        data_source_id: this.homeDataSource,
        ...queryBody
      });
      
      if (!data.results || data.results.length === 0) {
        const error = new Error(ERROR_MESSAGES.HOME_NOT_FOUND);
        error.code = ERROR_CODES.HOME_NOT_FOUND;
        error.statusCode = 404;
        throw error;
      }

      const page = data.results[0];
      const blocks = await this.getPageBlocks(page.id);

      return this.formatHomeData(page, blocks);

    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * 에러 처리 헬퍼 메서드
   * @param {Error} error - 원본 에러 객체
   * @throws {Error} 적절히 포맷된 에러
   * @private
   */
  handleError(error) {
    // 이미 우리가 정의한 에러는 그대로 전달
    const knownErrorCodes = [
      ERROR_CODES.HOME_NOT_FOUND,
      ERROR_CODES.MISSING_API_KEY,
      ERROR_CODES.MISSING_DB_ID,
    ];
    
    if (knownErrorCodes.includes(error.code)) {
      throw error;
    }

    // Notion SDK 에러 처리
    if (error.code === 'object_not_found') {
      const notFoundError = new Error(ERROR_MESSAGES.DATA_SOURCE_NOT_FOUND);
      notFoundError.code = ERROR_CODES.MISSING_DB_ID;
      notFoundError.statusCode = 404;
      throw notFoundError;
    }
    
    if (error.code === 'rate_limited') {
      const rateLimitError = new Error(ERROR_MESSAGES.RATE_LIMITED);
      rateLimitError.code = ERROR_CODES.RATE_LIMITED;
      rateLimitError.statusCode = 429;
      throw rateLimitError;
    }
    
    // 기타 에러
    const serviceError = new Error(`홈 화면 데이터 조회 중 오류가 발생했습니다: ${error.message}`);
    serviceError.code = ERROR_CODES.NOTION_API_ERROR;
    serviceError.statusCode = 500;
    throw serviceError;
  }

  /**
   * 페이지 블록 내용 조회 (페이지네이션 처리)
   * @param {string} pageId - 페이지 ID
   * @returns {Promise<Array>} 포맷팅된 블록 배열 (실패 시 빈 배열)
   * @private
   */
  async getPageBlocks(pageId) {
    try {
      let cursor;
      const allBlocks = [];
      
      // Notion API는 한 번에 최대 100개만 반환하므로 페이지네이션 처리
      do {
        const response = await this.notion.blocks.children.list({
          block_id: pageId,
          start_cursor: cursor,
        });
        
        allBlocks.push(...response.results);
        cursor = response.has_more ? response.next_cursor : undefined;
      } while (cursor);

      return formatNotionBlocks(allBlocks);
    } catch (error) {
      // 블록 조회 실패 시 빈 배열 반환 (메인 데이터는 유지)
      return [];
    }
  }

  /**
   * 홈 화면 데이터 포맷팅
   * @param {Object} page - Notion 페이지 객체
   * @param {Array} [blocks=[]] - 페이지 블록 내용
   * @returns {Object} 포맷팅된 홈 화면 데이터
   * @property {string} id - 페이지 ID
   * @property {string} name - 홈 화면 이름
   * @property {Array} backgroundImage - 배경 이미지 목록
   * @property {boolean} activityReview - 활동후기 표시 여부
   * @property {boolean} nadaumExhibition - 나다움전시 표시 여부
   * @property {string} deployDate - 운영 배포일자
   * @property {Array} content - 페이지 블록 내용
   * @property {string} createdAt - 생성 일시
   * @property {string} updatedAt - 수정 일시
   * @property {string} url - 노션 페이지 URL
   * @private
   */
  formatHomeData(page, blocks = []) {
    const props = page.properties;
    
    return {
      id: page.id,
      name: getTitleValue(props[NOTION_FIELDS.NAME]),
      backgroundImage: getFileUrls(props[NOTION_FIELDS.BACKGROUND_IMAGE]),
      activityReview: getCheckboxValue(props[NOTION_FIELDS.ACTIVITY_REVIEW]),
      nadaumExhibition: getCheckboxValue(props[NOTION_FIELDS.NADAUM_EXHIBITION]),
      deployDate: getDateValue(props[NOTION_FIELDS.DEPLOY_DATE]),
      content: blocks,
      createdAt: page.created_time,
      updatedAt: page.last_edited_time,
      url: page.url
    };
  }
}

module.exports = new HomeService();
