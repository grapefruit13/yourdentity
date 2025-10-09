const {buildNotionHeadersFromEnv} = require("../utils/notionHelper");

class FaqService {
  constructor() {
    this.databaseId = process.env.NOTION_FAQ_DATABASE_ID;
    this.baseUrl = "https://api.notion.com/v1";
    this.NOTION_API_TIMEOUT = 10000; // 10초
  }

  async fetchWithRetry(url, options = {}, attempt = 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.NOTION_API_TIMEOUT);
    let res;
    try {
      res = await fetch(url, {...options, signal: controller.signal});
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === "AbortError") {
        const err = new Error("노션 API 요청 시간 초과");
        err.status = 504;
        throw err;
      }
      throw error;
    }
    clearTimeout(timeoutId);
    if (res.status !== 429 || attempt >= 3) return res;

    const retryAfter = res.headers.get("retry-after");
    const delayMs = Math.max(200, Math.floor(Number(retryAfter || 0) * 1000) || 400 * attempt);
    await new Promise((r) => setTimeout(r, delayMs));
    return this.fetchWithRetry(url, options, attempt + 1);
  }

  async queryFaqList({category, pageSize = 20, startCursor} = {}) {
    if (!this.databaseId) {
      const e = new Error("노션 FAQ 데이터베이스 ID가 설정되지 않았습니다");
      e.code = "BAD_REQUEST";
      throw e;
    }

    const url = `${this.baseUrl}/databases/${this.databaseId}/query`;
    const headers = buildNotionHeadersFromEnv();

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

    const res = await this.fetchWithRetry(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      const e = new Error(`노션 FAQ 목록 조회 실패: ${text}`);
      e.status = res.status;
      throw e;
    }
    return await res.json();
  }

  async getPageBlocks({pageId, pageSize = 50, startCursor}) {
    if (!pageId) {
      const e = new Error("pageId is required");
      e.code = "BAD_REQUEST";
      throw e;
    }

    const headers = buildNotionHeadersFromEnv();

    const searchParams = new URLSearchParams();
    if (pageSize) {
      const size = Math.min(100, Math.max(1, Number(pageSize) || 50));
      searchParams.set("page_size", String(size));
    }
    if (startCursor) searchParams.set("start_cursor", String(startCursor));

    const url = `${this.baseUrl}/blocks/${pageId}/children${searchParams.size ? `?${searchParams.toString()}` : ""}`;

    const res = await this.fetchWithRetry(url, {method: "GET", headers});
    if (!res.ok) {
      const text = await res.text();
      const e = new Error(`노션 블록 조회 실패: ${text}`);
      e.status = res.status;
      throw e;
    }
    return await res.json();
  }
}

module.exports = new FaqService();


