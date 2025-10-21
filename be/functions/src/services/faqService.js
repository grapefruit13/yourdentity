const {
  buildNotionHeadersFromEnv, 
  getTitleValue,
  getTextContent,
  getMultiSelectNames,
  getDateValue,
  getCreatedTimeValue,
  getLastEditedTimeValue
} = require("../utils/notionHelper");

class FaqService {
  constructor() {
    this.databaseId = process.env.NOTION_FAQ_DATABASE_ID;
    this.dataSourceId = process.env.NOTION_FAQ_DATA_SOURCE_ID;
    this.baseUrl = "https://api.notion.com/v1";
    this.NOTION_API_TIMEOUT = 10000;
  }

  async fetchWithTimeout(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.NOTION_API_TIMEOUT);

    try {
      const resp = await fetch(url, {...options, signal: controller.signal});
      clearTimeout(timeoutId);
      return resp;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === "AbortError") {
        const err = new Error("노션 API 요청 시간 초과");
        err.status = 504;
        throw err;
      }
      throw error;
    }
  }

  async queryFaqList({category, pageSize = 20, startCursor} = {}) {
    if (!this.dataSourceId) {
      const err = new Error("노션 FAQ 데이터 소스 ID가 설정되지 않았습니다");
      err.status = 500;
      err.code = "MISSING_CONFIG";
      throw err;
    }

    const url = `${this.baseUrl}/data_sources/${this.dataSourceId}/query`;
    const headers = buildNotionHeadersFromEnv();
    
    console.log(`[FAQ 서비스] FAQ 목록 조회 중 - 카테고리: ${category}, 페이지 크기: ${pageSize}`);

    const body = {};

    if (category) {
      body.filter = {
        property: "주제",
        multi_select: {contains: String(category)},
      };
    }

    if (pageSize) {
      const size = Math.min(100, Math.max(1, Number(pageSize) || 20));
      body.page_size = size;
    }
    if (startCursor) body.start_cursor = String(startCursor);

    const resp = await this.fetchWithTimeout(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error(`[FAQ 서비스] FAQ 목록 조회 실패: ${resp.status} - ${text}`);
      const err = new Error(`노션 FAQ 목록 조회 실패: ${text}`);
      err.status = resp.status;
      throw err;
    }
    
    console.log(`[FAQ 서비스] FAQ 목록 조회 성공`);
    return resp.json();
  }

  async getPageBlocks({pageId, pageSize = 50, startCursor}) {
    if (!pageId) {
      const err = new Error("pageId is required");
      err.status = 400;
      err.code = "MISSING_PARAMETER";
      throw err;
    }

    const headers = buildNotionHeadersFromEnv();

    const searchParams = new URLSearchParams();
    if (pageSize) {
      const size = Math.min(100, Math.max(1, Number(pageSize) || 50));
      searchParams.set("page_size", String(size));
    }
    if (startCursor) searchParams.set("start_cursor", String(startCursor));

    const url = `${this.baseUrl}/blocks/${pageId}/children${searchParams.size ? `?${searchParams.toString()}` : ""}`;
    
    console.log(`[FAQ 서비스] 페이지 블록 조회 중 - 페이지 ID: ${pageId}`);

    const resp = await this.fetchWithTimeout(url, {method: "GET", headers});
    if (!resp.ok) {
      const text = await resp.text();
      console.error(`[FAQ 서비스] 페이지 블록 조회 실패: ${resp.status} - ${text}`);
      const err = new Error(`노션 블록 조회 실패: ${text}`);
      err.status = resp.status;
      throw err;
    }
    
    console.log(`[FAQ 서비스] 페이지 블록 조회 성공 - 페이지 ID: ${pageId}`);
    return resp.json();
  }

  /**
   * FAQ 데이터 포맷팅
   * @param {Object} pageData - Notion 페이지 데이터
   * @param {Array} blocks - 페이지 블록 데이터
   * @returns {Object} 포맷팅된 FAQ 데이터
   */
  formatFaqData(pageData, blocks = []) {
    const props = pageData.properties;
    
    return {
      id: pageData.id,
      title: getTitleValue(props["제목"]),
      category: getMultiSelectNames(props["주제"]),
      content: this.formatFaqBlocks(blocks),
      createdAt: getCreatedTimeValue(props["생성일"]) || pageData.created_time,
      updatedAt: getLastEditedTimeValue(props["수정일"]) || pageData.last_edited_time
    };
  }

  /**
   * FAQ 블록 포맷팅
   * @param {Array} blocks - Notion 블록 배열
   * @returns {Array} 포맷팅된 FAQ 내용
   */
  formatFaqBlocks(blocks) {
    return blocks.map(block => ({
      type: block.type,
      id: block.id,
      text: this.extractBlockText(block)
    }));
  }

  /**
   * 블록에서 텍스트 추출
   * @param {Object} block - Notion 블록
   * @returns {string} 추출된 텍스트
   */
  extractBlockText(block) {
    switch (block.type) {
      case 'paragraph':
        return getTextContent(block.paragraph);
      case 'heading_1':
        return getTextContent(block.heading_1);
      case 'heading_2':
        return getTextContent(block.heading_2);
      case 'heading_3':
        return getTextContent(block.heading_3);
      case 'bulleted_list_item':
        return getTextContent(block.bulleted_list_item);
      case 'numbered_list_item':
        return getTextContent(block.numbered_list_item);
      case 'to_do':
        return getTextContent(block.to_do);
      case 'toggle':
        return getTextContent(block.toggle);
      case 'quote':
        return getTextContent(block.quote);
      case 'callout':
        return getTextContent(block.callout);
      default:
        return '';
    }
  }
}

module.exports = new FaqService();


