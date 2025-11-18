const FCMService = require("../services/fcmService");

class FCMController {
  constructor() {
    this.fcmService = new FCMService();
  }

  async saveToken(req, res) {
    try {
      const {token, deviceInfo, deviceType = "pwa"} = req.body;
      const userId = req.user.uid;

      console.log("[FCM][Controller][saveToken] 요청 수신", {
        deviceType,
        hasToken: !!token,
        hasDeviceInfo: !!deviceInfo,
        deviceInfoLength: deviceInfo?.length,
        deviceInfoPreview: deviceInfo?.substring(0, 50),
      });

      if (!token) {
        console.error("[FCM][Controller][saveToken] 토큰 누락", { userId, deviceType });
        return res.error(400, "FCM 토큰이 필요합니다.");
      }

      const result = await this.fcmService.saveToken(userId, token, deviceInfo, deviceType);
      if (!result) {
        console.error("[FCM][Controller][saveToken] 저장 결과 없음", { userId, deviceType });
        return res.error(500, "토큰 저장에 실패했습니다.");
      }
      
      console.log("[FCM][Controller][saveToken] 저장 성공", { userId, deviceType, deviceId: result.deviceId });
      return res.success(result);
    } catch (error) {
      console.error("[FCM][Controller][saveToken] 에러 발생", {
        deviceType: req.body?.deviceType,
        error: error.message,
        errorCode: error.code,
        errorStack: error.stack,
      });
      return res.error(error.statusCode || 500, error.message);
    }
  }

  async getUserTokens(req, res) {
    try {
      const userId = req.user.uid;

      const tokens = await this.fcmService.getUserTokens(userId);
      if (!tokens) {
        return res.error(500, "토큰 조회에 실패했습니다.");
      }
      return res.success({tokens});
    } catch (error) {
      console.error("FCM 토큰 조회 실패:", error);
      return res.error(500, error.message);
    }
  }

  async deleteToken(req, res) {
    try {
      const {deviceId} = req.params;
      const userId = req.user.uid;

      if (!deviceId) {
        return res.error(400, "디바이스 ID가 필요합니다.");
      }

      await this.fcmService.deleteToken(userId, deviceId);
      return res.success({message: "토큰이 삭제되었습니다."});
    } catch (error) {
      console.error("FCM 토큰 삭제 실패:", error);
      return res.error(500, error.message);
    }
  }
}

module.exports = new FCMController();
