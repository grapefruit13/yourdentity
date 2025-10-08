const {db} = require("../config/database");
const {buildNotionHeadersFromEnv, getNotionToken} = require("../utils/notionHelper");

class AnnouncementService {
  constructor() {
    this.collectionName = "announcement";
  }

  async retrieveNotionPage(pageId) {
    const resp = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {method: "GET", headers: buildNotionHeadersFromEnv()});
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
      const resp = await fetch(url.toString(), {method: "GET", headers: buildNotionHeadersFromEnv()});
      if (!resp.ok) break;
      const data = await resp.json();
      for (const block of data.results || []) all.push(block);
      cursor = data.next_cursor;
    } while (cursor);
    return all;
  }

  transformPageToAnnouncement(page, contentRich) {
    const props = page.properties || {};
    const titleProp = props["이름"] || props["Name"] || props["title"];
    const title = Array.isArray(titleProp?.title) && titleProp.title.length > 0 ? (titleProp.title[0].plain_text || titleProp.title[0]?.text?.content || "") : "";
    const pinnedProp = props["pinned"] || props["Pinned"] || props["고정"];
    const pinned = typeof pinnedProp?.checkbox === "boolean" ? pinnedProp.checkbox : null;
    const startProp = props["startDate"] || props["Start date"] || props["시작일"] || props["start"]; 
    const endProp = props["endDate"] || props["End date"] || props["종료일"] || props["end"]; 
    const startIso = startProp?.date?.start || null;
    const endIso = endProp?.date?.end || endProp?.date?.start || null;

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
    const updateData = {isDeleted: true, updatedAt: new Date().toISOString()};
    await db.collection(this.collectionName).doc(pageId).update(updateData);
    return {id: pageId, ...updateData};
  }

  async getAnnouncementList() {
    const snapshot = await db.collection(this.collectionName)
      .where("isDeleted", "==", false)
      .orderBy("createdAt", "desc")
      .get();
    
    const announcements = [];
    snapshot.forEach((doc) => {
      announcements.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // pinned=true인 항목들을 상위로 이동
    const pinned = announcements.filter(item => item.pinned === true);
    const unpinned = announcements.filter(item => item.pinned !== true);
    
    return [...pinned, ...unpinned];
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


