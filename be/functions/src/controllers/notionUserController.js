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


  async syncAllUserAccounts(req, res, next) {
    try {
      const result = await notionUserService.syncAllUserAccounts();
      res.success(`회원 전체 재동기화 완료: ${result.syncedCount}명`);
    } catch (error) {
      console.error("[Controller Error] syncAllUserAccounts:", error);
      res.error(error);
    }
  }


  async syncPenaltyUsers(req, res, next) {
    try {
      const result = await notionUserService.syncPenaltyUsers();
      res.success(`자격정지 회원 동기화 완료: ${result.syncedCount}명`);
    } catch (error) {
      console.error("[Controller Error] syncPenaltyUsers:", error);
      next(error);
    }
  }


  async syncSelectedUsers(req, res, next) {
    try {
      const result = await notionUserService.syncSelectedUsers();
      res.success(`선택된 회원 동기화 완료: ${result.syncedCount}명, Firebase에 존재하지 않는 회원 건너뜀: ${result.skippedCount}명, 잘못된 값: ${result.validateErrorCount}명`);
    } catch (error) {
      console.error("[Controller Error] syncSelectedUsers:", error);
      next(error);
    }
  }



}

module.exports = new NotionUserController();