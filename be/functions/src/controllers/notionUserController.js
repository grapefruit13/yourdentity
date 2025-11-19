const notionUserService = require("../services/notionUserService");
const {successResponse} = require("../utils/helpers");
const {db} = require("../config/database");

class NotionUserController {

  async syncUserAccounts(req, res, next) {
    try {
      const result = await notionUserService.syncUserAccounts();
      res.success(`회원 동기화 완료: ${result.syncedCount}명, 실패: ${result.failedCount}명, 아카이브: ${result.archivedCount}명`);
    } catch (error) {
      console.error("[Controller Error] syncActiveUsers:", error);
       res.error(500, "활동회원 동기화 중 오류가 발생했습니다.");
    }
  }


  async syncAllUserAccounts(req, res, next) {
    try {
      const result = await notionUserService.syncAllUserAccounts();
      res.success(`회원 전체 재동기화 완료: ${result.syncedCount}명 (업데이트: ${result.updatedCount}명, 생성: ${result.createdCount}명, 실패: ${result.failedCount}명, 아카이브: ${result.archivedCount}명)`);
    } catch (error) {
      console.error("[Controller Error] syncAllUserAccounts:", error);
      res.error(error);
    }
  }


  //해당 메서드는 초기 개발한 메서드로 만약 사용할 경우 syncSelectedUsers메서드를 참고해서 최신화 필요
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

    /**
   * 테스트 사용자 대량 생성
   * @param {Object} req.body - { count: number }
   */
    async createTestUsers(req, res, next) {
      try {
        const { count } = req.body || {};
        
        if (!count || typeof count !== 'number' || count < 1) {
          const err = new Error("생성할 사용자 수(count)를 1 이상의 숫자로 입력해주세요");
          err.code = "BAD_REQUEST";
          throw err;
        }
  
        if (count > 100) {
          const err = new Error("한 번에 최대 100명까지만 생성할 수 있습니다");
          err.code = "BAD_REQUEST";
          throw err;
        }
  
        const result = await notionUserService.createTestUsers(count);
        
        return res.success({
          message: `${result.created}명의 테스트 사용자가 생성되었습니다`,
          ...result
        });
      } catch (error) {
        return next(error);
      }
    }


    async allUsersRollback(req, res, next) {
      try {
        const result = await notionUserService.allUsersRollback();
        res.success(`백업 DB에서 전체 회원 복원 완료: ${result.syncedCount}명, Firebase에 존재하지 않는 회원 건너뜀: ${result.skippedCount}명, 잘못된 값: ${result.validateErrorCount}명`);
      } catch (error) {
        console.error("[Controller Error] allUsersRollback:", error);
        next(error);
      }
    }
  


}

module.exports = new NotionUserController();