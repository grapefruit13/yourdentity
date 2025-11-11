const { db, FieldValue } = require('../config/database');
const FirestoreService = require('./firestoreService');
const { getStatusValue, getNumberValue } = require('../utils/notionHelper');
const { toDate, formatDate } = require('../utils/helpers');

// 액션 키 → 타입 코드 매핑 (historyId 생성용)
const ACTION_TYPE_MAP = {
  'comment': 'COMMENT',
  'routine_post': 'ROUTINE-POST',
  'routine_review': 'ROUTINE-REVIEW',
  'gathering_review_text': 'GATHERING-TEXT',
  'gathering_review_media': 'GATHERING-MEDIA',
  'tmi_review': 'TMI',
};

/**
 * Reward Service
 * Notion 리워드 정책 조회 및 사용자 리워드 부여
 */
class RewardService {
  constructor() {
    if (!process.env.NOTION_REWARD_POLICY_DB_ID) {
      const error = new Error('[REWARD SERVICE] NOTION_REWARD_POLICY_DB_ID 환경변수가 설정되지 않았습니다');
      error.code = 'INTERNAL_ERROR';
      throw error;
    }
    
    if (!process.env.NOTION_API_KEY) {
      const error = new Error('[REWARD SERVICE] NOTION_API_KEY 환경변수가 설정되지 않았습니다');
      error.code = 'INTERNAL_ERROR';
      throw error;
    }
    
    this.rewardPolicyDB = process.env.NOTION_REWARD_POLICY_DB_ID;
    this.notionApiKey = process.env.NOTION_API_KEY;
    this.firestoreService = new FirestoreService();
  }

  /**
   * Notion에서 특정 액션의 리워드 포인트 조회
   * @param {string} actionKey - 액션 키 (예: "comment")
   * @return {Promise<number>} 리워드 포인트 (정책이 없거나 비활성화면 0)
   */
  async getRewardByAction(actionKey) {
    try {
      // Notion REST API로 직접 호출 (기존 notionUserService 패턴)
      const response = await fetch(`https://api.notion.com/v1/databases/${this.rewardPolicyDB}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.notionApiKey}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filter: {
            property: '__DEV_ONLY__',
            rich_text: {
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

      // status 체크 ('적용 완료'인 경우만 리워드 부여)
      const status = getStatusValue(props['정책 적용 상태']);
      if (status !== '적용 완료') {
        console.log(`[REWARD] 액션 "${actionKey}"는 적용 전 상태입니다 (status: ${status})`);
        return 0;
      }

      // Rewards 포인트 가져오기
      const rewards = getNumberValue(props['나다움']) || 0;
      return rewards;
    } catch (error) {
      console.error('[REWARD ERROR] getRewardByAction:', error.message);
      return 0;
    }
  }

  /**
   * 사용자 리워드 총량 업데이트 + 히스토리 추가 (범용 메서드)
   * @param {string} userId - 사용자 ID
   * @param {number} amount - 리워드 금액
   * @param {string} actionKey - 액션 키 (나중에 reason 필드로 사용 예정)
   * @param {string} historyId - 히스토리 문서 ID (중복 체크용)
   * @param {Date|Timestamp|null} actionTimestamp - 액션 발생 시간 (null이면 FieldValue.serverTimestamp() 사용)
   * @param {boolean} checkDuplicate - 중복 체크 여부 (기본: true, 중복 지급 방지)
   * @return {Promise<{isDuplicate: boolean}>}
   * @throws {Error} DAILY_LIMIT_EXCEEDED - 일일 제한 초과 시
   */
  async addRewardToUser(userId, amount, actionKey, historyId, actionTimestamp = null, checkDuplicate = true) {
    const userRef = db.collection('users').doc(userId);
    const historyRef = db.collection(`users/${userId}/rewardsHistory`).doc(historyId);

    let isDuplicate = false;

    await this.firestoreService.runTransaction(async (transaction) => {
      // 댓글 일일 제한 체크 (actionTimestamp가 있고, actionKey가 comment인 경우)
      if (actionTimestamp && actionKey === 'comment') {
        const dateKey = formatDate(actionTimestamp);
        const counterRef = db.collection(`users/${userId}/dailyRewardCounters`).doc(dateKey);
        const counterDoc = await transaction.get(counterRef);
        
        const currentCount = counterDoc.exists ? (counterDoc.data()[actionKey] || 0) : 0;
        
        if (currentCount >= 5) {
          const error = new Error('Daily comment reward limit reached (5/day)');
          error.code = 'DAILY_LIMIT_EXCEEDED';
          throw error;
        }
      }

      // 중복 체크 (개별 리워드 중복 방지)
      if (checkDuplicate) {
        const historyDoc = await transaction.get(historyRef);
        if (historyDoc.exists) {
          isDuplicate = true;
          return; // 트랜잭션 중단
        }
      }

      // rewardsHistory에 기록 추가
      transaction.set(historyRef, {
        actionKey,
        amount,
        changeType: 'add',
        // actionTimestamp가 있으면 사용 (액션 기반), 없으면 서버 시간 사용 (관리자 직접 지급)
        createdAt: actionTimestamp || FieldValue.serverTimestamp(),
        isProcessed: false,
      });

      // users/{userId}.rewards 증가
      transaction.update(userRef, {
        rewards: FieldValue.increment(amount),
        updatedAt: FieldValue.serverTimestamp(),
      });

      // 일일 카운터 증가 (actionTimestamp가 있고, actionKey가 comment인 경우)
      if (actionTimestamp && actionKey === 'comment') {
        const dateKey = formatDate(actionTimestamp);
        const counterRef = db.collection(`users/${userId}/dailyRewardCounters`).doc(dateKey);
        
        transaction.set(counterRef, {
          [actionKey]: FieldValue.increment(1),
          updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true });
      }
    });

    return { isDuplicate };
  }

  /**
   * Action 기반 리워드 부여 (Notion DB 조회)
   * Race condition 방지를 위해 중복 체크와 리워드 부여를 단일 transaction으로 처리
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

      // 2. 액션 시점 결정 (Firestore에서 직접 조회)
      let actionTimestamp;
      
      // 댓글 작성: comments/{commentId}에서 createdAt 조회
      if (actionKey === 'comment' && metadata.commentId) {
        const commentDoc = await db.collection('comments')
          .doc(metadata.commentId)
          .get();
        
        if (commentDoc.exists) {
          const createdAt = commentDoc.data().createdAt;
          if (createdAt) {
            actionTimestamp = toDate(createdAt);
          }
        }
      }
      // 게시글 작성: communities/{communityId}/posts/{postId}에서 createdAt 조회
      else if (metadata.postId && metadata.communityId) {
        const postDoc = await db
          .collection(`communities/${metadata.communityId}/posts`)
          .doc(metadata.postId)
          .get();
        
        if (postDoc.exists) {
          const createdAt = postDoc.data().createdAt;
          if (createdAt) {
            actionTimestamp = toDate(createdAt);
          }
        }
      }
      
      // fallback: 조회 실패 시 현재 시간
      if (!actionTimestamp) {
        actionTimestamp = new Date();
      }
      
      // 3. historyId 생성 (타입 코드 기반)
      const typeCode = ACTION_TYPE_MAP[actionKey] || 'REWARD';
      const targetId = metadata.commentId || metadata.postId || metadata.targetId;
      
      if (!targetId) {
        const error = new Error('commentId 또는 postId가 필요합니다');
        error.code = 'BAD_REQUEST';
        throw error;
      }
      
      const historyId = `${typeCode}-${targetId}`;

      // 4. addRewardToUser 호출 (범용 메서드 활용, 트랜잭션 내 중복 체크 + 일일 제한 체크)
      const { isDuplicate } = await this.addRewardToUser(
        userId, 
        rewardAmount, 
        actionKey, 
        historyId, 
        actionTimestamp
      );

      // 5. 중복 체크 결과 처리
      if (isDuplicate) {
        console.log(`[REWARD DUPLICATE] 이미 부여된 리워드입니다: userId=${userId}, action=${actionKey}, historyId=${historyId}`);
        return { success: true, amount: 0, message: 'Reward already granted' };
      }

      console.log(`[REWARD SUCCESS] userId=${userId}, action=${actionKey}, amount=${rewardAmount}, historyId=${historyId}`);

      return {
        success: true,
        amount: rewardAmount,
        message: `Granted ${rewardAmount} rewards for ${actionKey}`,
      };
    } catch (error) {
      if (error.code === 'DAILY_LIMIT_EXCEEDED') {
        console.log(`[REWARD LIMIT] 댓글 작성 일일 제한 도달: userId=${userId}, action=${actionKey} (UTC 기준 5/day)`);
        throw error; // 프론트에서 사용자에게 알림 표시
      }

      // 시스템 에러
      console.error('[REWARD ERROR] grantActionReward:', error.message, {
        userId,
        actionKey,
        metadata,
      });
      
      // error.code가 없으면 적절한 코드 설정 (Service 에러 가이드라인 준수)
      if (!error.code) {
        error.code = 'INTERNAL_ERROR';
      }
      
      throw error;
    }
  }
}

module.exports = RewardService;

