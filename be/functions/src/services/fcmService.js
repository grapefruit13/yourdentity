const admin = require("firebase-admin");
const crypto = require("crypto");
const FirestoreService = require("./firestoreService");
const {FieldValue} = require("../config/database");

let fcmAdmin = admin;
if (!admin.apps.find(app => app.name === 'fcm-app')) {
  let serviceAccount;
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      fcmAdmin = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      }, 'fcm-app');
    } catch (error) {
      console.error("Firebase 서비스 계정 키 파싱 실패:", error);
      throw new Error("Invalid FIREBASE_SERVICE_ACCOUNT environment variable");
    }
  } else {
    fcmAdmin = admin;
  }
}

class FCMService {
  constructor() {
    this.firestoreService = new FirestoreService("users");
    this.maxTokensPerUser = 5;
  }

  /**
   * FCM 토큰 저장/업데이트
   * @param {string} userId - 사용자 ID
   * @param {string} token - FCM 토큰
   * @param {string} deviceInfo - 디바이스 정보 (PWA: userAgent, 모바일: deviceId, 웹: userAgent)
   * @param {string} deviceType - 디바이스 타입 (pwa, mobile, web)
   * @return {Promise<Object>} 저장 결과
   */
  async saveToken(userId, token, deviceInfo, deviceType = "pwa") {
    try {
      const deviceId = deviceType === "mobile" 
        ? deviceInfo 
        : this.generateDeviceId(deviceInfo);
    
      const existingTokens = await this.getUserTokens(userId);

      const existingToken = existingTokens.find(t => t.token === token);
      if (existingToken) {
        await this.updateTokenLastUsed(userId, existingToken.id);
        return {deviceId: existingToken.id, message: "토큰 업데이트 완료"};
      }

      if (existingTokens.length >= this.maxTokensPerUser) {
        const sortedTokens = [...existingTokens].sort((a, b) => 
          new Date(a.lastUsed) - new Date(b.lastUsed));
        const oldestToken = sortedTokens[0];
        await this.deleteToken(userId, oldestToken.id);
      }

      const tokenData = {
        token,
        deviceType,
        deviceInfo,
        lastUsed: FieldValue.serverTimestamp(),
        createdAt: FieldValue.serverTimestamp(),
      };

      await this.firestoreService.addDocument(`users/${userId}/fcmTokens`, tokenData);

      return {deviceId, message: "토큰 저장 완료"};
    } catch (error) {
      console.error("FCM 토큰 저장 실패:", error);
      const errorMessage = error.message || "토큰 저장에 실패했습니다.";
      const fcmError = new Error(errorMessage);
      fcmError.code = "FCM_TOKEN_SAVE_FAILED";
      fcmError.statusCode = 500;
      throw fcmError;
    }
  }

  /**
   * 사용자의 모든 FCM 토큰 조회
   * @param {string} userId - 사용자 ID
   * @return {Promise<Array>} 토큰 목록
   */
  async getUserTokens(userId) {
    try {
      return await this.firestoreService.getCollection(`users/${userId}/fcmTokens`);
    } catch (error) {
      console.error("FCM 토큰 조회 실패:", error);
      const fcmError = new Error("토큰 조회에 실패했습니다.");
      fcmError.code = "FCM_TOKEN_GET_FAILED";
      fcmError.statusCode = 500;
      throw fcmError;
    }
  }

  /**
   * 특정 토큰 삭제
   * @param {string} userId - 사용자 ID
   * @param {string} deviceId - 디바이스 ID
   * @return {Promise<void>}
   */
  async deleteToken(userId, deviceId) {
    try {
      await this.firestoreService.deleteDocument(`users/${userId}/fcmTokens`, deviceId);
    } catch (error) {
      console.error("FCM 토큰 삭제 실패:", error);
      const fcmError = new Error("토큰 삭제에 실패했습니다.");
      fcmError.code = "FCM_TOKEN_DELETE_FAILED";
      fcmError.statusCode = 500;
      throw fcmError;
    }
  }

  /**
   * 토큰의 lastUsed 업데이트
   * @param {string} userId - 사용자 ID
   * @param {string} deviceId - 디바이스 ID
   * @return {Promise<void>}
   */
  async updateTokenLastUsed(userId, deviceId) {
    try {
      await this.firestoreService.updateDocument(
        `users/${userId}/fcmTokens`, 
        deviceId, 
        {lastUsed: FieldValue.serverTimestamp()}
      );
    } catch (error) {
      console.error("토큰 lastUsed 업데이트 실패:", error);
    }
  }

  /**
   * 단일 사용자에게 푸시 알림 전송
   * @param {string} userId - 사용자 ID
   * @param {Object} notification - 알림 데이터
   * @return {Promise<Object>} 전송 결과
   */
  async sendToUser(userId, notification) {
    try {
      const tokens = await this.getUserTokens(userId);
      if (tokens.length === 0) {
        return null;
      }

      const tokenList = tokens.map(t => t.token);
      const result = await this.sendToTokens(tokenList, notification);

      return {
        sentCount: result.successCount,
        failedCount: result.failureCount,
      };
    } catch (error) {
      console.error("사용자 알림 전송 실패:", error);
      const fcmError = new Error("알림 전송에 실패했습니다.");
      fcmError.code = "FCM_SEND_USER_FAILED";
      fcmError.statusCode = 500;
      throw fcmError;
    }
  }

  /**
   * 여러 사용자에게 푸시 알림 전송
   * @param {Array<string>} userIds - 사용자 ID 배열
   * @param {Object} notification - 알림 데이터
   * @return {Promise<Object>} 전송 결과
   */
  async sendToUsers(userIds, notification) {
    try {
      const tokenPromises = userIds.map(userId => this.getUserTokens(userId));
      const tokenResults = await Promise.all(tokenPromises);
      const allTokens = tokenResults.flatMap(tokens => tokens.map(t => t.token));

      if (allTokens.length === 0) {
        return null;
      }

      const result = await this.sendToTokens(allTokens, notification);
      return {
        sentCount: result.successCount,
        failedCount: result.failureCount};
    } catch (error) {
      console.error("다중 사용자 알림 전송 실패:", error);
      const fcmError = new Error("다중 사용자 알림 전송에 실패했습니다.");
      fcmError.code = "FCM_SEND_USERS_FAILED";
      fcmError.statusCode = 500;
      throw fcmError;
    }
  }

  /**
   * FCM 토큰 배열에 직접 알림 전송
   * @param {Array<string>} tokens - FCM 토큰 배열
   * @param {Object} notification - 알림 데이터
   * @return {Promise<Object>} 전송 결과
   */
  async sendToTokens(tokens, notification) {
    try {
      if (!tokens || tokens.length === 0) {
        return {successCount: 0, failureCount: 0};
      }

      const message = {
        notification: {
          title: notification.title,
          body: notification.message},
        data: {
          type: notification.type || "general",
          relatedId: notification.relatedId || "",
          link: notification.link || ""},
        tokens: tokens};

      const response = await fcmAdmin.messaging().sendEachForMulticast(message);

      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses: response.responses};
    } catch (error) {
      console.error("FCM 메시지 전송 실패:", error);
      const fcmError = new Error("FCM 메시지 전송에 실패했습니다.");
      fcmError.code = "FCM_SEND_TOKENS_FAILED";
      fcmError.statusCode = 500;
      throw fcmError;
    }
  }

  /**
   * deviceInfo를 기반으로 deviceId 생성
   * @param {string} deviceInfo - 브라우저/디바이스 정보
   * @return {string} deviceId
   */
  generateDeviceId(deviceInfo) {
    const hash = crypto
      .createHash('sha256')
      .update(deviceInfo)
      .digest('hex');
    return hash.substring(0, 20);
  }

}

module.exports = FCMService;
