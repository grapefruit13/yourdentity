const { Client } = require('@notionhq/client');
const { 
  getTitleValue,
  getFileUrls,
  getCheckboxValue,
  getDateValue,
  formatNotionBlocks,
} = require('../utils/notionHelper');

// Notion 필드명 상수
const NOTION_FIELDS = {
  NAME: "이름",
  BACKGROUND_IMAGE: "배경화면",
  ACTIVITY_REVIEW: "활동후기",
  NADAUM_EXHIBITION: "나다움전시",
  DEPLOY_DATE: "운영 배포일자",
};

class HomeService {
  constructor() {
    // Notion 클라이언트 초기화 (lazy)
    this.notion = null;
    this.homeDataSource = null;
  }

  /**
   * Notion 클라이언트 초기화 (필요할 때만)
   */
  initNotionClient() {
    if (this.notion) return;

    const {
      NOTION_API_KEY,
      NOTION_HOME_DB_ID,
      NOTION_VERSION = "2025-09-03",
    } = process.env;

    if (!NOTION_API_KEY) {
      const error = new Error("NOTION_API_KEY가 설정되지 않았습니다");
      error.code = 'MISSING_NOTION_API_KEY';
      error.statusCode = 500;
      throw error;
    }

    if (!NOTION_HOME_DB_ID) {
      const error = new Error("NOTION_HOME_DB_ID가 설정되지 않았습니다");
      error.code = 'MISSING_NOTION_HOME_DB_ID';
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
   * @returns {Promise<Object>} 홈 화면 데이터
   */
  async getHomeScreenData() {
    try {
      // Lazy initialization
      this.initNotionClient();

      const queryBody = {
        page_size: 1, // 최신 항목 1개만 조회
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
        const error = new Error('운영 배포된 홈 화면 데이터가 존재하지 않습니다.');
        error.code = 'HOME_NOT_FOUND';
        error.statusCode = 404;
        throw error;
      }

      // 가장 최신 배포일자 항목 (이미 필터링 및 정렬되어 있으므로 첫 번째)
      const page = data.results[0];
      
      console.log(`[HomeService] 선택된 홈 화면: ${getTitleValue(page.properties[NOTION_FIELDS.NAME])}, 배포일자: ${getDateValue(page.properties[NOTION_FIELDS.DEPLOY_DATE])}`);
      
      // 페이지 블록 내용도 함께 조회
      const blocks = await this.getPageBlocks(page.id);

      return this.formatHomeData(page, blocks);

    } catch (error) {
      if (error.code === 'HOME_NOT_FOUND' || error.code === 'MISSING_NOTION_API_KEY' || error.code === 'MISSING_NOTION_HOME_DB_ID') {
        throw error;
      }

      console.error('[HomeService] 홈 화면 데이터 조회 오류:', error.message);
      
      if (error.code === 'object_not_found') {
        const notFoundError = new Error('홈 화면 데이터 소스를 찾을 수 없습니다.');
        notFoundError.code = 'MISSING_NOTION_HOME_DB_ID';
        notFoundError.statusCode = 404;
        throw notFoundError;
      }
      
      if (error.code === 'rate_limited') {
        const rateLimitError = new Error('Notion API 요청 한도가 초과되었습니다. 잠시 후 다시 시도해주세요.');
        rateLimitError.code = 'RATE_LIMITED';
        rateLimitError.statusCode = 429;
        throw rateLimitError;
      }
      
      const serviceError = new Error(`홈 화면 데이터 조회 중 오류가 발생했습니다: ${error.message}`);
      serviceError.code = 'NOTION_API_ERROR';
      serviceError.statusCode = 500;
      throw serviceError;
    }
  }

  /**
   * 페이지 블록 내용 조회
   * @param {string} pageId - 페이지 ID
   * @returns {Promise<Array>} 포맷팅된 블록 배열
   */
  async getPageBlocks(pageId) {
    try {
      const blocks = await this.notion.blocks.children.list({
        block_id: pageId,
      });

      return formatNotionBlocks(blocks.results);
    } catch (error) {
      console.error('[HomeService] 페이지 블록 조회 오류:', error.message);
      // 블록 조회 실패 시 빈 배열 반환 (메인 데이터는 유지)
      return [];
    }
  }

  /**
   * 홈 화면 데이터 포맷팅
   * @param {Object} page - Notion 페이지 객체
   * @param {Array} blocks - 페이지 블록 내용
   * @returns {Object} 포맷팅된 홈 화면 데이터
   */
  formatHomeData(page, blocks = []) {
    const props = page.properties;
    
    return {
      id: page.id,
      name: getTitleValue(props[NOTION_FIELDS.NAME]),
      backgroundImage: getFileUrls(props[NOTION_FIELDS.BACKGROUND_IMAGE]),
      activityReview: getCheckboxValue(props[NOTION_FIELDS.ACTIVITY_REVIEW]),
      nadaumExhibition: getCheckboxValue(props[NOTION_FIELDS.NADAUM_EXHIBITION]),
      deployDate: getDateValue(props[NOTION_FIELDS.DEPLOY_DATE]), // 운영 배포일자 추가
      content: blocks, // 페이지 내부 블록 내용 추가
      createdAt: page.created_time,
      updatedAt: page.last_edited_time,
      url: page.url
    };
  }
}

module.exports = new HomeService();
