const {db} = require("../config/database");
const {buildNotionHeadersFromEnv, getNotionToken} = require("../utils/notionHelper");

class AnnouncementService {
  constructor() {
    this.collectionName = "announcements";
    this.NOTION_API_TIMEOUT = 10000; // 10초
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

  async retrieveNotionPage(pageId) {
    const resp = await this.fetchWithTimeout(
        `https://api.notion.com/v1/pages/${pageId}`,
        {method: "GET", headers: buildNotionHeadersFromEnv()},
    );
    if (!resp.ok) {
      const text = await resp.text();
      const err = new Error(`노션 페이지 조회 실패: ${text}`);
      err.status = resp.status;
      throw err;
    }
    return resp.json();
  }

  async retrieveNotionBlocks(rootBlockId) {
    let cursor = null;
    const all = [];
    do {
      const url = new URL(`https://api.notion.com/v1/blocks/${rootBlockId}/children`);
      if (cursor) url.searchParams.set("start_cursor", cursor);
      url.searchParams.set("page_size", "100");
      const resp = await this.fetchWithTimeout(url.toString(), {
        method: "GET",
        headers: buildNotionHeadersFromEnv(),
      });
      if (!resp.ok) {
        const text = await resp.text();
        const err = new Error(`노션 블록 조회 실패: ${text}`);
        err.status = resp.status;
        throw err;
      }
      const data = await resp.json();
      for (const block of data.results || []) all.push(block);
      cursor = data.next_cursor;
    } while (cursor);
    return all;
  }

  transformPageToAnnouncement(page, contentRich) {
    const props = page.properties || {};
    // 실제 Notion 페이지 속성명 사용
    const titleProp = props["이름"];
    const title = Array.isArray(titleProp?.title) && titleProp.title.length > 0 ?
        (titleProp.title[0].plain_text || titleProp.title[0]?.text?.content || "") :
        "";
    const pinnedProp = props["고정"];
    const pinned = typeof pinnedProp?.checkbox === "boolean" ? pinnedProp.checkbox : null;
    // 실제 시작일/종료일 속성 사용
    const startProp = props["시작일"];
    const endProp = props["종료일"];
    const startIso = startProp?.date?.start || null;
    const endIso = endProp?.date?.start || null;

    return {
      title,
      author: page.created_by?.id || null,
      contentRich,
      pinned,
      startDate: startIso || null,
      endDate: endIso || null,
      createdAt: page.created_time || new Date().toISOString(),
      updatedAt: page.last_edited_time || new Date().toISOString(),
      isDeleted: false,
    };
  }

  async synchronizeAnnouncement(pageId) {
    const token = getNotionToken();
    if (!token) {
      const err = new Error("노션 API 키가 설정되지 않았습니다");
      err.status = 500;
      throw err;
    }
    const page = await this.retrieveNotionPage(pageId);
    const contentRich = await this.retrieveNotionBlocks(pageId);
    const transformed = this.transformPageToAnnouncement(page, contentRich);
    await db.collection(this.collectionName).doc(pageId).set(transformed, {merge: true});
    return {id: pageId, ...transformed};
  }

  async markAsDeleted(pageId) {
    const doc = await db.collection(this.collectionName).doc(pageId).get();
    if (!doc.exists) {
      const err = new Error("삭제할 공지사항을 찾을 수 없습니다");
      err.status = 404;
      throw err;
    }
    const updateData = {isDeleted: true, updatedAt: new Date().toISOString()};
    await db.collection(this.collectionName).doc(pageId).update(updateData);
    return {id: pageId, ...updateData};
  }

  async getAnnouncementList() {
    // contentRich 필드를 제외하고 필요한 필드만 조회하여 성능 최적화
    // pinned 필드로 정렬하여 고정된 공지사항이 상단에 표시됨
    const snapshot = await db.collection(this.collectionName)
        .where("isDeleted", "==", false)
        .orderBy("pinned", "desc")
        .orderBy("createdAt", "desc")
        .select("title", "author", "pinned", "startDate", "endDate", "createdAt", "updatedAt", "isDeleted")
        .get();

    const announcements = [];
    snapshot.forEach((doc) => {
      announcements.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return announcements;
  }

  async getAnnouncementDetail(pageId) {
    const doc = await db.collection(this.collectionName).doc(pageId).get();

    if (!doc.exists) {
      const err = new Error("공지사항을 찾을 수 없습니다");
      err.status = 404;
      throw err;
    }

    const data = doc.data();
    if (data.isDeleted) {
      const err = new Error("삭제된 공지사항입니다");
      err.status = 404;
      throw err;
    }

    return {
      id: doc.id,
      ...data,
    };
  }
}

module.exports = new AnnouncementService();


