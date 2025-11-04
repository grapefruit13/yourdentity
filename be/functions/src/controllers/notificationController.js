const NotificationService = require("../services/notificationService");

const notificationService = new NotificationService();

class NotificationController {
  /**
   * 모든 "전송 대기" 상태 알림 일괄 전송 API
   * 전송 버튼 하나로 모든 대기 상태 알림을 전송
   * @param {Object} req - Express 요청 객체
   * @param {Object} res - Express 응답 객체
   * @param {Function} next - Express 다음 미들웨어 함수
   * @returns {Promise<void>}
   */
  async sendAllPending(req, res, next) {
    try {
      const result = await notificationService.sendAllPendingNotifications();
      return res.success(result);
    } catch (error) {
      console.error("대기 상태 알림 일괄 전송 에러:", error);
      return next(error);
    }
  }
}

module.exports = new NotificationController();

