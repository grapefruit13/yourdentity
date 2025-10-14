const notionUserService = require("../services/notionUserService");
const {successResponse} = require("../utils/helpers");
const {db} = require("../config/database");

class NotionUserController {

  async syncUserAccounts(req, res, next) {
    try {
      const result = await notionUserService.syncUserAccounts();
      res.success(`회원 동기화 완료: ${result.syncedCount}명`);
    } catch (error) {
      console.error("[Controller Error] syncActiveUsers:", error);
       res.error(500, "활동회원 동기화 중 오류가 발생했습니다.");
    }
  }



}

module.exports = new NotionUserController();