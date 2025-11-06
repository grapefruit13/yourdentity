const { Client } = require('@notionhq/client');
const { db, FieldValue, Timestamp } = require('../config/database');

/**
 * Reward Service
 * Notion 리워드 정책 조회 및 사용자 리워드 부여
 */
class RewardService {
  constructor() {
    if (!process.env.NOTION_API_KEY) {
      console.warn('[REWARD] NOTION_API_KEY 환경변수가 설정되지 않았습니다');
    }
    
    this.notion = new Client({
      auth: process.env.NOTION_API_KEY,
    });

    this.rewardPolicyDB = process.env.NOTION_REWARD_POLICY_DB_ID;
    
    console.log('[REWARD] RewardService 초기화:', {
      hasNotionClient: !!this.notion,
      hasQuery: typeof this.notion?.databases?.query === 'function',
      rewardPolicyDB: this.rewardPolicyDB,
    });
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

      // Notion DB에서 해당 Key 조회
      const response = await this.notion.databases.query({
        database_id: this.rewardPolicyDB,
        filter: {
          property: 'Key',
          title: {
            equals: actionKey,
          },
        },
      });

      if (response.results.length === 0) {
        console.warn(`[REWARD] 액션 "${actionKey}"에 대한 리워드 정책이 없습니다`);
        return 0;
      }

      const page = response.results[0];
      const props = page.properties;

      // IsActive 체크
      const isActive = props['IsActive']?.checkbox || false;
      if (!isActive) {
        console.log(`[REWARD] 액션 "${actionKey}"는 비활성화 상태입니다`);
        return 0;
      }

      // Rewards 포인트 가져오기
      const rewards = props['Rewards']?.number || 0;
      return rewards;
    } catch (error) {
      console.error('[REWARD ERROR] getRewardByAction:', error.message);
      return 0;
    }
  }

  /**
   * 사용자에게 리워드 부여
   * @param {string} userId - 사용자 ID
   * @param {string} actionKey - 액션 키
   * @param {Object} metadata - 추가 정보 (postId, commentId 등)
   * @return {Promise<Object>} 부여 결과
   */
  async grantReward(userId, actionKey, metadata = {}) {
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

      const historyRef = db.collection(`users/${userId}/rewardsHistory`).doc(historyId);
      const historyDoc = await historyRef.get();

      if (historyDoc.exists) {
        console.log(`[REWARD DUPLICATE] 이미 부여된 리워드입니다: userId=${userId}, action=${actionKey}, targetId=${targetId}`);
        return { success: true, amount: 0, message: 'Reward already granted' };
      }

      // 3. Firestore 트랜잭션으로 원자적 처리
      await db.runTransaction(async (transaction) => {
        const userRef = db.collection('users').doc(userId);

        // users/{userId}.rewards 증가
        transaction.update(userRef, {
          rewards: FieldValue.increment(rewardAmount),
          updatedAt: FieldValue.serverTimestamp(),
        });

        // rewardsHistory에 기록 추가
        transaction.set(historyRef, {
          actionKey,
          amount: rewardAmount,
          changeType: 'add',
          metadata: {
            ...metadata,
            targetId,
          },
          createdAt: FieldValue.serverTimestamp(),
          isProcessed: true,
        });
      });

      console.log(`[REWARD SUCCESS] userId=${userId}, action=${actionKey}, amount=${rewardAmount}, targetId=${targetId}`);

      return {
        success: true,
        amount: rewardAmount,
        message: `Granted ${rewardAmount} rewards for ${actionKey}`,
      };
    } catch (error) {
      console.error('[REWARD ERROR] grantReward:', error.message, {
        userId,
        actionKey,
        metadata,
      });
      throw error;
    }
  }
}

module.exports = RewardService;

