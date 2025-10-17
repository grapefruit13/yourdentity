const FCMService = require("../services/fcmService");


class FCMHelper {
  constructor() {
    this.fcmService = new FCMService();
  }

  /**
   * 단일 사용자 알림 전송
   * @param {string} userId - 사용자 ID
   * @param {string} title - 알림 제목
   * @param {string} message - 알림 내용
   * @param {string} type - 알림 타입 (community, mission, routine, gathering, announcement 등)
   * @param {string} relatedId - 관련 ID (선택사항)
   * @param {string} link - 링크 (선택사항)
   * @return {Promise<Object>} 전송 결과
   */
  async sendNotification(userId, title, message, type = "general", relatedId = "", link = "") {
    try {
      const notification = {
        title,
        message,
        type,
        relatedId,
        link,
      };

      return await this.fcmService.sendToUser(userId, notification);
    } catch (error) {
      console.error("알림 전송 실패:", error);
      return null; // 에러 시 null 반환
    }
  }

  /**
   * 다중 사용자 알림 전송
   * @param {Array<string>} userIds - 사용자 ID 배열
   * @param {string} title - 알림 제목
   * @param {string} message - 알림 내용
   * @param {string} type - 알림 타입 (community, mission, routine, gathering, announcement 등)
   * @param {string} relatedId - 관련 ID (선택사항)
   * @param {string} link - 링크 (선택사항)
   * @return {Promise<Object>} 전송 결과
   */
  async sendNotificationToUsers(userIds, title, message, type = "general", relatedId = "", link = "") {
    try {
      const notification = {
        title,
        message,
        type,
        relatedId,
        link,
      };

      return await this.fcmService.sendToUsers(userIds, notification);
    } catch (error) {
      console.error("다중 사용자 알림 전송 실패:", error);
      return null; // 에러 시 null 반환
    }
  }
}

module.exports = new FCMHelper();
