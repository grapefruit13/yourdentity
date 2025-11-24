const notionRewardHistoryService = require("../services/notionRewardHistoryService");

class NotionRewardHistoryController {
  /**
   * 리워드 히스토리 동기화
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   */
  async syncRewardHistory(req, res, next) {
    try {
      const result = await notionRewardHistoryService.syncRewardHistoryToNotion();
      res.success(`리워드 히스토리 동기화 완료: ${result.syncedCount}개, 실패: ${result.failedCount}개 (총 ${result.total}개)`);
    } catch (error) {
      console.error("[Controller Error] syncRewardHistory:", error);
      next(error);
    }
  }
}

module.exports = new NotionRewardHistoryController();

