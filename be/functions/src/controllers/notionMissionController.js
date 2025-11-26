const notionMissionService = require("../services/notionMissionService");

class NotionMissionController {
  /**
   * Firestore 미션 반응 수를 Notion "반응 수" 필드에 동기화
   */
  async syncReactions(req, res, next) {
    try {
      const result = await notionMissionService.syncReactionCountsFromFirestore();

      return res.success(
        `미션 반응 수 동기화 완료: ${result.syncedCount}개, 실패: ${result.failedCount}개 (총 ${result.total}개)`,
      );
    } catch (error) {
      console.error("[NotionMissionController] 미션 반응 수 동기화 오류:", error.message);
      return next(error);
    }
  }
}

module.exports = new NotionMissionController();


