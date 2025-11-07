const { db, FieldValue, Timestamp } = require('../config/database');
const FirestoreService = require('./firestoreService');
const { getCheckboxValue, getNumberValue } = require('../utils/notionHelper');

/**
 * Reward Service
 * Notion 리워드 정책 조회 및 사용자 리워드 부여
 */
class RewardService {
  constructor() {
    this.rewardPolicyDB = process.env.NOTION_REWARD_POLICY_DB_ID;
    this.firestoreService = new FirestoreService();
  }

  /**
   * Notion에서 특정 액션의 리워드 포인트 조회
   * @param {string} actionKey - 액션 키 (예: "comment_create")
   * @return {Promise<number>} 리워드 포인트 (정책이 없거나 비활성화면 0)
   */
  async getRewardByAction(actionKey) {
    try {
      if (!this.rewardPolicyDB) {
        console.warn('[REWARD] NOTION_REWARD_POLICY_DB_ID 환경변수가 설정되지 않았습니다');
        return 0;
      }

      // Notion REST API로 직접 호출 (기존 notionUserService 패턴)
      const response = await fetch(`https://api.notion.com/v1/databases/${this.rewardPolicyDB}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filter: {
            property: 'Key',
            title: {
              equals: actionKey,
            },
          },
        }),
      });

      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        console.warn(`[REWARD] 액션 "${actionKey}"에 대한 리워드 정책이 없습니다`);
        return 0;
      }

      const page = data.results[0];
      const props = page.properties;

      // IsActive 체크
      const isActive = getCheckboxValue(props['IsActive']);
      if (!isActive) {
        console.log(`[REWARD] 액션 "${actionKey}"는 비활성화 상태입니다`);
        return 0;
      }

      // Rewards 포인트 가져오기
      const rewards = getNumberValue(props['Rewards']) || 0;
      return rewards;
    } catch (error) {
      console.error('[REWARD ERROR] getRewardByAction:', error.message);
      return 0;
    }
  }

  /**
   * 사용자 리워드 총량 업데이트 + 히스토리 추가
   * @param {string} userId - 사용자 ID
   * @param {number} amount - 리워드 금액
   * @param {string} actionKey - 액션 키 또는 사유
   * @param {string} historyId - 히스토리 문서 ID (중복 체크용)
   * @param {Object} metadata - 추가 메타데이터
   * @return {Promise<void>}
   */
  async addRewardToUser(userId, amount, actionKey, historyId, metadata = {}) {
    const userRef = db.collection('users').doc(userId);
    const historyRef = db.collection(`users/${userId}/rewardsHistory`).doc(historyId);

    await this.firestoreService.runTransaction(async (transaction) => {
      // users/{userId}.rewards 증가
      transaction.update(userRef, {
        rewards: FieldValue.increment(amount),
        updatedAt: FieldValue.serverTimestamp(),
      });

      // rewardsHistory에 기록 추가
      transaction.set(historyRef, {
        actionKey,
        amount,
        changeType: 'add',
        metadata,
        createdAt: FieldValue.serverTimestamp(),
        isProcessed: true,
      });
    });
  }

  /**
   * Action 기반 리워드 부여 (Notion DB 조회)
   * @param {string} userId - 사용자 ID
   * @param {string} actionKey - 액션 키 (예: "comment_create")
   * @param {Object} metadata - 추가 정보 (postId, commentId 등)
   * @return {Promise<Object>} 부여 결과
   */
  async grantActionReward(userId, actionKey, metadata = {}) {
    try {
      // 1. Notion에서 리워드 포인트 조회
      const rewardAmount = await this.getRewardByAction(actionKey);

      if (rewardAmount <= 0) {
        console.log(`[REWARD] 액션 "${actionKey}"는 리워드가 없습니다 (0 포인트)`);
        return { success: true, amount: 0, message: 'No reward for this action' };
      }

      // 2. 중복 부여 방지: rewardsHistory에서 확인
      const targetId = metadata.commentId || metadata.postId || metadata.targetId || 'unknown';
      const historyId = `${actionKey}_${targetId}`;

      const historyDoc = await this.firestoreService.getDocument(
        `users/${userId}/rewardsHistory`,
        historyId
      );

      if (historyDoc) {
        console.log(`[REWARD DUPLICATE] 이미 부여된 리워드입니다: userId=${userId}, action=${actionKey}, targetId=${targetId}`);
        return { success: true, amount: 0, message: 'Reward already granted' };
      }

      // 3. 공통 메서드로 리워드 부여
      await this.addRewardToUser(userId, rewardAmount, actionKey, historyId, {
        ...metadata,
        targetId,
      });

      console.log(`[REWARD SUCCESS] userId=${userId}, action=${actionKey}, amount=${rewardAmount}, targetId=${targetId}`);

      return {
        success: true,
        amount: rewardAmount,
        message: `Granted ${rewardAmount} rewards for ${actionKey}`,
      };
    } catch (error) {
      console.error('[REWARD ERROR] grantActionReward:', error.message, {
        userId,
        actionKey,
        metadata,
      });
      throw error;
    }
  }
}

module.exports = RewardService;

